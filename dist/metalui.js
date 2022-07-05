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
        return markup === null ? [] : [document.createTextNode(String(markup))];
    }
    const [tag, props, ...children] = markup;
    const newContext = Object.entries(props).reduce((r, [key, val]) => {
        if (key[0] === "$") {
            r[key] = val;
        }
        return r;
    }, { ...context });
    if (tag === "svg") {
        newContext.$namespace = "http://www.w3.org/2000/svg";
    }
    // ["tag", {}, ...]
    if (typeof tag === "string") {
        const mapped = [];
        for (const child of children) {
            const rendered = await renderǃ(child, newContext);
            if (rendered !== null) {
                mapped.push(rendered);
            }
        }
        // ["Fragment", {}, ...]
        if (tag === "Fragment") {
            if (mapped.every((x) => Array.isArray(x))) {
                return mapped.flat();
            }
            return flattenChildren(mapped);
        }
        const node = !newContext.$namespace
            ? document.createElement(tag)
            : document.createElementNS(newContext.$namespace, tag);
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
        if (mapped.every((x) => Array.isArray(x))) {
            node.replaceChildren(...mapped.flat());
            return [node];
        }
        ;
        (async () => {
            for await (const values of flattenChildren(mapped)) {
                node.replaceChildren(...values);
            }
        })();
        return [node];
    }
    let result;
    try {
        result = tag({ ...newContext, ...props, children });
    }
    catch (e) {
        console.log({ e, newContext });
        if (newContext.$errorBoundary) {
            return [document.createTextNode(String(newContext.$errorBoundary))];
        }
        throw e;
    }
    // [function(), {}, ...]
    if (result === null ||
        typeof result !== "object" ||
        Array.isArray(result) // ??
    ) {
        return await renderǃ(result, newContext);
    }
    const iterator = result;
    const getNext = () => iterator
        .next()
        .then((n) => n.done
        ? [n, "main"]
        : renderǃ(n.value, newContext).then((value) => [{ value }, "main"]));
    const _ = async function* () {
        let main = getNext();
        let sub = null;
        do {
            const promises = [main];
            if (sub) {
                promises.push(sub
                    .next()
                    .then((n) => [n, "sub"]));
            }
            const [next, type] = await Promise.race(promises);
            if (type === "main") {
                if (next.done) {
                    break;
                }
                else {
                    const value = next.value;
                    if (Array.isArray(value)) {
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
const flattenChildren = async function* (mapped) {
    // get initial values
    const values = await Promise.all(mapped.map((child) => Array.isArray(child)
        ? Promise.resolve(child)
        : child.next().then((n) => (n.done ? [] : n.value))));
    yield values.flat();
    const nexts = mapped.map((child, i) => Array.isArray(child) ? null : child.next().then((n) => [n, i]));
    do {
        const [next, i] = await Promise.race(nexts.filter(notNull));
        values[i] = next.done ? [] : next.value;
        yield values.flat();
        nexts[i] = next.done
            ? null
            : mapped[i].next().then((n) => [n, i]);
    } while (true);
};
