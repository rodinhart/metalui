(()=>{"use strict";const r=()=>Math.random().toString(16).substr(2),t=r=>new Promise(((t,e)=>{setTimeout((()=>{t(void 0)}),r)})),e=(()=>{const r=document.createElement("div");return t=>(r.innerText=t,r.innerHTML)})(),n=(t,o="GLOBAL",a={})=>{if(Array.isArray(t)){const[e,d,...m]=t,y=(c=([t,e])=>{if("on"!==t.substr(0,2))return[t,e];{const n=t+"-"+r();return glob[o]=a,a[n]=r=>e(r),[t,`glob['${o}']['${n}'](event)`]}},i=(r,[t,e])=>(r[t]=e,r),s={},((u=d).reduce?u:Object.entries(u)).reduce(((r,t)=>i(r,c(t))),s)),w=m.map((r=>n(r,o,a)));return"Fragment"===e?w.join(""):`<${e} ${Object.entries(y).map((([r,t])=>void 0!==t?`${r}="${t}"`:r)).join(" ")}>${w.join("")}</${e}>`}var i,s,c,u;return null===t?"":e(String(t))},o=async(e,a={})=>{if(Array.isArray(e)){const[i,s,...c]=e,u=Object.entries(s).reduce(((r,[t,e])=>("$"===t[0]&&(r[t]=e),r)),{...a}),d=[];try{for(const r of c)d.push(await o(r,u))}catch(r){if(s.errorBoundary)return s.errorBoundary;throw r}if("string"==typeof i)return[i,s,...d];const m=i({...u,...s,children:d});if(null===m||"object"!=typeof m||Array.isArray(m))return await o(m,u);let y;const w=async r=>{do{await t(0)}while(r&&!document.getElementById(y));const e=document.getElementById(y);if(!e)return void await m.return();const a=await m.next(e);if(a.done)return;const i=await o(a.value,u);if(!Array.isArray(i))throw new Error(`Expect component to rerender a tag, not ${i}`);const[s,c,...d]=i;if(s!==e.tagName.toLowerCase())throw new Error(`Expect component to rerender with tag ${e.tagName.toLowerCase()}, not tag ${s}`);Object.assign(e,c);const l={};e.innerHTML=d.map((r=>n(r,y,l))).join(" "),w(!1)},l=await m.next();if(l.done)return null;const $=await o(l.value,u);if(!Array.isArray($))throw new Error(`Expect component to return a tag, not ${$}`);const[,f]=$;return y=f.id||r(),f.id=y,w(!0),$}return e};Symbol.asyncIterator,(async()=>{const r=({number:r,$size:t})=>["div",{},`Size here at ${r} is ${t}`];document.body.innerHTML=n(await o([()=>["div",{},[r,{number:1}],["div",{},["div",{$size:"large"},[r,{number:2}]]],[r,{number:3}]],{$size:"small"}]))})()})();