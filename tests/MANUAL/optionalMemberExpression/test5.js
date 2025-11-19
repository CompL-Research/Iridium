let a = { t: { f: function() { console.log(this.boo) }, boo: 10 } }
a.t?.f?.()