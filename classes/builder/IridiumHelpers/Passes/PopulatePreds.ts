// 
// Visit each BB and populate predecessor nodes of all the children
// 

import { BB } from "../BB.ts";
import { traverseBBLexical } from "../Visitors/traverse.ts";

export function populatePreds(bb: BB) {
  traverseBBLexical(bb, (bb, _) => {
    let succ = bb.terminal.getSuccessors()
    for (let b of succ) {
      b.preds.add(bb)
    }
  })
}