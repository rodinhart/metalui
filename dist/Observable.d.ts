import { Lens } from "./lenses";
export declare class Observable<T> {
    value: T;
    private watchers;
    [Symbol.asyncIterator]: () => AsyncGenerator<T, void, unknown>;
    constructor(init: T);
    notify(delta: T | ((val: T) => T)): void;
    focus(...lenses: Lens<any, any, any, any>[]): Observable<T>;
}
