## errorBoundary

If any of the children throw an error when rendering, the container will display the string specified by `errorBoundary` instead of throwing the error.

```js
const WithErrorBoundary = ({ children }) => [
  "div",
  { errorBoundary: "OOPS" },
  ...children,
]
```

## Fragment

Renders a collection of child components without any containing element.

```js
const WithoutContainingDiv = ({ children }) => [Fragment, {}, ...children]
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

Sometimes one is only interested in changes to some subset of the data structure in the observable. To specify the portion to focus on, [lenses](https://bartoszmilewski.com/2021/04/01/traversals-1-van-laarhoven-and-existentials/) are used. Note that despite the focus, the observable value exposed is still the full value, not the subset.

```js
const stateOb = {
  color: "red",
  shapes: {
    rect: true,
    triangle: false,
  },
}

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

## renderǃ

Takes markup and context and returns an array of DOM nodes.

```js
const el = await renderǃ(["span", { style: "color: red;" }, "Hello", "World"])
console.log(el.length, el[0].tagName, el[0].innerText)
```

This will log `1`, `"SPAN"` and `"HelloWorld"`.

## Scroller

Scroller is a component that takes a Body component and a total height as its props. It then constructs a scrollable vertical window into a virtual canvas of total height. It renders the Body in the window giving it the relevant height of the window and vertical offset of the window. [Here](../readme.md#virtual-scrolling) is a working example.
