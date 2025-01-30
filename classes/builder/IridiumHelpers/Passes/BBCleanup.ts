// remove redundant BBs

import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseBBLexical } from "../Visitors/traverse.ts";

export function cleanupBBs(fg: IRIDIUM_FG) {
  let change;
  do {
    change = false;
    traverseBBLexical(fg, (bb: BB, fg: IRIDIUM_FG) => {
      if (!bb || !fg.hasNode('' + bb.idx)) return; // We are removing nodes on the fly, skip nodes that were previously removed
      
      let succ = fg.successors('' + bb.idx)
      if (succ && succ.length === 1 && fg.node(succ[0]).env === bb.env) {
        let succNode = fg.getBBNode(succ[0])
        
        
        // Copy all statements from succ node to the current node
        succNode.statements.forEach(i => bb.statements.push(i))

        // remove edge between the current node and succ node
        fg.removeEdge('' + bb.idx, succ[0]);

        let succList = fg.successors(succ[0])

        // Add all successors of succ to current nodes successor list
        for (let s of succList ? succList : []) {
          fg.setEdge('' + bb.idx, s);
        }

        if (bb.branchTerminal !== undefined) throw new Error("Unconditional goto, marked with a branch terminal, invalid code generation")

        // Copy terminal information
        bb.branchTerminal = succNode.branchTerminal

        fg.removeNode(succ[0])

        change = true;
        console.log("Removed BB", succ[0])
      }
    })
  } while(change)
}
