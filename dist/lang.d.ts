export interface Reducible<T> extends Iterable<T> {
    reduce: <R>(step: (r: R, x: T) => R, init: R) => R;
    [Symbol.iterator]: () => Generator<T, void, undefined>;
}
declare type Icompose = {
    <A, B, R>(g: (x: B) => R, f: (x: A) => B): (x: A) => R;
    <A, B, C, R>(h: (x: C) => R, g: (x: B) => C, f: (x: A) => B): (x: A) => R;
    <A, B, C, D, R>(i: (x: D) => R, h: (x: C) => D, g: (x: B) => C, f: (x: A) => B): (x: A) => R;
};
export declare const compose: Icompose;
/**
 * Conjoin. Returns a new collection with the xs 'added'.
 */
export declare const conj: <T>(coll: Set<T>, ...xs: T[]) => Set<T>;
export declare const count: <T>(coll: Reducible<T>) => number;
export declare const createUid: () => string;
/**
 * Disjoin. Returns a new collection with the xs 'removed'.
 */
export declare const disj: <T>(set: Set<T>, ...keys: T[]) => Set<T>;
/**
 * Disassociate. Returns a new object without the specified keys.
 */
export declare const dissoc: (obj: Record<string, any>, ...keys: string[]) => Record<string, any>;
export declare const filter: <T>(p: (x: T) => boolean, coll: Reducible<T>) => Reducible<T>;
export declare const identity: <T>(x: T) => T;
/**
 * Returns the intersection of two sets.
 */
export declare const intersection: <T>(s1: Set<T>, s2: Set<T>) => Set<T>;
declare type Imap = {
    <T, U>(f: (x: T) => U, coll: Reducible<T>): Reducible<U>;
    <T, U>(f: ([k, v]: [string, T]) => U, coll: Record<string, T>): Reducible<U>;
};
export declare const map: Imap;
/**
 * Returns a memoized function, optionally with hash creating function.
 */
export declare const memo: <A extends any[], R>(f: (...args: A) => R, getHash?: ((args: A) => string) | undefined) => (...args: A) => R;
export declare type Thunk<T> = () => Promise<T>;
/**
 * Returns a memoized Thunks.
 */
export declare const memoPromise: <T>(thunk: Thunk<T>) => () => Promise<T>;
declare type Irace = {
    <A, B>(a: AsyncIterable<A>, b: AsyncIterable<B>): AsyncIterable<[A, B]>;
    <A, B, C>(a: AsyncIterable<A>, b: AsyncIterable<B>, c: AsyncIterable<C>): AsyncIterable<[A, B, C]>;
};
/**
 * Race multiple async iterables.
 */
export declare const race: Irace;
/**
 * Returns a reducibles of integers from start (inclusive) to end (exclusive).
 */
export declare const range: (a: number, b: number) => Reducible<number>;
/**
 * Returns a Promise that sleeps for ms milliseconds.
 */
export declare const sleep: (ms: number) => Promise<undefined>;
declare type Ithread = {
    <A, B, R>(x: A, f: (x: A) => B, g: (x: B) => R): R;
    <A, B, C, R>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => R): R;
    <A, B, C, D, R>(x: A, f: (x: A) => B, g: (x: B) => C, h: (x: C) => D, i: (x: D) => R): R;
};
/**
 * Return result of threading initial value through a series of functions.
 */
export declare const thread: Ithread;
/**
 * Returns the union of two sets.
 */
export declare const union: <T>(s1: Set<T>, s2: Set<T>) => Set<T>;
export {};
