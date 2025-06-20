class A {
  static a = 12;
  static {
    this.a = 13;
  }
}

console.log(A.a);