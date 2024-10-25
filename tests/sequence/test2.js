let o = { f: function() { console.log(this.boo); }, boo: 10 };

(1,o.f)()
