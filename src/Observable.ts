import { Lens, view } from "./lenses"

export class Observable<T /* extends Extract<(val: T) => T, any> */> {
  value: T
  private ref: number
  private watchers: Array<(value: unknown) => void>;
  [Symbol.asyncIterator]: () => AsyncGenerator<T, void, unknown>

  constructor(init: T) {
    this.value = init
    this.ref = 1
    this.watchers = []

    this[Symbol.asyncIterator] = async function* () {
      let myRef = this.ref
      yield this.value

      while (true) {
        if (myRef !== this.ref) {
          myRef = this.ref
          yield this.value
        } else {
          await new Promise((res) => {
            this.watchers.push(res)
          })
        }
      }
    }
  }

  async notify(delta: T | ((val: T) => T)) {
    this.value =
      typeof delta === "function" ? (delta as (val: T) => T)(this.value) : delta
    this.ref += 1
    for (const watcher of this.watchers.splice(0, this.watchers.length)) {
      watcher(undefined)
    }
  }

  focus(...lenses: Lens<any, any, any, any>[]): Observable<T> {
    const ob: Observable<T> = this
    let prev: any[] = []
    // @ts-ignore
    return {
      [Symbol.asyncIterator]: async function* () {
        for await (const value of ob) {
          const next = lenses.map((lens) => view(value, lens))
          if (
            next.length !== prev.length ||
            next.some((n, i) => n !== prev[i])
          ) {
            prev = next
            yield value
          }
        }
      },
    }
  }
}
