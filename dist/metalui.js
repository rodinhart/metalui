import { Observable } from "./Observable.js";
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
    // ["tag", {}, ...]
    if (typeof tag === "string") {
        const mapped = [];
        try {
            for (const child of children) {
                mapped.push(...(await renderǃ(child, newContext)));
            }
        }
        catch (e) {
            // @ts-ignore
            if (newContext.$errorBoundary) {
                // @ts-ignore
                return [document.createTextNode(String(newContext.$errorBoundary))];
            }
            throw e;
        }
        // ["Fragment", {}, ...]
        if (tag === "Fragment") {
            return mapped;
        }
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith("on")) {
                node.addEventListener(key.substr(2), value);
            }
            else if (!key.startsWith("$")) {
                node.setAttribute(key, key === "style" && typeof value !== "string"
                    ? Object.entries(value)
                        .map(([key, value]) => `${key}: ${value};`)
                        .join(" ")
                    : String(value)); // what about non-string values?
            }
        }
        for (const child of mapped) {
            if (child instanceof Node) {
                node.appendChild(child);
            }
            else {
                const nodes = (await child.next()).value;
                node.append(...nodes);
                const _ = (nodes) => {
                    child.next().then((n) => {
                        if (n.done) {
                            return;
                        }
                        const newNodes = n.value;
                        for (const nn of newNodes) {
                            node.insertBefore(nn, nodes[0]); // what if nodes === []
                        }
                        for (const n of nodes) {
                            node.removeChild(n);
                        }
                        _(newNodes);
                    });
                };
                _(nodes);
            }
        }
        return [node];
    }
    const iterator = tag({ ...newContext, ...props, children });
    // [function(), {}, ...]
    if (iterator === null ||
        typeof iterator !== "object" ||
        Array.isArray(iterator)) {
        return await renderǃ(iterator, newContext);
    }
    // [async function*(), {}, ...]
    const m = genMap((x) => renderǃ(x, newContext), iterator);
    const n = genFlatten(m);
    return [n];
    // const rerender = async (atom: HTMLElement, loop: boolean) => {
    //   do {
    //     await sleep(0)
    //   } while (loop && !atom.isConnected)
    //   if (!atom.isConnected) {
    //     await iterator.return()
    //     return
    //   }
    //   const next = await iterator.next(atom)
    //   if (next.done) {
    //     return
    //   }
    //   const nodes = await renderǃ(next.value, newContext)
    //   if (nodes.length !== 1) {
    //     throw new Error(
    //       `Expect component to return single element, not ${nodes.length} elements`
    //     )
    //   }
    //   const node = nodes[0] as HTMLElement
    //   if (node.tagName !== atom.tagName) {
    //     throw new Error(
    //       `Expect component to rerender with tag ${atom.tagName.toLowerCase()}, not tag ${node.tagName.toLocaleLowerCase()}`
    //     )
    //   }
    //   for (const name of node.getAttributeNames()) {
    //     // event handlers ?!?
    //     const value = node.getAttribute(name)
    //     if (value !== null) {
    //       atom.setAttribute(name, value)
    //     }
    //   }
    //   atom.replaceChildren(...node.childNodes)
    //   rerender(atom, false)
    // }
    // const next = await iterator.next()
    // if (next.done) {
    //   return []
    // }
    // const nodes = await renderǃ(next.value, newContext)
    // if (nodes.length !== 1) {
    //   throw new Error(
    //     `Expect component to return single node, not ${nodes.length} nodes`
    //   )
    // }
    // rerender(nodes[0] as HTMLElement, true) // !!
    // return nodes
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
const genMap = (f, coll) => (async function* () {
    for await (const item of coll) {
        yield await f(item);
    }
})();
const genFlatten = (coll) => (async function* () {
    const next = (g, i) => g.next().then((n) => [n, i]);
    let items = (await coll.next()).value;
    let gens = items.filter(isAsyncGenerator);
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
        const [n, i] = await Promise.race([coll, ...gens].map((g, i) => next(g, i)));
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
