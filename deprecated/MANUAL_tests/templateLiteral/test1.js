

let a = `hello ${(() => { console.log("boo"); return "doh"; })()} boo`

console.log(a)
