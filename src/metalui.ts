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

type DynamicNode = AsyncGenerator<Node | null, void, void>
type Indexed = [IteratorResult<Node | null, void>, number]
const notNull = <T>(value: T | null): value is T => value !== null

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
): Promise<Node | null | DynamicNode> => {
  // "Hello World"
  if (!Array.isArray(markup)) {
    return markup === null ? null : document.createTextNode(String(markup))
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
    const mapped: Array<Node | DynamicNode> = []
    try {
      // move try-catch to function/component call
      for (const child of children) {
        const rendered = await renderǃ(child, newContext)
        if (rendered !== null) {
          mapped.push(rendered)
        }
      }
    } catch (e) {
      if (newContext.$errorBoundary) {
        return document.createTextNode(String(newContext.$errorBoundary))
      }

      throw e
    }

    // ["Fragment", {}, ...]
    if (tag === "Fragment") {
      // @ts-ignore
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

    // get initial values
    const values = await Promise.all(
      mapped.map((child) =>
        child instanceof Node
          ? Promise.resolve(child)
          : child.next().then((n) => (n.done ? null : n.value))
      )
    )
    node.replaceChildren(...values.filter(notNull))

    const _ = async () => {
      const nexts = mapped.map((child, i) =>
        child instanceof Node
          ? null
          : child.next().then((n) => [n, i] as Indexed)
      )

      do {
        const [next, i] = await Promise.race(nexts.filter(notNull))
        values[i] = next.done ? null : next.value
        node.replaceChildren(...values.filter(notNull))
        nexts[i] = next.done
          ? null
          : (mapped[i] as DynamicNode).next().then((n) => [n, i])
      } while (true)
    }

    _()

    return node
  }

  // catch error here
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

  const getNext = () =>
    iterator
      .next()
      .then((n) =>
        n.done
          ? ([n, "main"] as [
              IteratorResult<Node | null | DynamicNode, void>,
              "main" | "sub"
            ])
          : renderǃ(n.value, newContext).then(
              (value) =>
                [{ value }, "main"] as [
                  IteratorResult<Node | null | DynamicNode, void>,
                  "main" | "sub"
                ]
            )
      )

  const _ = async function* () {
    let main = getNext()
    let sub: null | DynamicNode = null
    do {
      const [next, type] = await Promise.race([
        main,
        ...(sub
          ? [
              sub
                .next()
                .then(
                  (n) =>
                    [n, "sub"] as [
                      IteratorResult<Node | null, void>,
                      "main" | "sub"
                    ]
                ),
            ]
          : []),
      ])

      if (type === "main") {
        if (next.done) {
          break
        } else {
          const value: Node | null | DynamicNode = next.value
          if (value instanceof Node || value === null) {
            yield value
          } else {
            sub = value
          }

          main = getNext()
        }
      } else {
        if (next.done) {
          sub = null
        } else {
          yield next.value
        }
      }
    } while (true)
  }

  return _()
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
