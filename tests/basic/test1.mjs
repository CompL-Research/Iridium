// import { boo } from "./lib.mjs";

// export * from "./lib1.mjs";


// let a = 12;

// console.log(a);

// let {a, b} = { a: 1, b: 2, c: 3 };

// console.log(a, b);

// class Test { #foo() { return 42; } foo() { return this.#foo(); } }

// console.log(new Test().foo())

// class A {
//   #foo() {
//     return 42;
//   }
//   foo() {
//     return this.#foo();
//   }
// }

// console.log(new A().foo());


// function foo() {
//   this.x = 12;
//   console.log(this.x);
// }

// new foo();

// function foo() {
//   console.log(arguments);
// }

// foo(1, 2, 3);


// class A {
//   constructor() {
//     console.log("Parent class constructor called");
//   }
//   bar() { return 42; }
// }

// class B extends A {
//   foo() {
//     return super.bar();
//   }
// }

// console.log(new B().foo());

// function foo() {
//   for (let i of [1,2,3]) {
//     console.log(i);
//     if (i === 2) return;
//   }

//   for (let i in [1,2,3]) {
//     console.log(i);
//   }
// }

// foo();

// function foo() {
//   console.log("foo called");
// }

// foo();

// class B {

// }

// class A extends B{
//   p = (console.log("pinit 1 called"), 12);
//   constructor() {
//     console.log("pinit 2 called")
//     if (false) {
//       super();
//     } else {
//       super();
//     }
//   }
// }

// console.log(new A());

// class B {
//   constructor() {
//     console.log("B constructor called");
//   }
// }

// class A extends B {
//   p1 = (console.log("p1init"), 12);
//   constructor() {
//     let x = () => {
//       super();
//     };
//     let y = () => {
//       super();
//     }
//     x();
//   }
// }

// new A()

// class Test { #foo() { return 423; } foo() { return this.#foo(); } }
// console.log(new Test().foo());

// function test5() {
//   let a = 0;
//   let b = 1;
//   let c = 2;
//   let d = -1;
//   let e = a + b + c + d
//   console.log(e);
// }

// test5()

// let b = ["a", "b"];
// let c = ["foo", "bar"];
// let a = [1,2,...b, 3, ...c];

// console.log(a);

// let a = { a: 1, b: 2, c: 3 }
// let c = { ...a, c: 13 }
// console.log(c.c)

// let a = {
//  m() { console.log("m called"); },
//  set f(val) { this.m(), this.data = val; },
//  get f() { this.m(); return this.data; }
// };

// a.f = 13;
// console.log(a.f);

// let f = () => {
//   for (let e of [1,2,3]) {
//     try {
//       if (e === 3) {
//         throw "Pikachu";
//       }
//     } catch (e) {
//       console.log("caught", e);
//     } finally {
//       console.log(e);
//     }
//   }
  
// }

// f()

// function foo() {
//   console.log("Hello World");
// }

// foo();

// let a = 0;
// // let b = 13;
// console.log(typeof a);

// class Foo {
//   #bar = () => {
//     console.log("Hello World");
//   }

//   #goober() {
//     console.log("goober");
//   }

//   #yy = 123;
  
//   foo() {
//     this.#bar();
//     this.#bar = 121;
//     let xx = this.#goober;
//     let yy = this.#yy;
//     console.log(this.#bar);
//     xx();
//     console.log(this.#yy);
//   }
// }

// new Foo().foo()

// //CHECK#1
// if (Number.MAX_VALUE + Number.MAX_VALUE !== Number.POSITIVE_INFINITY) {
//   console.log("Check 1 fail");
// }

// //CHECK#2
// if (-Number.MAX_VALUE - Number.MAX_VALUE !== Number.NEGATIVE_INFINITY) {
//   console.log("Check 2 fail");
// }

// //CHECK#3
// if (1e+308 + 1e+308 !== Number.POSITIVE_INFINITY) {
//   console.log("Check 3 fail");
// }

// //CHECK#4
// if (-8.99e+307 - 8.99e+307 !== Number.NEGATIVE_INFINITY) {
//   console.log("Check 4 fail");
// }

// var a = (xx, yy) => { let x; eval('var x;'); };

// a();

// var a = () => { let x; { let x; let z; let y; let a; let b; let c; eval(code); } { let z; }  };
// var b = () => { eval(code);  };

// a();

// var callCount = 0;
// var f;
// f = ({a, b, ...rest}) => {
//   // console.log(rest.a, undefined);
//   // console.log(rest.b, undefined);

//   // // verifyProperty(rest, "x", {
//   // //   enumerable: true,
//   // //   writable: true,
//   // //   configurable: true,
//   // //   value: 1
//   // // });

//   // // verifyProperty(rest, "y", {
//   // //   enumerable: true,
//   // //   writable: true,
//   // //   configurable: true,
//   // //   value: 2
//   // // });
//   // callCount = callCount + 1;
// };

// f({x: 1, y: 2, a: 5, b: 3});
// console.log(callCount, 1, 'arrow function invoked exactly once');


// var x = 'outside';
// var probeParams, probeBody;

// ((_ = probeParams = function() { return x; }) => {
//   var x = 'inside';
//   probeBody = function() { return x; };
// })();

// console.log(probeParams(), 'outside');
// console.log(probeBody(), 'inside');


// var zoo = 100;

// function foo(x = (console.log(zoo), zoo)) {
//   var zoo = 121;
//   var x;
//   console.log(x);
// }

// foo();

// var zoo = 100;

// function foo(x = (console.log(zoo), zoo)) {
//   var zoo = 121;
//   var x;
//   console.log(x);
// }

// foo();

var iter = function*() {}();
iter.next();

var callCount = 0;
var f;
f = ([,]) => {
  
  callCount = callCount + 1;
};

f(iter);
console.log(callCount, 1, 'arrow function invoked exactly once');


// [,,] = 121;