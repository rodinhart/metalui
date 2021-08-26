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
  const disj = <T>(set: Set<T>, ...keys: T[]) => {
    const r = new Set(set)
    for (const key of keys) {
      r.delete(key)
    }

    return r
  }

  // Some async data loading
  const loadItems = async () => {
    await sleep(42)

    return ["Apples", "Bananas", "Chocolate"]
  }

  const List = async function* ({ stateOb }) {
    // Some local state available while the component is alive
    const onClick = (item) =>
      stateOb.notify((state) => ({
        ...state,
        selected: state.selected.has(item)
          ? disj(state.selected, item)
          : new Set([...state.selected, item]),
      }))

    for await (const { selected } of stateOb) {
      if (!selected) {
        return // exit component
      }

      // Some async data loading
      const items = await loadItems()

      yield [
        "div",
        {},
        [
          "ul",
          {},
          ...items.map((item) => [
            "li",
            {
              style: selected.has(item) ? "font-weight: bold;" : "",
              onclick: () => onClick(item),
            },
            item,
          ]),
        ],
      ]
    }
  }

  const stateOb = new Observable({
    selected: new Set(["Bananas"]),
  })

  window.glob = {}
  document.body.innerHTML = toxml(await render([List, { stateOb }]))
}

main()
