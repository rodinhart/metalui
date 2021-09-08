import React from "react"
import { render, toxml } from "../dist/index"
import { ReactWrapper } from "./react-bridge"
import ReactComponent from "./ReactComponent"

const main = async () => {
  const App = ReactWrapper(async function* () {
    yield React.createElement(ReactComponent)
  })

  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
