
let res1 = "";
(() => { res1 = arguments.callee.name })`Hello ${1} World`;
console.log(res1 === "");

let res2 = "";
function a() { res2 = arguments.callee.name }`Hello ${1} World`;
console.log(a.name === "a")

let res3 = "";
(function a() { res3 = arguments.callee.name })`Hello ${1} World`;
console.log(res3 === "a")


