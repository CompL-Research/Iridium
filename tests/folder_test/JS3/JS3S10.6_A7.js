function f1() {
  return arguments;
}
{
  let i$1 = 1;
  var i = i$1;
  while (true) {
    let js3$3 = 5;
    let js3$2 = i < js3$3;
    if (js3$2) {
      break;
    }
    {
      {
        let ifTest$7 = 1;
        let ifTest$8 = 2;
        let ifTest$9 = 3;
        let ifTest$10 = 4;
        let ifTest$11 = 5;
        let ifTest$6 = f1(ifTest$7, ifTest$8, ifTest$9, ifTest$10, ifTest$11);
        let ifTest$5 = ifTest$6[i];
        let ifTest$13 = 1;
        let ifTest$12 = i + ifTest$13;
        let ifTest$4 = ifTest$5 !== ifTest$12;
        if (ifTest$4) {
          let ifTrue$20 = "#";
          let ifTrue$19 = ifTrue$20 + i;
          let ifTrue$21 = ": Returning function's arguments work wrong, f1(1,2,3,4,5)[";
          let ifTrue$18 = ifTrue$19 + ifTrue$21;
          let ifTrue$17 = ifTrue$18 + i;
          let ifTrue$22 = "] !== ";
          let ifTrue$16 = ifTrue$17 + ifTrue$22;
          let ifTrue$24 = 1;
          let ifTrue$23 = i + ifTrue$24;
          let ifTrue$15 = ifTrue$16 + ifTrue$23;
          let ifTrue$14 = new Test262Error(ifTrue$15);
          throw ifTrue$14;
        }
      }
    }
    let js3$25 = i++;
  }
}