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

const iterable = {
  
};

iterable[Symbol.iterator] = function() {
    return {
      next() {
        console.log("next called");
        return { value: 1, done: false };
      },
      return() {
        console.log("return called (cleanup)");
        return { done: true };
      }
    };
  }

function test() {
  for (const x of iterable) {
    console.log("inside loop:", x);
    throw new Error("abrupt exit"); // abrupt exit triggers iterator.return()
  }
}

try {
  test();
} catch (e) {
  console.log("caught:", e.message);
}

// for (let i of [1,2,3]) {
//   console.log(i);
// }