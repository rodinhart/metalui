!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.metalui=t():e.metalui=t()}(self,(function(){return(()=>{"use strict";var e={d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{Observable:()=>$,assoc:()=>n,compose:()=>r,conj:()=>o,count:()=>s,createUid:()=>i,disj:()=>c,dissoc:()=>a,filter:()=>u,identity:()=>l,intersection:()=>d,into:()=>f,map:()=>y,memo:()=>m,memoPromise:()=>h,race:()=>p,range:()=>b,render:()=>O,sleep:()=>w,thread:()=>g,toArray:()=>v,toObject:()=>j,toxml:()=>x,union:()=>S});const n=(e,...t)=>{const n={...e};for(let e=0;e+1<t.length;e+=2)n[t[e]]=t[e+1];return n};function r(...e){return t=>{let n=t;for(let t=e.length-1;t>=0;t-=1)n=e[t](n);return n}}const o=(e,...t)=>new Set([...e,...t]),s=e=>e.reduce((e=>e+1),0),i=()=>Math.random().toString(16).substr(2),c=(e,...t)=>{const n=new Set(e);for(const e of t)n.delete(e);return n},a=(e,...t)=>{const n={};for(const r in e)-1===t.indexOf(r)&&(n[r]=e[r]);return n},u=(e,t)=>({reduce:(n,r)=>t.reduce(((t,r)=>e(r)?n(t,r):t),r)}),l=e=>e,d=(e,t)=>{const n=new Set;for(const r of e)t.has(r)&&n.add(r);return n},f=(e,...t)=>t.reduce(((e,[t,n])=>(e[t]=n,e)),{...e});function y(e,t){return{reduce:(n,r)=>(t.reduce?t:Object.entries(t)).reduce(((t,r)=>n(t,e(r))),r)}}const m=(e,t)=>{const n={};return(...r)=>{const o=t?t(r):JSON.stringify(r);return o in n||(n[o]=e(...r)),n[o]}},h=e=>{const t=[];return async()=>t.length?t[0]:await e().then((e=>(t[0]=e,e)))},p=(...e)=>({[Symbol.asyncIterator]:async function*(){const t=e.map((e=>e[Symbol.asyncIterator]())),n=await Promise.all(t.map((e=>e.next().then((e=>e.value)))));yield n;const r=t.map(((e,t)=>e.next().then((e=>[e.value,t]))));for(;;){const[e,o]=await Promise.race(r);n[o]=e,r[o]=t[o].next().then((e=>[e.value,o])),yield n}}}),b=(e,t)=>({reduce:(n,r)=>{let o=r,s=e;for(;void 0===t||s<t;)o=n(o,s),s+=1;return o}}),w=e=>new Promise(((t,n)=>{setTimeout((()=>{t(void 0)}),e)}));function g(e,...t){return t.reduce(((e,t)=>t(e)),e)}const v=e=>Array.isArray(e)?e:e.reduce(((e,t)=>(e.push(t),e)),[]),j=e=>e.reduce(((e,[t,n])=>(e[t]=n,e)),{}),S=(e,t)=>new Set([...e,...t]),x=(e,t,n)=>{if(Array.isArray(e)){const[r,o,...s]=e,c=j(y((([e,r])=>{if("on"!==e.substr(0,2))return[e,r];{const o=e+"-"+i();return glob[t]=n,n[o]=e=>r(e),[e,`glob['${t}']['${o}'](event)`]}}),o)),a=s.map((e=>x(e,t,n)));return`<${r} ${Object.entries(c).map((([e,t])=>void 0!==t?`${e}="${t}"`:e)).join(" ")}>${a.join("")}</${r}>`}return null===e?"":String(e)},O=async e=>{if(Array.isArray(e)){const[t,n,...r]=e,o=[];for(const e of r)o.push(await O(e));if("string"==typeof t)return[t,n,...o];const s=t({...n,children:o});if(null===s||"object"!=typeof s||Array.isArray(s))return await O(s);let c;const a=async e=>{do{await w(0)}while(e&&!document.getElementById(c));const t=document.getElementById(c);if(!t)return;const n=await s.next(t);if(n.done)return;const r=await O(n.value),[,o,...i]=r;Object.assign(t,o);const u={};t.innerHTML=i.map((e=>x(e,c,u))).join(" "),a(!1)},u=await s.next();if(u.done)return null;const l=await O(u.value),[,d]=l;return c=d.id||i(),d.id=c,a(!0),l}return e};class A{constructor(e){this.x=e}map(e){return new A(this.x)}}const P=(e,t)=>t((e=>new A(e)))(e).x;class ${constructor(e){this.value=e,this.watchers=[],this[Symbol.asyncIterator]=async function*(){for(;;)yield this.value,await new Promise((e=>{this.watchers.push(e)}))}}notify(e){this.value="function"==typeof e?e(this.value):e,this.watchers.splice(0,this.watchers.length).forEach((e=>e(void 0)))}focus(...e){const t=this;let n=[];return{[Symbol.asyncIterator]:async function*(){for await(const r of t){const t=e.map((e=>P(r,e)));(t.length!==n.length||t.some(((e,t)=>e!==n[t])))&&(n=t,yield r)}}}}}return t})()}));