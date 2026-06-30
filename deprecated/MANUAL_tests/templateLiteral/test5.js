let a = {
  val: 101,
  get b() {
    return this.toString()
  },
  toString: () => "HI FROM TOSTRING"
}

console.log(`${a.b}`)