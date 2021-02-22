export const assoc = (obj, ...pairs) => {
    const r = { ...obj };
    for (let i = 0; i + 1 < pairs.length; i += 2) {
        r[pairs[i]] = pairs[i + 1];
    }
    return r;
};
function compose(...fs) {
    return (x) => {
        let r = x;
        for (let i = fs.length - 1; i >= 0; i -= 1) {
            r = fs[i](r);
        }
        return r;
    };
}
export { compose };
export const conj = (coll, ...xs) => {
    return new Set([...coll, ...xs]);
};
export const count = (coll) => coll.reduce((r) => r + 1, 0);
export const createUid = () => Math.random().toString(16).substr(2);
export const disj = (set, ...keys) => {
    const r = new Set(set);
    for (const key of keys) {
        r.delete(key);
    }
    return r;
};
export const dissoc = (obj, ...keys) => {
    const r = {};
    for (const key in obj) {
        if (keys.indexOf(key) === -1) {
            r[key] = obj[key];
        }
    }
    return r;
};
export const filter = (p, coll) => ({
    reduce: (step, init) => coll.reduce((r, x) => (p(x) ? step(r, x) : r), init),
});
// export const reduce = (step, init, coll) => coll.reduce(step, init)
// identity function
export const identity = (x) => x;
export const intersection = (s1, s2) => {
    const r = new Set();
    for (const x of s1) {
        if (s2.has(x)) {
            r.add(x);
        }
    }
    return r;
};
// pour key-value pairs into object
export const into = (obj, ...ps) => ps.reduce((r, [key, val]) => {
    r[key] = val;
    return r;
}, { ...obj });
function map(f, coll) {
    return {
        reduce: (step, init) => {
            const t = coll.reduce
                ? coll
                : Object.entries(coll);
            // @ts-ignore
            return t.reduce((r, x) => step(r, f(x)), init);
        },
    };
}
export { map };
// Return memoized function, optionally with hash creating function.
export const memo = (f, getHash) => {
    const cache = {};
    return (...args) => {
        const hash = getHash ? getHash(args) : JSON.stringify(args);
        if (!(hash in cache)) {
            cache[hash] = f(...args);
        }
        return cache[hash];
    };
};
// memoize promise thunk
export const memoPromise = (thunk) => {
    const cache = [];
    return async () => {
        if (cache.length) {
            return cache[0];
        }
        return await thunk().then((r) => {
            cache[0] = r;
            return r;
        });
    };
};
// race multiple async iterables
// Needs multiple signatures like compose
export const race = (...iterables) => ({
    [Symbol.asyncIterator]: async function* () {
        const iterators = iterables.map((iter) => iter[Symbol.asyncIterator]());
        const values = await Promise.all(iterators.map((iterator) => iterator.next().then((n) => n.value)));
        yield values;
        const promises = iterators.map((iterator, i) => iterator.next().then((n) => [n.value, i]));
        while (true) {
            const [value, i] = await Promise.race(promises);
            values[i] = value;
            promises[i] = iterators[i].next().then((n) => [n.value, i]);
            yield values;
        }
    },
});
export const range = (a, b) => ({
    reduce: (step, init) => {
        let r = init;
        let i = a;
        while (b === undefined || i < b) {
            r = step(r, i);
            i += 1;
        }
        return r;
    },
});
// sleep for ms milliseconds
export const sleep = (ms) => new Promise((res, rej) => {
    setTimeout(() => {
        res(undefined);
    }, ms);
});
function thread(x, ...fs) {
    return fs.reduce((x, f) => f(x), x);
}
export { thread };
export const toArray = (coll) => Array.isArray(coll)
    ? coll
    : coll.reduce((r, x) => {
        r.push(x);
        return r;
    }, []);
export const toObject = (entries) => entries.reduce((r, [key, val]) => {
    r[key] = val;
    return r;
}, {});
export const union = (s1, s2) => new Set([...s1, ...s2]);
//# sourceMappingURL=lang.js.map