import {
  AsyncComponent,
  Fragment,
  lenses,
  Markup,
  Observable,
  Props,
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

  //
  const stateOb = new Observable({
    color: "red",
    shapes: {
      rect: true,
      triangle: false,
    },
  })

  setTimeout(() => {
    stateOb.notify((state) => ({
      ...state,
      color: "green",
    }))
  }, 1000)

  setTimeout(() => {
    stateOb.notify((state) => ({
      ...state,
      shapes: {
        ...state.shapes,
        triangle: true,
      },
    }))
  }, 2000)

  for await (const state of stateOb.focus(lenses.grind("shapes"))) {
    console.log(JSON.stringify(state))
  }
}

main()
