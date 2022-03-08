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

const main = async () => {
  const Tabs: AsyncComponent<{}> = async function* () {
    const tabOb = new Observable(0)

    for await (const tab of tabOb) {
      yield [
        "div",
        {},
        ["div", { onclick: () => tabOb.notify(0) }, "First"],
        ["div", { onclick: () => tabOb.notify(1) }, "Second"],
        ["h1", {}, tab === 0 ? "First" : "Second"],
      ]
    }
  }

  const App: AsyncComponent<{}> = async function* () {
    const toggleOb = new Observable(false)

    for await (const toggle of toggleOb) {
      if (!toggle) {
        yield ["div", { onclick: () => toggleOb.notify(true) }, "START"]
      } else {
        // break
        yield [Tabs, {}]
        // yield ["div", { onclick: () => toggleOb.notify(false) }, "Started"]
      }
    }
  }

  document.body.replaceChildren(...(await renderǃ(["div", {}, [App, {}]])))
}

main()
