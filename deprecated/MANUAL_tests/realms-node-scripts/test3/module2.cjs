Object.prototype.boo = "updated in module2"

let toExport = {}
console.log("(Object created in script realm, module2)", {}.boo)
module.exports = toExport