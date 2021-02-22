import { compose } from "./lang.js";
class Identity {
    constructor(x) {
        this.x = x;
    }
    map(f) {
        return new Identity(f(this.x));
    }
}
class Const {
    constructor(x) {
        this.x = x;
    }
    map(f) {
        return new Const(this.x);
    }
}
export const grind = (...keys) => 
// @ts-ignore
compose(...keys.map(prop));
export const over = (lens, f) => (obj) => lens((x) => new Identity(f(x)))(obj).x;
export const prop = (key) => (f) => (obj) => f(obj && obj[key]).map((val) => ({
    ...obj,
    [key]: val,
}));
export const view = (obj, lens) => lens((x) => new Const(x))(obj).x;
//# sourceMappingURL=lenses.js.map