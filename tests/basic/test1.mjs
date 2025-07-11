// let a = 0;
// let b = 0;
// loop1: while (a < 10) {
//   console.log("Outer Loop");
//   while (b < 10) {
//     console.log("Inner Loop");
//     b = b + 1;
//     continue loop1;
//   }
//   a = a + 1;
// }



// loop1: for(let i = 0; i < 10; i = i + 1) {
//   console.log(i);
//   while(true) {
//     console.log("inner loop");
//     break loop1;
//   }
// }

// let temp = [1,2,3,4]

// for (let i in OP(temp)) {
//   console.log(i);
// }

// {
//   temp1, x, y = OP(temp)
//   {
//     temp2;
//     temp3;

//     OP(temp1, temp2, temp3);

//     if(temp3) {
//       // Body
//       let i = temp2

//     } else {
//       exit;
//     }
//   }
// }

// loc1: {
//   console.log("Hello");
//   break loc1;
//   console.log("Heaven");
// }
// console.log("World");

// for (let i of [1,2,3]) {
//   console.log(i);
// }


// let [a, b, ...{ 0: { e: { f = 1 } } }] 
// let x = [1,2, { e: { f: 66 } }];

// {
//   let [o1, ,...o3] = [1,2,3,4];
// }

// console.log(a, b, f);

// let f = () => {
//   f = 12;
//   return f;
// }

// let a = []
// a[0] = 1;

// console.log(a);
// {
//   let [a,...c] = [1,2,3];

//   console.log(a,c);
// }

// let x;
// for (x in [1,2,3]) {
//   console.log(x);
// }

// let field = "x";

// let { [field]: x } = { x: 112 };

// console.log(x);

// class A {
//   #x = 12;
//   foo(a) {
//     { b: #x } = a;
//   }
// }

// let a = null;

// let { ["b"]: a, ...b } = { a: 12, b: 112, c: 113 }

// console.log(b.b);

// function* foo(params = console.log("param call")) {
//   yield 1;
//   yield 2;
//   yield 3;
// }

// function* a() {
//   console.log("After initial yield");
//   yield 1;
//   yield 2;
//   return;
// }

// let x = a();
// console.log(x.next().value);
// console.log(x.next().value);

// var a = 12;
// try {
//   x = 12;
// } catch(e) {
// }

// function f() {
//   try {
//     return 1;
//   } finally {
//     console.log("cleanup");
//   }
// }

// f();

// for (let a of [1,2,3]) {
//   console.log(a);
// }

// try {
//   try {
//     try {
//       throw "Error";
//     } finally {
//       console.log("Quixote");
//     }
//   } finally {
//     console.log("Don");
//   }
// } catch (e) {
//   console.log("Sire");
// }    

// let a;
// let b;
// let x = () => {
//   try {
//     a = () => {
//       throw 1;
//     }
//     b = function() {
//       throw 2;
//     }
//   } catch (e) {
//     console.log(e);
//   }
//   a();
// }
// x();

// for (let x of [1,2,3]) {
//   console.log(x);
// }

// try {
//   throw { x: 12 };
// } catch({ y: {z} }) {
//   console.log("This catch");
// }

// for (let i = 0; i < 10; ++i) {
//   try {
//     break;
//   } finally {
//     console.log("Boo");
//   }
// }

// let a;
// a = 12;
// try {
//   a = 12;
// } catch(e) {
//   a = 13;
// }
// let res;
// try {
//   throw 12;
// } catch(e) {
//   res = e;
// } finally {
//   console.log(res);
// }

// let i = 0;
// while (i < 10) {
//   i = i + 1;
//   try {
//     break;
//   } finally {
//     console.log("While loop");
//   }
// }

// xoxo: {
//   console.log("xoxo");
//   for (let i of [1,2,3]) {
//     console.log("Loop");
//     try {
//       console.log(i);
//     } finally {
//       console.log("Hae");
//       // break;
//     }
//   }
// }
// console.log("end");

// const iterable = {
  
// };

// iterable[Symbol.iterator] = function() {
//   return {
//     next() {
//       console.log("next called");
//       return { value: 1, done: false };
//     },
//     return() {
//       console.log("return called (cleanup)");
//       return { done: true };
//     }
//   };
// }

// function test() {
//   for (const x of iterable) {
//     console.log("inside loop:", x);
//     throw new Error("abrupt exit"); // abrupt exit triggers iterator.return()
//   }
// }

// try {
//   test();
// } catch (e) {
//   console.log("caught:", e.message);
// }

// for (let i of [1,2,3]) {
//   console.log(i);
// }

// let a = [1,2,3];
// let [b, ...c] = a;

// console.log(a, b, c)

// let f = () => {
//   for (let i of [1,2,3]) {
//     try {
//       try {
//         break;
//       } finally {
//         console.log("Inner finally");
//       }
//     } finally {
//       console.log("Outer finally");
//     }
//   }
//   return;
// }

// f();

// for (let i of [1,2,3]) {
  
// }

// for (let i of iterable) {  
//   try {
//     try {
//       break;
//     } finally {
//       console.log("Inner finalizer");
//     }
//   } finally {
//     console.log("Outer finalizer");
//   }
// }

// function f() {
//   try {
//     for (let i of iterable) {
//       return;
//     }
//   } finally {
//     console.log("Finalizer");
//   }
// }

// f();

// const re = /\w+\s/g;
// const str = "fee fi fo fum";
// const myArray = str.match(re);
// console.log(myArray);

// let x = {
//   toString() { return "Pikachu"; }
// };
// let y = 2;
// let z = 3;
// let m = `${x}: one\n${y}: two\n${z}: three`

// console.log(m);


// let a = true;
// let b = -1;
// let log = console.log;

// log(!a);
// log(-b);
// log(+b);
// log(~0);
// log(void console.log("Hello"));
// log(typeof b);


// let a = 12;
// let b = 13;
// let log = console.log;
// log(a + b)
// log(a - b)
// log(a / b)
// log(a % b)
// log(a * b)
// log(a ** b)


// let a = 1
// let b = 2;
// let c = 3;
// let d = 4;
// let log = console.log;
// log(a & b);
// log(a & c);
// log(a | b);
// log(d >> a);
// log(d >>> a);
// log(a << b);
// log(b ^ c);
// log("0" == 0)
// log("0" === 0)

// log("0" != 0)
// log("0" !== 0)

// let a = {
//   foo: 12
// }

// let log = console.log;
// log("foo" in a)
// log("bar" in a)
// log(a instanceof Object)
// let s = "123";
// log(s instanceof String)

// let a = 1
// let b = 2;
// let log = console.log;
// log(b > a);
// log(a < b);
// log(a > a);
// log(b < b);
// log(a >= b);
// log(a <= b);

// let a = async () => {
//   return 10;
// }

// console.log(a());
// a().then(function f(res) { console.log(res); return; } );


// let a = async () => {
//   return 10 + await b();
// }

// let b = async () => {
//   return 20;
// }

// console.log(a());
// a().then(function f(res) { console.log(res); return; } );

// class A {
//   #foo = 12;
//   foo() {
//     console.log(#foo in this);
//     return;
//   }
//   bar() {
//     class B {
//       #foo = 1;
//     };
//     let o1 = new B();
//     console.log(#foo in o1);
//     return;
//   }
// }

// new A().foo();

// new A().bar();

// do {
//   console.log("Hello World");
// } while(false);

// let a = 11;
// switch(a) {
//   case 1: console.log("a");
//   case 11: console.log("b");
//   case 12: console.log("c");
//   default: console.log("Default");
// }

// for (let i of [1,2,3]) {
//   s : {
//     console.log(i);
//     continue;
//   }
// }

// import { hello } from  "./lib.mjs";

// console.log("Hello: ", hello);

// export default "Hello World";

// import pikachu from  "./test1.mjs";

// console.log(pikachu);


// import * as boo from "./lib.mjs";
// import {bye} from "./lib.mjs";

// console.log(boo.hello);
// console.log(bye);

// import {boo} from "./lib.mjs";
// import {bye} from "./lib1.mjs";
// console.log(boo.hello);
// console.log(bye);

// console.log("Hello");

// x = 212;

let a; 
a = 12;

// console.log(a);