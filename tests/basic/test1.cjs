let srcString = "x";

var x = 1;
var y = 1;
var evil = eval;

srcString += "+ y";
console.log(evil(srcString))
