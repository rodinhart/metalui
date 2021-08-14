import {
  Component,
  Markup,
  Observable,
  render,
  sleep,
  toxml,
} from "../dist/index"

const main = async () => {
  const themes = {
    light: {
      foreground: "#000000",
      background: "#eeeeee",
    },
    dark: {
      foreground: "#ffffff",
      background: "#222222",
    },
  }

  // Put themeOb in whatever global context you are using
  const themeOb = new Observable(themes.dark)

  const Toolbar = () => ["div", {}, [ThemedButton, {}]]

  const ThemedButton = async function* ({ $themeOb }) {
    for await (const theme of $themeOb) {
      yield [
        "button",
        {
          style: `background: ${theme.background}; color: ${theme.foreground};`,
        },
        "I am styled by theme context!",
      ]
    }
  }

  document.body.innerHTML = toxml(
    await render([
      Toolbar,
      {
        $themeOb: themeOb,
      },
    ])
  )
}

main()
