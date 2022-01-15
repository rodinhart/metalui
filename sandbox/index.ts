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
  const App: AsyncComponent<{ prefixOb: Observable<number> }> =
    async function* ({ prefixOb, children }) {
      for await (const prefix of prefixOb) {
        yield ["div", {}, ["h3", {}, prefix.toFixed(2)], ...children]
      }
    }

  document.body.replaceChildren(
    ...(await renderǃ([App, { prefixOb: new Observable(42) }]))
  )
}

main()
