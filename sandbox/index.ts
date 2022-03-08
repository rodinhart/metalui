import { AsyncComponent, Observable, renderǃ } from "../dist/index"

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
        const el = yield [
          "div",
          { onclick: () => toggleOb.notify(true) },
          "START",
        ]
        el.setAttribute("style", "background: red;")
      } else {
        // break
        yield ["div", {}, ["div", {}, String(new Date())], [Tabs, {}]]
        // yield ["div", { onclick: () => toggleOb.notify(false) }, "Started"]
      }
    }
  }

  document.body.replaceChildren(...(await renderǃ(["div", {}, [App, {}]])))
}

main()
