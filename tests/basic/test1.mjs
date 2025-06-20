let a = 0;
let b = 0;
loop1: while (a < 10) {
  console.log("Outer Loop");
  while (b < 10) {
    console.log("Inner Loop");
    b = b + 1;
    continue loop1;
  }
  a = a + 1;
}

