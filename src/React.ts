import { Component, Markup, Props } from "metalui"

export const createElement = (
  tag: string | Component,
  props: Props | undefined,
  ...children: Markup[] | Markup[][]
): Markup => [
  tag,
  props || {},
  ...children
    .flatMap((x) => {
      if (Array.isArray(x) && x.every((y) => Array.isArray(y))) {
        return x as Markup[]
      } else {
        return [x] as Markup[]
      }
    })
    .map((x) => (Array.isArray(x) ? createElement(...x) : x)),
]
