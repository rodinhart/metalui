import {
  Component,
  Markup,
  Observable,
  race,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const App = async function* ({ ob }) {
    for await (const i of ob) {
      yield ["div", {}, `i: ${i}`]
    }
  }

  const typeOb = new Observable(true)

  window.glob = {}
  const ob = new Observable(1)
  const onclick = () => ob.notify((x) => (Math.random() < 0.5 ? x : x + 1))
  document.body.innerHTML = toxml(
    await render(["div", {}, [App, { ob }], ["button", { onclick }, "Inc"]])
  )

  setTimeout(() => {
    typeOb.notify(false)
  }, 1000)
}

main()
