# Documentation

## A stateless component

```ts
const List = ({ title, items }) => [
  "div",
  { class: "todo-list" },
  ["div", {}, `${title} (${items.length})`],
  ...items.map((item) => ["li", {}, item]),
]
```

[see in action](http://rodinhart.nl/metalui/ex1.html)

## A stateful component

```ts
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
      { class: "todo-list" },
      [
        "ul",
        {},
        ...items.map((item) => [
          "li",
          {
            class: selected.has(item) ? "todo--selected" : "",
            onclick: () => onClick(item),
          },
          item,
        ]),
      ],
    ]
  }
}
```

[see in action](http://rodinhart.nl/metalui/ex2.html)
