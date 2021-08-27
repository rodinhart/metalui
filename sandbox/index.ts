import { lazyLoad, Observable, render, toxml } from "../dist/index"

const main = async () => {
  const Costly = lazyLoad(() => import("./Costly.js").then((r) => r.default))

  const App = async function* () {
    const ob = new Observable(false)

    for await (const val of ob) {
      yield [
        "div",
        {},
        !val ? "Greedily loaded" : [Costly, { message: "greetings!" }],
        ["br", {}],
        ["button", { onclick: () => ob.notify((x) => !x) }, "Switch"],
      ]
    }
  }

  window.glob = {}
  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
