// var a = 12;
// delete a;

// console.log(a);

// function foo(a, [b, c] = [1,2,3], d, ...{d: [e, {x: f}]}) {
//   console.log(a, b, c, d);
// }

// foo(1,2,3,4);

// function foo(a,...c) {

// }

// let [a, b, [c, [d, e]]] = [1,2, [3, [4,5]]];
// console.log(a,b,c,d,e);

// let v, c;

// ({ a: v, ...c } = { a: 12, b: 13 });

// console.log(v, c.b)

// function f(a, b = a) {
// }

// f()

// let a, b;
// ({ a, ...b} = { b: 1, c: 2, a: 3 });

// console.log(a, b.b, b.c)

// function foo(a, ...b) {
//   console.log(a, b);
// }

// foo(1,2,3);

// var ref;
// ref = (a, b = 39,) => {
// };


var callCount = 0;
var f;
f = (a = eval("var a = 42")) => {
  
  callCount = callCount + 1;
};

f();
console.log(callCount);

// function() {
// }
// assert.sameValue(callCount, 0, 'arrow function body not evaluated');
