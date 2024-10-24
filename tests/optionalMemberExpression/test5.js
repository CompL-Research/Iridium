// let a = { t: { f: function() { console.log(this.data) }, data: 101 } };

// a.t?.[[(console.log("side effect"), "f")]](a.t);

let a = { t: { f: function() { console.log(this.boo) }, boo: 10 } }

a.t?.f?.()