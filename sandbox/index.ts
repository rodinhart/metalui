import {
  AsyncComponent,
  Fragment,
  lenses,
  Markup,
  Observable,
  Props,
  race,
  renderǃ,
  SyncComponent,
} from "../dist/index"

import { metalui2react, react2metalui } from "./react-bridge"
import * as React from "react"
import * as ReactDOM from "react-dom"

import Hello from "./ReactComponent"

const main = async () => {
  // const App: SyncComponent<{}> = () => [
  //   "div",
  //   {},
  //   ["div", { style: { color: "red" } }, "Urgent Message"],
  //   [react2metalui(Hello), { name: "Pete" }],
  // ]
  // document.body.replaceChildren(...(await renderǃ([App, {}])))

  const Greet: AsyncComponent<{}> = async function* () {
    const dateOb = new Observable(new Date())

    setInterval(() => {
      dateOb.notify(new Date())
    }, 1000)

    for await (const date of dateOb) {
      yield ["div", { style: { color: "green" } }, date.toUTCString()]
    }
  }

  ReactDOM.render(
    React.createElement(metalui2react(Greet), null),
    document.body
  )
}

main()
