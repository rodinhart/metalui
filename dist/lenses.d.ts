interface Functor<T> {
    map: <R>(f: (x: T) => R) => Functor<R>;
}
export declare type Lens<s, t, a, b> = (f: (x: a) => Functor<b>) => (obj: s) => Functor<t>;
export declare const index: (ix: number) => Lens<any, any, any, any>;
export declare const grind: (...keys: string[]) => Lens<any, any, any, any>;
export declare const over: <s, t, a, b>(obj: s, lens: Lens<s, t, a, b>, f: (x: a) => b) => t;
export declare const prop: (key: string) => Lens<any, any, any, any>;
export declare const view: <s, t, a, b>(obj: s, lens: Lens<s, t, a, b>) => b;
export {};
