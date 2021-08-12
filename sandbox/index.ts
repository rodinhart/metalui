import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  //
  const Counter: Component<{
    messageOb: Observable<string>
  }> = async function* ({ messageOb }: { messageOb: Observable<string> }) {
    let count = 0

    for await (const message of messageOb) {
      count++
      yield ["div", {}, `${message} ${count}`] as Markup<unknown>
    }
  }

  const messageOb = new Observable("The count is now:")

  document.body.innerHTML = toxml(await render([Counter, { messageOb }]))

  console.log(document.body.innerHTML) // "<div>The count is now: 1</div>"

  await messageOb.notify("Le décompte est maintenant:")

  console.log(document.body.innerHTML) // "<div>Le décompte est maintenant: 2</div>"
}

main()
