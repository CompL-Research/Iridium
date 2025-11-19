let moo = undefined
const faa = () => {
  moo = module
  return true
}

const boo = () => {
  console.log("Boo")
  return true
}

if (faa()) {
  moo.exports.boo = boo
} else {
  // module.exports.boo = undefined
}
