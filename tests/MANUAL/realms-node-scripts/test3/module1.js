// 
// So there appear to be multiple module realms, each their own.
// And one global script realm.
// When objects are transferred from script realm to module realm, unless 
// explicitly copied realm prototypes are not transferred.
// So some object properties available in script realm may simply break in script mode.
// 

console.log("module 1 out")
Object.prototype.boo = "module1"

import o2 from "./module2.cjs"
import o3 from "./module3.cjs"

console.log(1, {}.boo)
console.log(2, o2.boo)
console.log(3, o3.boo)
