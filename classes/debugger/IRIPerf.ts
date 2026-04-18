
//
// Simple scoped timer
//
// [----------] [---------]
//   [-----][-]  [-][---]
//

const DEBUG_LOG: Array<[number, string]> = [];

const STACK: Array<string> = []

export function tick(name: string) {
  STACK.push(name);
  DEBUG_LOG.push([performance.now(), name]);
}

export function tock(name: string) {
  let last = STACK.pop();
  if (last === undefined) {

    throw new Error("TICK TOCK FAILED TO RECONCILE SCOPES, last is not a string");
  }
  const res: Array<string> = [last];
  while (last != name) {
    last = STACK.pop();
    if (last === undefined) throw new Error("TICK TOCK FAILED TO RECONCILE SCOPES");
    res.push(last);
  }

  for (let e of res) {
    DEBUG_LOG.push([performance.now(), e]);
  }
}

export function printReport() {
  interface Scope {
    name: string;
    start: number;
    end: number;
    duration: number;
    children: Scope[];
  }

  const pendingStarts = new Map<string, number[]>();
  const scopes: Scope[] = [];

  // 1. Pair up starts and ends from the flat log
  for (const [time, name] of DEBUG_LOG) {
    const starts = pendingStarts.get(name) || [];
    // If we've seen this name as a start, the next occurrence is an end
    if (starts.length > 0) {
      const start = starts.pop()!;
      scopes.push({
        name,
        start,
        end: time,
        duration: time - start,
        children: []
      });
    } else {
      // Otherwise, record the start time
      starts.push(time);
      pendingStarts.set(name, starts);
    }
  }

  // Handle any scopes that were never closed
  const endTime = DEBUG_LOG.length > 0 ? DEBUG_LOG[DEBUG_LOG.length - 1][0] : performance.now();
  for (const [name, starts] of pendingStarts.entries()) {
    for (const start of starts) {
      scopes.push({ name: `${name} (UNCLOSED)`, start, end: endTime, duration: endTime - start, children: [] });
    }
  }

  // 2. Sort by start time, and then build the hierarchy tree
  scopes.sort((a, b) => a.start === b.start ? b.end - a.end : a.start - b.start);

  const rootScopes: Scope[] = [];
  const buildStack: Scope[] = [];

  for (const scope of scopes) {
    while (buildStack.length > 0) {
      const parent = buildStack[buildStack.length - 1];
      // A scope is a child if it started while the parent was still running
      if (scope.start >= parent.start && scope.start <= parent.end) {
        break;
      }
      buildStack.pop();
    }

    if (buildStack.length === 0) rootScopes.push(scope);
    else buildStack[buildStack.length - 1].children.push(scope);

    buildStack.push(scope);
  }

  // 3. Print the tree to the CLI
  console.log("\n\x1b[1m⏱️  IRIPerf\x1b[0m\n");

  function printTree(node: Scope, prefix: string = "", isLast: boolean = true, parentDuration?: number) {
    const branch = isLast ? "└── " : "├── ";
    const nameColor = "\x1b[33m"; // Yellow
    const timeColor = "\x1b[36m"; // Cyan
    const dimColor = "\x1b[90m";  // Gray
    const reset = "\x1b[0m";

    const durationStr = `${node.duration.toFixed(2)}ms`;
    const pctStr = parentDuration ? ` (${((node.duration / parentDuration) * 100).toFixed(1)}%)` : "";

    console.log(`${dimColor}${prefix}${branch}${reset}${nameColor}${node.name}${reset} ${timeColor}${durationStr}${reset}${dimColor}${pctStr}${reset}`);

    const childPrefix = prefix + (isLast ? "    " : "│   ");
    for (let i = 0; i < node.children.length; i++) {
      printTree(node.children[i], childPrefix, i === node.children.length - 1, node.duration);
    }
  }

  for (let i = 0; i < rootScopes.length; i++) {
    printTree(rootScopes[i], "", i === rootScopes.length - 1);
  }
  console.log(); // Trailing newline
}
