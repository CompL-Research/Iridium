// remove redundant BBs

import { BB, UnconditionalGoto } from "../BB.ts";
import { traverseBBLexical } from "../Visitors/traverse.ts";

export function cleanupBBs(bb: BB) {
  traverseBBLexical(bb, (bb, _) => {
    if (bb.terminal instanceof UnconditionalGoto) {
      let succ = bb.terminal.getSuccessors()
      if (succ.length === 1 && bb.env === succ[0].env && bb.scope === succ[0].scope) {
        // Merge the succ and curr bb
        bb.statements = [...bb.statements, ...succ[0].statements]
        bb.terminal = succ[0].terminal
      }

      if ((succ.length === 1 && succ[0].preds.size === 1) && (succ[0].statements.length === 0)) {
        bb.terminal = succ[0].terminal
      }
    }
  })
}
