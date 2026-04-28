const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const EXEC_BIN = path.resolve("../externalDeps/quickjs/build/qjs_new");
const IRI_PATH = "/root/Iridium";
const ARTIFACT_DIR = path.resolve("./failing_tests");
const TEST262_PATH = path.resolve("./test262");

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

    let finalContents = contents + ENV_SHIM;

    // Unique ID for this specific test run to prevent collisions
    const tempFile = path.join(
      "/tmp",
      `iri_${process.pid}_${Math.random().toString(36).slice(2)}.js`,
    );

    if (
      isStrict &&
      !isModule &&
      !/^\s*['"]use strict['"]/.test(finalContents)
    ) {
      finalContents = `"use strict";\n${finalContents}`;
    }

    fs.writeFileSync(tempFile, finalContents);

    let result = {
      status: "PASS",
      errorType: null,
      message: "",
      code: undefined,
    };

    try {
      if (mode === "baseline") {
        execSync(`${EXEC_BIN} ${isModule ? "" : "-C"} ${tempFile}`, {
          stdio: "pipe",
          timeout: 10000,
        });
      } else if (mode === "--iri") {
        execSync(
          `./iridium iri -r -s ${isModule ? "module" : "script"} ${tempFile}`,
          {
            cwd: IRI_PATH,
            encoding: "utf-8",
            stdio: "pipe",
            timeout: 10000,
          },
        );
      } else {
        execSync(
          `./iridium js3 -r -s ${isModule ? "module" : "script"} ${tempFile}`,
          {
            cwd: IRI_PATH,
            encoding: "utf-8",
            stdio: "pipe",
            timeout: 10000,
          },
        );
      }
    } catch (e) {
      result.status = "FAIL";

      // 1. e.stderr is the standard error output (usually where compilers/runtimes put errors)
      // 2. e.stdout might contain info if the tool prints errors to standard output
      // 3. e.output is an array: [stdin, stdout, stderr]

      const rawError =
        e.stderr?.toString() || e.stdout?.toString() || e.message;

      result.errorType = getErrorType(rawError);
      result.message = rawError;
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

    // Save Transformed Source - for 3js, ignore otherwise
    if (iridium.code)
      fs.writeFileSync(path.join(folder, "transformed.js"), iridium.code);
    // Save Metadata
    fs.writeFileSync(
      path.join(folder, "report.json"),
      JSON.stringify(
        {
          file: test.file,
          scenario: test.scenario,
          baseline,
          iridium: { ...iridium, code: undefined },
        },
        null,
        2,
      ),
    );
  },
};
