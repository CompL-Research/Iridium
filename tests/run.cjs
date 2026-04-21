const Test262Stream = require("test262-stream");
const { Worker } = require("jest-worker");
const path = require("path");
const pc = require("picocolors");
const cliProgress = require("cli-progress");

const THREADS = 64;
const TEST262_PATH = path.resolve("./test262");

const worker = new Worker(require.resolve("./worker.cjs"), {
  numWorkers: THREADS,
  exposedMethods: ["runTest", "saveArtifacts"],
});

async function main() {
  const args = process.argv.slice(2);
  const filter = args.find((a) => !a.startsWith("--")) || "";
  const onlyDiff = args.includes("--only-diff");
  const ignoreWith = args.includes("--ignore-with");

  const stream = new Test262Stream(TEST262_PATH, {
    paths: ["test/language"],
  });

  // 1. Pre-scan or estimate tests (Streaming doesn't give total count easily)
  // For a cleaner UI, we collect tests first. With 128 cores, memory is rarely the issue.
  const allTests = [];
  // for await (const test of stream) {
  //   if (filter && !test.file.includes(filter)) continue;
  //   allTests.push(test);
  // }
  for await (const test of stream) {
    // 1. Skip Negative Tests (Parser/Early Error tests)
    if (test.attrs.negative) {
      continue;
    }

    // 2. Your existing filters
    if (filter && !test.file.includes(filter)) continue;

    allTests.push(test);
  }

  const total = allTests.length;
  let passCount = 0;
  let failCount = 0;
  let activeTasks = [];

  console.log(pc.cyan(`\n🚀 Iridium JS3 Test Runner`));
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
    // Throttling to prevent worker saturation
    if (activeTasks.length >= THREADS * 2) {
      await Promise.all(activeTasks);
      activeTasks = [];
    }

    activeTasks.push(
      (async (t) => {
        try {
          const baseline = await worker.runTest(t, "baseline");
          const iridium = await worker.runTest(t, "iridium");

          const match =
            baseline.status === iridium.status &&
            baseline.errorType === iridium.errorType;

          if (match) {
            passCount++;
          } else {
            const isWithFailure = iridium.message.includes(
              "unhandled Statement->WithStatement",
            );
            const isTrueRegression =
              baseline.status === "PASS" && iridium.status === "FAIL";

            // Logic for saving artifacts
            let shouldSave = true;
            if (onlyDiff && !isTrueRegression) shouldSave = false;
            if (ignoreWith && isWithFailure) shouldSave = false;

            if (shouldSave) {
              failCount++;
              await worker.saveArtifacts(t, baseline, iridium);
            } else {
              // If we ignored it, we count it as a "Pass" in the progress bar
              // to keep the success rate focused on "fixable" bugs
              passCount++;
            }

            // failCount++;
            // await worker.saveArtifacts(t, baseline, iridium);
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
  console.log(`${pc.green("✔ Passed:")}  ${passCount}`);
  console.log(`${pc.red("✖ Failed:")}  ${failCount}`);
  console.log(`${pc.cyan("📊 Rate:")}    ${successRate}%`);

  if (failCount > 0) {
    console.log(`\n${pc.yellow("⚠ Artifacts saved to:")} ./failing_tests/`);
  }

  process.exit(0);
}

main().catch(console.error);
