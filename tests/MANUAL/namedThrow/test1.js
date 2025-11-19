

try {
  throw () => { }
} catch (e) {
  console.log(e.name)
}