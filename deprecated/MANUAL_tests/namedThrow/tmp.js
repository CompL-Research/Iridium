try {
  let NAMELESS_ANON_FN$1 = [() => {}][0];
  throw NAMELESS_ANON_FN$1;
} catch (e) {
  let js3$2 = console.log((() => {
    let js3$3 = e.name;
    return js3$3;
  })());
}
