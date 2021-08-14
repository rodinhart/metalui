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

## Providing component context

```js
const WhatSize = ({ number, $size }) => [
  "div",
  {},
  `Size here at ${number} is ${$size}`,
]

const App = () => [
  "div",
  {},
  [WhatSize, { number: 1 }],
  ["div", {}, ["div", { $size: "large" }, [WhatSize, { number: 2 }]]],
  [WhatSize, { number: 3 }],
]

document.body.innerHTML = toxml(await render([App, { $size: "small" }]))

// Size here at 1 is small
// Size here at 2 is large
// Size here at 3 is small
```

Any context is marked with `$` and these properties are automatically propegated to the children. Context can be overwritten at any point.

## Working with mutable data

```js
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
```

The object reference to `column` is constant, as it's only mutated, but combined with a monotonically increasing revision number it behaves as an immutable object.
