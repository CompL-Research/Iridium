"use strict";
// 
// Inspired by babel-262 runner: https://github.com/babel/babel-test262-runner
// 
const Test262Stream = require("test262-stream");
const tap = require("make-tap-output")({ count: true });
const { Worker: JestWorker } = require("jest-worker");

const UNSUPPORTED_FEATURES = ["import-attributes", "decorators"]
const EXCLUDE_ESID_PREFIXES = ["pending", "proposal", "legacy"];

const TEST262_PATH      = "/Users/meeteshmehta/dev/Iridium/tests/test262";

const THREADS = Number(process.env.THREADS) || require("os").cpus().length / 2;
// const THREADS = 128;

const worker = new JestWorker(require.resolve("./workerNew.cjs"), {
  numWorkers: THREADS,
  exposedMethods: ["runBaseline", "runIridium"],
  // enableWorkerThreads: true,
  // setupArgs: [{ hostPath: EXEC, shortName: "$262", testRoot: TESTS }],
});
worker.getStdout().pipe(process.stdout);
worker.getStderr().pipe(process.stderr);

tap.pipe(process.stdout);


async function main() {
  const filter = process.argv[2];
  if (!filter) {
    throw new Error(
      "If you really want to run all the tests, use\n\tnode run.cjs I_AM_SURE"
    );
  }

  const tests = new Test262Stream(TEST262_PATH, {
    paths: ["test/language", "test/harness"],
  }).once("error", () => {
    process.exitCode = 1;
  });

  tap.diag(`Using ${THREADS} threads.`);

  const baseline = {
    storeFail: 0,
    execFail: 0,
    success: 0
  };

  const iridium = {
    storeFail: 0,
    execFail: 0,
    success: 0
  };

  let PASS = 0;
  let FAIL = 0;

  const tasks = [];
  
  for await (const test of tests) {
    const file = `${test.file} ${test.scenario}`;

    if (filter !== "I_AM_SURE" && !test.file.includes(filter)) continue;

    // if (chunk && !chunk.has(test.file)) continue;
    const baseExpectedRes = getExpected(test)
    if (baseExpectedRes !== "success") continue;
    
    // If there are attributes that we do not plan to support right now, we will skip those tests as-well
    let toSkip = false
    let features = test.attrs.features ?? []
    for (const tf of features) {
      if (UNSUPPORTED_FEATURES.includes(tf)) {
        // console.log("Skipping test with feature")
        toSkip = true
      }
    }
    // Skip tests that are not yet part of the official ECMA spec
    if (isNonStandardTest(test)) toSkip = true;
    if (toSkip) continue

    tasks.push(
      (async test => {

        // If expected result is negative
        const baselineRes = await worker.runBaseline(test);
        const iridiumRes  = await worker.runIridium(test);

        if (baselineRes.result === "store-fail") {
          baseline.storeFail++;
        } else if (baselineRes.result === "exec-fail") {
          baseline.execFail++;
        } else {
          baseline.success++;
        }

        if (iridiumRes.result === "store-fail") {
          iridium.storeFail++;
        } else if (iridiumRes.result === "exec-fail") {
          iridium.execFail++;
        } else {
          iridium.success++;
        }


        if (baselineRes.result === iridiumRes.result) {
          PASS++;
          tap.pass(file, `(${iridiumRes.result})`);
        } else {
          FAIL++;
          tap.fail(
            file,
            `(expected ${baselineRes.result}, got ${iridiumRes.result})`,
            iridiumRes.error
              ? new RethrownError(iridiumRes.error)
              : new Error("[no error]")
          );
        }
      })(test)
    );
  }

  await Promise.all(tasks);

  tap.diag("\n\n");
  tap.diag(`Baseline: { storeFail: ${baseline.storeFail}, execFail: ${baseline.execFail}, success: ${baseline.success} }`);
  tap.diag(`Iridium:  { storeFail: ${iridium.storeFail}, execFail: ${iridium.execFail}, success: ${iridium.success} }`);
  tap.diag(`Success: ${(1 - ((baseline.success - iridium.success)/baseline.success))*100}%.`);
  tap.diag(`PASS: ${PASS}, FAIL: ${FAIL}.`);
  process.exit(0);
}
main().catch(error => {
  process.exitCode = 1;
  throw error;
});

function getExpected({ attrs }) {
  if (attrs.negative) {
    const { phase } = attrs.negative;
    if (phase === "early" || phase === "parse") {
      return "parser error";
    } else {
      return "runtime error";
    }
  } else {
    return "success";
  }
}

// 
// Helpers
// 

function isNonStandardTest(test) {
  const esid = test.attrs.esid;
  return esid && EXCLUDE_ESID_PREFIXES.some(prefix => esid.startsWith(prefix));
}

class ExtendedError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class RethrownError extends ExtendedError {
  constructor(error) {
    if (!error) {
      throw new Error("RethrownError requires an error with a message");
    }
    super(error.message || "[no message]");

    this.name = error.name;
    this.original = error;
    this.new_stack = this.stack;
    const errorStackString =
      error.stack &&
      (typeof error.stack === "string"
        ? error.stack
        : error.stack.map(location => location.source).join("\n"));
    let message_lines = (this.message.match(/\n/g) || []).length + 1;
    this.stack = `${this.name}: ${this.message}\n${this.stack
      .split("\n")
      .slice(0, message_lines + 1)
      .join("\n")}\n${errorStackString}`;
  }
}
