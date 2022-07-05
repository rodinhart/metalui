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

export type DynamicNodes = AsyncGenerator<Node[], void, void>
type Indexed = [IteratorResult<Node[], void>, number]
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
): Promise<Node[] | DynamicNodes> => {
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
  if (tag === "svg") {
    newContext.$namespace = "http://www.w3.org/2000/svg"
  }

  // ["tag", {}, ...]
  if (typeof tag === "string") {
    const mapped: Array<Node[] | DynamicNodes> = []
    for (const child of children) {
      const rendered = await renderǃ(child, newContext)
      if (rendered !== null) {
        mapped.push(rendered)
      }
    }

    // ["Fragment", {}, ...]
    if (tag === "Fragment") {
      if (mapped.every((x) => Array.isArray(x))) {
        return mapped.flat() as Node[]
      }

      return flattenChildren(mapped)
    }

    const node = !newContext.$namespace
      ? document.createElement(tag)
      : document.createElementNS(newContext.$namespace, tag)
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

    if (mapped.every((x) => Array.isArray(x))) {
      node.replaceChildren(...(mapped.flat() as Node[]))

      return [node]
    }

    ;(async () => {
      for await (const values of flattenChildren(mapped)) {
        node.replaceChildren(...values)
      }
    })()

    return [node]
  }

  let result: ReturnType<typeof tag>
  try {
    result = tag({ ...newContext, ...props, children } as T & ChildrenProp)
  } catch (e) {
    console.log({ e, newContext })
    if (newContext.$errorBoundary) {
      return [document.createTextNode(String(newContext.$errorBoundary))]
    }

    throw e
  }

  // [function(), {}, ...]
  if (
    result === null ||
    typeof result !== "object" ||
    Array.isArray(result) // ??
  ) {
    return await renderǃ(result, newContext)
  }

  const iterator = result as AsyncGenerator<Markup<any>, void, HTMLElement>
  const getNext = () =>
    iterator
      .next()
      .then((n) =>
        n.done
          ? ([n, "main"] as [
              IteratorResult<Node[] | DynamicNodes, void>,
              "main" | "sub"
            ])
          : renderǃ(n.value, newContext).then(
              (value) =>
                [{ value }, "main"] as [
                  IteratorResult<Node[] | DynamicNodes, void>,
                  "main" | "sub"
                ]
            )
      )

  const _ = async function* (): DynamicNodes {
    let main = getNext()
    let sub: null | DynamicNodes = null
    do {
      const promises = [main]
      if (sub) {
        promises.push(
          sub
            .next()
            .then(
              (n) =>
                [n, "sub"] as [IteratorResult<Node[], void>, "main" | "sub"]
            )
        )
      }

      const [next, type] = await Promise.race(promises)

      if (type === "main") {
        if (next.done) {
          break
        } else {
          const value: Node[] | DynamicNodes = next.value
          if (Array.isArray(value)) {
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
          yield next.value as Node[]
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

const flattenChildren = async function* (
  mapped: (Node[] | DynamicNodes)[]
): DynamicNodes {
  // get initial values
  const values = await Promise.all(
    mapped.map((child) =>
      Array.isArray(child)
        ? Promise.resolve(child)
        : child.next().then((n) => (n.done ? [] : n.value))
    )
  )
  yield values.flat()

  const nexts = mapped.map((child, i) =>
    Array.isArray(child) ? null : child.next().then((n) => [n, i] as Indexed)
  )

  do {
    const [next, i] = await Promise.race(nexts.filter(notNull))
    values[i] = next.done ? [] : next.value
    yield values.flat()
    nexts[i] = next.done
      ? null
      : (mapped[i] as DynamicNodes).next().then((n) => [n, i])
  } while (true)
}
