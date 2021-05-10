import { Component, Markup, Props } from "metalui"

const createElement = (
  tag: string | Component,
  props: Props | undefined,
  ...children: Markup[] | Markup[][]
): Markup => [
  tag,
  props || {},
  ...children.flatMap((x: Markup | Markup[]) =>
    Array.isArray(x) ? (x as Markup[]) : [x]
  ),
]

export default {
  createElement,
}
