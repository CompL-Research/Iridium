//
// Combine all return statements in functions
//

import GLIB from "#graphlib";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { IS_Return } from "../ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS1_AssignmentStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB, FunctionBB } from "../BB.ts";
import {
  traverseFGLexical,
  traverseInstruction,
} from "../Visitors/traverse.ts";
import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";

export function normalizeReturns(rootFG: IRIDIUM_FG) {
  traverseFGLexical(rootFG, (fg: IRIDIUM_FG) => {
    const dTree = GLIB.alg.dominatorTarjan(fg, "" + fg.rootBB.idx, false);
    const recursivelyFindHead = (curr: string) => {
      const currBB = fg.getBBNode(curr);
      if (currBB instanceof FunctionBB) {
        return currBB.retBB;
      }
      const preds = dTree.predecessors(curr);
      if (!preds)
        throw new Error("Expected successors to exist!! failed to match break");
      if (preds.length !== 1)
        throw new Error("A Dtree node must have exactly one predecessor");
      return recursivelyFindHead(preds[0]);
    };

    const updateSet: Set<BB> = new Set();
    traverseInstruction(fg, (inst: ALL_IS, bb: BB) => {
      if (inst instanceof IS_Return) {
        updateSet.add(bb);
        const headBB = recursivelyFindHead("" + bb.idx);
        inst.bb = headBB;
      }
    });

    for (const bb of updateSet) {
      const bbInQuestion = "" + bb.idx;
      const stmts = [];
      let i = 0;
      while (true) {
        const curr = bb.statements[i++];

        if (curr instanceof IS_Return) {
          if (!curr.bb)
            throw new Error(
              `Tried patching an unresolved return stmt: BB${bbInQuestion}`,
            );
          const targetBB = "" + curr.bb.idx;
          const existingSuccBB = fg.successors(bbInQuestion);
          if (!existingSuccBB) throw new Error("Expected the node to exist");
          for (const b of existingSuccBB) {
            fg.removeEdge(bbInQuestion, b);
          }
          fg.setEdge(bbInQuestion, targetBB, "RETURN");

          if (curr.argument)
            stmts.push(
              new IS1_AssignmentStmt(curr, curr.bb.arg, curr.argument),
            );
          break;
        }

        stmts.push(curr);
      }
      bb.statements = stmts;
    }
  });
}
