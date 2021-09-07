import { render, Scroller, toxml } from "../dist/index"

const main = async () => {
  document.body.innerHTML = toxml(await render([App, {}]))
}

main()
