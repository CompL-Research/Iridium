// 
// Objects in their module realms access the local realm prototypes.
// Even "monkey patching" does not carry the prototype from the parent realm.
// 

Object.prototype.boo = "module1"

import o2 from "./module2.js"
import o3 from "./module3.js"

console.log(1, {}.boo)
console.log(2, o2.boo)
console.log(3, o3.boo)
