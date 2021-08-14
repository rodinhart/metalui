import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const Clock = async function* () {
    const nowOb = new Observable(new Date())

    const timerID = setInterval(() => {
      nowOb.notify(new Date())
    }, 1000)

    try {
      for await (const now of nowOb) {
        yield [
          "div",
          {},
          ["h1", {}, "Hello, world!"],
          ["h2", {}, `It is ${now.toLocaleTimeString()}.`],
        ]
      }
    } finally {
      clearInterval(timerID)
    }
  }

  document.body.innerHTML = toxml(await render([Clock, {}]))
}

main()
