Some of the Crank.js examples from the docs implemented in metalui.

# Getting Started

## Key Examples

### A Simple Component

Crank.js

```jsx
function Greeting({ name = "World" }) {
  return <div>Hello {name}</div>
}

renderer.render(<Greeting />, document.body)
```

metalui

```js
const Greeting = ({ name = "World" }) => ["div", {}, `Hello ${name}`]

document.body.replaceChildren(...(await renderǃ([Greeting, {}])))
```

### A Stateful Component

Crank.js

```jsx
function* Timer() {
  let seconds = 0
  const interval = setInterval(() => {
    seconds++
    this.refresh()
  }, 1000)
  try {
    while (true) {
      yield <div>Seconds: {seconds}</div>
    }
  } finally {
    clearInterval(interval)
  }
}

renderer.render(<Timer />, document.body)
```

metalui

```js
const Timer = async function* () {
  const secondsOb = new Observable(0)

  const interval = setInterval(() => {
    secondsOb.notify((seconds) => seconds + 1)
  }, 1000)

  try {
    for await (const seconds of secondsOb) {
      yield ["div", {}, `Seconds: ${seconds}`]
    }
  } finally {
    clearInterval(interval)
  }
}

document.body.replaceChildren(...(await renderǃ([Timer, {}])))
```

### An Async Component

Crank.js

```jsx
async function QuoteOfTheDay() {
  const res = await fetch("https://favqs.com/api/qotd")
  const { quote } = await res.json()
  return (
    <p>
      “{quote.body}” – <a href={quote.url}>{quote.author}</a>
    </p>
  )
}

renderer.render(<QuoteOfTheDay />, document.body)
```

metalui

```js
const QuoteOfTheDay = async function* () {
  const res = await fetch("https://favqs.com/api/qotd")
  const { quote } = await res.json()

  yield [
    "p",
    {},
    `“${quote.body}” – `,
    ["a", { href: quote.url }, quote.author],
  ]
}

document.body.replaceChildren(...(await renderǃ([QuoteOfTheDay, {}])))
```

# Components

## Stateful Components

### Props Updates

Crank.js

```jsx
function* Counter({ message }) {
  let count = 0
  for ({ message } of this) {
    count++
    yield (
      <div>
        {message} {count}
      </div>
    )
  }
}

renderer.render(<Counter message="The count is now:" />, document.body)

console.log(document.body.innerHTML) // "<div>The count is now: 1</div>"

renderer.render(
  <Counter message="Le décompte est maintenant:" />,
  document.body
)

console.log(document.body.innerHTML) // "<div>Le décompte est maintenant: 2</div>"
```

metalui

```js
const Counter = async function* ({ messageOb }) {
  let count = 0

  for await (const message of messageOb) {
    count++
    yield ["div", {}, `${message} ${count}`]
  }
}

const messageOb = new Observable("The count is now:")

document.body.replaceChildren(...(await renderǃ([Counter, { messageOb }])))

console.log(document.body.innerHTML) // "<div>The count is now: 1</div>"

messageOb.notify("Le décompte est maintenant:")

// notify is fire and forget, so sleep to ensure dom has changed
await sleep(1)
console.log(document.body.innerHTML) // "<div>Le décompte est maintenant: 2</div>"
```
