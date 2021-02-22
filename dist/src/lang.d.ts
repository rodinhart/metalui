export interface Reducible<T> {
    reduce: <R>(step: (r: R, x: T) => R, init: R) => R;
}
export declare const assoc: (obj: Record<string, any>, ...pairs: (string | any)[]) => {
    [x: string]: any;
};
declare function compose<A, B, R>(g: (x: B) => R, f: (x: A) => B): (x: A) => R;
declare function compose<A, B, C, R>(h: (x: C) => R, g: (x: B) => C, f: (x: A) => B): (x: A) => R;
declare function compose<A, B, C, D, R>(i: (x: D) => R, h: (x: C) => D, g: (x: B) => C, f: (x: A) => B): (x: A) => R;
export { compose };
export declare const conj: <T>(coll: Set<T>, ...xs: T[]) => Set<T>;
export declare const count: <T>(coll: Reducible<T>) => number;
export declare const createUid: () => string;
export declare const disj: <T>(set: Set<T>, ...keys: T[]) => Set<T>;
export declare const dissoc: (obj: Record<string, any>, ...keys: string[]) => Record<string, any>;
export declare const filter: <T>(p: (x: T) => boolean, coll: Reducible<T>) => Reducible<T>;
export declare const identity: <T>(x: T) => T;
export declare const intersection: <T>(s1: Set<T>, s2: Set<T>) => Set<T>;
export declare const into: (obj: Record<string, any>, ...ps: [string, any][]) => Record<string, any>;
declare function map<T, U>(f: (x: T) => U, coll: Reducible<T>): Reducible<U>;
declare function map<T, U>(f: ([k, v]: [string, T]) => U, coll: Record<string, T>): Reducible<U>;
export { map };
export declare const memo: <A extends any[], R>(f: (...args: A) => R, getHash?: ((args: A) => string) | undefined) => (...args: A) => R;
declare type Thunk<T> = () => Promise<T>;
export declare const memoPromise: <T>(thunk: Thunk<T>) => () => Promise<T>;
export declare const race: (...iterables: AsyncIterable<any>[]) => {
    [Symbol.asyncIterator]: () => AsyncGenerator<any[], never, unknown>;
};
export declare const range: (a: number, b: number) => Reducible<number>;
export declare const sleep: (ms: number) => Promise<undefined>;
declare function thread<A, B, R>(x: A, f: (x: A) => B, g: (x: B) => R): R;
declare function thread<A, B, C, R>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => R): R;
declare function thread<A, B, C, D, R>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => D, i: (x: D) => R): R;
export { thread };
export declare const toArray: <T>(coll: Reducible<T>) => T[];
export declare const toObject: <T>(entries: Reducible<[string, T]>) => Record<string, T>;
export declare const union: <T>(s1: Set<T>, s2: Set<T>) => Set<T>;
