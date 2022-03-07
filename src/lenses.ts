import { compose } from "./lang.js"

interface Functor<T> {
  map: <R>(f: (x: T) => R) => Functor<R>
}

class Identity<T> implements Functor<T> {
  x: T

  constructor(x: T) {
    this.x = x
  }

  map<R>(f: (x: T) => R): Identity<R> {
    return new Identity(f(this.x))
  }
}

class Const<T, U> implements Functor<U> {
  x: T

  constructor(x: T) {
    this.x = x
  }

  map<R>(f: (x: U) => R): Const<T, R> {
    return new Const(this.x)
  }
}

export type Lens<s, t, a, b> = (
  f: (x: a) => Functor<b>
) => (obj: s) => Functor<t>

export const index =
  (ix: number): Lens<any, any, any, any> =>
  <a, b>(f: (x: a) => Functor<b>) =>
  (obj: a[]) =>
    f(obj && obj[ix]).map((val) =>
      (obj || []).map((x, i) => (i !== ix ? x : val))
    )

export const grind = (...keys: string[]): Lens<any, any, any, any> =>
  // @ts-ignore
  compose(...keys.map(prop))

export const over = <s, t, a, b>(
  obj: s,
  lens: Lens<s, t, a, b>,
  f: (x: a) => b
): t => (lens((x) => new Identity(f(x)))(obj) as Identity<t>).x

export const prop =
  (key: string): Lens<any, any, any, any> =>
  <a, b>(f: (x: a) => Functor<b>) =>
  (obj: Record<string, a>) =>
    f(obj && obj[key]).map((val) => ({
      ...obj,
      [key]: val,
    }))

export const view = <s, t, a, b>(obj: s, lens: Lens<s, t, a, b>): b =>
  (lens((x) => new Const(x))(obj) as Const<b, t>).x
