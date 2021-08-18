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
  const Sub = () => [Fragment, {}, ["h2", {}, "Foo"], ["h2", {}, "Bar"]]
  const App = () => ["div", {}, ["h1", {}, "App"], [Sub, {}]]

  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
