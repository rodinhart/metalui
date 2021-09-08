import { Markup, render, toxml } from "../dist/index"

import * as React from "react"
import * as ReactDOM from "react-dom"

export const ReactWrapper = <T extends any[]>(
  component: (...args: T) => AsyncGenerator<JSX.Element, void, void>
): ((...args: T) => AsyncGenerator<Markup, void, HTMLElement>) => {
  return async function* (...args: T) {
    const container = yield ["div", {}] as Markup // TODO remove this extra div

    for await (const element of component(...args)) {
      ReactDOM.render(element, container)
    }
  }
}

export const MetaluiWrapper = <T extends any[]>(
  component: (...args: T) => AsyncGenerator<Markup, void, HTMLElement>
): ((...args: T) => JSX.Element) => {
  return (...args: T) => {
    const dom = React.useRef<HTMLElement>(null)

    React.useEffect(() => {
      ;(async () => {
        const iterator = component(...args)

        const _ = async () => {
          const next = await iterator.next(dom.current!)
          if (dom.current && !next.done) {
            const element = next.value
            dom.current!.innerHTML = toxml(
              await render(element),
              dom.current!.id
            )
            _()
          } else {
            iterator.return()
          }
        }

        _()

        // for await (const element of component(...args)) {
        //   if (!dom.current) {
        //     break
        //   }

        //   dom.current!.innerHTML = toxml(await render(element), dom.current!.id)
        // }
      })()
    })

    // TODO remove this extra div
    return React.createElement("div", {
      id: Math.random().toString(16).substr(2),
      ref: dom,
    })
  }
}
