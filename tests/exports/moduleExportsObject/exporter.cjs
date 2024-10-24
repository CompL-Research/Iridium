const boo = () => {
  console.log("Boo")
  return true
}

if (boo()) {
  module.exports = { boo: () => { console.log("bart"); } }  
} else {
  module.exports = { boo }
}
