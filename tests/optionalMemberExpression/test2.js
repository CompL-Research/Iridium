let a = { x: { foo: { bar: { bart: 19 } } } }
let res = a.x?.foo?.bar.bart
console.log(res)