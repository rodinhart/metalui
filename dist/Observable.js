import { view } from "./lenses";
export class Observable {
    constructor(init) {
        this.value = init;
        this.watchers = [];
        this[Symbol.asyncIterator] = async function* () {
            while (true) {
                yield this.value;
                await new Promise((res) => {
                    this.watchers.push(res);
                });
            }
        };
    }
    notify(delta) {
        this.value =
            typeof delta === "function" ? delta(this.value) : delta;
        this.watchers
            .splice(0, this.watchers.length)
            .forEach((watcher) => watcher(undefined));
    }
    focus(...lenses) {
        const ob = this;
        let prev = [];
        // @ts-ignore
        return {
            [Symbol.asyncIterator]: async function* () {
                for await (const value of ob) {
                    const next = lenses.map((lens) => view(value, lens));
                    if (next.length !== prev.length ||
                        next.some((n, i) => n !== prev[i])) {
                        prev = next;
                        yield value;
                    }
                }
            },
        };
    }
}
