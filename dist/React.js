export const createElement = (tag, props, ...children) => [
    tag,
    props || {},
    ...children
        .flatMap((x) => {
        if (Array.isArray(x) && x.every((y) => Array.isArray(y))) {
            return x;
        }
        else {
            return [x];
        }
    })
        .map((x) => (Array.isArray(x) ? createElement(...x) : x)),
];
