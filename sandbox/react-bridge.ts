import { AsyncComponent, Markup, renderǃ } from "../dist/index"

import * as React from "react"
import * as ReactDOM from "react-dom"

export const react2metalui = <T>(
  Component: (props: T) => JSX.Element
): AsyncComponent<T> =>
  async function* (props: T) {
    const container = yield ["div", {}] // TODO remove this extra div

    // use React.createElement
    ReactDOM.render(React.createElement(Component, props), container)
  }

export const metalui2react =
  <T>(Component: AsyncComponent<T>) =>
  (props: T) => {
    const dom = React.useRef<HTMLElement>(null)

    React.useEffect(() => {
      ;(async () => {
        const iterator = Component(props)

        const _ = async () => {
          const next = await iterator.next(dom.current!)
          if (dom.current && !next.done) {
            const element = next.value
            dom.current!.replaceChildren(...(await renderǃ(element)))

            _()
          } else {
            iterator.return()
          }
        }

        _()

        // for await (const element of Component(props)) {
        //   if (!dom.current) {
        //     break
        //   }

        //   dom.current!.replaceChildren(...(await renderǃ(element)))
        // }
      })()
    })

    // TODO remove this extra div
    return React.createElement("div", {
      id: Math.random().toString(16).substr(2),
      ref: dom,
    })
  }
