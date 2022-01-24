# API

[**AsyncComponent**](#asynccomponent)

[**errorBoundary**](#errorboundary)

[**Fragment**](#fragment)

[**lenses**](#lenses)

[**Observable**](#observable)

[**race**](#race)

[**render**](#render)

[**Scroller**](#scroller)

[**SyncComponent**](#synccomponent)

## AsyncComponent<T>

The type for an asynchronous component. There is an implied prop `children` representing the children.

```ts
const Prefixed: AsyncComponent<{ prefixOb: Observable<number> }> =
  async function* ({ prefixOb, children }) {
    for await (const prefix of prefixOb) {
      yield ["div", {}, ["h3", {}, prefix.toFixed(2)], ...children]
    }
  }
```

## errorBoundary

If any of the children throw an error when rendering, the container will display the string specified by `$errorBoundary` instead of throwing the error.

```js
const WithErrorBoundary = ({ children }) => [
  "div",
  { $errorBoundary: "OOPS" },
  ...children,
]
```

## Fragment

Renders a collection of child components without any containing element.

```js
const WithoutContainingDiv = ({ children }) => [Fragment, {}, ...children]
```

## lenses

A lens enables you to focus on part of a data structure and view, update or set the associated value. Lenses are functional in the sense no data is ever mutated, and lenses are composable to allow focus deep into data.

```js
const data = {
  name: "Brian",
  role: "Dev",
}

const lens = lenses.prop("role")

lenses.view(data, lens) // "Dev"
lenses.over(data, lens, (role) => role.toUpperCase()) // { name: "Brian", role: "DEV" }
```

Here's how function composition operates on lenses

```js
const data = {
  name: "Brian",
  friends: [{ name: "Dennis" }, { name: "Claude" }, { name: "Donald" }],
}

const lens = compose(
  lenses.prop("friends"),
  lenses.index(1),
  lenses.prop("name")
)

lenses.view(data, lens) // "Claude"
lenses.over(data, lens, (name) => name.toUpperCase())
/*
  {
    name: "Brian",
    friends: [{ name: "Dennis" }, { name: "CLAUDE" }, { name: "Donald" }],
  }
*/
```

## Observable

An observable represents a succession of states. Each new state is constructed from the previous state. Ideally the states are value, that is, they are immutable.

Observables are async iterators and can easily be observed using the `for await of` construct.

### notify

Update the state and notify any observers.

```js
const integersOb = new Observable([2, 3, 5])
setTimeout(() => {
  integersOb.notify((integers) => [...integers, 7])
}, 1000)

for await (const integers of integersOb) {
  console.log(integers)
}
```

This will log `[2, 3, 5]` and after about a second `[2, 3, 5, 7]`

### focus

Sometimes one is only interested in changes to some subset of the data structure in the observable. To specify the portion to focus on, [lenses](#lenses) are used. Note that despite the focus, the observable value exposed is still the full value, not the subset.

```js
const stateOb = {
  color: "red",
  shapes: {
    rect: true,
    triangle: false,
  },
}

setTimeout(() => {
  stateOb.notify((state) => ({
    ...state,
    color: "green",
  }))
}, 1000)

setTimeout(() => {
  stateOb.notify((state) => ({
    ...state,
    shapes: {
      ...state.shapes,
      triangle: true,
    },
  }))
}, 2000)

for await (const state of stateOb.focus()) {
  console.log(state)
}
```

This will log `{"color":"red","shapes":{"rect":true,"triangle":false}}` and after about two seconds `{"color":"green","shapes":{"rect":true,"triangle":true}}`

## race

This enables observing multiple observables (or any async iterators). It exposes all the observables current values whenever any of them receives notification of an update.

```js
const shapeOb = new Observable("rectangle")
const colorOb = new Observable("red")

setTimeout(() => {
  colorOb.notify("green")
}, 1000)

setTimeout(() => {
  shapeOb.notify("circle")
}, 2000)

for await (const [shape, color] of race(shapeOb, colorOb)) {
  console.log(`${color} ${shape}`)
}
```

This will log `red rectangle`, `green rectangle` and `green circle`.

## render!

Takes markup and context and returns an array of DOM nodes.

```js
const el = await renderǃ(["span", { style: "color: red;" }, "Hello", "World"])
console.log(el.length, el[0].tagName, el[0].innerText)
```

This will log `1`, `"SPAN"` and `"HelloWorld"`.

## Scroller

Scroller is a component that takes a Body component and a total height as its props. It then constructs a scrollable vertical window into a virtual canvas of total height. It renders the Body in the window giving it the relevant height of the window and vertical offset of the window. [Here](../readme.md#virtual-scrolling) is a working example.

'

## SyncComponent<T>

The type for a synchronous component.

```ts
const List: SyncComponent<{ title: string; items: string[] }> = ({
  title,
  items,
}) => [
  "div",
  {},
  ["div", {}, `${title} (${items.length})`],
  ...items.map((item): Markup<any> => ["li", {}, item]),
]
```

There is an implied prop `children` representing the children.

```ts
const Reverse: SyncComponent<{}> = ({ children }) => [
  "div",
  {},
  ...children.slice().reverse(),
]
```
