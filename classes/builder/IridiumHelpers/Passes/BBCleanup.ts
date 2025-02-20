// remove redundant BBs

import { BB } from "../BB.ts";
import { traverseBBLexical, traverseFGLexical } from "../Visitors/traverse.ts";
import { IRIDIUM_FG } from "./PTA/IRIDIUM_FG.ts";

export function cleanupBBs(fg: IRIDIUM_FG) {
  let change;
  do {
    change = false;
    traverseBBLexical(fg, (bb: BB, fg: IRIDIUM_FG) => {
      // Apply Transform if:
      //  u[E1] --> v[E2] where E1 == E2 [remove redundant BB nodes]
      //
      // Predicate:
      //  1. "v" is the only successor of "u"
      //  2. "u" is the only predecessor of "v"
      //  3. Both operate on the same environment
      const u = "" + bb.idx;
      const uNode = bb;
      const succ = fg.successors(u);
      if (succ && succ.length === 1) {
        const v = succ[0];
        const vNode = fg.getBBNode(v);
        const predOfV = fg.predecessors(v);
        if (predOfV && predOfV.length === 1) {
          const env1 = bb.env;
          const env2 = fg.getBBNode(v).env;
          const scope1 = bb.scope;
          const scope2 = fg.getBBNode(v).scope;
          if (env1 === env2 && scope1 === scope2) {
            //
            // Transformation:
            //   1. remove edge from u -> v
            //   2. Copy all statements from v to u
            //   3. forward successors of v to u
            //   4. Copy branching info of v to u
            //   5. Remove node v from the graph
            // remove edge between the current node and succ node
            fg.removeEdge(u, v);

            // Copy all statements from succ node to the current node
            vNode.statements.forEach((i) => uNode.statements.push(i));

            // Forward Successors
            const succOfV = fg.successors(v);

            // Add all successors of succ to current nodes successor list
            for (const s of succOfV ? succOfV : []) {
              fg.setEdge(u, s);
            }

            if (bb.branchTerminal !== undefined)
              throw new Error(
                "Unconditional goto, marked with a branch terminal, invalid code generation",
              );

            // Copy terminal information
            uNode.branchTerminal = vNode.branchTerminal;

            // Remove unreachable node
            fg.removeNode(v);

            change = true;
          }
        }
      }
    });
  } while (change);

  // When backpatching break/continue statements, we might end up with unreachable BBs
  // non-root sources are basically dead code...
  do {
    change = false;
    // Find unreachable nodes
    traverseFGLexical(fg, (currFG: IRIDIUM_FG) => {
      const sources = currFG.sources();
      for (const s of sources)
        if (s !== "" + currFG.rootBB.idx) {
          currFG.removeNode(s);
          change = true;
        }
    });
  } while (change);
}
