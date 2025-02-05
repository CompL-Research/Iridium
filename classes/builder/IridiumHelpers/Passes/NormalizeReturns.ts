// 
// Combine all return statements in functions
// 

import GLIB from "#graphlib";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { IS_Return } from "../ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS1_AssignmentStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB, FunctionBB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseFGLexical, traverseInstruction } from "../Visitors/traverse.ts";

export function normalizeReturns(rootFG: IRIDIUM_FG) {
  traverseFGLexical(rootFG, (fg: IRIDIUM_FG) => {
    let dTree = GLIB.alg.dominatorTarjan(fg, '' + fg.rootBB.idx, false);
    let recursivelyFindHead = (curr: string) => {
      let currBB = fg.getBBNode(curr)
      if (currBB instanceof FunctionBB) {
        return currBB.retBB
      }
      let preds = dTree.predecessors(curr)
      if (!preds) throw new Error("Expected successors to exist!! failed to match break")
      if (preds.length !== 1) throw new Error("A Dtree node must have exactly one predecessor")
      return recursivelyFindHead(preds[0])
    }

    let updateSet: Set<BB> = new Set()
    traverseInstruction(fg, (inst: ALL_IS, bb: BB) => {
      if (inst instanceof IS_Return) {
        updateSet.add(bb)
        let headBB = recursivelyFindHead('' + bb.idx)
        inst.bb = headBB
      }
    })

    for (let bb of updateSet) {
      let bbInQuestion = '' + bb.idx
      let stmts = []
      let i = 0;
      while (true) {
        let curr = bb.statements[i++]

        if (curr instanceof IS_Return) {
          if (!curr.bb) throw new Error(`Tried patching an unresolved return stmt: BB${bbInQuestion}`)
          let targetBB = '' + curr.bb.idx
          let existingSuccBB = fg.successors(bbInQuestion)
          if (!existingSuccBB) throw new Error("Expected the node to exist")
          for (let b of existingSuccBB) {
            fg.removeEdge(bbInQuestion, b)
          }
          fg.setEdge(bbInQuestion, targetBB, "RETURN")

          if (curr.argument) stmts.push(new IS1_AssignmentStmt(curr, curr.bb.arg, curr.argument));
          break;
        }

        stmts.push(curr)
      }
      bb.statements = stmts;
    }
  })

}

