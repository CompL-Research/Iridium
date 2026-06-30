function foo() {
  let NAMELESS_ANON_FN$1 = [() => {}][0];
  return NAMELESS_ANON_FN$1;
}
let js3$2 = console.log((() => {
  let js3$4 = foo();
  let js3$3 = js3$4.name;
  return js3$3;
})());
