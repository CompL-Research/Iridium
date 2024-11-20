let a$1 = {
  val: 101,
  get b() {
    let returnStmt$2 = this.toString();
    return returnStmt$2;
  },
  toString: () => {
    let a$3 = "HI FROM TOSTRING";
    return a$3;
  }
};
let a = a$1;
let js3$4 = console.log((() => {
  let js3$6 = a.b;
  let js3$5 = `${js3$6}`;
  return js3$5;
})());
