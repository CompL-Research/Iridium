let NAMELESS_ANON_FN$3 = [function () {
  let a$2 = this.foo = 10;
}][0];
let a$1 = new NAMELESS_ANON_FN$3();
let a = a$1;
let js3$4 = console.log((() => {
  let js3$8 = Object.getPrototypeOf(a);
  let js3$7 = js3$8.constructor;
  let js3$6 = js3$7.name;
  let js3$9 = "";
  let js3$5 = js3$6 === js3$9;
  return js3$5;
})());
let b$11 = function b() {
  let b$12 = this.foo = 10;
};
let b$10 = new b$11();
let b = b$10;
let js3$13 = console.log((() => {
  let js3$17 = Object.getPrototypeOf(b);
  let js3$16 = js3$17.constructor;
  let js3$15 = js3$16.name;
  let js3$18 = "b";
  let js3$14 = js3$15 === js3$18;
  return js3$14;
})());
