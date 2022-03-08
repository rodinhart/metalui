import { sleep, Thunk } from "./lang.js"
import { Observable } from "./Observable.js"

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
): Promise<Array<Node | AsyncGenerator<Node[], void, void>>> => {
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
    const mapped: Array<Node | AsyncGenerator<Node[], void, void>> = []
    try {
      for (const child of children) {
        mapped.push(...(await renderǃ(child, newContext)))
      }
    } catch (e) {
      // @ts-ignore
      if (newContext.$errorBoundary) {
        // @ts-ignore
        return [document.createTextNode(String(newContext.$errorBoundary))]
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
        node.setAttribute(
          key,
          key === "style" && typeof value !== "string"
            ? Object.entries(value)
                .map(([key, value]) => `${key}: ${value};`)
                .join(" ")
            : String(value)
        ) // what about non-string values?
      }
    }

    for (const child of mapped) {
      if (child instanceof Node) {
        node.appendChild(child)
      } else {
        const nodes = (await child.next()).value!
        node.append(...nodes)

        const _ = (nodes: Node[]) => {
          child.next().then((n) => {
            if (n.done) {
              return
            }

            const newNodes = n.value!

            for (const nn of newNodes) {
              node.insertBefore(nn, nodes[0]) // what if nodes === []
            }

            for (const n of nodes) {
              node.removeChild(n)
            }

            _(newNodes)
          })
        }

        _(nodes)
      }
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
  const m = genMap(
    (x) => renderǃ(x, newContext),
    iterator as AsyncGenerator<Markup<any>, void, void>
  )

  const n = genFlatten(m)

  return [n]

  // const rerender = async (atom: HTMLElement, loop: boolean) => {
  //   do {
  //     await sleep(0)
  //   } while (loop && !atom.isConnected)

  //   if (!atom.isConnected) {
  //     await iterator.return()
  //     return
  //   }

  //   const next = await iterator.next(atom)
  //   if (next.done) {
  //     return
  //   }

  //   const nodes = await renderǃ(next.value, newContext)

  //   if (nodes.length !== 1) {
  //     throw new Error(
  //       `Expect component to return single element, not ${nodes.length} elements`
  //     )
  //   }

  //   const node = nodes[0] as HTMLElement
  //   if (node.tagName !== atom.tagName) {
  //     throw new Error(
  //       `Expect component to rerender with tag ${atom.tagName.toLowerCase()}, not tag ${node.tagName.toLocaleLowerCase()}`
  //     )
  //   }

  //   for (const name of node.getAttributeNames()) {
  //     // event handlers ?!?
  //     const value = node.getAttribute(name)
  //     if (value !== null) {
  //       atom.setAttribute(name, value)
  //     }
  //   }

  //   atom.replaceChildren(...node.childNodes)

  //   rerender(atom, false)
  // }

  // const next = await iterator.next()
  // if (next.done) {
  //   return []
  // }

  // const nodes = await renderǃ(next.value, newContext)

  // if (nodes.length !== 1) {
  //   throw new Error(
  //     `Expect component to return single node, not ${nodes.length} nodes`
  //   )
  // }

  // rerender(nodes[0] as HTMLElement, true) // !!

  // return nodes
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

const isAsyncGenerator = <T>(x: any): x is AsyncGenerator<T[], void, void> =>
  typeof x.next === "function"

const genMap = <T, R>(
  f: (item: T) => Promise<R>,
  coll: AsyncGenerator<T, void, void>
): AsyncGenerator<R, void, void> =>
  (async function* () {
    for await (const item of coll) {
      yield await f(item)
    }
  })()

const genFlatten = <T>(
  coll: AsyncGenerator<Array<T | AsyncGenerator<T[], void, void>>, void, void>
): AsyncGenerator<T[]> =>
  (async function* () {
    const next = <T>(g: AsyncGenerator<T, void, void>, i: number) =>
      g.next().then((n) => [n, i] as [IteratorResult<T, void>, number])

    let items: any[] = (await coll.next()).value!
    let gens = items.filter(isAsyncGenerator) as AsyncGenerator<T, void, void>[]
    let values: any[] = await Promise.all(
      gens.map((gen) => gen.next().then((x) => x.value!))
    )
    const getYield = () => {
      const r = []
      let i = 0
      for (const item of items) {
        if (isAsyncGenerator(item)) {
          r.push(...values[i])
          i++
        } else {
          r.push(item)
        }
      }

      return r
    }

    yield getYield()

    while (true) {
      const [n, i] = await Promise.race(
        [coll, ...gens].map((g, i) => next(g as any, i))
      )
      if (i === 0) {
        if (n.done) {
          break
        }

        items = n.value! as any[]
        gens = items.filter(isAsyncGenerator) as AsyncGenerator<T, void, void>[]
        values = await Promise.all(
          gens.map((gen) => gen.next().then((x) => x.value!))
        )
      } else {
        values[i - 1] = n.done ? [] : n.value!
      }

      yield getYield()
    }
  })()
