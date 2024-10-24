let called = false;
let context;
class Base {
  method() {
    let js3$1 = called = true;
    let js3$2 = context = this;
  }
}
class Foo extends Base {
  method() {
    let OPTE_RESULT$3 = undefined;
    let OPTCE_CALLEE$4 = super.method;
    let OPTCE_C1$5 = OPTCE_CALLEE$4 !== undefined;
    let OPTCE_NULL$6 = null;
    let OPTCE_C2$7 = OPTCE_CALLEE$4 !== OPTCE_NULL$6;
    let OPTE_CFIN$8 = OPTCE_C1$5 && OPTCE_C2$7;
    if (OPTE_CFIN$8) {
      OPTE_RESULT$3 = OPTCE_CALLEE$4.call(this)
    }
  }
}
let foo$10 = Foo;
let foo$9 = new foo$10();
const foo = foo$9;
let js3$11 = foo.method();
let js3$12 = console.log((() => {
  let js3$14 = foo;
  let js3$15 = context;
  let js3$13 = js3$14 === js3$15;
  return js3$13;
})());
let js3$16 = console.log((() => {
  let js3$18 = called;
  let js3$19 = true;
  let js3$17 = js3$18 === js3$19;
  return js3$17;
})());
