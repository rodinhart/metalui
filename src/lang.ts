export interface Reducible<T> extends Iterable<T> {
  reduce: <R>(step: (r: R, x: T) => R, init: R) => R
  [Symbol.iterator]: () => Generator<T, void, undefined>
}

const createReducible = <T>(
  reduce: <R>(step: (r: R, x: T) => R, init: R) => R
): Reducible<T> => ({
  reduce,
  [Symbol.iterator]: function* () {
    yield* reduce<T[]>((r, x) => {
      r.push(x)

      return r
    }, [])
  },
})

type Icompose = {
  <A, B, R>(g: (x: B) => R, f: (x: A) => B): (x: A) => R

  <A, B, C, R>(h: (x: C) => R, g: (x: B) => C, f: (x: A) => B): (x: A) => R

  <A, B, C, D, R>(
    i: (x: D) => R,
    h: (x: C) => D,
    g: (x: B) => C,
    f: (x: A) => B
  ): (x: A) => R
}

export const compose: Icompose = (...fs: ((x: any) => any)[]) => {
  return (x: any) => {
    let r = x
    for (let i = fs.length - 1; i >= 0; i -= 1) {
      r = fs[i](r)
    }

    return r
  }
}

/**
 * Conjoin. Returns a new collection with the xs 'added'.
 */
export const conj = <T>(coll: Set<T>, ...xs: T[]) => {
  return new Set([...coll, ...xs])
}

export const count = <T>(coll: Reducible<T>) => coll.reduce((r) => r + 1, 0)

export const createUid = () => Math.random().toString(16).slice(2)

/**
 * Disjoin. Returns a new collection with the xs 'removed'.
 */
export const disj = <T>(set: Set<T>, ...keys: T[]) => {
  const r = new Set(set)
  for (const key of keys) {
    r.delete(key)
  }

  return r
}

/**
 * Disassociate. Returns a new object without the specified keys.
 */
export const dissoc = (obj: Record<string, any>, ...keys: string[]) => {
  const r: Record<string, any> = {}
  for (const key in obj) {
    if (keys.indexOf(key) === -1) {
      r[key] = obj[key]
    }
  }

  return r
}

export const filter = <T>(
  p: (x: T) => boolean,
  coll: Reducible<T>
): Reducible<T> =>
  createReducible((step, init) =>
    coll.reduce((r, x) => (p(x) ? step(r, x) : r), init)
  )

export const identity = <T>(x: T) => x

/**
 * Returns the intersection of two sets.
 */
export const intersection = <T>(s1: Set<T>, s2: Set<T>): Set<T> => {
  const r = new Set<T>()

  for (const x of s1) {
    if (s2.has(x)) {
      r.add(x)
    }
  }

  return r
}

type Imap = {
  <T, U>(f: (x: T) => U, coll: Reducible<T>): Reducible<U>

  <T, U>(f: ([k, v]: [string, T]) => U, coll: Record<string, T>): Reducible<U>
}

export const map: Imap = <T, U>(
  f: (x: T | [string, T]) => U,
  coll: Reducible<T> | Record<string, T>
) =>
  createReducible(<R>(step: (r: R, x: U) => R, init: R) => {
    const t: Reducible<T> | [string, T][] = coll.reduce
      ? (coll as Reducible<T>)
      : Object.entries(coll)

    return t.reduce<R>((r: R, x: T | [string, T]): R => step(r, f(x)), init)
  })

/**
 * Returns a memoized function, optionally with hash creating function.
 */
export const memo = <A extends any[], R>(
  f: (...args: A) => R,
  getHash?: (args: A) => string
) => {
  const cache: Record<string, R> = {}

  return (...args: A): R => {
    const hash = getHash ? getHash(args) : JSON.stringify(args)

    if (!(hash in cache)) {
      cache[hash] = f(...args)
    }

    return cache[hash]
  }
}

export type Thunk<T> = () => Promise<T>

/**
 * Returns a memoized Thunks.
 */
export const memoPromise = <T>(thunk: Thunk<T>) => {
  const cache: T[] = []

  return async () => {
    if (cache.length) {
      return cache[0]
    }

    return await thunk().then((r) => {
      cache[0] = r

      return r
    })
  }
}

type Irace = {
  <A, B>(a: AsyncIterable<A>, b: AsyncIterable<B>): AsyncIterable<[A, B]>

  <A, B, C>(
    a: AsyncIterable<A>,
    b: AsyncIterable<B>,
    c: AsyncIterable<C>
  ): AsyncIterable<[A, B, C]>
}

/**
 * Race multiple async iterables.
 */
export const race: Irace = (
  ...iterables: AsyncIterable<any>[]
): AsyncIterable<any> => ({
  [Symbol.asyncIterator]: async function* () {
    const iterators = iterables.map((iter) => iter[Symbol.asyncIterator]())
    const values = await Promise.all(
      iterators.map((iterator) => iterator.next().then((n) => n.value))
    )
    yield values

    const promises = iterators.map((iterator, i) =>
      iterator.next().then((n) => [n.value, i])
    )
    while (true) {
      const [value, i] = await Promise.race(promises)
      values[i] = value
      promises[i] = iterators[i].next().then((n) => [n.value, i])
      yield values
    }
  },
})

/**
 * Returns a reducibles of integers from start (inclusive) to end (exclusive).
 */
export const range = (a: number, b: number): Reducible<number> =>
  createReducible((step, init) => {
    let r = init
    let i = a
    while (b === undefined || i < b) {
      r = step(r, i)
      i += 1
    }

    return r
  })

/**
 * Returns a Promise that sleeps for ms milliseconds.
 */
export const sleep = (ms: number): Promise<undefined> =>
  new Promise((res, rej) => {
    setTimeout(() => {
      res(undefined)
    }, ms)
  })

type Ithread = {
  <A, B, R>(x: A, f: (x: A) => B, g: (x: B) => R): R

  <A, B, C, R>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => R): R

  <A, B, C, D, R>(
    x: A,
    f: (x: A) => B,
    g: (x: B) => C,
    h: (x: C) => D,
    i: (x: D) => R
  ): R
}

/**
 * Return result of threading initial value through a series of functions.
 */
export const thread: Ithread = (x: any, ...fs: ((x: any) => any)[]) =>
  fs.reduce((x, f) => f(x), x)

/**
 * Returns the union of two sets.
 */
export const union = <T>(s1: Set<T>, s2: Set<T>) => new Set([...s1, ...s2])
