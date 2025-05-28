// // let a;
// // var b;
// // const c = 1;
// // let d = 2;
// // const e = 3;

// // {
// //   let a;
// // }

// var a;
// var a;

// {
//   var a;
// }

// {
//   let a;
// }

// let a;

// function f() {
//   let x = a;
//   return a;
// }

// var a;

// var a;

// var a;

// function f() {
//   function g() {
//     return a + a;
//   }
// }

// var a = 12;
// var b = a;
// console.log(b);
// let a = 112;
// function f() {
//   function g() {
//     return console.log(a);
//   }
//   return g();
// }

// f();

// var a = 12;
// {
//   console.log(a);
// }

// let a;

// {
//   console.log(a);
//   let a;
// }

// let a = 12;

// if (a == 12) {
//   console.log("If Case");
// }

// let a = false;
// if (a) {
//   console.log("True Branch");
// } else {
//   console.log("False Branch");
// }

// let a = [1,2,3,4]


// f();

// function f() {
//   console.log("1");
//   return;
// }

// f = 21;
// let x = [f];

// let f = () => {
//   console.log(this);
//   return;
// }
// f();

// this.x = 12;


// x[0]()

// globalThis.x = 12;

// let a = {
//   x: 1232,
//   // ["x"]: 1221,
//   f() {
//     console.log(this.x);
//     return;
//   },
//   // c: () => {
//   //   console.log("Arrow Func")
//   // }
// }

// a.f();

// let a = {
//   get f() {
//     console.log("getter to f called");
//     return;
//   }
// }

// a.f;

// console.log(a.x)

// a.b();
// a.c();

// let a = {
//   x: 12,
//   a: function x() {
//     let res = () => {
//       console.log(this.x);
//       return;
//     }
//     return res;
//   }
// }

// a.a()();

// let a = new Map();
// a.set(1, "Hello World");
// console.log(a.get(1));

// class A {
//   ["x"] = 12
// }

// function f() {
//   return;
// }

// class A {
//   x = 11;
//   ["x"] = 12;
// };

// let x = new A();
// console.log(x.x);

// let x = 12, y = 13;
// {
//   function f() {
//     function g() {
//       console.log(x + y);
//       return;
//     }
//     g();
//     return;
//   }
//   f();
// }


// let a = {}
// a["x"] = 12;
// console.log(a.x)

// class A {
//   // x = 12
//   // constructor() {
//   //   this.x = 11;
//   // }
// }

// console.log(x);

// let a = new A();
// console.log(a.x);

// let log = console.log;
// log("Test");

// console.log("Hello World");

// class A {
  
// }

// let x = () => {
//   return 1;
// };

// {
//   let a = () => {
//     return 2;
//   }
//   let b = x;
// }

// let log = console.log;

// let x = () => {
//   log("From x");
//   return;
// };

// let y = () => {
//   log("From y");
// };

// log("Hello");

// x();

// log("World");
// y();

// class A {
//   x = 12
//   // constructor() {
//   //   this.x = 12;
//   // }
// }
// let res = new A();
// let fun = res.y;
// console.log(fun());

// let log = console.log;

// class B {
//   x = 13;
// }

class A extends Map {
  x = 12
  constructor() {
    super();
    // super();
    // this.x = 11;
  }
}

console.log(new A().x)

// console.log(new A().x);

// {
//   a = 1112;
//   let a = 12;
//   console.log(a);
// }