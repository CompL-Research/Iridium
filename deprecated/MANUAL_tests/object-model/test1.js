function Foo(x) {
  this.x = x;
  this.y = 432;
}
console.log("CP1") // Checkpoint here and see the structure of Foo

Foo.prototype.point = function() {
  return 'Foo(' + this.x + ', ' + this.y + ')';
}

console.log("CP2") // Checkpoint here and see the structure of Foo

var myfoo = new Foo(99);
console.log("CP3") // Checkpoint here and see the structure of myfoo

// console.log(myfoo.point()); // prints "Foo(99, 432)"
