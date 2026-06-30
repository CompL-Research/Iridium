let a = (function f() {})?.name
console.log(a === "f")

let b = (function () {})?.name
console.log(b === "")