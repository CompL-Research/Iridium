const Test262Stream = require("test262-stream");
const { Worker } = require("jest-worker");
const os = require("os");
const path = require("path");
const pc = require("picocolors");
const cliProgress = require("cli-progress");
const fs = require("fs");

// Default to one worker per logical core. Every test spawns a synchronous
// child process, so oversubscribing the pool mostly adds scheduling churn.
// Can be overridden with --threads=N.
const AUTO_THREADS = Math.min(
  os.availableParallelism ? os.availableParallelism() : os.cpus().length,
  32,
);
const TEST262_PATH = path.resolve("./test262");

// Saved runs (--save-run / --compare) live here as <name>.json
const RUNS_DIR = path.resolve(__dirname, "runs");

// Categories that count as "the candidate failed against the bar"
const FAIL_CATS = ["regression", "timeoutRegression", "failBothEMismatch"];
const ALL_CATS = [
  "regression",
  "timeoutRegression",
  "failBothEMismatch",
  "failBothEMatch",
  "overCompliant",
  "ignored",
];
// Categories the runner counts toward passCount (the "bar")
const PASSING_CATS = new Set([
  "passBoth",
  "failBothEMatch",
  "overCompliant",
  "ignored",
]);
const SAVE_ARTIFACT_PREFIX = {
  ignored: "IGNO",
  failBothEMatch: "FBOT",
  failBothEMismatch: "EMIS",
  regression: "REGR",
  timeoutRegression: "REGR",
  overCompliant: "OVER",
};

function formatDuration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

function freshStats() {
  return {
    passBoth: 0,
    failBothEMatch: [],
    failBothEMismatch: [],
    overCompliant: [],
    regression: [],
    timeoutRegression: [],
    ignored: [],
  };
}

function recordResult(s, category, file) {
  if (category === "passBoth") s.passBoth++;
  else s[category].push(file);
}

// A test file can run in several scenarios; detail keys (and the markdown
// report) disambiguate them, while stats arrays stay plain paths so the
// --compare/--rerun set logic never has to parse them.
function detailKey(t) {
  return t.scenario && t.scenario !== "default"
    ? `${t.file} (${t.scenario})`
    : t.file;
}

function sortedStats(stats) {
  const out = {};
  for (const [key, value] of Object.entries(stats))
    out[key] = Array.isArray(value) ? [...value].sort() : value;
  return out;
}

// Sweep orphaned compile temp dirs (/tmp/iri-test-*) from the temp folder.
// Called once at normal completion: per-test cleanup plus the process-exit
// hook already handle the current run, so in practice this only collects
// strays from previous runs that were killed with SIGKILL. (Scanning /tmp
// can take ~1-2s on a crowded machine, hence not on every path.) If two
// harness runs share this machine at the exact same time, a sweep can also
// remove the other run's live dirs.
function sweepCompileTemps() {
  let removed = 0;
  try {
    const tmpRoot = os.tmpdir();
    for (const entry of fs.readdirSync(tmpRoot)) {
      if (!entry.startsWith("iri-test-")) continue;
      try {
        fs.rmSync(path.join(tmpRoot, entry), { recursive: true, force: true });
        removed++;
      } catch {}
    }
  } catch {}
  return removed;
}

// --- Saved-run helpers (--save-run / --compare / --rerun) ---

// A run reference is either a name under RUNS_DIR ("run1" -> runs/run1.json)
// or a path to a report file (contains a separator or ends in .json).
function resolveRunRef(ref) {
  if (ref.endsWith(".json") || ref.includes("/") || path.isAbsolute(ref))
    return path.resolve(ref);
  return path.join(RUNS_DIR, `${ref}.json`);
}

function savedRunNames() {
  try {
    return fs
      .readdirSync(RUNS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.slice(0, -".json".length));
  } catch {
    return [];
  }
}

// Newest saved run by mtime, or null if none exist.
function latestSavedRun() {
  try {
    let best = null;
    for (const f of fs.readdirSync(RUNS_DIR)) {
      if (!f.endsWith(".json")) continue;
      const full = path.join(RUNS_DIR, f);
      if (!best || fs.statSync(full).mtimeMs > fs.statSync(best).mtimeMs)
        best = full;
    }
    return best;
  } catch {
    return null;
  }
}

function loadRunReport(ref) {
  const file = resolveRunRef(ref);
  try {
    return { file, report: JSON.parse(fs.readFileSync(file, "utf-8")) };
  } catch (err) {
    console.error(pc.red(`Cannot read saved run "${ref}" (${file}): ${err.message}`));
    const known = savedRunNames();
    if (known.length)
      console.error(pc.gray(`  saved runs: ${known.join(", ")}`));
    else
      console.error(
        pc.gray("  no saved runs yet — pass --save-run <name> during a run"),
      );
    process.exit(1);
  }
}

function printFileList(files, color, cap = 40) {
  for (const f of files.slice(0, cap)) console.log(color(`      ${f}`));
  if (files.length > cap)
    console.log(pc.gray(`      …and ${files.length - cap} more`));
}

// --compare <a> <b>: diff two saved reports without running anything.
function compareRuns(refA, refB) {
  const { file: fileA, report: A } = loadRunReport(refA);
  const { file: fileB, report: B } = loadRunReport(refB);
  const mA = A.meta || {};
  const mB = B.meta || {};

  console.log(`\n${pc.bold("🔍 Comparing runs:")} ${refA} → ${refB}`);
  for (const [label, m, file] of [
    [refA, mA, fileA],
    [refB, mB, fileB],
  ]) {
    console.log(
      `   ${pc.bold(String(label).padEnd(12))} ${m.generated || "?"} | mode ${m.mode || "?"} | ${m.total ?? "?"} tests @ ${formatDuration(m.durationMs || 0)} | ${pc.green(`${m.passCount ?? "?"} pass`)} / ${pc.red(`${m.failCount ?? "?"} fail`)}`,
    );
    console.log(pc.gray(`   ${" ".repeat(12)} ${file}`));
  }
  if (mA.mode !== mB.mode)
    console.log(
      pc.yellow(
        `   ⚠ different modes (${mA.mode} vs ${mB.mode}) — differences are engine deltas, not regressions`,
      ),
    );
  if (
    JSON.stringify(mA.filters ?? mA.filter ?? null) !==
    JSON.stringify(mB.filters ?? mB.filter ?? null)
  )
    console.log(
      pc.yellow(
        `   ⚠ different filters — "resolved" may just mean "wasn't in scope"`,
      ),
    );

  console.log(`\n${pc.cyan("Failure categories (older → newer):")}`);
  let anyLine = false;
  for (const cat of ALL_CATS) {
    const prev = A.stats?.[cat] || [];
    const cur = B.stats?.[cat] || [];
    if (!prev.length && !cur.length) continue;
    anyLine = true;
    const prevSet = new Set(prev);
    const curSet = new Set(cur);
    const added = cur.filter((f) => !prevSet.has(f));
    const resolved = prev.filter((f) => !curSet.has(f));
    console.log(
      `   ${cat.padEnd(21)} ${pc.gray(`${cur.length - added.length} same`)} | ${pc.red(`+${added.length} new`)} | ${pc.green(`−${resolved.length} resolved`)}`,
    );
    if (cat === "regression" && added.length) printFileList(added, pc.red);
  }
  if (!anyLine) console.log(pc.gray("   no failures in either run"));

  const delta = (key) => (mB[key] ?? 0) - (mA[key] ?? 0);
  const dPass = delta("passCount");
  const dFail = delta("failCount");
  console.log(
    `\n   ${pc.gray("passCount")} ${mA.passCount ?? "?"} → ${mB.passCount ?? "?"} ${dPass === 0 ? pc.gray("(=)") : dPass > 0 ? pc.green(`(+${dPass})`) : pc.red(`(${dPass})`)}   ${pc.gray("failCount")} ${mA.failCount ?? "?"} → ${mB.failCount ?? "?"} ${dFail === 0 ? pc.gray("(=)") : dFail > 0 ? pc.red(`(+${dFail})`) : pc.green(`(${dFail})`)}`,
  );

  const failing = (r) => new Set(FAIL_CATS.flatMap((c) => r.stats?.[c] || []));
  const fa = failing(A);
  const fb = failing(B);
  const nowFailing = [...fb].filter((f) => !fa.has(f)).sort();
  const fixed = [...fa].filter((f) => !fb.has(f)).sort();

  if (nowFailing.length) {
    console.log(`\n${pc.red(`✖ Now failing (${nowFailing.length}):`)}`);
    printFileList(nowFailing, pc.red);
  }
  if (fixed.length) {
    console.log(`\n${pc.green(`✔ No longer failing (${fixed.length}):`)}`);
    printFileList(fixed, pc.green);
  }
  if (!nowFailing.length && !fixed.length)
    console.log(
      `\n${pc.green("✔ Identical pass/fail sets between the two runs.")}`,
    );
}

// Human-readable run report (markdown). Rationale: nvim folds it via
// headings (treesitter / foldmethod=expr) AND via the plain {{{ }}}
// markers in fenced blocks with stock nvim + foldmethod=marker; GitHub
// renders the tables; the fenced lists are one-path-per-line so they stay
// greppable/diff-able. Machine format stays separate (--save-run JSON).
const MD_SECTIONS = [
  ["regression", "✖ True regressions"],
  ["timeoutRegression", "⏱ Timeout regressions"],
  ["failBothEMismatch", "➖ Failed both — error mismatch"],
  ["overCompliant", "★ Over-compliant (fixes)"],
  ["failBothEMatch", "➖ Failed both — error match"],
  ["ignored", "⊘ Ignored (compile errors)"],
];

// Collapse to one readable line (compile failures carry multi-line pino JSON).
const oneLine = (s) => String(s).replace(/\s+/g, " ").trim().slice(0, 240);

function mdCell(s) {
  // backticks + escaped pipes: markdown tables split on | inside code too
  return String(s).replace(/\|/g, "\\|");
}

function buildMarkdownReport({ report, details, jsonPath, cmdLine }) {
  const m = report.meta;
  const L = [];
  L.push(`# test262 ${m.mode} report — ${m.generated}`);
  L.push("", "## Summary", "", "| field | value |", "|---|---|");
  const rate = m.total ? ((m.passCount / m.total) * 100).toFixed(2) : "0.00";
  const throughput =
    m.durationMs > 0
      ? (m.total / (m.durationMs / 1000)).toFixed(2)
      : "0.00";
  L.push(`| command | \`${mdCell(cmdLine)}\` |`);
  L.push(`| mode | \`${m.mode}\` |`);
  L.push(
    `| filter | \`${mdCell(m.filters ? m.filters.join(", ") : m.filter || "(all tests)")}\` |`,
  );
  if (m.rerun) L.push(`| rerun of | \`${mdCell(m.rerun)}\` |`);
  L.push(`| threads | ${m.threads} |`);
  L.push(`| duration | ${formatDuration(m.durationMs)} @ ${throughput} tests/s |`);
  L.push(`| total tests | ${m.total} |`);
  L.push(
    `| passed (bar) | **${m.passCount}** (${rate}%) — passBoth ${report.stats.passBoth}, errMatch ${report.stats.failBothEMatch.length}, overCompliant ${report.stats.overCompliant.length}, ignored ${report.stats.ignored.length} |`,
  );
  L.push(`| failed | **${m.failCount}** — regression ${report.stats.regression.length}, timeoutRegression ${report.stats.timeoutRegression.length}, errMismatch ${report.stats.failBothEMismatch.length} |`);

  if (report.groups) {
    L.push(
      "",
      "## Filter groups",
      "",
      "| filter | tests | pass | fail |",
      "|---|--:|--:|--:|",
    );
    for (const [line, g] of Object.entries(report.groups))
      L.push(
        `| \`${mdCell(line)}\` | ${g.total} | ${g.pass} | ${g.fail} |`,
      );
  }

  for (const [cat, title] of MD_SECTIONS) {
    const arr = report.stats[cat] || [];
    L.push("", `## ${title} (${arr.length})`, "");
    if (arr.length === 0) {
      L.push("_none_");
      continue;
    }
    // Prefer scenario-tagged detail entries (one per task, with evidence);
    // fall back to plain paths if details are missing (older reports).
    const tagged = Object.entries(details || {})
      .filter(([, d]) => d.category === cat)
      .sort(([a], [b]) => (a < b ? -1 : 1));
    L.push("```", "{{{");
    if (tagged.length === arr.length) {
      for (const [key, d] of tagged) {
        L.push(key);
        if (d.baseline || d.candidate) {
          L.push(
            `  baseline : ${d.baseline}`,
            `  candidate: ${d.candidate}`,
            "",
          );
        }
      }
    } else {
      for (const f of arr) L.push(f);
    }
    L.push("}}}", "```");
  }

  L.push(
    "",
    "---",
    "",
    `_machine-readable: \`${jsonPath || "(not saved — use --save-run)"}\`_`,
    "",
    "<!-- vim: set foldmethod=marker: -->",
  );
  return L.join("\n") + "\n";
}

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

const USAGE = `Usage: node run.cjs --iri|--js3 [options] [filter]

  filter                substring of test paths (e.g. language/types)
  --filters <file>      one path filter per line ('#' starts a comment);
                        tests matching ANY line run, results group per line
  --threads <N>         worker threads (default: all cores, max 32)
  --save-run <name>     save this run to tests/runs/<name>.json (machine,
                        for --compare / --rerun) plus <name>.md (report)
  --compare <a> <b>     diff two saved runs (names or .json paths); runs no
                        tests, just prints the category diff
  --rerun[=<name>]      run only the failures saved in <name> (default: the
                        most recently saved run)
  Every run also writes a markdown statistics report to tests/reports/.
  --saveArtifacts       copy non-passing tests to tests/failing_tests/<run-tag>/
                        (run-tag = --save-run name, else a timestamp)
  --ignore-with         count "JS3 build failed" as ignored instead of failing
  --ignore-name         skip test files containing "-name-"
  --help                show this message

  examples & typical workflow: see tests/usage.txt`;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
    process.exit(0);
  }

  // --compare <a> <b> consumes its operands before filter extraction so the
  // run names aren't mistaken for the positional filter. It runs no tests.
  {
    const ci = args.indexOf("--compare");
    if (ci !== -1) {
      const [a, b] = [args[ci + 1], args[ci + 2]];
      if (!a || !b || a.startsWith("--") || b.startsWith("--")) {
        console.error("Usage: node run.cjs --compare <runA> <runB>");
        console.error(
          pc.gray(`  saved runs: ${savedRunNames().join(", ") || "(none)"}`),
        );
        process.exit(1);
      }
      args.splice(ci, 3);
      compareRuns(a, b);
      process.exit(0);
    }
  }

  // Parse --threads / --threads=N first so the count isn't mistaken for the filter
  let threadsArg = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--threads") {
      threadsArg = parseInt(args[i + 1], 10);
      args.splice(i, 2);
      i--;
    } else if (args[i].startsWith("--threads=")) {
      threadsArg = parseInt(args[i].split("=")[1], 10);
      args.splice(i, 1);
      i--;
    }
  }
  const THREADS = Math.max(1, threadsArg || AUTO_THREADS);

  // Consume --filters <path> / --filters=<path> and --save-run <name> /
  // --save-run=<name> the same way (their values must not become the filter).
  const takeValueFlag = (name) => {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === `--${name}=`) {
        console.error(pc.red(`--${name} requires a value`));
        process.exit(1);
      }
      if (args[i].startsWith(`--${name}=`)) {
        const v = args[i].slice(name.length + 3);
        args.splice(i, 1);
        return v;
      }
      if (args[i] === `--${name}`) {
        const v = args[i + 1];
        if (v === undefined || v.startsWith("--")) {
          console.error(pc.red(`--${name} requires a value`));
          process.exit(1);
        }
        args.splice(i, 2);
        return v;
      }
    }
    return null;
  };
  const filterFileArg = takeValueFlag("filters");
  const saveRun = takeValueFlag("save-run");

  // C-7: --saveArtifacts writes into a run-scoped folder under
  // tests/failing_tests/ so artifacts from different runs never mix. The
  // --save-run name doubles as the folder name when given.
  const artifactTag = saveRun
    ? path
        .basename(String(saveRun))
        .replace(/\.json$/, "")
        .replace(/[^A-Za-z0-9._-]+/g, "_")
    : `run-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`;

  const filter = args.find((a) => !a.startsWith("--")) || "";
  const js3 = args.includes("--js3");
  const iri = args.includes("--iri");
  const saveArtifacts = args.includes("--saveArtifacts");
  const ignoreWith = args.includes("--ignore-with");
  const ignoreName = args.includes("--ignore-name");
  const ignoreList = true;

  // --rerun[=name]: only re-run the failures from a saved run (default: the
  // newest file under tests/runs/). Only the `=` form takes a value so a
  // following positional filter isn't swallowed.
  const rerunEq = args.find((a) => a.startsWith("--rerun="));
  const rerunSrc =
    args.includes("--rerun") || rerunEq
      ? rerunEq
        ? rerunEq.slice("--rerun=".length)
        : "latest"
      : null;

  const modeName = js3 ? "js3" : "iri";

  if (js3 === iri) {
    console.error("Expected one of --js3 or --iri, not both or neither.");
    process.exit(0);
  }

  // Filter lines: positional filter plus every line of the --filters file.
  // A test runs if it matches ANY line; when a file was given, each test is
  // tagged with the first line it matched so the report breaks down per
  // filter group.
  const filterLines = [];
  if (filter) filterLines.push(filter);
  if (filterFileArg) {
    let raw;
    try {
      raw = fs.readFileSync(filterFileArg, "utf-8");
    } catch (err) {
      console.error(
        pc.red(`Cannot read --filters file (${filterFileArg}): ${err.message}`),
      );
      process.exit(1);
    }
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (t && !t.startsWith("#")) filterLines.push(t);
    }
    if (filterLines.length === 0) {
      console.error(pc.red(`--filters file (${filterFileArg}) has no filters`));
      process.exit(1);
    }
  }
  const grouped = !!filterFileArg;

  const worker = new Worker(require.resolve("./worker.cjs"), {
    numWorkers: THREADS,
    exposedMethods: ["runTest", "preflight", "saveArtifacts"],
  });

  // All temp dirs of this run live under one parent so forced closes can
  // wipe it with a single targeted rm instead of scanning a busy /tmp.
  const runTempRoot = path.join(
    os.tmpdir(),
    `iri-test-${process.pid}-${Date.now()}`,
  );

  // High-level progress counts (declared early: the signal handlers read them)
  let passCount = 0;
  let failCount = 0;

  // Never leave temp dirs behind: sweep on any exit, and on Ctrl+C / SIGTERM
  // kill the pool first (workers are blocked in spawnSync, so they can't
  // clean up their in-flight dirs themselves), then wipe the run root.
  process.on("exit", () =>
    fs.rmSync(runTempRoot, { recursive: true, force: true }),
  );

  let shuttingDown = false;
  const bail = (code) => {
    if (shuttingDown) return;
    shuttingDown = true;
    const done = (passCount || 0) + (failCount || 0);
    if (done > 0) {
      try {
        process.stderr.write(
          `\n⚠ Interrupted after ${done}/${total} tests — ${passCount} pass, ${failCount} fail so far\n`,
        );
      } catch {}
    }
    try {
      worker.forceExit();
    } catch {}
    fs.rmSync(runTempRoot, { recursive: true, force: true });
    process.exit(code);
  };
  process.on("SIGINT", () => bail(130));
  process.on("SIGTERM", () => bail(143));

  // Fail fast before burning thousands of tasks: probe both binaries on the
  // exact code paths the runner uses. A missing/stale dist/ or qjs_new would
  // otherwise surface as 30k misclassified rows instead of a clear error.
  const preflightProblems = await worker.preflight(js3 ? "--js3" : "--iri");
  if (preflightProblems.length > 0) {
    console.error(pc.red("\n❌ Preflight failed — aborting before any tests:"));
    for (const problem of preflightProblems)
      console.error(pc.red(`   • ${problem}`));
    console.error(
      pc.gray(
        "   (is the bundle built? npm run build — and external/Iridium-Quickjs/build/qjs_new present?)",
      ),
    );
    try {
      await worker.end();
    } catch {}
    process.exit(1);
  }

  const stream = new Test262Stream(TEST262_PATH, {
    paths: ["test/language"],
  });

  const allTests = [];
  const saveArtifactsRoot = path.resolve(
    __dirname,
    "failing_tests",
    artifactTag,
  );
  if (saveArtifacts) {
    // This run's artifact folder starts empty (other runs' folders are left
    // alone); wipe happens before any worker writes into it.
    fs.rmSync(saveArtifactsRoot, { recursive: true, force: true });
  }
  for await (const test of stream) {
    if (test.attrs.negative) continue;
    if (ignoreName && test.file.includes("-name-")) continue;
    if (ignoreList && IGNORED.includes(test.file)) {
      continue;
    }
    if (TODOS.includes(test.file)) {
      continue;
    }
    if (filterLines.length) {
      const match = filterLines.find((f) => test.file.includes(f));
      if (!match) continue;
      if (grouped) test.group = match;
    }
    allTests.push(test);
  }

  // --rerun: restrict the run to failures recorded in a saved run
  let rerunFile = null;
  if (rerunSrc) {
    rerunFile = rerunSrc === "latest" ? latestSavedRun() : resolveRunRef(rerunSrc);
    if (!rerunFile) {
      console.error(
        pc.red("No saved runs to --rerun from — pass --save-run <name> on a run first."),
      );
      process.exit(1);
    }
    let prevReport;
    try {
      prevReport = JSON.parse(fs.readFileSync(rerunFile, "utf-8"));
    } catch (err) {
      console.error(
        pc.red(`Cannot read saved run (${rerunFile}): ${err.message}`),
      );
      const known = savedRunNames();
      if (known.length)
        console.error(pc.gray(`  saved runs: ${known.join(", ")}`));
      process.exit(1);
    }
    const prevStats = prevReport.stats || {};
    const rerunSet = new Set(
      [...FAIL_CATS, "ignored"].flatMap((c) => prevStats[c] || []),
    );
    for (let i = allTests.length - 1; i >= 0; i--)
      if (!rerunSet.has(allTests[i].file)) allTests.splice(i, 1);
  }

  const total = allTests.length;

  if (total === 0) {
    console.log(
      pc.yellow(
        rerunSrc
          ? "\n🎉 Nothing to rerun — the saved run has no failures."
          : "\nNo tests matched — nothing to run.",
      ),
    );
    await worker.end();
    process.exit(0);
  }

  // Per-filter-group tallies (only with --filters <file>). Groups keep the
  // order of the filter file, and lines matching nothing still appear (with
  // 0 tests) so typos in the list are visible. Totals reflect the post-rerun
  // set so scoped reruns still group cleanly.
  const groupStats = new Map();
  const getGroup = (line) => {
    if (!groupStats.has(line))
      groupStats.set(line, { total: 0, pass: 0, fail: 0, stats: freshStats() });
    return groupStats.get(line);
  };
  if (grouped) {
    for (const line of filterLines) getGroup(line);
    for (const t of allTests) getGroup(t.group).total++;
  }

  // Rolling window of completion timestamps used for smoothed ETA/rate.
  // Linear extrapolation from the start is wildly off when a batch of
  // 30s-timeout tests lands, so we only look at the most recent N finishes.
  const runStart = Date.now();
  const SAMPLE_WINDOW = 60;
  const completionTimes = [];

  function currentRate() {
    if (completionTimes.length < 2) return null;
    const windowMs =
      completionTimes[completionTimes.length - 1] - completionTimes[0];
    if (windowMs <= 0) return null;
    return ((completionTimes.length - 1) * 1000) / windowMs;
  }

  function timingMeta() {
    const done = passCount + failCount;
    const rate = currentRate();
    let remain = "--:--";
    if (rate !== null) {
      const remaining = Math.max(0, total - done);
      remain = formatDuration((remaining / rate) * 1000);
    }
    return {
      passes: passCount,
      fails: failCount,
      rate: rate !== null ? rate.toFixed(1) : "--",
      spent: formatDuration(Date.now() - runStart),
      remain,
    };
  }

  // Use a Set to track active tasks for O(1) additions/deletions
  const activeTasks = new Set();

  // Detailed tracking
  let stats = freshStats();
  // One-line "why" per failing test for the markdown report (keyed with
  // scenario suffix; stats arrays keep plain paths for set-diffing)
  const runDetails = {};

  console.log(
    pc.cyan(`\n🚀 Iridium Test-262 Runner (${js3 ? "--js3" : "--iri"})`),
  );
  const target = grouped
    ? `${filterLines.length} filters from ${path.basename(filterFileArg)}`
    : filter || "All tests";
  console.log(
    pc.gray(
      `Threads: ${THREADS}${threadsArg ? "" : " (auto)"} | Target: ${target}`,
    ),
  );
  console.log(
    (rerunSrc
      ? pc.gray(
          `Rerun mode:   only failures from ${path.basename(rerunFile)}\n`,
        )
      : "") +
      (saveRun
        ? pc.gray(`Saving run:   ${resolveRunRef(saveRun)}\n`)
        : "") +
      (saveArtifacts
        ? pc.gray(
            `Artifacts:    ${path.relative(process.cwd(), saveArtifactsRoot)}/\n`,
          )
        : "") +
      "\n",
  );

  const progressBar = new cliProgress.SingleBar(
    {
      format: `${pc.yellow("{bar}")} {percentage}% | {value}/{total} Tests | ${pc.green("PASS: {passes}")} | ${pc.red("FAIL: {fails}")} | ${pc.cyan("{rate} t/s")} | ${pc.dim("\u23F1 {spent}")} | ${pc.magenta("ETA {remain}")}`,
      barCompleteChar: "\u2588",
      barIncompleteChar: "\u2591",
      hideCursor: true,
      stream: process.stdout,
    },
    cliProgress.Presets.shades_classic,
  );

  progressBar.start(total, 0, {
    passes: 0,
    fails: 0,
    rate: "--",
    spent: "00:00",
    remain: "--:--",
  });

  for (const test of allTests) {
    // 1. Create the async task promise
    const taskPromise = (async (t) => {
      try {
        // Compile (dump modes) + direct artifact exec. With --saveArtifacts
        // the temp dir is kept until the run-wide sweep at the end so the
        // saveArtifacts pass can copy the compiled artifact out of it.
        const mode = js3 ? "--js3" : "--iri";
        const pair = await worker.runTest(t, mode, runTempRoot, saveArtifacts);
        const baseline = pair.baseline;
        const iridium = pair.iridium;

        // Status definitions
        const isBaselinePass = baseline.status === "PASS";
        const isIridiumPass = iridium.status === "PASS";
        // "Both failed the same way" requires agreeing on the error type
        // AND the normalized first error line (A3): two different
        // TypeErrors are not an error match.
        const errorsMatch =
          baseline.errorType === iridium.errorType &&
          (baseline.errorSig || "") === (iridium.errorSig || "");

        // Categorize the result
        let category;
        if (isBaselinePass && isIridiumPass) category = "passBoth";
        else if (
          ignoreWith &&
          iridium.message &&
          iridium.message.includes("JS3 build failed")
        )
          category = "ignored";
        else if (iridium.message && iridium.message.includes("IRI build failed"))
          category = "ignored";
        else if (!isBaselinePass && !isIridiumPass)
          category = errorsMatch ? "failBothEMatch" : "failBothEMismatch";
        else if (isBaselinePass && !isIridiumPass)
          category =
            iridium.errorType === "TimeoutError"
              ? "timeoutRegression"
              : "regression";
        else if (!isBaselinePass && isIridiumPass) category = "overCompliant";
        else throw new Error("Unreachable...");

        if (PASSING_CATS.has(category)) passCount++;
        else failCount++;
        recordResult(stats, category, t.file);
        if (t.group) {
          const g = groupStats.get(t.group);
          if (PASSING_CATS.has(category)) g.pass++;
          else g.fail++;
          recordResult(g.stats, category, t.file);
        }

        // Evidence for the markdown report: one entry per task (scenario-
        // tagged), for every non-pass category, including the error lines
        // from both engines.
        if (category !== "passBoth") {
          runDetails[detailKey(t)] = {
            category,
            baseline: isBaselinePass
              ? "PASS"
              : oneLine(baseline.errorSig || baseline.message || baseline.errorType || "FAIL"),
            candidate: isIridiumPass
              ? "PASS"
              : oneLine(iridium.errorSig || iridium.message || iridium.errorType || "FAIL"),
          };
        }

        const prefix = SAVE_ARTIFACT_PREFIX[category];
        if (saveArtifacts && prefix)
          await worker.saveArtifacts(t, baseline, iridium, prefix, artifactTag);
      } catch (err) {
        failCount++;
        if (t.group) groupStats.get(t.group).fail++;
      } finally {
        completionTimes.push(Date.now());
        if (completionTimes.length > SAMPLE_WINDOW) completionTimes.shift();
        progressBar.update(passCount + failCount, timingMeta());
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

  // Remove this run's temp root (this also drops any dirs kept for
  // --saveArtifacts), then sweep for strays from previous runs that were
  // SIGKILLed (the exit hook only handles the current run).
  fs.rmSync(runTempRoot, { recursive: true, force: true });
  const sweptTemps = sweepCompileTemps();
  if (sweptTemps > 0)
    console.log(
      pc.gray(
        `🧹 Removed ${sweptTemps} leftover compile temp dir(s) from ${os.tmpdir()}`,
      ),
    );

  // --- Final Report ---
  const successRate = ((passCount / total) * 100).toFixed(2);
  const wallMs = Date.now() - runStart;
  const avgRate = wallMs > 0 ? (total / (wallMs / 1000)).toFixed(2) : "0.00";

  console.log(`\n${pc.bold("--- Final Report ---")}`);
  console.log(`${pc.green("Total:")}                        ${total}`);
  console.log(
    `${pc.cyan("Duration:")}                     ${formatDuration(wallMs)} @ ${avgRate} tests/s (${THREADS} threads)`,
  );
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
    `${pc.red("✖ Timeout Regressions:")}        ${stats.timeoutRegression.length}`,
  );
  console.log(
    `${pc.dim("⊘ Ignored (Compile Errors):")}    ${stats.ignored.length}`,
  );

  console.log(`\n${pc.cyan("📊 Overall Bar Rate:")}          ${successRate}%`);

  // --- Per-filter-group breakdown (--filters <file>) ---
  if (grouped && groupStats.size) {
    console.log(`\n${pc.cyan("📂 Filter groups:")}`);
    for (const [line, g] of groupStats) {
      const bad =
        g.stats.regression.length +
        g.stats.timeoutRegression.length +
        g.stats.failBothEMismatch.length;
      console.log(
        `   ${line.padEnd(42)} ${String(g.total).padStart(5)} tests | ${pc.green(`${g.pass} pass`)} | ${bad ? pc.red(`${bad} fail`) : pc.gray("0 fail")}${g.stats.ignored.length ? pc.gray(` | ${g.stats.ignored.length} ignored`) : ""}`,
      );
    }
  }

  // --- Saved run (--save-run) ---
  const report = {
    meta: {
      generated: new Date().toISOString(),
      name: saveRun || null,
      mode: modeName,
      filter: filter || null,
      filters: filterLines.length ? filterLines : null,
      filterFile: filterFileArg || null,
      rerun: rerunSrc || null,
      threads: THREADS,
      durationMs: wallMs,
      total,
      passCount,
      failCount,
    },
    stats: sortedStats(stats),
    details: runDetails,
    groups: grouped
      ? Object.fromEntries(
          [...groupStats].map(([line, g]) => [
            line,
            {
              total: g.total,
              pass: g.pass,
              fail: g.fail,
              stats: sortedStats(g.stats),
            },
          ]),
        )
      : null,
  };

  // --- Run artifacts on disk ---
  // JSON (machine): only with --save-run; powers --compare/--rerun.
  // Markdown (human): ALWAYS — the statistics file the terminal output
  // merely summarizes.
  const jsonPath = saveRun ? resolveRunRef(saveRun) : null;
  const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const mdPath = jsonPath
    ? jsonPath.replace(/\.json$/, "") + ".md"
    : path.join(path.resolve(__dirname, "reports"), `${modeName}-${ts}.md`);

  if (jsonPath) {
    try {
      fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
      fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
      console.log(pc.gray(`\n💾 Run saved: ${jsonPath}`));
      console.log(
        pc.gray(`   compare later with: node run.cjs --compare <other> ${saveRun}`),
      );
    } catch (err) {
      console.log(pc.red(`\n⚠ Could not save run: ${err.message}`));
    }
  }

  let mdWritten = false;
  try {
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    fs.writeFileSync(
      mdPath,
      buildMarkdownReport({
        report,
        details: runDetails,
        mdPath,
        jsonPath,
        cmdLine: process.argv
          .slice(1)
          .map((a) => (/\s/.test(a) ? JSON.stringify(a) : a))
          .join(" "),
      }),
    );
    mdWritten = true;
    console.log(pc.gray(`📄 Report: ${path.relative(process.cwd(), mdPath)}`));
  } catch (err) {
    console.log(pc.red(`⚠ Could not write markdown report: ${err.message}`));
  }

  // Compact stderr summary (the full lists live in the markdown report).
  let outputString = "=== TEST RUN STATISTICS ===\n\n";
  outputString += `MODE: ${modeName}\n`;
  outputString += `FILTER: ${filterLines.length ? filterLines.join(", ") : "(all tests)"}\n`;
  outputString += `DURATION: ${formatDuration(wallMs)}\n`;
  outputString += `THROUGHPUT: ${avgRate} tests/s\n`;
  outputString += `THREADS: ${THREADS}\n`;
  outputString += `TOTAL: ${total}\n`;
  outputString += `PASS: ${passCount} (${successRate}%)\n`;
  outputString += `FAIL: ${failCount}\n`;
  for (const [cat, title] of MD_SECTIONS)
    outputString += `${cat.toUpperCase()}: ${stats[cat].length}\n`;
  if (grouped && groupStats.size) {
    outputString += `\nFILTER GROUPS (${groupStats.size}):\n`;
    for (const [line, g] of groupStats)
      outputString += `  ${line}: ${g.total} tests, ${g.pass} pass, ${g.fail} fail\n`;
  }
  outputString += `\nMARKDOWN REPORT: ${mdWritten ? mdPath : "(write failed)"}\n`;
  if (jsonPath) outputString += `JSON RUN: ${jsonPath}\n`;

  // Write synchronously to fd 2: an async write to a pipe could be
  // truncated by the explicit exit below (stderr is often redirected).
  fs.writeSync(2, outputString);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
