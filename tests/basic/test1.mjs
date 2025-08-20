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

// var iter = function*() {}();
// iter.next();

// var callCount = 0;
// var f;
// f = ([,]) => {
  
//   callCount = callCount + 1;
// };

// f(iter);
// console.log(callCount, 1, 'arrow function invoked exactly once');


// // [,,] = 121;

// Array.prototype[Symbol.iterator] = function* () {
//     if (this.length > 0) {
//         yield this[0];
//     }
//     if (this.length > 1) {
//         yield this[1];
//     }
//     if (this.length > 2) {
//         yield 42;
//     }
// };

// const [x, y, z] = [1, 2, 3];

// console.log(x, 1);
// console.log(y, 2);
// console.log(z, 42);


// assert.throws(TypeError, });

// function foo() {
//   for (const i = 0; i < 1; i++) {}
// }

// {
//   const x = 12;
//   x = 13;
// }

// const x = 12;
// x = 13;


// var count = 0;

// const {...x} = { get v() { count++; return 2; } };
// console.log(typeof(f));

// var check = 0;
// do {
//   console.log(typeof(f));
//   if(typeof(f) === "function"){
//     check = -1;        
//     break; 
//   } else {
//     check = 1;        
//     break; 
//   }
// } while(function f(){});

// //////////////////////////////////////////////////////////////////////////////
// //CHECK#1
// if (check !== 1) {
// 	throw new Test262Error('#1: FunctionExpression within a "do-while" statement is allowed, but no function with the given name will appear in the global context');
// }


// let x = 1;
// for (const x in { x }) {}

// let log = console.log;
// let a = { f: 1 };

// log(a.f++);
// log(++a.f);

// function makeCounterBlock(b) {
//   const counterBlock = new Array(16).fill(0);

//   // low 32 bits
//   for (let c = 0; c < 4; c++) {
//     counterBlock[15 - c] = (b >>> (c * 8)) & 0xff;
//   }

//   // high 32 bits
//   for (let c = 0; c < 4; c++) {
//     counterBlock[15 - c - 4] = ((b / 0x100000000) >>> (c * 8)) & 0xff;
//   }

//   return counterBlock;
// }

// function assertEqual(name, got, expected) {
//   const same = got.length === expected.length && got.every((v, i) => v === expected[i]);
//   if (same) {
//     console.log(`✅ ${name} passed`);
//   } else {
//     console.log(`❌ ${name} FAILED`);
//     console.log(" got:     ", got);
//     console.log(" expected:", expected);
//   }
// }

// // === Unit tests ===
// assertEqual("b=0", makeCounterBlock(0), [
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
// ]);

// assertEqual("b=1", makeCounterBlock(1), [
//   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1
// ]);

// assertEqual("b=0x12345678", makeCounterBlock(0x12345678), [
//   0,0,0,0,0,0,0,0,0,0,0,0,18,52,86,120
// ]);

// assertEqual("b=0x100000000", makeCounterBlock(0x100000000), [
//   0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0
// ]);

// assertEqual("b=0x123456789ABCDEF", makeCounterBlock(0x123456789ABCDEF), [
//   0,0,0,0,0,0,0,0,1,35,69,103,137,171,205, 240,
// ]);

// function Camera() {
//   console.log("Camera constructor called");
// }

// Camera.prototype.render = function() {
//     console.log("Calling render");
// }

// let o = new Camera();
// o.render();

// function Scene(a_triangles) {
//   this.triangles = a_triangles;
// }

// Scene.prototype.testfun = function() {
//   console.log(this.triangles);
// }

// new Scene("Hello World").testfun();

// function Triangle() {
//   this.name = "Triangle";
// }

// {
//   var i = 0;
//   var triangles = new Array();
//   triangles[i++] = new Triangle();
//   triangles[i++] = new Triangle();
//   triangles[i++] = new Triangle();
//   triangles[i++] = new Triangle();
//   triangles[i++] = new Triangle();
//   triangles[i++] = new Triangle();

//   console.log(triangles[0].name);
// }

// let a = [];
// let i = 0;
// a[i++] = i;
// a[i++] = i;
// a[i++] = i;
// a[i++] = i;
// a[i++] = i;
// a[i++] = i;
// a[i++] = i;
// console.log(a,i)

// function foo(foo) {
//   let y;
//   let t1;
//   ({ x: t1} = { w: undefined});
//   ({ y } = t1);
//   console.log(y);
// }

// foo();

// function f({ w: { x, y, z } = { x: 4, y: 5, z: 6 } } = { w: undefined }) {

// }
// f();


// let x, y, z;
// ({ w: { x, y, z } = { x: 4, y: 5, z: 6 } } = { w: undefined });

// var callCount = 0;
// var f;
// f = ({ w: { x, y, z } = { x: 4, y: 5, z: 6 } } = { w: undefined }) => {
//   console.log(x, 4);
//   console.log(y, 5);
//   console.log(z, 6);

//   // assert.throws(ReferenceError, function() {
//   //   w;
//   // });
//   callCount = callCount + 1;
// };

// f();
// console.log(callCount, 1, 'arrow function invoked exactly once');

// console.log("Hello World");

// for (let i of [1,2,3]) {
//   console.log(i);
// }


try {
  throw new Error();
} catch(e) {
}