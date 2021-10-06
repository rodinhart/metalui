import { Observable, renderǃ, race, Scroller, sleep } from "../dist/index"

const main = async () => {
  const load = async () => {
    await sleep(2000)

    return [2, 3, 5]
  }

  const App = async function* () {
    yield ["div", {}, "Loading..."]
    const list = await load()
    yield ["div", {}, ["ul", {}, ...list.map((x) => ["li", {}, x])]]
  }

  document.body.replaceChildren(...(await renderǃ([App, {}])))
}

main()
