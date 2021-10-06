import { Observable, renderǃ, sleep } from "../dist/index"

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

  const List = async function* ({
    stateOb,
  }: {
    stateOb: Observable<{
      selected: Set<string>
    }>
  }) {
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

  document.body.replaceChildren(...(await renderǃ([List, { stateOb }])))
}

main()
