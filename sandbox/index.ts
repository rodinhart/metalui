import { render, Scroller, toxml } from "../dist/index"

const main = async () => {
  const App = () => {
    const data = new Array(100000)
      .fill(0)
      .map(() => Math.random().toString(36).substr(2))

    const Rows = async function* ({ height, scrollOb }) {
      for await (const scroll of scrollOb) {
        const start = Math.round(scroll / 19)
        const len = Math.ceil(height / 19)

        yield [
          "div",
          {},
          ...data
            .slice(start, start + len)
            .map((row, i) => [
              "div",
              { style: "height: 19px;" },
              `${1 + start + i}: ${row}`,
            ]),
        ]
      }
    }

    return [
      "div",
      { style: "width: 200px; height: 400px;" },
      [Scroller, { totalHeight: data.length * 19, Body: Rows }],
    ]
  }

  window.glob = {}
  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
