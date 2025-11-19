
let res1 = ""
let a = `hello ${(function () { 
  res1 = arguments.callee.name; return "doh"; 
})()} boo`
console.log(res1 === "")
console.log(a === "hello doh boo")



let res2 = ""
let b = `hello ${(function asa() { 
  res2 = arguments.callee.name; return "dih"; 
})()} boo`
console.log(res2 === "asa")
console.log(b === "hello dih boo")
