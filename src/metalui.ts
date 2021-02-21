import { createUid, map, sleep, toObject } from "./lang.js"

declare const glob: Record<string, Record<string, (e: Event) => void>>

// e.g. AppProps, PropertyProps etc?
type Props = Record<string, any>
type Element = null | boolean | number | string | [string, Props, ...Element[]]
export type Component =
  | ((props: Props) => Markup)
  | ((props: Props) => AsyncGenerator<Markup, void, HTMLElement>)
export type Markup =
  | null
  | boolean
  | number
  | string
  | [string | Component, Props, ...Markup[]]

// JSONML to XML string
export const toxml = (
  el: Element,
  gkey: string,
  ids: Record<string, (e: Event) => void>
): string => {
  if (Array.isArray(el)) {
    const [name, props, ...children] = el
    const evented = toObject(
      map<any, [string, any]>(([key, val]) => {
        if (key.substr(0, 2) !== "on") {
          return [key, val]
        } else {
          const id = key + "-" + createUid()
          glob[gkey] = ids
          ids[id] = (event) => val(event)

          return [key, `glob['${gkey}']['${id}'](event)`]
        }
      }, props)
    )

    const mapped = children.map((c) => toxml(c, gkey, ids))

    return `<${name} ${Object.entries(evented)
      .map(([key, val]) => (val !== undefined ? `${key}="${val}"` : key))
      .join(" ")}>${mapped.join("")}</${name}>`
  }

  return el === null ? "" : String(el)
}

export const render = async (markup: Markup): Promise<Element> => {
  if (Array.isArray(markup)) {
    const [tag, props, ...children] = markup

    const mapped: Element[] = []
    for (const child of children) {
      mapped.push(await render(child))
    }

    if (typeof tag === "string") {
      return [tag, props, ...mapped]
    }

    const iterator = tag({ ...props, children: mapped })
    if (
      iterator === null ||
      typeof iterator !== "object" ||
      Array.isArray(iterator)
    ) {
      return await render(iterator)
    }

    let id: string
    const rerender = async (loop: boolean) => {
      do {
        await sleep(0)
      } while (loop && !document.getElementById(id))

      const node = document.getElementById(id)
      if (!node) {
        return
      }

      const next = await iterator.next(node)
      if (next.done) {
        return
      }

      const element = (await render(next.value)) as [
        string,
        Props,
        ...Element[]
      ]

      const [, props, ...children] = element
      Object.assign(node, props)
      const ids = {}
      node.innerHTML = children.map((e) => toxml(e, id, ids)).join(" ")
      rerender(false)
    }

    const next = await iterator.next()
    if (next.done) {
      return null
    }

    const element = (await render(next.value)) as [string, Props, ...Element[]]
    const [, props2] = element
    id = props2.id || createUid()
    props2.id = id // don't reassign

    rerender(true)

    return element
  }

  return markup
}
