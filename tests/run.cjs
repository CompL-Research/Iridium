// const Test262Stream = require("test262-stream");
// const { Worker } = require("jest-worker");
// const path = require("path");
// const pc = require("picocolors");
// const cliProgress = require("cli-progress");

// const THREADS = 64;
// const TEST262_PATH = path.resolve("./test262");

// const worker = new Worker(require.resolve("./worker.cjs"), {
//   numWorkers: THREADS,
//   exposedMethods: ["runTest", "saveArtifacts"],
// });

// async function main() {
//   const args = process.argv.slice(2);
//   const filter = args.find((a) => !a.startsWith("--")) || "";
//   const js3 = args.includes("--js3");
//   const iri = args.includes("--iri");
//   const onlyDiff = args.includes("--only-diff");
//   const ignoreWith = args.includes("--ignore-with");

//   if (js3 === iri) {
//     console.error("Expected one of --3js or --iri, not both or neither.")
//     process.exit(0);
//   }

//   const stream = new Test262Stream(TEST262_PATH, {
//     paths: ["test/language"],
//   });

//   // 1. Pre-scan or estimate tests (Streaming doesn't give total count easily)
//   // For a cleaner UI, we collect tests first. With 128 cores, memory is rarely the issue.
//   const allTests = [];
//   // for await (const test of stream) {
//   //   if (filter && !test.file.includes(filter)) continue;
//   //   allTests.push(test);
//   // }
//   for await (const test of stream) {
//     // 1. Skip Negative Tests (Parser/Early Error tests)
//     if (test.attrs.negative) {
//       continue;
//     }

//     // 2. Your existing filters
//     if (filter && !test.file.includes(filter)) continue;

//     allTests.push(test);
//   }

//   const total = allTests.length;
//   let passCount = 0;
//   let failCount = 0;
//   let activeTasks = [];

//   console.log(pc.cyan(`\n🚀 Iridium Test-262 Runner`));
//   console.log(
//     pc.gray(`Threads: ${THREADS} | Target: ${filter || "All tests"}\n`),
//   );

//   const progressBar = new cliProgress.SingleBar(
//     {
//       format: `${pc.yellow("{bar}")} {percentage}% | {value}/{total} Tests | ${pc.green("PASS: {passes}")} | ${pc.red("FAIL: {fails}")}`,
//       barCompleteChar: "\u2588",
//       barIncompleteChar: "\u2591",
//       hideCursor: true,
//     },
//     cliProgress.Presets.shades_classic,
//   );

//   progressBar.start(total, 0, { passes: 0, fails: 0 });

//   for (const test of allTests) {
//     // Throttling to prevent worker saturation
//     if (activeTasks.length >= THREADS * 2) {
//       await Promise.all(activeTasks);
//       activeTasks = [];
//     }

//     activeTasks.push(
//       (async (t) => {
//         try {
//           const baseline = await worker.runTest(t, "baseline");
//           const iridium = await worker.runTest(t, "iridium");

//           const match =
//             baseline.status === iridium.status &&
//             baseline.errorType === iridium.errorType;

//           if (match) {
//             passCount++;
//             if (baseline.status === "FAIL") {
//               console.log("FAIL ON BASELINE: ", t.file);
//             }
//           } else {
//             const isWithFailure = iridium.message.includes(
//               "unhandled Statement->WithStatement",
//             );
//             const isTrueRegression =
//               baseline.status === "PASS" && iridium.status === "FAIL";

//             // Logic for saving artifacts
//             let shouldSave = true;
//             if (onlyDiff && !isTrueRegression) shouldSave = false;
//             if (ignoreWith && isWithFailure) shouldSave = false;

//             if (shouldSave) {
//               failCount++;
//               await worker.saveArtifacts(t, baseline, iridium);
//             } else {
//               // If we ignored it, we count it as a "Pass" in the progress bar
//               // to keep the success rate focused on "fixable" bugs
//               passCount++;
//               // console.log("FAIL ON BASELINE: ", t.file);
//             }

//             // failCount++;
//             // await worker.saveArtifacts(t, baseline, iridium);
//           }
//         } catch (err) {
//           failCount++;
//         } finally {
//           progressBar.update(passCount + failCount, {
//             passes: passCount,
//             fails: failCount,
//           });
//         }
//       })(test),
//     );
//   }

//   await Promise.all(activeTasks);
//   progressBar.stop();

//   // --- Final Report ---
//   const successRate = ((passCount / total) * 100).toFixed(2);

//   console.log(`\n${pc.bold("--- Final Report ---")}`);
//   console.log(`${pc.green("✔ Passed:")}  ${passCount}`);
//   console.log(`${pc.red("✖ Failed:")}  ${failCount}`);
//   console.log(`${pc.cyan("📊 Rate:")}    ${successRate}%`);

//   if (failCount > 0) {
//     console.log(`\n${pc.yellow("⚠ Artifacts saved to:")} ./failing_tests/`);
//   }

//   process.exit(0);
// }

// main().catch(console.error);

const Test262Stream = require("test262-stream");
const { Worker } = require("jest-worker");
const path = require("path");
const pc = require("picocolors");
const cliProgress = require("cli-progress");
const fs = require("fs"); // Added for writing list outputs

const THREADS = 64;
const TEST262_PATH = path.resolve("./test262");

const worker = new Worker(require.resolve("./worker.cjs"), {
  numWorkers: THREADS,
  exposedMethods: ["runTest", "saveArtifacts"],
});

async function main() {
  const args = process.argv.slice(2);
  const filter = args.find((a) => !a.startsWith("--")) || "";
  const js3 = args.includes("--js3");
  const iri = args.includes("--iri");
  const onlyDiff = args.includes("--only-diff");
  const ignoreWith = args.includes("--ignore-with");

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
    allTests.push(test);
  }

  const total = allTests.length;

  // High-level progress counts
  let passCount = 0;
  let failCount = 0;
  let activeTasks = [];

  // Detailed tracking
  let stats = {
    passBoth: 0,
    failBoth: 0,
    overCompliant: 0,
    regression: 0,
    mismatch: 0, // Failed both but with different error types
    ignored: 0,
  };

  const failBothFiles = [];
  const overCompliantFiles = [];

  console.log(pc.cyan(`\n🚀 Iridium Test-262 Runner (${js3 ? "--js3" : "--iri"})`));
  console.log(
    pc.gray(`Threads: ${THREADS} | Target: ${filter || "All tests"}\n`),
  );

  const progressBar = new cliProgress.SingleBar(
    {
      format: `${pc.yellow("{bar}")} {percentage}% | {value}/{total} Tests | ${pc.green("PASS: {passes}")} | ${pc.red("FAIL: {fails}")}`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  );

  progressBar.start(total, 0, { passes: 0, fails: 0 });

  for (const test of allTests) {
    if (activeTasks.length >= THREADS * 2) {
      await Promise.all(activeTasks);
      activeTasks = [];
    }

    activeTasks.push(
      (async (t) => {
        try {
          const baseline = await worker.runTest(t, "baseline");
          const iridium = js3 ? await worker.runTest(t, "--js3") :  await worker.runTest(t, "--iri");

          // Status definitions
          const isBaselinePass = baseline.status === "PASS";
          const isIridiumPass = iridium.status === "PASS";
          const errorsMatch = baseline.errorType === iridium.errorType;

          // Categorize the result
          if (isBaselinePass && isIridiumPass) {
            passCount++;
            stats.passBoth++;
          } else if (!isBaselinePass && !isIridiumPass && errorsMatch) {
            passCount++; // Counted as progress bar 'pass' because there's no diff
            stats.failBoth++;
            failBothFiles.push(t.file);
            await worker.saveArtifacts(t, baseline, iridium);
          } else {
            // Mismatch block (Regressions, Over-compliance, Diff errors)
            const isWithFailure = iridium.message && iridium.message.includes("unhandled Statement->WithStatement");
            const isTrueRegression = isBaselinePass && !isIridiumPass;
            const isOverCompliant = !isBaselinePass && isIridiumPass;

            if (isOverCompliant) {
              stats.overCompliant++;
              overCompliantFiles.push(t.file);
            } else if (isTrueRegression) {
              stats.regression++;
            } else {
              stats.mismatch++;
            }

            // Artifact saving logic
            let shouldSave = true;
            if (onlyDiff && !isTrueRegression && !isOverCompliant) shouldSave = false;
            if (ignoreWith && isWithFailure) shouldSave = false;

            if (shouldSave) {
              failCount++;
              await worker.saveArtifacts(t, baseline, iridium);
            } else {
              passCount++;
              stats.ignored++;
            }
          }
        } catch (err) {
          failCount++;
        } finally {
          progressBar.update(passCount + failCount, {
            passes: passCount,
            fails: failCount,
          });
        }
      })(test),
    );
  }

  await Promise.all(activeTasks);
  progressBar.stop();

  // Write the tracking arrays to files
  if (failBothFiles.length > 0) {
    fs.writeFileSync(path.resolve("./fail_both.txt"), failBothFiles.join("\n"));
  }
  if (overCompliantFiles.length > 0) {
    fs.writeFileSync(path.resolve("./over_compliant.txt"), overCompliantFiles.join("\n"));
  }

  // --- Final Report ---
  const successRate = ((passCount / total) * 100).toFixed(2);

  console.log(`\n${pc.bold("--- Final Report ---")}`);
  console.log(`${pc.green("✔ True Passes (Pass Both):")}    ${stats.passBoth}`);
  console.log(`${pc.gray("➖ Failed Both (No Diff):")}      ${stats.failBoth}`);
  console.log(`${pc.magenta("★ Over Compliant (Fixes):")}     ${stats.overCompliant}`);
  console.log(`${pc.red("✖ True Regressions:")}           ${stats.regression}`);
  console.log(`${pc.yellow("⚠ Other Mismatches:")}           ${stats.mismatch}`);
  if (stats.ignored > 0) {
    console.log(`${pc.dim("⊘ Ignored (--ignore-with):")}    ${stats.ignored}`);
  }

  console.log(`\n${pc.cyan("📊 Overall Bar Rate:")}          ${successRate}%`);

  if (failCount > 0) {
    console.log(`\n${pc.yellow("⚠ Diff Artifacts saved to:")} ./failing_tests/`);
  }

  if (failBothFiles.length > 0 || overCompliantFiles.length > 0) {
    console.log(`${pc.yellow("📄 Lists generated:")}`);
    if (failBothFiles.length > 0) console.log(`   - ./fail_both.txt`);
    if (overCompliantFiles.length > 0) console.log(`   - ./over_compliant.txt`);
  }

  process.exit(0);
}

main().catch(console.error);
