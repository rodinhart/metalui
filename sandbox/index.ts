import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const Test = async function* ({ ob }) {
    try {
      for await (const v of ob) {
        yield ["div", {}, v]
      }
    } finally {
      console.log("Dismounting!")
    }
  }

  const Container = async function* ({ ob }) {
    yield ["div", {}, [Test, { ob }]]

    for await (const v of ob) {
      if (v > 3) {
        yield ["div", {}, "Nothing to see here"]
      }
    }
  }

  const ob = new Observable(1)
  document.body.innerHTML = toxml(await render([Container, { ob }]))
  const _ = (i) => {
    if (i < 6) {
      console.log(i)
      ob.notify(i)
      setTimeout(() => _(i + 1), 1000)
    }
  }

  setTimeout(() => _(2), 1000)
}

main()
