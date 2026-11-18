// const { execSync } = require("child_process");
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const EXEC_BIN = path.resolve(
  __dirname,
  "../external/Iridium-Quickjs/build/qjs_new",
);
const IRI_PATH = path.resolve(__dirname, "..");
const IRI_BIN = process.env.IRIDIUM_BIN
  ? path.resolve(process.env.IRIDIUM_BIN)
  : path.join(IRI_PATH, "dist/iridium.js");
const ARTIFACT_DIR = path.resolve(__dirname, "./failing_tests");

// Per-process execution budgets (C-4). The baseline is a bare qjs_new
// spawn of *unmodified* source: it either finishes in milliseconds or is
// pathologically looping, so 5s catches runaways ~6x sooner than the
// candidate's budget. Compiled artifacts and the Forge compile pipeline
// legitimately need longer, so they keep the old 30s ceiling.
const COMPILE_TIMEOUT = 30000;
const BASELINE_TIMEOUT = 5000;
const CANDIDATE_TIMEOUT = 30000;

if (!fs.existsSync(ARTIFACT_DIR))
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

function getErrorType(stderr) {
  if (!stderr) return null;
  const match = stderr.match(
    /(SyntaxError|ReferenceError|TypeError|Test262Error)/,
  );
  return match ? match[0] : "Error";
}

// The constructor name alone is too loose for error matching (A3): two
// different TypeErrors read as "the same error". The signature is the
// first error-ish line of the output with locations stripped — compiled
// artifacts legitimately report different paths/lines than the input, so
// anything after " at " is dropped and whitespace collapsed.
function normalizeErrorLine(line) {
  return line
    .replace(/\s+/g, " ")
    // strip stack-frame decorations like " at <eval> (/tmp/x.js:1:1)"
    .replace(/ at (?=[^\s]*[:<(]).*$/, "")
    .trim()
    .slice(0, 400);
}

function getErrorSignature(message) {
  if (!message) return "";
  const lines = String(message).split("\n");
  const line =
    lines.find((l) =>
      /^(Test262:|([A-Z][A-Za-z]*Error|Error):)/.test(l.trim()),
    ) ||
    lines.find((l) => l.trim() !== "") ||
    "";
  return normalizeErrorLine(line);
}

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

// True when the test body (ignoring leading comments/whitespace) opens
// with a "use strict" directive.
function bodyStartsWithUseStrict(body) {
  let s = body;
  for (;;) {
    const m = s.match(/^\s*(?:\/\/[^\n]*\n|\/\*[\s\S]*?\*\/)/);
    if (!m) break;
    s = s.slice(m[0].length);
  }
  return /^\s*["']use strict["']\s*;?/.test(s);
}

// Test262 test -> the exact source we hand to the baseline and to Iridium.
// The shim is spliced in at the stream's insertionIndex (after the
// frontmatter and inlined harness includes, immediately before the test
// body) rather than appended at the end: async tests call $DONE() from a
// microtask, and doneprintHandle.js's $DONE -> print() must find the shim's
// globals already assigned. A body-level "use strict" directive loses its
// leading position once includes/shim are spliced in front of it, so the
// directive is re-declared at the very top of the program instead (making
// the whole program strict — what the file asked for, and what the official
// harness does for its strict-mode variants). test262-stream already
// prepends its own "use strict" for strict-mode scenarios.
function buildInputContents(test) {
  const idx = Number.isInteger(test.insertionIndex) ? test.insertionIndex : 0;
  const spliced =
    test.contents.slice(0, idx) + ENV_SHIM + test.contents.slice(idx);
  const wantsStrict = bodyStartsWithUseStrict(test.contents.slice(idx));
  const alreadyAtTop = bodyStartsWithUseStrict(test.contents);
  const alreadyInHead = idx > 0 && bodyStartsWithUseStrict(test.contents.slice(0, idx));
  if (wantsStrict && !alreadyAtTop && !alreadyInHead)
    return '"use strict";\n' + spliced;
  return spliced;
}

// Turn a spawnSync outcome into the test result shape used by the runner
function finalizeSpawn(spawnResult, cmd, spawnArgs, timeoutMs, label) {
  const result = {
    status: "PASS",
    errorType: null,
    message: "",
    code: undefined,
    stdout: "",
    errorSig: "",
  };

  if (spawnResult.stdout)
    result.stdout = String(spawnResult.stdout).slice(0, 32768);

  if (spawnResult.error) {
    // System-level errors (like timeout or binary not found)
    result.status = "FAIL";
    if (spawnResult.error.code === "ETIMEDOUT") {
      result.message = `TIMEOUT: ${label} took longer than ${timeoutMs / 1000}s`;
      result.errorType = "TimeoutError";
    } else {
      result.message = spawnResult.error.message;
    }
  } else if (spawnResult.status !== 0) {
    // Runtime/compiler errors from the JS engine
    result.status = "FAIL";
    const rawError =
      spawnResult.stderr || spawnResult.stdout || "Unknown Error";
    result.errorType = getErrorType(rawError);
    result.message = rawError;
  }

  if (result.status === "FAIL") result.errorSig = getErrorSignature(result.message);

  result.cmd = cmd;
  result.spawnArgs = spawnArgs;
  return result;
}

function spawnTest(cmd, spawnArgs, opts = {}) {
  // timeoutMs/label steer the budget & message; everything else goes to
  // spawnSync. Using spawnSync instead of execSync to prevent zombies.
  const { timeoutMs = CANDIDATE_TIMEOUT, label = "execution", ...spawnOpts } = opts;
  const spawnResult = spawnSync(cmd, spawnArgs, {
    encoding: "utf-8",
    stdio: "pipe",
    timeout: timeoutMs,
    killSignal: "SIGKILL", // Force kill instantly on timeout
    ...spawnOpts,
  });
  return finalizeSpawn(spawnResult, cmd, spawnArgs, timeoutMs, label);
}

// Per-test temp dir under the run's shared temp root. The run-scoped root
// (e.g. /tmp/iri-test-1234-1700000000/) lets an interrupted run be wiped
// with one targeted rmSync instead of scanning a tmp dir that may hold
// millions of unrelated entries.
function makeRunTempDir(runTempRoot) {
  if (runTempRoot) {
    fs.mkdirSync(runTempRoot, { recursive: true });
    return fs.mkdtempSync(path.join(runTempRoot, "t-"));
  }
  return fs.mkdtempSync(path.join(os.tmpdir(), "iri-test-"));
}

// Compile one test into a runnable artifact using the CLI's dump modes
// (iri -> `<uname>.iri`, js3 -> `<uname>.js3.js`). The artifact lives in a
// throwaway dir under the run's temp root — the compiler changes between
// runs, so there is nothing worth reusing across runs.
function compileTest(test, mode, runTempRoot = null) {
  const dir = makeRunTempDir(runTempRoot);
  const isModule = test.attrs.flags?.module;
  const inputPath = path.join(dir, "input.js");
  fs.writeFileSync(inputPath, buildInputContents(test));

  const compileArgs = [
    "--max-old-space-size=8192",
    IRI_BIN,
    mode === "--iri" ? "iri" : "js3",
    "-s",
    isModule ? "module" : "script",
    mode === "--iri" ? "--dump-iri" : "--dump-js3",
    // The default '~' temp prefix is a parser extension that qjs_new only
    // accepts inside .iri containers; runnable JS3 artifacts use 't$' so
    // they can be loaded as plain classic scripts/modules.
    ...(mode === "--js3" ? ["--emit-runnable-js3"] : []),
    "-o",
    dir,
    inputPath,
  ];
  const compiled = spawnSync(process.execPath, compileArgs, {
    cwd: IRI_PATH,
    encoding: "utf-8",
    stdio: "pipe",
    timeout: COMPILE_TIMEOUT,
    killSignal: "SIGKILL",
  });

  let meta;
  if (compiled.error) {
    // ETIMEDOUT / ENOENT etc. (mirrors legacy TimeoutError classification).
    meta = {
      ok: false,
      artifact: null,
      message:
        compiled.error.code === "ETIMEDOUT"
          ? `TIMEOUT: Compilation took longer than ${COMPILE_TIMEOUT / 1000}s`
          : compiled.error.message,
    };
  } else {
    // The CLI names artifacts after the absolute input path with
    // separators replaced; the temp dir is unique per test, so we just
    // glob for the expected suffix.
    const suffix = mode === "--iri" ? ".iri" : ".js3.js";
    const artifact = fs.readdirSync(dir).find((f) => f.endsWith(suffix));

    if (artifact) {
      meta = { ok: true, artifact, message: "" };
    } else {
      meta = {
        ok: false,
        artifact: null,
        // The pino logger reports "IRI/JS3 build failed" on stdout as a
        // JSON line, so capture both streams for the runner's matching.
        message:
          `${compiled.stderr || ""}\n${compiled.stdout || ""}`.slice(0, 8000) ||
          `${mode === "--iri" ? "IRI" : "JS3"} build failed`,
      };
    }
  }

  return { dir, meta };
}

function runBaseline(test, inputPath) {
  const isModule = test.attrs.flags?.module;
  // Filter out empty strings if it's a module
  const spawnArgs = [isModule ? "-m" : "-C", inputPath].filter(Boolean);
  return spawnTest(EXEC_BIN, spawnArgs, {
    timeoutMs: BASELINE_TIMEOUT,
    label: "baseline execution",
  });
}

// Execute a precompiled artifact: iri -> `qjs_new -X file` (binary IRI
// container), js3 -> `qjs_new -C/-m file` (runnable JS3 source).
function runArtifact(mode, artifactPath, isModule) {
  const spawnArgs =
    mode === "--iri"
      ? ["-X", artifactPath]
      : [isModule ? "-m" : "-C", artifactPath];
  const result = spawnTest(EXEC_BIN, spawnArgs, {
    timeoutMs: CANDIDATE_TIMEOUT,
    label: "candidate execution",
  });
  result.artifact = artifactPath;
  return result;
}

// test262's async protocol: doneprintHandle.js (inlined for [async] tests)
// defines $DONE(), which prints "Test262:AsyncTestComplete" on success or
// "Test262:AsyncTestFailure:..." in continuations that detected a problem.
// A clean exit alone is NOT success (A1): code that silently drops a
// continuation still exits 0, so the success marker is required and any
// failure marker means the test did not pass. Applied identically to
// baseline and candidate, so the comparison semantics stay symmetric.
const ASYNC_COMPLETE = "Test262:AsyncTestComplete";
function applyAsyncGate(result, isAsync) {
  if (!isAsync || result.status !== "PASS") return result;
  const out = result.stdout || "";
  const failure = out.match(/Test262:AsyncTestFailure:.*$/m);
  if (failure) {
    result.status = "FAIL";
    result.errorType = getErrorType(failure[0]) || "Error";
    result.message = failure[0];
    result.errorSig = normalizeErrorLine(failure[0]);
    result.asyncFailure = true;
  } else if (!out.includes(ASYNC_COMPLETE)) {
    result.status = "FAIL";
    result.errorType = null;
    result.message = "Test262:AsyncTestIncomplete ($DONE was never called)";
    result.errorSig = "Test262:AsyncTestIncomplete";
    result.asyncFailure = true;
  }
  return result;
}

// Internal helpers exported for direct unit checks (jest-worker only proxies
// the exposedMethods over RPC, extra exports are inert there).
module.exports._internals = { getErrorSignature, normalizeErrorLine, buildInputContents, bodyStartsWithUseStrict, applyAsyncGate };

module.exports = Object.assign(module.exports, {
  // Compile (dump modes) in a temp dir, then run baseline + artifact as
  // plain qjs_new spawns. keepDirs leaves the temp dir behind so the
  // runner's --saveArtifacts pass can copy from it; the run-wide temp root
  // is then wiped in one shot by the runner at the end.
  async runTest(test, mode, runTempRoot = null, keepDirs = false) {
    const { dir, meta } = compileTest(test, mode, runTempRoot);
    const isAsync = !!test.attrs.flags?.async;

    try {
      const baseline = applyAsyncGate(
        runBaseline(test, path.join(dir, "input.js")),
        isAsync,
      );

      let iridium;
      if (meta.ok) {
        iridium = applyAsyncGate(
          runArtifact(
            mode,
            path.join(dir, meta.artifact),
            !!test.attrs.flags?.module,
          ),
          isAsync,
        );
      } else {
        iridium = {
          status: "FAIL",
          errorType: /TIMEOUT/.test(meta.message || "") ? "TimeoutError" : null,
          message:
            meta.message || `${mode === "--iri" ? "IRI" : "JS3"} build failed`,
          errorSig: getErrorSignature(meta.message || ""),
          code: undefined,
        };
      }

      return { baseline, iridium };
    } finally {
      if (!keepDirs && fs.existsSync(dir))
        fs.rmSync(dir, { recursive: true, force: true });
    }
  },

  // Fail fast before burning thousands of tasks: probe the baseline binary
  // and the compile+exec candidate path with a trivial pass, plus an async
  // end-to-end probe (microtask pump + $DONE marker gate). Returns a list
  // of human-readable problems (empty = all good).
  async preflight(mode) {
    const problems = [];
    const probeRoot = fs.mkdtempSync(path.join(os.tmpdir(), "iri-test-"));
    try {
      const probes = [
        {
          name: "sync",
          test: {
            file: "preflight/probe.js",
            scenario: "normal mode",
            attrs: { flags: [] },
            contents: "var preflightProbe = 1;\n",
          },
        },
        {
          // Mirrors what inlined doneprintHandle.js provides, so the async
          // classification path (marker gate) is exercised end-to-end.
          name: "async",
          test: {
            file: "preflight/async-probe.js",
            scenario: "normal mode",
            attrs: { flags: { async: true } },
            contents:
              'function $DONE(e) { print(e ? "Test262:AsyncTestFailure:Test262Error: " + e : "Test262:AsyncTestComplete"); }\n' +
              "Promise.resolve().then(function () { $DONE(); });\n",
          },
        },
      ];

      for (const { name, test } of probes) {
        const inputPath = path.join(probeRoot, `${name}-input.js`);
        fs.writeFileSync(inputPath, buildInputContents(test));

        const baseline = applyAsyncGate(runBaseline(test, inputPath), !!test.attrs.flags?.async);
        if (baseline.status !== "PASS") {
          problems.push(
            `${name} baseline binary failed a trivial pass (${EXEC_BIN}): ${String(baseline.message).slice(0, 200)}`,
          );
          continue;
        }

        const { dir, meta } = compileTest(test, mode, probeRoot);
        if (!meta.ok) {
          problems.push(
            `${name} ${mode} compile failed on a trivial input: ${String(meta.message).slice(0, 300)}`,
          );
          continue;
        }
        const candidate = applyAsyncGate(
          runArtifact(mode, path.join(dir, meta.artifact), false),
          !!test.attrs.flags?.async,
        );
        if (candidate.status !== "PASS")
          problems.push(
            `${name} artifact exec failed on a trivial pass (${EXEC_BIN}): ${String(candidate.message).slice(0, 200)}`,
          );
      }
    } finally {
      fs.rmSync(probeRoot, { recursive: true, force: true });
    }
    return problems;
  },

  async saveArtifacts(test, baseline, iridium, prefix = "", runTag = "") {
    const testId = `${prefix ? prefix + "_" : ""}${test.file.replace(/\//g, "_")}_${test.scenario.replace(/ /g, "_")}`;
    // Artifacts are versioned per run (C-7): --save-run <name> files them
    // under failing_tests/<name>/, otherwise under a timestamped folder, so
    // one run's artifacts never masquerade as another's. The runner wipes
    // this run's folder at startup.
    const folder = path.join(ARTIFACT_DIR, runTag, testId);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    // Save Baseline Source
    fs.writeFileSync(path.join(folder, "original.js"), test.contents);

    // Save Transformed Source - for 3js, ignore otherwise
    if (iridium.code)
      fs.writeFileSync(path.join(folder, "transformed.js"), iridium.code);

    // Save the precompiled artifact (iri binary / js3 source) when available
    if (iridium.artifact && fs.existsSync(iridium.artifact)) {
      const suffix = iridium.artifact.endsWith(".iri") ? ".iri" : ".js3.js";
      fs.copyFileSync(
        iridium.artifact,
        path.join(folder, "iridium_artifact" + suffix),
      );
    }

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
});
