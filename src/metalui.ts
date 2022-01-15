import { sleep, Thunk } from "./lang"
import { Observable } from "./Observable"

export type Props = Record<string, any>
type ChildrenProp = { children: Markup<any>[] }

export type SyncComponent<T extends Props> = (
  props: T & ChildrenProp
) => Markup<any>

export type AsyncComponent<T extends Props> = (
  props: T & ChildrenProp
) => AsyncGenerator<Markup<any>, void, HTMLElement>

export type Component<T extends Props> = SyncComponent<T> | AsyncComponent<T>

export type Markup<T> =
  | null
  | boolean
  | number
  | string
  | [string, Props, ...Markup<any>[]]
  | [Component<T>, T, ...Markup<any>[]]

export const Fragment: SyncComponent<{}> = ({ children }: ChildrenProp) => [
  "Fragment",
  {},
  ...children,
]

export const lazyLoad = <T>(thunk: Thunk<Component<T>>): Component<T> =>
  async function* (props: T) {
    const component = await thunk()

    yield [component, props] as Markup<any>
  }

export const renderǃ = async <T>(
  markup: Markup<T>,
  context: Record<string, any> = {}
): Promise<Node[]> => {
  // "Hello World"
  if (!Array.isArray(markup)) {
    return markup === null ? [] : [document.createTextNode(String(markup))]
  }

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

  // ["tag", {}, ...]
  if (typeof tag === "string") {
    const mapped: Node[] = []
    try {
      for (const child of children) {
        mapped.push(...(await renderǃ(child, newContext)))
      }
    } catch (e) {
      // @ts-ignore
      if (props.errorBoundary) {
        // @ts-ignore
        return [document.createTextNode(String(props.errorBoundary))]
      }

      throw e
    }

    // ["Fragment", {}, ...]
    if (tag === "Fragment") {
      return mapped
    }

    const node = document.createElement(tag)
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith("on")) {
        node.addEventListener(key.substr(2), value as any)
      } else if (!key.startsWith("$")) {
        node.setAttribute(key, String(value)) // what about non-string values?
      }
    }

    for (const child of mapped) {
      node.appendChild(child)
    }

    return [node]
  }

  const iterator = tag({ ...newContext, ...props, children } as T &
    ChildrenProp)

  // [function(), {}, ...]
  if (
    iterator === null ||
    typeof iterator !== "object" ||
    Array.isArray(iterator)
  ) {
    return await renderǃ(iterator, newContext)
  }

  // [async function*(), {}, ...]
  const rerender = async (atom: HTMLElement, loop: boolean) => {
    do {
      await sleep(0)
    } while (loop && !atom.isConnected)

    if (!atom.isConnected) {
      await iterator.return()
      return
    }

    const next = await iterator.next(atom)
    if (next.done) {
      return
    }

    const nodes = await renderǃ(next.value, newContext)

    if (nodes.length !== 1) {
      throw new Error(
        `Expect component to return single element, not ${nodes.length} elements`
      )
    }

    const node = nodes[0] as HTMLElement
    if (node.tagName !== atom.tagName) {
      throw new Error(
        `Expect component to rerender with tag ${atom.tagName.toLowerCase()}, not tag ${node.tagName.toLocaleLowerCase()}`
      )
    }

    for (const name of node.getAttributeNames()) {
      // event handlers ?!?
      const value = node.getAttribute(name)
      if (value !== null) {
        atom.setAttribute(name, value)
      }
    }

    atom.replaceChildren(...node.childNodes)

    rerender(atom, false)
  }

  const next = await iterator.next()
  if (next.done) {
    return []
  }

  const nodes = await renderǃ(next.value, newContext)

  if (nodes.length !== 1) {
    throw new Error(
      `Expect component to return single node, not ${nodes.length} nodes`
    )
  }

  rerender(nodes[0] as HTMLElement, true) // !!

  return nodes
}

export const Scroller: Component<any> = async function* ({
  Body,
  totalHeight,
}: {
  Body: Component<any>
  totalHeight: number
}) {
  const scrollOb = new Observable(0)

  const onScroll = (e: any) => {
    scrollOb.notify(e.target.scrollTop)
  }

  const ref = yield [
    "div",
    { style: "height: 100%; position: relative;" },
  ] as Markup<any>

  yield [
    "div",
    { style: "height: 100%; position: relative;" },
    [
      "div",
      {
        style: "height: 100%; overflow-y: auto; width: 100%",
        onscroll: onScroll,
      },
      ["div", { style: `height: ${totalHeight}px;` }],
    ],
    [
      "div",
      {
        style:
          "height: 100%; overflow-y: hidden; position: absolute; top: 0px; width: calc(100% - 18px);",
      },
      [Body, { height: (ref && ref.offsetHeight) || 100, scrollOb }],
    ],
  ] as Markup<any>
}
