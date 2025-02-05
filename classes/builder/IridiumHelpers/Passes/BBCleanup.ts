// remove redundant BBs

import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseBBLexical, traverseFGLexical } from "../Visitors/traverse.ts";

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
      let u = '' + bb.idx
      let uNode = bb
      let succ = fg.successors(u)
      if (succ && succ.length === 1) {
        let v = succ[0]
        let vNode = fg.getBBNode(v)
        let predOfV = fg.predecessors(v)
        if (predOfV && predOfV.length === 1) {
          let env1 = bb.env
          let env2 = fg.getBBNode(v).env
          let scope1 = bb.scope
          let scope2 = fg.getBBNode(v).scope
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
            vNode.statements.forEach(i => uNode.statements.push(i))

            // Forward Successors
            let succOfV = fg.successors(v)

            // Add all successors of succ to current nodes successor list
            for (let s of succOfV ? succOfV : []) {
              fg.setEdge(u, s);
            }

            if (bb.branchTerminal !== undefined) throw new Error("Unconditional goto, marked with a branch terminal, invalid code generation")

            // Copy terminal information
            uNode.branchTerminal = vNode.branchTerminal

            // Remove unreachable node
            fg.removeNode(v)

            change = true;

          }
        }
      }
    })
  } while (change);

  do {
    change = false;
    traverseFGLexical(fg, (currFG: IRIDIUM_FG) => {
      // When backpatching break/continue statements, we might end up with unreachable BBs
      // non-root sources are basically dead code...
      let sources = currFG.sources()
      for (let s of sources) {
        if (s !== ('' + currFG.rootBB.idx)) {
          fg.removeNode(s)
          change = true
        }
      }
    })

  } while(change)

  
}
