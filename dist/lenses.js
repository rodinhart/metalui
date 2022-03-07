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
export const index = (ix) => (f) => (obj) => f(obj && obj[ix]).map((val) => (obj || []).map((x, i) => (i !== ix ? x : val)));
export const grind = (...keys) => 
// @ts-ignore
compose(...keys.map(prop));
export const over = (obj, lens, f) => lens((x) => new Identity(f(x)))(obj).x;
export const prop = (key) => (f) => (obj) => f(obj && obj[key]).map((val) => ({
    ...obj,
    [key]: val,
}));
export const view = (obj, lens) => lens((x) => new Const(x))(obj).x;
