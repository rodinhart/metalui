import { AsyncComponent, Markup, Props, renderǃ } from "../dist/index"

const main = async () => {
  const App: AsyncComponent<{
    name: string
  }> = async function* ({ name }) {
    const canvas = (yield [
      "canvas",
      { width: 200, height: 20 },
    ]) as HTMLCanvasElement
    const g = canvas.getContext("2d")!
    g.fillText(name, 0, 15)
  }

  document.body.replaceChildren(
    ...(await renderǃ([App, { name: "Baby Driver" }]))
  )
}

main()
