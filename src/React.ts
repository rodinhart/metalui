import { Component, Markup, Props } from "metalui"

export const createElement = (
  tag: string | Component,
  props: Props | undefined,
  ...children: Markup[] | Markup[][]
): Markup => [
  tag,
  props || {},
  ...children
    .flatMap((x) =>
      Array.isArray(x) && x.every((y) => Array.isArray(y)) ? x : [x]
    )
    .map((x) => (Array.isArray(x) ? createElement(...x) : x)),
]
