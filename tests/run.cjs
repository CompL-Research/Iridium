"use strict";
// 
// Inspired by babel-262 runner: https://github.com/babel/babel-test262-runner
// 
const path = require("path");
const fs = require("fs");
const Test262Stream = require("test262-stream");
const IRIAgent = require("./iri-agent.cjs");
const { execSync } = require('child_process');

// const tap = require("make-tap-output")({ count: true });
// const { Worker: JestWorker } = require("jest-worker");

// const relative = file => path.resolve(process.cwd(), file);

const EXEC = "/home/meetesh/wd/quickjs/build/qjs"
const EXECIRI = "./iridium iri -t /home/meetesh/wd/Iridium/tests/test262"
const TESTS = path.resolve('./test262');

const { transpile, transpileJS3 } = require("./transpile.cjs");


// const UNSUPPORTED_FEATURES = ["import-attributes", "decorators"]
// const EXCLUDE_ESID_PREFIXES = ["pending", "proposal", "legacy"];

// // Function to determine if the test belongs to an in-progress proposal
// function isNonStandardTest(test) {
//   const esid = test.attrs.esid;
//   return esid && EXCLUDE_ESID_PREFIXES.some(prefix => esid.startsWith(prefix));
// }




// const THREADS = 64
// const THREADS = Number(process.env.THREADS) || require("os").cpus().length / 2;
// const { CHUNK, CHUNKS_FILE } = process.env;

// const chunk = CHUNKS_FILE ? new Set(require(relative(CHUNKS_FILE))[CHUNK]) : undefined;

// const worker = new JestWorker(require.resolve("./worker.cjs"), {
//   numWorkers: THREADS,
//   exposedMethods: ["runTest", "getBaseline"],
//   // enableWorkerThreads: true,
//   setupArgs: [{ hostPath: EXEC, shortName: "$262", testRoot: TESTS }],
// });
// worker.getStdout().pipe(process.stdout);
// worker.getStderr().pipe(process.stderr);

// tap.pipe(process.stdout);

const agent = new IRIAgent({ hostPath: EXEC, shortName: "$262", testRoot: TESTS });
const testRoot = TESTS;
const TEST_TIMEOUT = 60 * 1000; // 1 minute
function timeout(file, waitMs = TEST_TIMEOUT) {
  return new Promise((_resolve, reject) =>
    setTimeout(
      () => reject(new Error(`test ${file} timed out after ${waitMs} ms`)),
      waitMs
    )
  );
}

let storeBaselineTest = (test) => {
  let { attrs, contents, file, scenario } = test;
  const baseName = file.replace(/\//g, '_');
  const isModule = attrs.flags.module;
  const isStrict = scenario === "strict mode";
  const UID = Math.random().toString(36).substring(2, 15);
  const fPath = `./tmp/${baseName}_baseline_${UID}.js`;

  try {
    if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(contents)) {
      contents = `"use strict";\nundefined;\n${contents}`;
    }
    fs.writeFileSync(fPath, contents);
  } catch (error) {
    return { result: "Failed to get baseline test", error };
  }

  return { result: fPath, error: false }
}

let storeIridiumTest = (test) => {
  let { attrs, contents, file, scenario } = test;
  const baseName = file.replace(/\//g, '_');
  const isModule = attrs.flags.module;
  const isStrict = scenario === "strict mode";
  const UID = Math.random().toString(36).substring(2, 15);
  const fPath = path.resolve(`./tmp/${baseName}_baseline_${UID}.js`);
  const fPathIri = path.resolve(`./tmp/${baseName}_baseline_${UID}.json`);

  try {
    if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(contents)) {
      contents = `"use strict";\nundefined;\n${contents}`;
    }
    fs.writeFileSync(fPath, contents);
    execSync(`${EXECIRI} ${fPath} > ${fPathIri}`, { cwd: '/home/meetesh/wd/Iridium', encoding: 'utf-8', stdio: 'pipe' });

  } catch (error) {
    return { result: "Failed to save iridium test", error };
  }

  return { result: fPathIri, error: false }
}

async function main() {
  const filter = process.argv[2];
  if (!filter) {
    throw new Error(
      "If you really want to run all the tests, use\n\tnode run.cjs I_AM_SURE"
    );
  }

  const tests = new Test262Stream(TESTS, {
    paths: ["test/language", "test/harness"],
  }).once("error", () => {
    process.exitCode = 1;
  });

  // tap.diag(`Using ${THREADS} threads.`);

  let passed = 0;
  let run = 0;
  let total = 0;

  const tasks = [];
  

  for await (const test of tests) {
    total++;
    const file = `${test.file} ${test.scenario}`;
    const isModule = test.attrs.flags.module;

    if (filter !== "I_AM_SURE" && !test.file.includes(filter)) continue;
    console.log(`Running: ${file}`);

    let baselineTestPath, iriTestPath, error;
    
    // ({result: baselineTestPath, error} = storeBaselineTest(test));
    // if (error) {
    //   console.error(`[Baseline Store failed]`, error);
    //   continue;
    // }

    // try {
    //   execSync(`${EXEC} ${isModule ? '-m' : '-C'} ${baselineTestPath}`, { encoding: 'utf-8', stdio: 'pipe' });
    //   console.log("Baseline Test Passed");
    // } catch (err) {
    //   console.error('Error:', err.message);
    // }

    ({result: iriTestPath, error} = storeIridiumTest(test));

    if (error) {
      console.error(`[Iridium Store failed]`, error);
      continue;
    }

    try {
      execSync(`${EXEC} -X ${iriTestPath}`, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (err) {
      console.error('Error:', err.message);
    }


    // let { attrs, contents, file } = test;
    // console.log(test.scenario)
    // const isModule = attrs.flags.module;

    // let result = await Promise.race([
    //   agent.evalScript({
    //     attrs,
    //     contents,
    //     file: path.join(testRoot, file),
    //   }, { module: isModule ? isModule : undefined }),
    //   timeout(file),
    // ]);

    // console.log(result);
    // break;

    // if (chunk && !chunk.has(test.file)) continue;
    // const baseExpectedRes = getExpected(test)
    // if (baseExpectedRes !== "success") continue;
    
    // // To run an individual test file (will usually be run in two modes, default and strict)
    // // if (!test.file.includes("test/language/expressions/await/await-monkey-patched-promise.js")) continue;
    
    // // If there are attributes that we do not plan to support right now, we will skip those tests as-well
    // let toSkip = false
    // let features = test.attrs.features ?? []
    // for (const tf of features) {
    //   if (UNSUPPORTED_FEATURES.includes(tf)) {
    //     // console.log("Skipping test with feature")
    //     toSkip = true
    //   }
    // }
    // // Skip tests that are not yet part of the official ECMA spec
    // if (isNonStandardTest(test)) toSkip = true;
    // if (toSkip) continue

    // run++;
    // tasks.push(
    //   (async test => {

    //     // If expected result is negative
    //     const baselineRes = await worker.getBaseline(test);
    //     const expected = baselineRes.result
    //     const actual = await worker.runTest(test);

    //     if (actual.result === expected) {
    //       passed++;
    //       tap.pass(file, `(${expected})`);
    //     } else {
    //       tap.fail(
    //         file,
    //         `(expected ${expected}, got ${actual.result})`,
    //         actual.error
    //           ? new RethrownError(actual.error)
    //           : new Error("[no error]")
    //       );
    //     }
    //   })(test)
    // );
  }

  await Promise.all(tasks);

  // tap.diag("\n\n");
  // tap.diag(`Run ${run} out of ${total} tests.`);
  // tap.diag(`Passed ${passed} out of ${run} tests.`);
  // // Creating promises based timeouts per test prevents node from exiting
  // // causing an unparseable failure in CircleCI. Here we're forcing an exit
  // // with an exit code 0. tap-mocha-reporter will parse the tap output
  // // and output the correct exit code.
  process.exit(0);
}
main().catch(error => {
  process.exitCode = 1;
  throw error;
});

// function getExpected({ attrs }) {
//   if (attrs.negative) {
//     const { phase } = attrs.negative;
//     if (phase === "early" || phase === "parse") {
//       return "parser error";
//     } else {
//       return "runtime error";
//     }
//   } else {
//     return "success";
//   }
// }

// class ExtendedError extends Error {
//   constructor(message) {
//     super(message);
//     this.name = this.constructor.name;
//     this.message = message;
//     if (typeof Error.captureStackTrace === "function") {
//       Error.captureStackTrace(this, this.constructor);
//     } else {
//       this.stack = new Error(message).stack;
//     }
//   }
// }

// class RethrownError extends ExtendedError {
//   constructor(error) {
//     if (!error) {
//       throw new Error("RethrownError requires an error with a message");
//     }
//     super(error.message || "[no message]");

//     this.name = error.name;
//     this.original = error;
//     this.new_stack = this.stack;
//     const errorStackString =
//       error.stack &&
//       (typeof error.stack === "string"
//         ? error.stack
//         : error.stack.map(location => location.source).join("\n"));
//     let message_lines = (this.message.match(/\n/g) || []).length + 1;
//     this.stack = `${this.name}: ${this.message}\n${this.stack
//       .split("\n")
//       .slice(0, message_lines + 1)
//       .join("\n")}\n${errorStackString}`;
//   }
// }
