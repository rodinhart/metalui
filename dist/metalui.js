import { Observable } from "./Observable.js";
const notNull = (value) => value !== null;
export const Fragment = ({ children }) => [
    "Fragment",
    {},
    ...children,
];
export const lazyLoad = (thunk) => async function* (props) {
    const component = await thunk();
    yield [component, props];
};
export const renderǃ = async (markup, context = {}) => {
    // "Hello World"
    if (!Array.isArray(markup)) {
        return markup === null ? null : document.createTextNode(String(markup));
    }
    const [tag, props, ...children] = markup;
    const newContext = Object.entries(props).reduce((r, [key, val]) => {
        if (key[0] === "$") {
            r[key] = val;
        }
        return r;
    }, { ...context });
    // ["tag", {}, ...]
    if (typeof tag === "string") {
        const mapped = [];
        try {
            // move try-catch to function/component call
            for (const child of children) {
                const rendered = await renderǃ(child, newContext);
                if (rendered !== null) {
                    mapped.push(rendered);
                }
            }
        }
        catch (e) {
            if (newContext.$errorBoundary) {
                return document.createTextNode(String(newContext.$errorBoundary));
            }
            throw e;
        }
        // ["Fragment", {}, ...]
        if (tag === "Fragment") {
            // @ts-ignore
            return mapped;
        }
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith("on")) {
                node.addEventListener(key.substring(2), value);
            }
            else if (!key.startsWith("$")) {
                node.setAttribute(key, key === "style" && typeof value !== "string"
                    ? Object.entries(value)
                        .map(([key, value]) => `${key}: ${value};`)
                        .join(" ")
                    : String(value)); // what about non-string values?
            }
        }
        // get initial values
        const values = await Promise.all(mapped.map((child) => child instanceof Node
            ? Promise.resolve(child)
            : child.next().then((n) => (n.done ? null : n.value))));
        node.replaceChildren(...values.filter(notNull));
        const _ = async () => {
            const nexts = mapped.map((child, i) => child instanceof Node
                ? null
                : child.next().then((n) => [n, i]));
            do {
                const [next, i] = await Promise.race(nexts.filter(notNull));
                values[i] = next.done ? null : next.value;
                node.replaceChildren(...values.filter(notNull));
                nexts[i] = next.done
                    ? null
                    : mapped[i].next().then((n) => [n, i]);
            } while (true);
        };
        _();
        return node;
    }
    // catch error here
    const iterator = tag({ ...newContext, ...props, children });
    // [function(), {}, ...]
    if (iterator === null ||
        typeof iterator !== "object" ||
        Array.isArray(iterator)) {
        return await renderǃ(iterator, newContext);
    }
    const getNext = () => iterator
        .next()
        .then((n) => n.done
        ? [n, "main"]
        : renderǃ(n.value, newContext).then((value) => [{ value }, "main"]));
    const _ = async function* () {
        let main = getNext();
        let sub = null;
        do {
            const [next, type] = await Promise.race([
                main,
                ...(sub
                    ? [
                        sub
                            .next()
                            .then((n) => [n, "sub"]),
                    ]
                    : []),
            ]);
            if (type === "main") {
                if (next.done) {
                    break;
                }
                else {
                    const value = next.value;
                    if (value instanceof Node || value === null) {
                        yield value;
                    }
                    else {
                        sub = value;
                    }
                    main = getNext();
                }
            }
            else {
                if (next.done) {
                    sub = null;
                }
                else {
                    yield next.value;
                }
            }
        } while (true);
    };
    return _();
};
export const Scroller = async function* ({ Body, totalHeight, }) {
    const scrollOb = new Observable(0);
    const onScroll = (e) => {
        scrollOb.notify(e.target.scrollTop);
    };
    const ref = yield [
        "div",
        { style: "height: 100%; position: relative;" },
    ];
    yield [
        "div",
        { style: "height: 100%; position: relative;" },
        [
            "div",
            {
                style: "height: 100%; overflow-y: auto; width: 100%",
                onscroll: onScroll,
            },
            ["div", { style: `height: ${totalHeight}px;` }],
        ],
        [
            "div",
            {
                style: "height: 100%; overflow-y: hidden; position: absolute; top: 0px; width: calc(100% - 18px);",
            },
            [Body, { height: (ref && ref.offsetHeight) || 100, scrollOb }],
        ],
    ];
};
const isAsyncGenerator = (x) => typeof x.next === "function";
const genMap = (f, coll, ret, initial) => {
    let r = initial;
    return {
        async next() {
            const n = await coll.next(r);
            if (n.done) {
                return n;
            }
            const value = await f(n.value);
            r = ret(value);
            return {
                done: n.done,
                value,
            };
        },
        async return() {
            const n = await coll.return();
            if (n.done) {
                return n;
            }
            const value = await f(n.value);
            return {
                done: n.done,
                value,
            };
        },
        async throw(e) {
            const n = await coll.throw(e);
            if (n.done) {
                return n;
            }
            const value = await f(n.value);
            return {
                done: n.done,
                value,
            };
        },
        [Symbol.asyncIterator]() {
            return null;
        },
    };
};
const genFlatten = (coll) => (async function* () {
    let items = (await coll.next())
        .value;
    let gens = items.filter((x) => isAsyncGenerator(x));
    let values = await Promise.all(gens.map((gen) => gen.next().then((x) => x.value)));
    const getYield = () => {
        const r = [];
        let i = 0;
        for (const item of items) {
            if (isAsyncGenerator(item)) {
                r.push(...values[i]);
                i++;
            }
            else {
                r.push(item);
            }
        }
        return r;
    };
    yield getYield();
    while (true) {
        const [n, i] = await Promise.race([coll, ...gens].map((g, i) => g.next().then((n) => [n, i])));
        if (i === 0) {
            if (n.done) {
                break;
            }
            items = n.value;
            gens = items.filter(isAsyncGenerator);
            values = await Promise.all(gens.map((gen) => gen.next().then((x) => x.value)));
        }
        else {
            values[i - 1] = n.done ? [] : n.value;
        }
        yield getYield();
    }
})();
