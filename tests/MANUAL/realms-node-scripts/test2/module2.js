Object.prototype.boo = "module2"

let toExport = {  __proto__: Object.prototype }
console.log("(Explicitly named ==> { __proto__: Object.prototype } )Made in 2", toExport.boo)
export default toExport
