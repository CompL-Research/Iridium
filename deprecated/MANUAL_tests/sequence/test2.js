let o = { f: function() { console.log(this === undefined); }, boo: 10 };

(1,o.f)()
