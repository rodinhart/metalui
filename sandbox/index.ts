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
  const Scroller = async function* ({ Body, totalHeight }) {
    const scrollOb = new Observable(0)

    const onScroll = (e) => {
      scrollOb.notify(e.target.scrollTop)
    }

    const ref = yield ["div", { style: "height: 100%; position: relative;" }]

    yield [
      "div",
      { style: "height: 100%; position: relative;" },
      [
        "div",
        {
          style: "height: 100%; overflow-y: auto; width: 100%",
          onscroll: onScroll,
        },
        ["div", { style: `height: ${totalHeight}px;` }],
      ],
      [
        "div",
        {
          style:
            "height: 100%; overflow-y: hidden; position: absolute; top: 0px; width: calc(100% - 18px);",
        },
        [Body, { height: (ref && ref.offsetHeight) || 100, scrollOb }],
      ],
    ]
  }

  const App = () => {
    const data = new Array(100000)
      .fill(0)
      .map(() => Math.random().toString(36).substr(2))

    const Rows = async function* ({ height, scrollOb }) {
      for await (const scroll of scrollOb) {
        const start = Math.floor(scroll / 19)
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
      [Scroller, { totalHeight: (1 + data.length) * 19, Body: Rows }],
    ]
  }

  window.glob = {}
  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
