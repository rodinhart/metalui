## errorBoundary

```js
const WithErrorBoundary = ({ children }) => [
  "div",
  { errorBoundary: "OOPS" },
  ...children,
]
```

## Fragment

```js
const WithoutContainingDiv = ({ children }) => [Fragment, {}, ...children]
```

## Observable

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
