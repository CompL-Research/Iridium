// assert.sameValue = function (actual, expected, message) {
//   try {
//     if (assert._isSameValue(actual, expected)) {
//       return;
//     }
//   } catch (error) {
//     throw new Test262Error(message + ' (_isSameValue operation threw) ' + error);
//     return;
//   }

//   if (message === undefined) {
//     message = '';
//   } else {
//     message += ' ';
//   }

//   message += 'Expected SameValue(«' + assert._toString(actual) + '», «' + assert._toString(expected) + '») to be true';

//   throw new Test262Error(message);
// };


// const oldArguments = globalThis.arguments;
// const f = (arguments, p = eval("var arguments = 'param'"), q = () => arguments) => {}
// try {
//   f();
// } catch(e) {
//   console.log(e);
//   console.log("1", e.constructor === SyntaxError);
// }
// console.log("2", globalThis.arguments === oldArguments);


// function foo(xx) {
//   var xx = 12;
//   console.log(xx);
// }

// foo(13);

const x = 12;

x = 13;

console.log(x);