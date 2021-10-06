Some of the reactjs examples from the docs implemented in metalui.

# Main Concepts

## 1. Hello World

React

```jsx
ReactDOM.render(<h1>Hello, world!</h1>, document.getElementById("root"))
```

metalui

```js
document.body.replaceChildren(...(await renderǃ(["h1", {}, "Hello, world!"])))
```

## 2. Introducing JSX

React

```jsx
const name = "Josh Perez"
const element = <h1>Hello, {name}</h1>

ReactDOM.render(element, document.getElementById("root"))
```

metalui

```js
const name = "Josh Perez"
const element = ["h1", {}, `Hello, ${name}`]

document.body.replaceChildren(...(await renderǃ(element)))
```

React

```jsx
function formatName(user) {
  return user.firstName + " " + user.lastName
}

const user = {
  firstName: "Harper",
  lastName: "Perez",
}

const element = <h1>Hello, {formatName(user)}!</h1>

ReactDOM.render(element, document.getElementById("root"))
```

metalui

```js
function formatName(user) {
  return user.firstName + " " + user.lastName
}

const user = {
  firstName: "Harper",
  lastName: "Perez",
}

const element = ["h1", {}, `Hello, ${formatName(user)}`]

document.body.replaceChildren(...(await renderǃ(element)))
```

React

```jsx
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>
  }
  return <h1>Hello, Stranger.</h1>
}
```

metalui

```js
function getGreeting(user) {
  if (user) {
    return ["h1", {}, `Hello, ${formatName(user)}!`]
  }
  return ["h1", {}, `Hello, Stranger.`]
}
```

React

```jsx
const element = <div tabIndex="0"></div>
```

metalui

```js
const element = ["div", { tabIndex: 0 }]
```

React

```jsx
const element = <img src={user.avatarUrl}></img>
```

metalui

```js
const element = ["img", { src: user.avatarUrl }]
```

React

```jsx
const element = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
)
```

metalui

```js
const element = [
  "div",
  {},
  ["h1", {}, "Hello!"],
  ["h2", {}, "Good to see you here."],
]
```

React

```jsx
const element = React.createElement(
  "h1",
  { className: "greeting" },
  "Hello, world!"
)
```

metalui

```js
const element = ["h1", { class: "greeting" }, "Hello, world!"]
```

## 3. Rendering Elements

React

```jsx
function tick() {
  const element = (
    <div>
      <h1>Hello, world!</h1>
      <h2>It is {new Date().toLocaleTimeString()}.</h2>
    </div>
  )
  ReactDOM.render(element, document.getElementById("root"))
}

setInterval(tick, 1000)
```

metalui

```js
async function tick() {
  const element = [
    "div",
    {},
    ["h1", {}, "Hello, world!"],
    ["h2", {}, `It is ${new Date().toLocaleTimeString()}.`],
  ]
  document.body.replaceChildren(...(await renderǃ(element)))
}

setInterval(tick, 1000)
```

## 4. Components and Props

React

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

const element = <Welcome name="Sara" />
ReactDOM.render(element, document.getElementById("root"))
```

metalui

```js
function Welcome(props) {
  return ["h1", {}, `Hello, ${props.name}`]
}

const element = [Welcome, { name: "Sara" }]
document.body.replaceChildren(...(await renderǃ(element)))
```

React

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
```

metalui

```js
function Welcome(props) {
  return ["h1", {}, `Hello, ${props.name}`]
}

function App() {
  return [
    "div",
    {},
    [Welcome, { name: "Sara" }],
    [Welcome, { name: "Cahal" }],
    [Welcome, { name: "Edite" }],
  ]
}

document.body.replaceChildren(...(await renderǃ([App, {}])))
```

## 5. State and Lifecycle

React

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props)
    this.state = { date: new Date() }
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timerID)
  }

  tick() {
    this.setState({
      date: new Date(),
    })
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    )
  }
}

ReactDOM.render(<Clock />, document.getElementById("root"))
```

metalui

```js
const Clock = async function* () {
  const nowOb = new Observable(new Date())

  const timerID = setInterval(() => {
    nowOb.notify(new Date())
  }, 1000)

  try {
    for await (const now of nowOb) {
      yield [
        "div",
        {},
        ["h1", {}, "Hello, world!"],
        ["h2", {}, `It is ${now.toLocaleTimeString()}.`],
      ]
    }
  } finally {
    clearInterval(timerID)
  }
}

document.body.replaceChildren(...(await renderǃ([Clock, {}])))
```

## 6. Handling Events

React

```jsx
<button onClick={activateLasers}>Activate Lasers</button>
```

metalui

```js
;["button", { onclick: activateLasers }, "Activate Lasers"]
```

## 7. Conditional Rendering

React

```jsx
class LoginControl extends React.Component {
  constructor(props) {
    super(props)
    this.handleLoginClick = this.handleLoginClick.bind(this)
    this.handleLogoutClick = this.handleLogoutClick.bind(this)
    this.state = { isLoggedIn: false }
  }

  handleLoginClick() {
    this.setState({ isLoggedIn: true })
  }

  handleLogoutClick() {
    this.setState({ isLoggedIn: false })
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn
    let button
    if (isLoggedIn) {
      button = <LogoutButton onClick={this.handleLogoutClick} />
    } else {
      button = <LoginButton onClick={this.handleLoginClick} />
    }

    return (
      <div>
        <Greeting isLoggedIn={isLoggedIn} />
        {button}
      </div>
    )
  }
}

ReactDOM.render(<LoginControl />, document.getElementById("root"))
```

metalui

```js
const LoginControl = async function* () {
  const stateOb = new Observable({
    isLoggedIn: false,
  })

  const handleLoginClick = () => {
    stateOb.notify((state) => ({
      ...state,
      isLoggedIn: true,
    }))
  }

  const handleLogoutClick = () => {
    stateOb.notify((state) => ({
      ...state,
      isLoggedIn: false,
    }))
  }

  for await (const { isLoggedIn } of stateOb) {
    let button
    if (isLoggedIn) {
      button = [LogoutButton, { onclick: handleLogoutClick }]
    } else {
      button = [LoginButton, { onclick: handleLoginClick }]
    }

    yield ["div", {}, [Greeting, { isLoggedIn }], button]
  }
}

document.body.replaceChildren(...(await renderǃ([LoginControl, {}])))
```

React

```jsx
function Mailbox(props) {
  const unreadMessages = props.unreadMessages
  return (
    <div>
      <h1>Hello!</h1>
      {unreadMessages.length > 0 && (
        <h2>You have {unreadMessages.length} unread messages.</h2>
      )}
    </div>
  )
}

const messages = ["React", "Re: React", "Re:Re: React"]
ReactDOM.render(
  <Mailbox unreadMessages={messages} />,
  document.getElementById("root")
)
```

metalui

```js
const Mailbox = (props) => {
  const unreadMessages = props.unreadMessages

  return [
    "div",
    {},
    ["h1", {}, "Hello!"],
    unreadMessages.length > 0
      ? ["h2", {}, `You have ${unreadMessages.length} unread messages.`]
      : null,
  ]
}

const messages = ["React", "Re: React", "Re:Re: React"]

document.body.replaceChildren(
  ...(await renderǃ([Mailbox, { unreadMessages: messages }]))
)
```

## 8. Lists and Keys

React

```jsx
function NumberList(props) {
  const numbers = props.numbers
  const listItems = numbers.map((number) => <li>{number}</li>)
  return <ul>{listItems}</ul>
}

const numbers = [1, 2, 3, 4, 5]
ReactDOM.render(
  <NumberList numbers={numbers} />,
  document.getElementById("root")
)
```

metalui

```js
const NumberList = (props) => {
  const numbers = props.numbers
  const listItems = numbers.map((number) => ["li", {}, number])

  return ["ul", {}, ...listItems]
}

const numbers = [1, 2, 3, 4, 5]

document.body.replaceChildren(...(await renderǃ([NumberList, { numbers }])))
```

React

```jsx
function NumberList(props) {
  const numbers = props.numbers
  return (
    <ul>
      {numbers.map((number) => (
        <ListItem key={number.toString()} value={number} />
      ))}
    </ul>
  )
}
```

metalui

```js
const NumberList = (props) => {
  const numbers = props.numbers

  return ["ul", {}, ...numbers.map((number) => ["li", {}, number])]
}

const numbers = [1, 2, 3, 4, 5]

document.body.replaceChildren(...(await renderǃ([NumberList, { numbers }])))
```

## 9. Forms

### Controlled Components

```jsx
class NameForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = { value: "" }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleChange(event) {
    this.setState({ value: event.target.value })
  }

  handleSubmit(event) {
    alert("A name was submitted: " + this.state.value)
    event.preventDefault()
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    )
  }
}
```

```js
const NameForm = async function* () {
  const stateOb = new Observable({ name: "" })

  const handleChange = (e) => {
    stateOb.notify((state) => ({
      ...state,
      name: e.target.value,
    }))
  }

  const handleSubmit = (e) => {
    alert(`A name was submitted: ${stateOb.value.name}`)
    e.preventDefault()
  }

  for await (const state of stateOb) {
    yield [
      "form",
      {
        onsubmit: handleSubmit,
      },
      [
        "label",
        {},
        "Name:",
        [
          "input",
          {
            type: "text",
            value: state.name,
            onchange: handleChange,
          },
        ],
      ],
      [
        "input",
        {
          type: "submit",
          value: "Submit",
        },
      ],
    ]
  }
}

document.body.replaceChildren(...(await renderǃ([NameForm, {}])))
```

## 11. Composition vs Inheritance

React

```jsx
function FancyBorder(props) {
  return (
    <div className={"FancyBorder FancyBorder-" + props.color}>
      {props.children}
    </div>
  )
}
```

metalui

```js
const FancyBorder = (props) => [
  "div",
  { class: "FancyBorder FancyBorder-" + props.color },
  ...props.children,
]
```

# Hooks

## Introducing Hooks

React

```jsx
function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

metalui

```js
const Example = async function* () {
  const countOb = new Observable(0)

  for await (const count of countOb) {
    yield [
      "div",
      {},
      ["p", {}, `You clicked ${count} times`],
      [
        "button",
        { onclick: () => countOb.notify((count) => count + 1) },
        "Click me",
      ],
    ]
  }
}
```

React

```jsx
function Example() {
  const [count, setCount] = useState(0)

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`
  })

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  )
}
```

metalui

```js
const Example = async function* () {
  const countOb = new Observable(0)

  for await (const count of countOb) {
    yield [
      "div",
      {},
      ["p", {}, `You clicked ${count} times`],
      [
        "button",
        { onclick: () => countOb.notify((count) => count + 1) },
        "Click me",
      ],
    ]

    document.title = `You clicked ${count} times`
  }
}
```

## Hooks API Reference

### useContext

React

```jsx
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee",
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222",
  },
}

const ThemeContext = React.createContext(themes.light)

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  )
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  )
}

function ThemedButton() {
  const theme = useContext(ThemeContext)
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  )
}
```

metalui

```js
const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee",
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222",
  },
}

// Put themeOb in whatever global context you are using
const themeOb = new Observable(themes.dark)

const Toolbar = () => ["div", {}, [ThemedButton, {}]]

const ThemedButton = async function* ({ $themeOb }) {
  for await (const theme of $themeOb) {
    yield [
      "button",
      {
        style: `background: ${theme.background}; color: ${theme.foreground};`,
      },
      "I am styled by theme context!",
    ]
  }
}
```
