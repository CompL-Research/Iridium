// Hoist all declarations to their dominating scope's BB
// 
// For a given (fg: FlowGraph):
//  1. envs <- allContainedEnvs(fg)
//  2. For a given (e : Environment) of envs:
//     a. BBs <- all BB's that operate on e
//     b. mapInPlaceAllDeclarations in BBs <- Update it with the new "IS1" declarations 
//     c. dBB_e = findDominatingBB(BBs), the basic block that dominates all the Basic Blocks operating on some env = e
//     d. move all declarations to dBB
// 

import debugConfig from "#debugConfig";
import GLIB from "#graphlib";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IS_Noop } from "../ALL_IS/ALL_IS.ts";
import { IS_FunDecl } from "../ALL_IS/IS_FunDecl.ts";
import { IS1_AssignmentStmt, IS1_DeclarationStmt, IS_ArrPatVarDecl, IS_ObjPatVarDecl, IS_SimpleVarDecl } from "../ALL_IS/IS_VarDecl.ts";
import { IV_NUBD } from "../ALL_RVal/IV_NonLang.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseFGLexical } from "../Visitors/traverse.ts";

let isAncestor = (u, v, dTree) => {
  const uData = dTree.node(u);
  const vData = dTree.node(v);
  return uData.inTime <= vData.inTime && uData.outTime >= vData.outTime;
}

export function hoistDeclarations(rootFG: IRIDIUM_FG) {
  let todo: Set<IRIDIUM_FG> = new Set()
  traverseFGLexical(rootFG, (fg: IRIDIUM_FG) => todo.add(fg));
  for (let fg of todo) {
    let envBBMap = fg.getEnvBBMap()

    for (let [e, BBsSet] of envBBMap) {
      let toDeclare: Array<IS_SimpleVarDecl | IS_ArrPatVarDecl | IS_ObjPatVarDecl | IS_FunDecl> = new Array()
      let BBs = [...BBsSet]
      BBs.map(bb => {
        bb.statements = bb.statements.map((i) => {
          if (i instanceof IS_SimpleVarDecl || i instanceof IS_ArrPatVarDecl || i instanceof IS_ObjPatVarDecl) {
            toDeclare.push(i)
            if (i.RVal)
              return new IS1_AssignmentStmt(i, i.LVal, i.RVal);
            else
              return new IS_Noop()
          } else if (i instanceof IS_FunDecl) {
            toDeclare.push(i)
          }
          return i;
        })
        return bb;
      })

      let rootBBName = '' + fg.rootBB.idx;
      let dTree = GLIB.alg.dominatorTarjan(fg, rootBBName, false)
      // @ts-ignore
      dTree = GLIB.alg.dominatorTarjan.getDfsTree(dTree, rootBBName);

      BBs.sort((a, b) => dTree.node('' + a.idx).dfsId - dTree.node('' + b.idx).dfsId)

      let dBB = BBs[0]

      // Assert that the dBB is an ancestor of all other BBs
      BBs.forEach(b => {
        // Skip Self
        if (b === dBB) return;

        if (!isAncestor('' + dBB.idx, '' + b.idx, dTree)) debugConfig.logger.throwIriError("Expected dBB to be an ancestor of all BBs")
      })

      // Generate and add declaratopms tp dBB
      let updatedDeclarations = toDeclare.map(d => {
        if (d instanceof IS_FunDecl) return new IS1_DeclarationStmt(d, d.name, new IV_NUBD())
        if (d.KIND === "let" || d.KIND === "const") {
          return new IS1_DeclarationStmt(d, d.LVal, new IV_NUBD())
        } else {
          return new IS1_DeclarationStmt(d, d.LVal, new IV_Identifier(undefined, "undefined"))
        }
        
      })
      dBB.statements = [...updatedDeclarations, ...dBB.statements]

    }
  }
}
