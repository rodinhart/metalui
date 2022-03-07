import { view } from "./lenses.js";
export class Observable {
    constructor(init) {
        this.value = init;
        this.ref = 1;
        this.watchers = [];
        this[Symbol.asyncIterator] = async function* () {
            let myRef = this.ref;
            yield this.value;
            while (true) {
                if (myRef !== this.ref) {
                    myRef = this.ref;
                    yield this.value;
                }
                else {
                    await new Promise((res) => {
                        this.watchers.push(res);
                    });
                }
            }
        };
    }
    async notify(delta) {
        const next = typeof delta === "function" ? delta(this.value) : delta;
        if (next === this.value) {
            return;
        }
        this.value = next;
        this.ref += 1;
        for (const watcher of this.watchers.splice(0, this.watchers.length)) {
            watcher(undefined);
        }
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
Symbol.asyncIterator;
