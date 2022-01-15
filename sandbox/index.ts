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
  const Temp: SyncComponent<{}> = () => ["div", {}, "Hello"]

  const App: SyncComponent<{}> = ({ children }) => {
    return [Fragment, {}, ...children]
  }

  document.body.replaceChildren(
    ...(await renderǃ([App, {}, [Temp, {}], [Temp, {}]]))
  )

  const el = await renderǃ(["span", { style: "color: red;" }, "Hello", "World"])
  console.log(el.length, el[0].tagName, el[0].innerText)
}

main()
