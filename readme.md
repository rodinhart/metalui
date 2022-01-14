# Documentation

## Contents

[1. Stateless components](#stateless-components)

[2. Stateful components](#stateful-components)

[3. Component context](#component-context)

[4. Mutable data](#mutable-data)

[5. Multiple observables](#multiple-observables)

[6. Virtual scrolling](#virtual-scrolling)

[7. Loading spinner](#loading-spinner)

[8. Lazy load components](#lazy-load-components)

[9. DOM Reference](#dom-reference)

## More documentation

[A. API](./docs/api.md)

[B. React examples as metalui](./docs/react-examples.md)

[C. Crank.js examples as metalui](./docs/crankjs-examples.md)

[D. The initial rant](./docs/initial-rant.md)

[Z. The long read](./docs/the-long-read.md)

## Stateless components

```ts
const List = ({ title, items }) => [
  "div",
  {},
  ["div", {}, `${title} (${items.length})`],
  ...items.map((item) => ["li", {}, item]),
]

document.body.replaceChildren(
  ...(await renderǃ([
    List,
    { title: "Todo", items: ["Apple", "Banana", "Chocolate"] },
  ]))
)
```

[see in action](http://rodinhart.nl/metalui/ex-stateless.html)

## Stateful components

```js
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

document.body.replaceChildren(...(await renderǃ([List, { stateOb }])))
```

[see in action](http://rodinhart.nl/metalui/ex-stateful.html)

## Component context

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

document.body.replaceChildren(...(await renderǃ([App, { $size: "small" }])))

// Size here at 1 is small
// Size here at 2 is large
// Size here at 3 is small
```

Any context is marked with `$` and these properties are automatically propegated to the children. Context can be overwritten at any point.

[see in action](http://rodinhart.nl/metalui/ex-context.html)

## Mutable data

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

document.body.replaceChildren(...(await renderǃ([Summary, { dataOb }])))

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

## Multiple observables

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

document.body.replaceChildren(...(await renderǃ([App, {}])))
```

[see in action](http://rodinhart.nl/metalui/ex-race.html)

## Virtual scrolling

```js
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

document.body.replaceChildren(...(await renderǃ([App, {}])))
```

[see in action](http://rodinhart.nl/metalui/ex-scroller.html)

## Loading spinner

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

document.body.replaceChildren(...(await renderǃ([App, {}])))
```

[see in action](http://rodinhart.nl/metalui/ex-loading.html)

## Lazy load components

```js
const Costly = lazyLoad(() => import("./Costly.js").then((r) => r.default))

const App = async function* () {
  const ob = new Observable(false)

  for await (const val of ob) {
    yield [
      "div",
      {},
      !val ? "Greedily loaded" : [Costly, { message: "greetings!" }],
      ["br", {}],
      ["button", { onclick: () => ob.notify((x) => !x) }, "Switch"],
    ]
  }
}

document.body.replaceChildren(...(await renderǃ([App, {}])))
```

## DOM Reference

```js
const App = async function* ({ name }) {
  const canvas = yield ["canvas", { width: 200, height: 20 }]
  const g = canvas.getContext("2d")
  g.fillText(name, 0, 15)
}

document.body.replaceChildren(
  ...(await renderǃ([App, { name: "Baby Driver" }]))
)
```
