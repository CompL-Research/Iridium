function* generate() {
  yield 'Hello';
  yield 'World';
  return 'Done';
}


// var Test = "outer";
// function f1(a = Test, Test = "args") {
//   var Test = "inner";
//   return a + Test;
// }
// console.log(f1());


// "use strict";

// var Test = "outer";
// function f1() {
//   var a = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Test;
//   var Test = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "args";
//   return function (Test) {
//     var Test = "inner";
//     return a + Test;
//   }(Test);
// }
// console.log(f1());