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

let a = {
  get f() {
    console.log("getter to f called");
    return;
  }
}

a.f;

// console.log(a.x)

// a.b();
// a.c();