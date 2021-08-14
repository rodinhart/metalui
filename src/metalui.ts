import { createUid, map, sleep, toObject } from "./lang"

const escapeHtml = (() => {
  const e = document.createElement("div")

  return (s: string) => {
    e.innerText = s

    return e.innerHTML
  }
})()

declare const glob: Record<string, Record<string, (e: Event) => void>>

// e.g. AppProps, PropertyProps etc?
export type Props = Record<string, any>
type Element = null | boolean | number | string | [string, Props, ...Element[]]
export type Component<T extends Props> =
  | ((props: T) => Markup<any>)
  | ((props: T) => AsyncGenerator<Markup<any>, void, HTMLElement>)
export type Markup<T> =
  | null
  | boolean
  | number
  | string
  | [string | Component<T>, T, ...Markup<any>[]]

// JSONML to XML string
export const toxml = (
  el: Element,
  gkey: string = "GLOBAL",
  ids: Record<string, (e: Event) => void> = {}
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

  return el === null ? "" : escapeHtml(String(el))
}

export const render = async (
  markup: Markup<any>,
  context: Record<string, any> = {}
): Promise<Element> => {
  if (Array.isArray(markup)) {
    const [tag, props, ...children] = markup

    const newContext = Object.entries(props).reduce<Record<string, any>>(
      (r, [key, val]) => {
        if (key[0] === "$") {
          r[key] = val
        }

        return r
      },
      { ...context }
    )

    const mapped: Element[] = []
    for (const child of children) {
      mapped.push(await render(child, newContext))
    }

    if (typeof tag === "string") {
      return [tag, props, ...mapped]
    }

    const iterator = tag({ ...newContext, ...props, children: mapped })
    if (
      iterator === null ||
      typeof iterator !== "object" ||
      Array.isArray(iterator)
    ) {
      return await render(iterator, newContext)
    }

    let id: string
    const rerender = async (loop: boolean) => {
      do {
        await sleep(0)
      } while (loop && !document.getElementById(id))

      const node = document.getElementById(id)
      if (!node) {
        await iterator.return()
        return
      }

      const next = await iterator.next(node)
      if (next.done) {
        return
      }

      const element = (await render(next.value, newContext)) as [
        string,
        Props,
        ...Element[]
      ]

      if (!Array.isArray(element)) {
        throw new Error(`Expect component to rerender a tag, not ${element}`)
      }

      const [tag, props, ...children] = element
      if (tag !== node.tagName) {
        throw new Error(
          `Expect component to rerender with tag ${node.tagName}, not tag ${tag}`
        )
      }

      Object.assign(node, props)
      const ids = {}
      node.innerHTML = children.map((e) => toxml(e, id, ids)).join(" ")
      rerender(false)
    }

    const next = await iterator.next()
    if (next.done) {
      return null
    }

    const element = (await render(next.value, newContext)) as [
      string,
      Props,
      ...Element[]
    ]

    if (!Array.isArray(element)) {
      throw new Error(`Expect component to return a tag, not ${element}`)
    }

    const [, props2] = element
    id = props2.id || createUid()
    props2.id = id // don't reassign

    rerender(true)

    return element
  }

  return markup
}
