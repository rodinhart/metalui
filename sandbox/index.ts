import {
  AsyncComponent,
  Fragment,
  lenses,
  Markup,
  Observable,
  Props,
  race,
  renderǃ,
  SyncComponent,
} from "../dist/index"

const main = async () => {
  document.body.replaceChildren(
    ...(await renderǃ(["div", { style: { color: "red" } }, "Hello World"]))
  )
}

main()
