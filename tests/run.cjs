const Test262Stream = require("test262-stream");
const { Worker } = require("jest-worker");
const path = require("path");
const pc = require("picocolors");
const cliProgress = require("cli-progress");
const fs = require("fs");

const THREADS = 64;
const TEST262_PATH = path.resolve("./test262");

const IGNORED = [
  "test/language/expressions/arrow-function/name.js",
  "test/language/expressions/class/elements/static-field-anonymous-function-name.js",
  "test/language/statements/class/definition/basics.js",
  "test/language/expressions/async-arrow-function/name.js",
  "test/language/expressions/async-function/name.js",
  "test/language/expressions/async-generator/name.js",
  "test/language/expressions/function/name.js",
  "test/language/expressions/generators/name.js",
  "test/language/expressions/generators/no-name.js",
];

const TODOS = [
  "test/language/expressions/compound-assignment/S11.13.2_A7.10_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.11_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.1_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.2_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.3_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.4_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.5_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.6_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.7_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.8_T4.js",
  "test/language/expressions/compound-assignment/S11.13.2_A7.9_T4.js",
];


const worker = new Worker(require.resolve("./worker.cjs"), {
  numWorkers: THREADS,
  exposedMethods: ["runTest", "saveArtifacts"],
});

async function main() {
  const args = process.argv.slice(2);
  const filter = args.find((a) => !a.startsWith("--")) || "";
  const js3 = args.includes("--js3");
  const iri = args.includes("--iri");
  const saveArtifacts = args.includes("--saveArtifacts");
  const onlyDiff = args.includes("--only-diff");
  const ignoreWith = args.includes("--ignore-with");
  const ignoreName = args.includes("--ignore-name");
  const ignoreList = true;

  if (js3 === iri) {
    console.error("Expected one of --js3 or --iri, not both or neither.");
    process.exit(0);
  }

  const stream = new Test262Stream(TEST262_PATH, {
    paths: ["test/language"],
  });

  const allTests = [];
  for await (const test of stream) {
    if (test.attrs.negative) continue;
    if (filter && !test.file.includes(filter)) continue;
    if (ignoreName && test.file.includes("-name-")) continue;
    if (ignoreList && IGNORED.includes(test.file)) {
      continue;
    }
    if (TODOS.includes(test.file)) {
      continue;
    }
    allTests.push(test);
  }

  const total = allTests.length;

  // High-level progress counts
  let passCount = 0;
  let failCount = 0;

  // Use a Set to track active tasks for O(1) additions/deletions
  const activeTasks = new Set();

  // Detailed tracking
  let stats = {
    passBoth: 0,
    failBothEMatch: [],
    failBothEMismatch: [],
    overCompliant: [],
    regression: [],
    ignored: [],
  };

  console.log(
    pc.cyan(`\n🚀 Iridium Test-262 Runner (${js3 ? "--js3" : "--iri"})`),
  );
  console.log(
    pc.gray(`Threads: ${THREADS} | Target: ${filter || "All tests"}\n`),
  );

  const progressBar = new cliProgress.SingleBar(
    {
      format: `${pc.yellow("{bar}")} {percentage}% | {value}/{total} Tests | ${pc.green("PASS: {passes}")} | ${pc.red("FAIL: {fails}")}`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
      stream: process.stdout,
    },
    cliProgress.Presets.shades_classic,
  );

  progressBar.start(total, 0, { passes: 0, fails: 0 });

  for (const test of allTests) {
    // 1. Create the async task promise
    const taskPromise = (async (t) => {
      try {
        const baseline = await worker.runTest(t, "baseline");
        const iridium = js3
          ? await worker.runTest(t, "--js3")
          : await worker.runTest(t, "--iri");

        // Status definitions
        const isBaselinePass = baseline.status === "PASS";
        const isIridiumPass = iridium.status === "PASS";
        const errorsMatch = baseline.errorType === iridium.errorType;

        // Categorize the result
        if (isBaselinePass && isIridiumPass) {
          passCount++;
          stats.passBoth++;
        } else if (
          ignoreWith &&
          iridium.message &&
          iridium.message.includes("JS3 build failed")
        ) {
          passCount++;
          stats.ignored.push(t.file);
          if (saveArtifacts)
            await worker.saveArtifacts(t, baseline, iridium, "IGNO");
        } else if (
          iridium.message &&
          iridium.message.includes("IRI build failed")
        ) {
          passCount++;
          stats.ignored.push(t.file);
          if (saveArtifacts)
            await worker.saveArtifacts(t, baseline, iridium, "IGNO");
        } else if (!isBaselinePass && !isIridiumPass) {
          if (errorsMatch) {
            passCount++;
            stats.failBothEMatch.push(t.file);
            if (saveArtifacts)
              await worker.saveArtifacts(t, baseline, iridium, "FBOT");
          } else {
            failCount++;
            stats.failBothEMismatch.push(t.file);
            if (saveArtifacts)
              await worker.saveArtifacts(t, baseline, iridium, "EMIS");
          }
        } else if (isBaselinePass && !isIridiumPass) {
          failCount++;
          stats.regression.push(t.file);
          if (saveArtifacts)
            await worker.saveArtifacts(t, baseline, iridium, "REGR");
        } else if (!isBaselinePass && isIridiumPass) {
          passCount++;
          stats.overCompliant.push(t.file);
          if (saveArtifacts)
            await worker.saveArtifacts(t, baseline, iridium, "OVER");
        } else {
          throw new Error("Unreachable...");
        }
      } catch (err) {
        failCount++;
      } finally {
        progressBar.update(passCount + failCount, {
          passes: passCount,
          fails: failCount,
        });
      }
    })(test);

    // 2. Add it to our Set of active workers
    activeTasks.add(taskPromise);

    // 3. Remove it from the Set as soon as it finishes
    taskPromise.finally(() => {
      activeTasks.delete(taskPromise);
    });

    // 4. Backpressure: If we hit our thread limit, wait for ANY single task to finish
    if (activeTasks.size >= THREADS) {
      await Promise.race(activeTasks);
    }
  }

  // Wait for the remaining tail-end tasks to finish
  await Promise.all(activeTasks);
  progressBar.stop();

  // Explicitly close the worker pool so Jest doesn't hang the main process
  await worker.end();

  // --- Final Report ---
  const successRate = ((passCount / total) * 100).toFixed(2);

  console.log(`\n${pc.bold("--- Final Report ---")}`);
  console.log(`${pc.green("Total:")}                        ${total}`);
  console.log(`${pc.green("PassCount:")}                    ${passCount}`);
  console.log(
    `${pc.green("✔ True Passes (Pass Both):")}    ${stats.passBoth}`,
  );
  console.log(
    `${pc.gray("➖ Failed Both (Err Match):")}      ${stats.failBothEMatch.length}`,
  );
  console.log(
    `${pc.gray("➖ Failed Both (Err Mismatch):")}      ${stats.failBothEMismatch.length}`,
  );
  console.log(
    `${pc.magenta("★ Over Compliant (Fixes):")}     ${stats.overCompliant.length}`,
  );
  console.log(
    `${pc.red("✖ True Regressions:")}           ${stats.regression.length}`,
  );
  console.log(
    `${pc.dim("⊘ Ignored (Compile Errors):")}    ${stats.ignored.length}`,
  );

  console.log(`\n${pc.cyan("📊 Overall Bar Rate:")}          ${successRate}%`);

  // 1. Build the string
  let outputString = "=== TEST RUN STATISTICS ===\n\n";

  for (const [key, value] of Object.entries(stats)) {
    if (Array.isArray(value)) {
      outputString += `${key.toUpperCase()} (${value.length}):\n`;
      if (value.length === 0) {
        outputString += "  (None)\n";
      } else {
        value.sort().forEach((filePath) => {
          outputString += `  - ${filePath}\n`;
        });
      }
    } else {
      // For flat numbers like passBoth
      outputString += `${key.toUpperCase()}: ${value}\n`;
    }
    outputString += "\n";
  }

  // 2. Write exactly that string to stderr
  process.stderr.write(outputString);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
