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

  document.body.innerHTML = toxml(await render([App, { $size: "small" }]))
}

main()
