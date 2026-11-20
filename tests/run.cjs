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
  "unsupported",
];
// Categories the runner counts toward passCount (the "bar")
const PASSING_CATS = new Set([
  "passBoth",
  "failBothEMatch",
  "overCompliant",
  "ignored",
  "unsupported",
]);
const SAVE_ARTIFACT_PREFIX = {
  ignored: "IGNO",
  failBothEMatch: "FBOT",
  failBothEMismatch: "EMIS",
  regression: "REGR",
  timeoutRegression: "REGR",
  overCompliant: "OVER",
  unsupported: "UNSP",
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
    unsupported: [],
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
  ["unsupported", "⊘ Unsupported (by design)"],
];

// Collapse to one readable line (compile failures carry multi-line pino JSON).
const oneLine = (s) => String(s).replace(/\s+/g, " ").trim().slice(0, 240);

function mdCell(s) {
  // backticks + escaped pipes: markdown tables split on | inside code too
  return String(s).replace(/\|/g, "\\|");
}

// The point of the non-pass sections is to say what support is missing, so they
// are grouped by test262 feature, by compiler reason, and by area of the suite
// as well as by path. features: has an inline ([a, b]) and a block (- a) form.
// The YAML block follows a copyright header in most files, so it is not anchored.
const FRONTMATTER = /\/\*---([\s\S]*?)---\*\//;
function testFeatures(relPath) {
  const out = new Set();
  let src;
  try {
    src = fs.readFileSync(path.join(TEST262_PATH, relPath), "utf8");
  } catch {
    return out;
  }
  const fm = (FRONTMATTER.exec(src) || [])[1] || "";
  const inline = /features:\s*\[([^\]]*)\]/.exec(fm);
  if (inline) {
    for (const f of inline[1].split(",")) if (f.trim()) out.add(f.trim());
  } else {
    const block = /^features:\s*\n((?:[ \t]*-[ \t]*.+\n?)+)/m.exec(fm);
    if (block)
      for (const l of block[1].split("\n")) {
        const f = l.replace(/^[ \t]*-[ \t]*/, "").trim();
        if (f) out.add(f);
      }
  }
  return out;
}

function gapGroups(details, cat, by) {
  const counts = new Map();
  const bump = (k) => counts.set(k, (counts.get(k) || 0) + 1);
  for (const [key, d] of Object.entries(details || {})) {
    if (d.category !== cat) continue;
    const rel = key.replace(/ \(strict mode\)$/, "");
    if (by === "feature") for (const f of testFeatures(rel)) bump(f);
    else if (by === "reason") bump(d.note || d.candidate || "(no reason recorded)");
    else bump(rel.split("/").slice(0, 4).join("/"));
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

// Ranked gap tables, one block per non-pass category that has rows.
function buildGapBreakdown(report, details) {
  const L = [];
  for (const [cat, title] of MD_SECTIONS) {
    const arr = report.stats[cat] || [];
    if (!arr.length || cat === "overCompliant") continue;
    const tables = [
      ["feature", "feature"],
      ["compiler reason / error", "reason"],
      ["suite area", "dir"],
    ]
      .map(([label, by]) => [label, gapGroups(details, cat, by).slice(0, 12)])
      .filter(([, rows]) => rows.length);
    if (!tables.length) continue;
    L.push("", `### ${title} (${arr.length})`, "");
    for (const [label, rows] of tables) {
      L.push("", `| ${label} | rows |`, "|---|--:|");
      for (const [k, n] of rows) L.push(`| \`${mdCell(k)}\` | ${n} |`);
    }
  }
  if (!L.length) return L;
  return [
    "",
    "## Feature gap breakdown",
    "",
    "_Rows, not tests: one test can declare several features, and a test runs",
    "twice (sloppy + strict) unless it is `onlyStrict`._",
    ...L,
  ];
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
    `| passed (bar) | **${m.passCount}** (${rate}%) — passBoth ${report.stats.passBoth}, errMatch ${report.stats.failBothEMatch.length}, overCompliant ${report.stats.overCompliant.length}, ignored ${report.stats.ignored.length}, unsupported ${report.stats.unsupported.length} |`,
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

  // What support is missing, ranked, before the per-test evidence below.
  L.push(...buildGapBreakdown(report, details));

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
            ...(d.note ? [`  reason   : ${d.note}`] : []),
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

// Feature gaps that are unsupported by design. When the candidate dies with one
// of these compiler errors the row is a known gap, not a regression: it joins
// the passing side of the bar and gets its own report section.
// --unsupported=<file> replaces this list with a JSON array of
// { "needle": <substring of the candidate error>, "reason": <shown text> }.
const UNSUPPORTED_DEFAULT = [
  {
    needle: "unhandled Statement->WithStatement",
    reason: "with statement (support removed by design)",
  },
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
  --ignore-with         count "JS3 build failed"/"Babel parsing failed" as
                        ignored even when the baseline passes (they are always
                        ignored when the baseline fails too)
  --ignore-name         skip test files containing "-name-"
  --unsupported=<file>  JSON array of {needle, reason} describing by-design
                        feature gaps; a candidate error containing a needle is
                        counted UNSUPPORTED instead of as a regression (the
                        built-in list covers the with statement)
  --no-unsupported      disable that bucket
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
  // By-design feature gaps (see UNSUPPORTED_DEFAULT). --unsupported=<file>
  // replaces the built-in list with a JSON array of { needle, reason };
  // --no-unsupported turns the bucket off.
  const unsupportedEq = args.find((a) => a.startsWith("--unsupported="));
  const UNSUPPORTED = args.includes("--no-unsupported")
    ? []
    : unsupportedEq
      ? JSON.parse(
          fs.readFileSync(
            path.resolve(unsupportedEq.slice("--unsupported=".length)),
            "utf8",
          ),
        )
      : UNSUPPORTED_DEFAULT;
  const unsupportedReasonOf = (message) => {
    if (!message) return null;
    for (const gap of UNSUPPORTED)
      if (message.includes(gap.needle)) return gap.reason;
    return null;
  };

  // A compile failure is a feature gap, so the report should name the construct
  // that is missing. The CLI logs it inside a pino JSON line ("IRI/JS3 build
  // failed" is only the wrapper) and the Forge aborts with a `what():` line, so
  // dig the real message out of both envelopes.
  const compileGapReasonOf = (message) => {
    if (!message) return null;
    let text = message;
    for (const line of message.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("{") || !t.endsWith("}")) continue;
      try {
        const p = JSON.parse(t);
        const errors = Array.isArray(p.errors) ? p.errors : [];
        const payload = [...errors, p.msg].filter((x) => typeof x === "string");
        if (payload.length) text = payload.join("\n");
        break;
      } catch {
        /* not a log line, keep scanning */
      }
    }
    const lines = text
      .split("\n")
      .map((l) => l.trim().replace(/^Error:\s+/, "").replace(/^what\(\):\s*/, ""))
      .filter(Boolean);
    // "IRI build failed" is true of every row in this bucket and says nothing,
    // so it is never the answer: prefer the compiler's own marker (a ::TODO::
    // from a lowering that is not written yet, or the Forge abort message), then
    // the first real line of the log, which is the message that was thrown.
    const wrapper = /^(IRI|JS3|Babel) .*failed(::.*)?$/;
    const real = lines.filter((l) => !wrapper.test(l) && !/^terminate called/.test(l));
    const pick = (re) => real.find((l) => re.test(l));
    const found =
      pick(/::TODO::/) ||
      pick(/TODO \/\/ unhandled /) ||
      pick(/unhandled [A-Za-z]+->/) ||
      pick(/Unhandled [A-Za-z]/) ||
      pick(/^(SyntaxError|TypeError|RangeError|ReferenceError)\b/) ||
      pick(/^(Expected|Found|.*integrity-check failed|Failed to resolve)/) ||
      real[0] ||
      lines[0];
    if (!found || wrapper.test(found)) return null;
    // Both spellings of the compiler's not-implemented-yet marker mean the same
    // thing, so group them under one label.
    return found
      .replace(/^(TODO \/\/|::TODO::)\s*/, "TODO: ")
      .replace(/^IRI build failed\s*/, "")
      .replace(/::TODO::\s*/, "TODO: ")
      .slice(0, 160);
  };

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
        // A candidate error that matches the by-design gap table is a known
        // gap; the reason is kept for the report's unsupported section.
        const unsReason = !isIridiumPass
          ? unsupportedReasonOf(iridium.message)
          : null;
        if (isBaselinePass && isIridiumPass) category = "passBoth";
        else if (unsReason) category = "unsupported"; // known by-design gap
        else if (
          iridium.message &&
          (iridium.message.includes("JS3 build failed") ||
            iridium.message.includes("Babel parsing failed")) &&
          (ignoreWith || !isBaselinePass)
        )
          // The frontend reports a construct it does not lower. When the
          // reference engine rejects the same test there is nothing to compare,
          // so the row is a shared gap rather than a failure of ours.
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
            // By-design gaps carry the gap-table reason; a plain compile failure
            // carries the compiler's own message so the gap tables can rank it.
            note:
              unsReason ||
              (category === "ignored"
                ? compileGapReasonOf(iridium.message)
                : null),
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
    `${pc.dim("⊘ Unsupported (By Design):")}     ${stats.unsupported.length}`,
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
        `   ${line.padEnd(42)} ${String(g.total).padStart(5)} tests | ${pc.green(`${g.pass} pass`)} | ${bad ? pc.red(`${bad} fail`) : pc.gray("0 fail")}${g.stats.ignored.length ? pc.gray(` | ${g.stats.ignored.length} ignored`) : ""}${g.stats.unsupported.length ? pc.gray(` | ${g.stats.unsupported.length} unsupported`) : ""}`,
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
