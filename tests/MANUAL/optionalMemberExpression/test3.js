// CASE 1: Optional Member Expr

let a = { t: { f: function() { console.log(this.data) }, data: 101 } };

(a.t?.[[(console.log("side effect"), "f")]])()