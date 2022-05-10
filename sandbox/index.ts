import {
  AsyncComponent,
  Fragment,
  Observable,
  race,
  renderǃ,
} from "../dist/index"

const main = async () => {
  const Counter = async function* () {
    const countOb = new Observable(0)

    for await (const count of countOb) {
      yield [
        "button",
        { onclick: () => countOb.notify((x) => x + 1) },
        `Count: ${count}`,
      ]
    }
  }

  const Preview = async function* ({ pageOb }) {
    for await (const page of pageOb) {
      yield [Tabs, { page: `Page ${page + 1}` }]
    }
  }

  const Selector = async function* ({ stateOb }) {
    const pageOb = new Observable(0)

    for await (const state of stateOb) {
      yield [
        "div",
        {},
        ["div", { onclick: () => pageOb.notify(0) }, "Page 1"],
        ["div", { onclick: () => pageOb.notify(1) }, "Page 2"],
        [Preview, { pageOb }],
      ]
    }
  }

  const Tabs = async function* ({ page }) {
    const tabOb = new Observable(0)

    for await (const tab of tabOb) {
      yield [
        "div",
        {},
        ["div", { onclick: () => tabOb.notify(0) }, `${page} Tab A`],
        ["div", { onclick: () => tabOb.notify(1) }, `${page} Tab B`],
        tab === 0 ? ["div", {}, "AA"] : [Counter, {}],
      ]
    }
  }

  const App = async function* () {
    const stateOb = new Observable({})

    for await (const state of stateOb) {
      yield ["div", {}, [Selector, { stateOb }]]
    }
  }

  document.body.replaceChildren(...(await renderǃ(["div", {}, [App, {}]])))
}

main()
