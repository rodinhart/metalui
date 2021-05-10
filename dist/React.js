export const createElement = (tag, props, ...children) => [
    tag,
    props || {},
    ...children.flatMap((x) => Array.isArray(x) ? x : [x]),
];
