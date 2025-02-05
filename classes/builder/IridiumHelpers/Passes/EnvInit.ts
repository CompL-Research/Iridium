// 
// This pass basically visits all the instructions, and for each statement which can 
// generate bindings we populate the environments.
// 

import debugConfig from "#debugConfig";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { IS_FunDecl } from "../ALL_IS/IS_FunDecl.ts";
import { IS1_DeclarationStmt, IS_ArrPatVarDecl, IS_ClassNameInitStmt, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_ThisInitStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB } from "../BB.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseInstructionRecDepthFirst } from "../Visitors/traverse.ts";

export function initializeEnvDefs(rootFG: IRIDIUM_FG) {
  traverseInstructionRecDepthFirst(rootFG, (inst: ALL_IS, bbInQestion: BB, fgContext: IRIDIUM_FG) => {
    // 
    // Imports that create bindings
    // 
    let envInQuestion = bbInQestion.env

    // 
    // Hoisted Declarations
    // 
    if (inst instanceof IS1_DeclarationStmt) {
      let kind = inst.getBindingKind()
      for (let binding of inst.definedIdentifiers()) {
        envInQuestion.declareBinding(binding, inst, bbInQestion, kind)
      }
    }

    // 
    // Error cases, we would have gotten rid of these nodes beforehand...
    // 
    else if (inst instanceof IS_ThisInitStmt || inst instanceof IS_ClassNameInitStmt ||
      inst instanceof IS_SimpleVarDecl || inst instanceof IS_ArrPatVarDecl || inst instanceof IS_ObjPatVarDecl || inst instanceof IS_FunDecl) {
      debugConfig.logger.throwIriError(`Expected Hoisting Pass to Get Rid of these nodes! ${inst}`)
    }

    // 
    // Assignments
    // 
    else {
      let definedIds = inst.definedIdentifiers()
      let usedIds = inst.usedIdentifiers()

      for (let defId of definedIds) {
        let containingEnv = envInQuestion.findEnvContaining(defId)
        if (!containingEnv) {
          envInQuestion.declareGlobalBinding(defId, bbInQestion, inst)
          containingEnv = envInQuestion.findEnvContaining(defId)
          if (!containingEnv) throw new Error("Failed to find binding that was just declared")
        }

        // Else update info in the containing env
        containingEnv.getBinding(defId).defs.add(inst)
        containingEnv.getBinding(defId).defBBs.add(bbInQestion)
      }

      for (let useId of usedIds) {
        let containingEnv = envInQuestion.findEnvContaining(useId)
        if (!containingEnv) {
          envInQuestion.declareGlobalBinding(useId, bbInQestion, inst)
          containingEnv = envInQuestion.findEnvContaining(useId)
          if (!containingEnv) throw new Error("Failed to find binding that was just declared")
        }

        // Else update info in the containing env
        containingEnv.getBinding(useId).uses.add(inst)
        containingEnv.getBinding(useId).useBBs.add(bbInQestion)
      }
    }
  })
}

