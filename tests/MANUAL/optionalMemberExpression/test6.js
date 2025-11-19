let called = false;
let context;
class Base {
    method() {
      called = true;
      context = this;
    }
}
class Foo extends Base {
    method() {
      super.method?.();
    }
}
const foo = new Foo();
foo.method();
console.log(foo === context)
console.log(called === true)