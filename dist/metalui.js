import { createUid, map, sleep } from "./lang";
import { Observable } from "./Observable";
const escapeHtml = (() => {
    const e = document.createElement("div");
    return (s) => {
        e.innerText = s;
        return e.innerHTML;
    };
})();
export const Fragment = ({ children }) => [
    "Fragment",
    {},
    ...children,
];
export const lazyLoad = (thunk) => async function* (props) {
    const component = await thunk();
    yield [component, props];
};
export const render = async (markup, context = {}) => {
    if (Array.isArray(markup)) {
        const [tag, props, ...children] = markup;
        const newContext = Object.entries(props).reduce((r, [key, val]) => {
            if (key[0] === "$") {
                r[key] = val;
            }
            return r;
        }, { ...context });
        const mapped = [];
        try {
            for (const child of children) {
                mapped.push(await render(child, newContext));
            }
        }
        catch (e) {
            if (props.errorBoundary) {
                return props.errorBoundary;
            }
            throw e;
        }
        if (typeof tag === "string") {
            return [tag, props, ...mapped];
        }
        const iterator = tag({ ...newContext, ...props, children: mapped });
        if (iterator === null ||
            typeof iterator !== "object" ||
            Array.isArray(iterator)) {
            return await render(iterator, newContext);
        }
        let id;
        const rerender = async (loop) => {
            do {
                await sleep(0);
            } while (loop && !document.getElementById(id));
            const node = document.getElementById(id);
            if (!node) {
                await iterator.return();
                return;
            }
            const next = await iterator.next(node);
            if (next.done) {
                return;
            }
            const element = (await render(next.value, newContext));
            if (!Array.isArray(element)) {
                throw new Error(`Expect component to rerender a tag, not ${element}`);
            }
            const [tag, props, ...children] = element;
            if (tag !== node.tagName.toLowerCase()) {
                throw new Error(`Expect component to rerender with tag ${node.tagName.toLowerCase()}, not tag ${tag}`);
            }
            Object.assign(node, props);
            const ids = {};
            node.innerHTML = children.map((e) => toxml(e, id, ids)).join(" ");
            rerender(false);
        };
        const next = await iterator.next();
        if (next.done) {
            return null;
        }
        const element = (await render(next.value, newContext));
        if (!Array.isArray(element)) {
            throw new Error(`Expect component to return a tag, not ${element}`);
        }
        const [, props2] = element;
        id = props2.id || createUid();
        props2.id = id; // don't reassign
        rerender(true);
        return element;
    }
    return markup;
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
// JSONML to XML string
export const toxml = (el, gkey = "GLOBAL", ids = {}) => {
    if (Array.isArray(el)) {
        const [name, props, ...children] = el;
        const evented = Object.fromEntries(map(([key, val]) => {
            if (key.substr(0, 2) !== "on") {
                return [key, val];
            }
            else {
                const id = key + "-" + createUid();
                glob[gkey] = ids;
                ids[id] = (event) => val(event);
                return [key, `glob['${gkey}']['${id}'](event)`];
            }
        }, props));
        const mapped = children.map((c) => toxml(c, gkey, ids));
        if (name === "Fragment") {
            return mapped.join("");
        }
        return `<${name} ${Object.entries(evented)
            .map(([key, val]) => (val !== undefined ? `${key}="${val}"` : key))
            .join(" ")}>${mapped.join("")}</${name}>`;
    }
    return el === null ? "" : escapeHtml(String(el));
};
