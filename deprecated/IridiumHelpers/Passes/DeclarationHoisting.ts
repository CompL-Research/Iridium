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
import { IS_BImport, IS_CImport } from "../ALL_IS/IS_Imports_Exports.ts";
import {
  IS1_AssignmentStmt,
  IS1_DeclarationStmt,
  IS_ArrPatVarDecl,
  IS_ClassNameInitStmt,
  IS_ObjPatVarDecl,
  IS_SimpleVarDecl,
  IS_ThisInitStmt,
} from "../ALL_IS/IS_VarDecl.ts";
import { IV_FunctionExpression } from "../ALL_RVal/IV_FunctionExpression.ts";
import { IV_NUBD } from "../ALL_RVal/IV_NonLang.ts";
import { IV_This } from "../ALL_RVal/IV_This.ts";
import { traverseFGLexical } from "../Visitors/traverse.ts";
import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";

const isAncestor = (u, v, dTree) => {
  const uData = dTree.node(u);
  const vData = dTree.node(v);
  return uData.inTime <= vData.inTime && uData.outTime >= vData.outTime;
};

export function hoistDeclarations(rootFG: IRIDIUM_FG) {
  const todo: Set<IRIDIUM_FG> = new Set();
  traverseFGLexical(rootFG, (fg: IRIDIUM_FG) => todo.add(fg));
  for (const fg of todo) {
    const envBBMap = fg.getEnvBBMap();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_e, BBsSet] of envBBMap) {
      const toDeclare: Array<
        | IS_SimpleVarDecl
        | IS_ArrPatVarDecl
        | IS_ObjPatVarDecl
        | IS_FunDecl
        | IS_ClassNameInitStmt
        | IS_ThisInitStmt
        | IS_BImport
        | IS_CImport
      > = [];
      const BBs = [...BBsSet];
      BBs.map((bb) => {
        bb.statements = bb.statements.map((i) => {
          if (
            i instanceof IS_SimpleVarDecl ||
            i instanceof IS_ArrPatVarDecl ||
            i instanceof IS_ObjPatVarDecl
          ) {
            toDeclare.push(i);
            if (i.RVal) return new IS1_AssignmentStmt(i, i.LVal, i.RVal);
            else return new IS_Noop();
          } else if (i instanceof IS_FunDecl) {
            toDeclare.push(i);
            return new IS_Noop();
          } else if (i instanceof IS_ThisInitStmt) {
            toDeclare.push(i);
            return new IS_Noop();
          } else if (i instanceof IS_ClassNameInitStmt) {
            toDeclare.push(i);
            return new IS_Noop();
          } else if (i instanceof IS_BImport) {
            toDeclare.push(i);
            return new IS_Noop();
          } else if (i instanceof IS_CImport) {
            toDeclare.push(i);
            return new IS_Noop();
          }
          return i;
        });
        return bb;
      });

      const rootBBName = "" + fg.rootBB.idx;
      let dTree = GLIB.alg.dominatorTarjan(fg, rootBBName, false);

      // @ts-expect-error: dominatorTarjan exports getDfsTree
      dTree = GLIB.alg.dominatorTarjan.getDfsTree(dTree, rootBBName);

      BBs.sort(
        (a, b) => dTree.node("" + a.idx).dfsId - dTree.node("" + b.idx).dfsId,
      );

      const dBB = BBs[0];

      // Assert that the dBB is an ancestor of all other BBs
      BBs.forEach((b) => {
        // Skip Self
        if (b === dBB) return;

        if (!isAncestor("" + dBB.idx, "" + b.idx, dTree))
          debugConfig.logger.throwIriError(
            "Expected dBB to be an ancestor of all BBs",
          );
      });

      // Generate and add declaratopms tp dBB
      const updatedDeclarations = [];

      toDeclare.forEach((d) => {
        if (d instanceof IS_FunDecl)
          updatedDeclarations.push(
            new IS1_DeclarationStmt(d, d.name, new IV_NUBD()),
          );
        else if (d instanceof IS_ThisInitStmt)
          updatedDeclarations.push(
            new IS1_DeclarationStmt(
              d,
              new IV_Identifier(undefined, IV_This.lookupName()),
              new IV_Identifier(undefined, "undefined"),
            ),
          );
        else if (d instanceof IS_ClassNameInitStmt)
          updatedDeclarations.push(
            new IS1_DeclarationStmt(d, d.LVal, new IV_NUBD()),
          );
        else if (d instanceof IS_BImport || d instanceof IS_CImport)
          updatedDeclarations.push(
            new IS1_DeclarationStmt(d, d.local, new IV_NUBD()),
          );
        else {
          const KIND =
            d.KIND === "let"
              ? new IV_NUBD()
              : new IV_Identifier(undefined, "undefined");

          if (d instanceof IS_SimpleVarDecl) {
            updatedDeclarations.push(new IS1_DeclarationStmt(d, d.LVal, KIND));
          } else if (d instanceof IS_ArrPatVarDecl) {
            for (const ddd of d.generatedBindings) {
              updatedDeclarations.push(new IS1_DeclarationStmt(d, ddd, KIND));
            }
          } else if (d instanceof IS_ObjPatVarDecl) {
            for (const ddd of d.generatedBindings) {
              updatedDeclarations.push(new IS1_DeclarationStmt(d, ddd, KIND));
            }
          }
        }
      });

      const hoistedFunctionDeclarations = toDeclare
        .filter((i) => i instanceof IS_FunDecl)
        .map((i) => {
          return new IS1_AssignmentStmt(
            i,
            i.name,
            new IV_FunctionExpression(
              undefined,
              i.func.params,
              i.func.funBody,
              i.name,
              i.func.generator,
              i.func.async,
            ),
          );
        });

      const hoistedImportDeclarations = toDeclare.filter(
        (i) => i instanceof IS_BImport || i instanceof IS_CImport,
      );

      dBB.statements = [
        ...updatedDeclarations,
        ...hoistedImportDeclarations,
        ...hoistedFunctionDeclarations,
        ...dBB.statements,
      ];
      dBB.statements = dBB.statements.filter((i) => !(i instanceof IS_Noop));
    }
  }
}
