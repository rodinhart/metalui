import { Observable, race, render, toxml } from "../dist/index"

const main = async () => {
  const App = async function* () {
    const headsOb = new Observable(0)
    const tailsOb = new Observable(0)

    const timer = setInterval(() => {
      if (Math.random() < 0.5) {
        headsOb.notify((count) => count + 1)
      } else {
        tailsOb.notify((count) => count + 1)
      }
    }, 1000)

    try {
      for await (const [heads, tails] of race(headsOb, tailsOb)) {
        yield [
          "ul",
          {},
          ["li", {}, `Heads: ${heads}`],
          ["li", {}, `Tails: ${tails}`],
        ]
      }
    } finally {
      clearInterval(timer)
    }
  }

  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
