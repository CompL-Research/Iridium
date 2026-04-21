const fs = require("fs");
const path = require("path");
const pc = require("picocolors"); // Optional, for styling

const ARTIFACT_DIR = path.resolve("./failing_tests");

function generateReport() {
  const RESULT_FILE = process.argv.at(2) ?? "failure_summary.txt";

  if (!fs.existsSync(ARTIFACT_DIR)) {
    console.error("No failing_tests folder found.");
    return;
  }

  const folders = fs.readdirSync(ARTIFACT_DIR);
  const report = {};

  folders.forEach((folder) => {
    const reportPath = path.join(ARTIFACT_DIR, folder, "report.json");

    if (fs.existsSync(reportPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        // Use "Unknown" if errorType is null or undefined
        const errorType = data.iridium.errorType || "Unknown/Mismatch";

        if (!report[errorType]) {
          report[errorType] = [];
        }

        report[errorType].push({
          file: data.file,
          scenario: data.scenario,
          message: data.iridium.message?.split("\n")[0], // Get first line of error
        });
      } catch (e) {
        // Skip malformed JSON
      }
    }
  });

  // Print the summary
  console.log(pc.bold(pc.cyan(`\n📊 Failure Audit Report\n`)));

  Object.keys(report)
    .sort()
    .forEach((type) => {
      const count = report[type].length;
      console.log(`${pc.yellow(type.padEnd(20))} : ${pc.bold(count)} tests`);

      // Print the first 5 tests as examples
      report[type].slice(0, 5).forEach((test) => {
        console.log(pc.gray(`  - ${test.file} (${test.scenario})`));
      });

      if (count > 5) {
        console.log(pc.gray(`  ... and ${count - 5} more`));
      }
      console.log("");
    });

  // Generate a text file for easy reading
  const textReport = Object.keys(report)
    .map((type) => {
      return (
        `=== ${type} (${report[type].length}) ===\n` +
        report[type].map((t) => `${t.file} [${t.scenario}]`).join("\n")
      );
    })
    .join("\n\n");

  fs.writeFileSync(RESULT_FILE, textReport);
  console.log(pc.green(`✔ Detailed list written to failure_summary.txt`));
}

generateReport();
