import {
  Component,
  Fragment,
  Markup,
  Observable,
  race,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const Content = () => {
    throw new Error("Blah")
    return ["p", {}, "I'm here"]
  }

  const Container = async function* ({ children }) {
    yield ["div", {}, ...children]
  }

  const App = () => [
    "div",
    {},
    ["h1", {}, "Welcome!"],
    [Container, { errorBoundary: ["div", {}, "We are fuck*d"] }, [Content, {}]],
    ["p", {}, "The aftermath"],
  ]

  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
