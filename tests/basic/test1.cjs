// var a = 12;
// delete a;

// console.log(a);

var calls = 0;
var usurper = {};
[1].forEach(value => {
  calls++;
  console.log(this, usurper);
}, usurper);

console.log(calls, 1);
