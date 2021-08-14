import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const column = [1, 2, 3, 4, 5]

  const dataOb = new Observable({
    column,
    revision: 1,
  })

  const Summary = async function* ({ dataOb }) {
    for await (const { column } of dataOb) {
      yield [
        "div",
        {},
        `Count: ${column.length}, Sum: ${column.reduce((r, x) => r + x, 0)}`,
      ]
    }
  }

  document.body.innerHTML = toxml(await render([Summary, { dataOb }]))

  setTimeout(() => {
    dataOb.notify(({ column, revision }) => {
      column.pop() // mutation

      return {
        column,
        revision: revision + 1,
      }
    })
  }, 2000)
}

main()
