class Base {
  boo = 111
  method() {
    console.log(`Base method: ${this.boo}`)
  }
}
class Foo extends Base {
  boo = 100
  method() {
    console.log(`Foo method: ${this.boo}`)
  }
  callParent() {
    console.log("Super.foo", super.foo) // This is undefined? why?
    super.method() // This finds the binding and passes 'this'?
  }
}
const foo = new Foo();
foo.callParent();  // Base method: 100