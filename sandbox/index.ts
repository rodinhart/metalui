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
  const WithErrorBoundary = ({ children }) => [
    "div",
    { $errorBoundary: "OOPS" },
    ...children,
  ]
  const Broken = () => {
    throw new Error("BOOM")
  }

  document.body.replaceChildren(
    ...(await renderǃ([WithErrorBoundary, {}, "Hello World", [Broken, {}]]))
  )
}

main()
