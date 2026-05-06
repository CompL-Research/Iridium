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
  const ignoreName = args.includes("--ignore-name");

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
      stream: process.stdout
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
            await worker.saveArtifacts(t, baseline, iridium, "IGNO");
          } else if (
            iridium.message &&
            iridium.message.includes("IRI build failed")
          ) {
            passCount++;
            stats.ignored.push(t.file);
            await worker.saveArtifacts(t, baseline, iridium, "IGNO");
          } else if (!isBaselinePass && !isIridiumPass) {
            if (errorsMatch) {
              passCount++;
              stats.failBothEMatch.push(t.file);
              await worker.saveArtifacts(t, baseline, iridium, "FBOT");
            } else {
              failCount++;
              stats.failBothEMismatch.push(t.file);
              await worker.saveArtifacts(t, baseline, iridium, "EMIS");
            }
          } else if (isBaselinePass && !isIridiumPass) {
            failCount++;
            stats.regression.push(t.file);
            await worker.saveArtifacts(t, baseline, iridium, "REGR");
          } else if (!isBaselinePass && isIridiumPass) {
            passCount++;
            stats.overCompliant.push(t.file);
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
      })(test),
    );
  }

  await Promise.all(activeTasks);
  progressBar.stop();

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
        value.forEach((filePath) => {
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

main().catch(console.error);
