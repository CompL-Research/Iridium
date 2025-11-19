
let obj = []
console.log(i) // undefined
console.log(j) // undefined

for (let _ in obj) {
  var i = 10
}

for (let _ of obj) {
  var j = 10
}
