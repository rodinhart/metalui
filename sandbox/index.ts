import {
  Component,
  Fragment,
  Markup,
  Observable,
  race,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const Lazy = async function* () {
    const Costly = (await import("./Costly.js")).default

    yield [Costly, {}]
  }

  const App = async function* () {
    const ob = new Observable(false)

    for await (const val of ob) {
      yield [
        "div",
        {},
        !val ? "Greedily loaded" : [Lazy, {}],
        ["br", {}],
        ["button", { onclick: () => ob.notify((x) => !x) }, "Switch"],
      ]
    }
  }

  window.glob = {}
  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
