import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const Test = () => ["div", {}, `<b>Hello</b> world`]
  document.body.innerHTML = toxml(await render([Test, {}]))
}

main()
