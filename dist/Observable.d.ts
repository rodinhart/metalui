import { Lens } from "./lenses.js";
export declare class Observable<T> {
    value: T;
    private ref;
    private watchers;
    [Symbol.asyncIterator]: () => AsyncGenerator<T, void, unknown>;
    constructor(init: T);
    notify(delta: T | ((val: T) => T)): Promise<void>;
    focus(...lenses: Lens<any, any, any, any>[]): Observable<T>;
}
