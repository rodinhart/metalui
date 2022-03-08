import { Thunk } from "./lang.js"
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
      if (newContext.$errorBoundary) {
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
        node.addEventListener(key.substring(2), value as any)
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

        const monitor = (nodes: Node[]) => {
          child.next().then((n) => {
            if (n.done) {
              return
            }

            if (!node.isConnected) {
              child.return()
              return
            }

            const newNodes = n.value!

            for (const nn of newNodes) {
              node.insertBefore(nn, nodes[0]) // what if nodes === []
            }

            for (const n of nodes) {
              node.removeChild(n)
            }

            monitor(newNodes)
          })
        }

        monitor(nodes)
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
    iterator,
    (r) => (r.length === 1 && r[0] instanceof Node ? r[0] : undefined),
    undefined
  )
  const n = genFlatten(m)

  return [n]
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

const isAsyncGenerator = <T>(x: any): x is AsyncGenerator<T, void, void> =>
  typeof x.next === "function"

const genMap = <A, B, R>(
  f: (item: A) => Promise<B>,
  coll: AsyncGenerator<A, void, R>,
  ret: (value: B) => R,
  initial: R
): AsyncGenerator<B, void, void> => {
  let r: R = initial

  return {
    async next(): Promise<IteratorResult<B, void>> {
      const n = await coll.next(r)
      if (n.done) {
        return n
      }

      const value = await f(n.value)
      r = ret(value)

      return {
        done: n.done,
        value,
      }
    },

    async return(): Promise<IteratorResult<B, void>> {
      const n = await coll.return()
      if (n.done) {
        return n
      }

      const value = await f(n.value)

      return {
        done: n.done,
        value,
      }
    },

    async throw(e: any): Promise<IteratorResult<B, void>> {
      const n = await coll.throw(e)
      if (n.done) {
        return n
      }

      const value = await f(n.value)

      return {
        done: n.done,
        value,
      }
    },

    [Symbol.asyncIterator]() {
      return null as any
    },
  }
}

const genFlatten = <T>(
  coll: AsyncGenerator<Array<T | AsyncGenerator<T[], void, void>>, void, void>
): AsyncGenerator<T[]> =>
  (async function* () {
    let items: Array<T | AsyncGenerator<T[], void, void>> = (await coll.next())
      .value!
    let gens = items.filter((x: any) => isAsyncGenerator(x)) as AsyncGenerator<
      T[],
      void,
      void
    >[]
    let values = await Promise.all(
      gens.map((gen) => gen.next().then((x) => x.value!))
    )
    const getYield = () => {
      const r: T[] = []
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
        [coll, ...gens].map((g, i) =>
          g.next().then((n) => [n, i] as [typeof n, number])
        )
      )
      if (i === 0) {
        if (n.done) {
          break
        }

        items = n.value!
        gens = items.filter(isAsyncGenerator) as AsyncGenerator<
          T[],
          void,
          void
        >[]
        values = await Promise.all(
          gens.map((gen) => gen.next().then((x) => x.value!))
        )
      } else {
        values[i - 1] = n.done ? [] : (n.value! as T[])
      }

      yield getYield()
    }
  })()
