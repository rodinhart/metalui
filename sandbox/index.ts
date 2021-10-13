import { AsyncComponent, Markup, Props, renderǃ } from "../dist/index"

const main = async () => {
  const App: AsyncComponent<{
    name: string
  }> = async function* ({ name }) {
    yield ["div", {}, "Hello, ", name]
  }

  document.body.replaceChildren(
    ...(await renderǃ([App, { name: "Baby Driver" }]))
  )
}

main()
