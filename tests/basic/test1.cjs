// assert.sameValue = function (actual, expected, message) {
//   try {
//     if (assert._isSameValue(actual, expected)) {
//       return;
//     }
//   } catch (error) {
//     throw new Test262Error(message + ' (_isSameValue operation threw) ' + error);
//     return;
//   }

//   if (message === undefined) {
//     message = '';
//   } else {
//     message += ' ';
//   }

//   message += 'Expected SameValue(«' + assert._toString(actual) + '», «' + assert._toString(expected) + '») to be true';

//   throw new Test262Error(message);
// };


// const oldArguments = globalThis.arguments;
// const f = (arguments, p = eval("var arguments = 'param'"), q = () => arguments) => {}
// try {
//   f();
// } catch(e) {
//   console.log(e);
//   console.log("1", e.constructor === SyntaxError);
// }
// console.log("2", globalThis.arguments === oldArguments);


// function foo(xx) {
//   var xx = 12;
//   console.log(xx);
// }

// foo(13);

// var x;

// var x;

// var x;

// const x = 12;

// x = 13;

// console.log(x);

// var squidImageData = [8, 7, 21, 255, 42, 39, 79, 255, 74, 64];

var ilen, clen,
 seqs = [
  /agggtaaa|tttaccct/ig,
  /[cgt]gggtaaa|tttaccc[acg]/ig,
  /a[act]ggtaaa|tttacc[agt]t/ig,
  /ag[act]gtaaa|tttac[agt]ct/ig,
  /agg[act]taaa|ttta[agt]cct/ig,
  /aggg[acg]aaa|ttt[cgt]ccct/ig,
  /agggt[cgt]aa|tt[acg]accct/ig,
  /agggta[cgt]a|t[acg]taccct/ig,
  /agggtaa[cgt]|[acg]ttaccct/ig],
 subs = {
  B: '(c|g|t)', D: '(a|g|t)', H: '(a|c|t)', K: '(g|t)',
  M: '(a|c)', N: '(a|c|g|t)', R: '(a|g)', S: '(c|t)',
  V: '(a|c|g)', W: '(a|t)', Y: '(c|t)' }


for (i in seqs)
  console.log(seqs[i].source)
// ilen = dnaInput.length;

// // There is no in-place substitution
// dnaInput = dnaInput.replace(/>.*\n|\n/g,"")
// clen = dnaInput.length

// var dnaOutputString = "";

// for(i in seqs)
//     dnaOutputString += seqs[i].source + " " + (dnaInput.match(seqs[i]) || []).length + "\n";