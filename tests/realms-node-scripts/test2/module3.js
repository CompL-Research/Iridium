Object.prototype.boo = "module3"

let toExport = { __proto__: { ...Object.prototype } }
console.log("(Explicitly duplicated ==> { __proto__: { ...Object.prototype } } )Made in 2", toExport.boo)
export default toExport