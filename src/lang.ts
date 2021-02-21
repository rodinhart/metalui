export interface Reducible<T> {
  reduce: <R>(step: (r: R, x: T) => R, init: R) => R
}

export const assoc = (obj: Record<string, any>, ...pairs: (string | any)[]) => {
  const r = { ...obj }
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    r[pairs[i]] = pairs[i + 1]
  }

  return r
}

function compose<A, B, R>(g: (x: B) => R, f: (x: A) => B): (x: A) => R
function compose<A, B, C, R>(
  h: (x: C) => R,
  g: (x: B) => C,
  f: (x: A) => B
): (x: A) => R
function compose<A, B, C, D, R>(
  i: (x: D) => R,
  h: (x: C) => D,
  g: (x: B) => C,
  f: (x: A) => B
): (x: A) => R

function compose(...fs: ((x: any) => any)[]) {
  return (x: any) => {
    let r = x
    for (let i = fs.length - 1; i >= 0; i -= 1) {
      r = fs[i](r)
    }

    return r
  }
}

export { compose }

export const conj = <T>(coll: Set<T>, ...xs: T[]) => {
  return new Set([...coll, ...xs])
}

export const count = <T>(coll: Reducible<T>) => coll.reduce((r) => r + 1, 0)

export const createUid = () => Math.random().toString(16).substr(2)

export const disj = <T>(set: Set<T>, ...keys: T[]) => {
  const r = new Set(set)
  for (const key of keys) {
    r.delete(key)
  }

  return r
}

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
): Reducible<T> => ({
  reduce: (step, init) => coll.reduce((r, x) => (p(x) ? step(r, x) : r), init),
})

// export const reduce = (step, init, coll) => coll.reduce(step, init)

// identity function
export const identity = <T>(x: T) => x

export const intersection = <T>(s1: Set<T>, s2: Set<T>): Set<T> => {
  const r = new Set<T>()

  for (const x of s1) {
    if (s2.has(x)) {
      r.add(x)
    }
  }

  return r
}

// pour key-value pairs into object
export const into = (
  obj: Record<string, any>,
  ...ps: [string, any][]
): Record<string, any> =>
  ps.reduce(
    (r, [key, val]) => {
      r[key] = val

      return r
    },
    { ...obj }
  )

function map<T, U>(f: (x: T) => U, coll: Reducible<T>): Reducible<U>
function map<T, U>(
  f: ([k, v]: [string, T]) => U,
  coll: Record<string, T>
): Reducible<U>

function map<T, U>(
  f: (x: T | [string, T]) => U,
  coll: Reducible<T> | Record<string, T>
) {
  return {
    reduce: <R>(step: (r: R, x: U) => R, init: R) => {
      const t: Reducible<T> | [string, T][] = coll.reduce
        ? (coll as Reducible<T>)
        : Object.entries(coll)
      // @ts-ignore
      return t.reduce<R>((r: R, x: T | [string, T]): R => step(r, f(x)), init)
    },
  }
}

export { map }

// Return memoized function, optionally with hash creating function.
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

type Thunk<T> = () => Promise<T>

// memoize promise thunk
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

// race multiple async iterables
// Needs multiple signatures like compose
export const race = (...iterables: AsyncIterable<any>[]) => ({
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

export const range = (a: number, b: number): Reducible<number> => ({
  reduce: (step, init) => {
    let r = init
    let i = a
    while (b === undefined || i < b) {
      r = step(r, i)
      i += 1
    }

    return r
  },
})

// sleep for ms milliseconds
export const sleep = (ms: number): Promise<undefined> =>
  new Promise((res, rej) => {
    setTimeout(() => {
      res(undefined)
    }, ms)
  })

// Return result of threading initial value through a series of functions.
function thread<A, B, R>(x: A, f: (x: A) => B, g: (x: B) => R): R
function thread<A, B, C, R>(
  x: A,
  f: (x: A) => B,
  g: (x: B) => C,
  h: (x: C) => R
): R
function thread<A, B, C, D, R>(
  x: A,
  f: (x: A) => B,
  g: (x: B) => C,
  h: (x: C) => D,
  i: (x: D) => R
): R

function thread(x: any, ...fs: ((x: any) => any)[]) {
  return fs.reduce((x, f) => f(x), x)
}

export { thread }

export const toArray = <T>(coll: Reducible<T>): T[] =>
  Array.isArray(coll)
    ? coll
    : coll.reduce((r: T[], x) => {
        r.push(x)

        return r
      }, [])

export const toObject = <T>(
  entries: Reducible<[string, T]>
): Record<string, T> =>
  entries.reduce<Record<string, T>>((r, [key, val]) => {
    r[key] = val

    return r
  }, {})

export const union = <T>(s1: Set<T>, s2: Set<T>) => new Set([...s1, ...s2])
