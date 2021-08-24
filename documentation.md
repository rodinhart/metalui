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

## Racing multiple observables

```js
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
```

## Virtual scrolling

```js
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

document.body.innerHTML = toxml(await render([App, {}]))
```

[see in action](http://rodinhart.nl/metalui/ex-scroller.html)

## Showing loading information

```js
const load = async () => {
  await sleep(2000)

  return [2, 3, 5]
}

const App = async function* () {
  yield ["div", {}, "Loading..."]
  const list = await load()
  yield ["div", {}, ["ul", {}, ...list.map((x) => ["li", {}, x])]]
}

document.body.innerHTML = toxml(await render([App, {}]))
```

[see in action](http://rodinhart.nl/metalui/ex-loading.html)

## Lazy load components

```js
const Lazy = async function* () {
  const Costly = (await import("./Costly.js")).default

  yield [Costly, {}]
}

const App = async function* () {
  const ob = new Observable(false)

  for await (const val of ob) {
    yield [
      "div",
      {},
      !val ? "Greedily loaded" : [Lazy, {}],
      ["br", {}],
      ["button", { onclick: () => ob.notify((x) => !x) }, "Switch"],
    ]
  }
}

document.body.innerHTML = toxml(await render([App, {}]))
```
