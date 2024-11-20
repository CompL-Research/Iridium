let a$2 = {
  f: function () {
    let a$3 = console.log((() => {
      let a$4 = this.boo;
      return a$4;
    })());
  },
  boo: 10
};
let a$1 = {
  t: a$2
};
let a = a$1;
let OPTE_RESULT$5 = undefined;
let OPTE_RESULT$6 = undefined;
let js3$7 = a.t;
let OPTE_C1$8 = js3$7 !== undefined;
let OPTE_NULL$9 = null;
let OPTE_C2$10 = js3$7 !== OPTE_NULL$9;
let OPTE_CFIN$11 = OPTE_C1$8 && OPTE_C2$10;
if (OPTE_CFIN$11) {
  OPTE_RESULT$6 = js3$7.f
}
let OPTCE_C1$12 = OPTE_RESULT$6 !== undefined;
let OPTCE_NULL$13 = null;
let OPTCE_C2$14 = OPTE_RESULT$6 !== OPTCE_NULL$13;
let OPTE_CFIN$15 = OPTCE_C1$12 && OPTCE_C2$14;
if (OPTE_CFIN$15) {
  OPTE_RESULT$5 = OPTE_RESULT$6.call(js3$7)
}
