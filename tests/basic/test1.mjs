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

loop1: while(true) {
  for (let i in [1,2,3,4]) {
    console.log(i);
    if (i === 3) break loop1;
  }
}

