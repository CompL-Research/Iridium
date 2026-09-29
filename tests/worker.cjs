// const { execSync } = require("child_process");
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const EXEC_BIN = path.resolve(__dirname, "../external/Iridium-Quickjs/build/qjs_new");
const IRI_PATH = path.resolve(__dirname, "..");
const IRI_BIN = process.env.IRIDIUM_BIN
  ? path.resolve(process.env.IRIDIUM_BIN)
  : path.join(IRI_PATH, "dist/iridium.js");
const ARTIFACT_DIR = path.resolve(__dirname, "./failing_tests");

const TIMEOUT = 30000; // 30 Seconds Timeout

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
    let spawnArgs;
    let cmd;

    try {

      if (mode === "baseline") {
        cmd = EXEC_BIN;
        // Filter out empty strings if it's a module
        spawnArgs = [isModule ? "-m" : "-C", tempFile].filter(Boolean);
      } else {
        // spawnSync has no shell, so run node itself with the bundle as an arg
        cmd = process.execPath;
        spawnArgs = [
          "--max-old-space-size=8192",
          IRI_BIN,
          mode === "--iri" ? "iri" : "js3",
          "-r",
          "-s",
          isModule ? "module" : "script",
          tempFile,
        ];
      }

      // Using spawnSync instead of execSync to prevent zombie processes
      const spawnResult = spawnSync(cmd, spawnArgs, {
        cwd: mode === "baseline" ? undefined : IRI_PATH,
        encoding: "utf-8",
        stdio: "pipe",
        timeout: TIMEOUT, 
        killSignal: "SIGKILL", // Force kill instantly on timeout
      });

      if (spawnResult.error) {
        // Handle system-level errors (like timeout or binary not found)
        result.status = "FAIL";
        if (spawnResult.error.code === "ETIMEDOUT") {
          result.message = `TIMEOUT: Process took longer than ${TIMEOUT / 1000}s`;
          result.errorType = "TimeoutError";
        } else {
          result.message = spawnResult.error.message;
        }
      } else if (spawnResult.status !== 0) {
        // Handle runtime/compiler errors from the JS engine
        result.status = "FAIL";
        const rawError =
          spawnResult.stderr || spawnResult.stdout || "Unknown Error";
        result.errorType = getErrorType(rawError);
        result.message = rawError;
      }
    } catch (e) {
      // Fallback catch for unexpected Node.js errors
      result.status = "FAIL";
      result.errorType = "InternalRunnerError";
      result.message = e.message;
    } finally {
      // Ensure we always clean up the temp file
      if (fs.existsSync(tempFile)) {
        // fs.unlinkSync(tempFile);
      }
    }

    result.cmd = cmd;
    result.spawnArgs = spawnArgs;

    return result;
  },

  async saveArtifacts(test, baseline, iridium, prefix = "") {
    const testId = `${prefix ? prefix + "_" : ""}${test.file.replace(/\//g, "_")}_${test.scenario.replace(/ /g, "_")}`;
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
