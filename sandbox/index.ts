import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const Bad = async function* ({ ob }) {
    for await (const v of ob) {
      yield v % 2
        ? ["div", {}, "Divving it"]
        : ["b", {}, "Spanner in the works"]
    }
  }

  const ob = new Observable(1)
  document.body.innerHTML = toxml(await render([Bad, { ob }]))

  setInterval(() => {
    ob.notify((x) => x + 1)
  }, 1000)
}

main()
