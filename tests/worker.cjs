const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const EXEC_BIN = "/root/.nvm/versions/node/v24.14.1/bin/node";
const IRI_PATH = "/root/Iridium";
const ARTIFACT_DIR = path.resolve("./failing_tests");

if (!fs.existsSync(ARTIFACT_DIR))
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function getErrorType(stderr) {
  if (!stderr) return null;
  const match = stderr.match(
    /(SyntaxError|ReferenceError|TypeError|Test262Error)/,
  );
  return match ? match[0] : "Error";
}

module.exports = {
  async runTest(test, mode) {
    const { contents, file, attrs, scenario } = test;
    const isModule = attrs.flags?.module;
    const isStrict = scenario === "strict mode";

    // This shim fixes the "print is not defined" and other shell-specific missing globals
    const ENV_SHIM = `
          var print = console.log;
          var $262 = {
            global: globalThis,
            agent: {
              receiveBroadcast: function() {},
              report: function(msg) { console.log(msg); },
              sleep: function(ms) {
                const start = Date.now();
                while (Date.now() - start < ms) {}
              },
              broadcast: function() {},
              leaving: function() {}
            },
            destroy: function() {},
            gc: function() { if (global.gc) global.gc(); },
            IsHTMLDDA: function() { return {}; }
          };
        `;

    let finalContents = ENV_SHIM + contents;

    // Unique ID for this specific test run to prevent collisions
    const testId = `${file.replace(/\//g, "_")}_${scenario.replace(/ /g, "_")}`;
    const tempFile = path.join(
      "/dev/shm",
      `iri_${process.pid}_${Math.random().toString(36).slice(2)}.js`,
    );

    if (isStrict && !isModule && !/^\s*['"]use strict['"]/.test(contents)) {
      finalContents = `"use strict";\n${contents}`;
    }

    let result = { status: "PASS", errorType: null, message: "", code: "" };

    try {
      if (mode === "baseline") {
        fs.writeFileSync(tempFile, finalContents);
        execSync(`${EXEC_BIN} ${tempFile}`, { stdio: "pipe", timeout: 10000 });
      } else {
        fs.writeFileSync(tempFile, finalContents);
        const transformedCode = execSync(
          `./iridium js3 -s ${isModule ? "module" : "script"} -t ${tempFile}`,
          {
            cwd: IRI_PATH,
            encoding: "utf-8",
            stdio: "pipe",
          },
        );
        result.code = transformedCode; // Store transformed code to return it

        const secondTemp = tempFile + ".transformed.js";
        fs.writeFileSync(secondTemp, transformedCode);
        try {
          execSync(`${EXEC_BIN} ${secondTemp}`, {
            stdio: "pipe",
            timeout: 10000,
          });
        } finally {
          if (fs.existsSync(secondTemp)) fs.unlinkSync(secondTemp);
        }
      }
    } catch (e) {
      result.status = "FAIL";
      result.errorType = getErrorType(e.stderr?.toString() || e.message);
      result.message = e.stderr?.toString() || e.message;
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }

    return result;
  },

  async saveArtifacts(test, baseline, iridium) {
    const testId = `${test.file.replace(/\//g, "_")}_${test.scenario.replace(/ /g, "_")}`;
    const folder = path.join(ARTIFACT_DIR, testId);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    // Save Baseline Source
    fs.writeFileSync(path.join(folder, "original.js"), test.contents);
    // Save Transformed Source
    fs.writeFileSync(path.join(folder, "transformed.js"), iridium.code);
    // Save Metadata
    fs.writeFileSync(
      path.join(folder, "report.json"),
      JSON.stringify(
        {
          file: test.file,
          scenario: test.scenario,
          baseline,
          iridium: { ...iridium, code: undefined }, // Don't duplicate code in JSON
        },
        null,
        2,
      ),
    );
  },
};
