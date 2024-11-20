// 
// Explicit duplication of a realm causes it to be preserved.
// module3 explicitly creates objects tied to the realm using
//   { __proto__: { ...Object.prototype } }
// 

Object.prototype.boo = "module1"

import o2 from "./module2.js"
import o3 from "./module3.js"

console.log(1, {}.boo)
console.log(2, o2.boo)
console.log(3, o3.boo) // Explicitly duplicating a prototype copies it across realm <- more memory?