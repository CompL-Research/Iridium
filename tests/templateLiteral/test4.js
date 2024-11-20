class A {
  a = 10
  toString() {
    return this.a
  }
}

let a = {
  val: 101,
  get b() {
    return new A()
  }
}

console.log(`${a.b}`)