import { Observable, renderǃ, sleep } from "../dist/index"

const main = async () => {
  const NameForm = async function* () {
    const stateOb = new Observable({ name: "" })

    const handleChange = (e) => {
      stateOb.notify((state) => ({
        ...state,
        name: e.target.value,
      }))
    }

    const handleSubmit = (e) => {
      alert(`A name was submitted: ${stateOb.value.name}`)
      e.preventDefault()
    }

    for await (const state of stateOb) {
      yield [
        "form",
        {
          onsubmit: handleSubmit,
        },
        [
          "label",
          {},
          "Name:",
          [
            "input",
            {
              type: "text",
              value: state.name,
              onchange: handleChange,
            },
          ],
        ],
        [
          "input",
          {
            type: "submit",
            value: "Submit",
          },
        ],
      ]
    }
  }

  document.body.replaceChildren(...(await renderǃ([NameForm, {}])))
}

main()
