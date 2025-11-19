// 
// Realms are independent, local realm prototypes retain their characteristics.
// 
Object.prototype.boo = "module1"

import "./module2.js"
import "./module3.js"

setTimeout(() => {
  console.log(1, {}.boo)
}, 100)

