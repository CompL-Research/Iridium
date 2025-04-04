// import "test.js";

// import a from "test.js";


// export * as boo from "";

// export default boo;

// import * as test from "./M1.js";
// console.log(test);


// function foo() {
//     let a = { foo: 100 };
//     if (this) {
//         this.foo = a;
//     } else {
//         foo.foo = foo;
//     }
//     return a;
// }

// foo()
// let x = foo.foo();
// x.foo = 12;
// console.log(x)


// let f = {
//   get x() { console.log("x called"); return 12; }
// }

// let comp = "x";

// let { [comp]: y, x: z } = f;

// console.log(y, z);


// const ff = function () {
//   this.x = 100
//   this.y = 111
//   return function foo () {
//     console.log(this.x, this.y);
//   }
// }



// let t = ff();
// t();

// const o = { x : 109 , t : t };
// o.t();

// let t1 = o.t
// t1();

// var boo = 12;
// let test = {
//   y: function() {
//     this.boo = 13;
//   }
// }
// test.y()
// let tt = test.y;
// tt()


// console.log(test)
// console.log(boo)

// console.log(test)

// f()

// function f() {
//   console.log(12);
// }

// let a = 12;
// const b = 13;
// var c = 14;

// let a = 1;
// {
//     let a = 12;
// }

if (true) {
  let a = 12;
} 
// else {
//   let b = 13;
// }