import { Component, Markup, Props } from "metalui"

export const createElement = (
  tag: string | Component<any>,
  props: Props | undefined,
  ...children: Markup<any>[] | Markup<any>[][]
): Markup<any> => [
  tag,
  props || {},
  ...children
    .flatMap((x) => {
      if (Array.isArray(x) && x.every((y) => Array.isArray(y))) {
        return x as Markup<any>[]
      } else {
        return [x] as Markup<any>[]
      }
    })
    .map((x) => (Array.isArray(x) ? createElement(...x) : x)),
]
