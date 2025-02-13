// 
// This pass basically visits all the instructions, and for each statement which can 
// generate bindings we populate the environments.
// 

import debugConfig from "#debugConfig";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { IS_FunDecl } from "../ALL_IS/IS_FunDecl.ts";
import { IS1_DeclarationStmt, IS_ArrPatVarDecl, IS_ClassNameInitStmt, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_ThisInitStmt } from "../ALL_IS/IS_VarDecl.ts";
import { BB } from "../BB.ts";
import { Environment } from "../I_GENERAL/I_Environment.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { traverseInstructionRecDepthFirst } from "../Visitors/traverse.ts";

export function initializeEnvDefs(rootFG: IRIDIUM_FG) {
  let fgEnvsMap: Map<IRIDIUM_FG, Set<Environment>> = new Map()

  // If the environment being operated on is not part of this closure context, then it is a free variable for our purposes
  let checkIfUseDefCrossesClosureBoundary = (e: Environment, fgContext) => !fgEnvsMap.get(fgContext).has(e);

  traverseInstructionRecDepthFirst(rootFG, (inst: ALL_IS, bbInQestion: BB, fgContext: IRIDIUM_FG) => {
    if (!fgEnvsMap.has(fgContext)) {
      fgEnvsMap.set(fgContext, fgContext.getEnvs())
    }
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

      for (let useId of inst.usedIdentifiers()) {
        let containingEnv = envInQuestion.findEnvContaining(useId)
        if (!containingEnv) {
          envInQuestion.declareGlobalBinding(useId, bbInQestion, inst)
          containingEnv = envInQuestion.findEnvContaining(useId)
          if (!containingEnv) throw new Error("Failed to find binding that was just declared")
        }

        if (checkIfUseDefCrossesClosureBoundary(containingEnv, fgContext)) fgContext.freeVarReads.add(useId)

        // Else update info in the containing env
        containingEnv.getBinding(useId).uses.add(inst)
        containingEnv.getBinding(useId).useBBs.add(bbInQestion)
      }
    }

    // 
    // Error cases, we would have gotten rid of these nodes beforehand...
    // 
    else if (inst instanceof IS_ThisInitStmt || inst instanceof IS_ClassNameInitStmt ||
      inst instanceof IS_SimpleVarDecl || inst instanceof IS_ArrPatVarDecl || inst instanceof IS_ObjPatVarDecl || inst instanceof IS_FunDecl) {
      debugConfig.logger.throwIriError(`Expected Hoisting Pass to Get Rid of these nodes! ${inst}`)
    }
  })


  traverseInstructionRecDepthFirst(rootFG, (inst: ALL_IS, bbInQestion: BB, fgContext: IRIDIUM_FG) => {
    if (!fgEnvsMap.has(fgContext)) {
      fgEnvsMap.set(fgContext, fgContext.getEnvs())
    }


    let envInQuestion = bbInQestion.env
    if (!(inst instanceof IS1_DeclarationStmt)) {
      let definedIds = inst.definedIdentifiers()
      let usedIds = inst.usedIdentifiers()

      for (let defId of definedIds) {
        let containingEnv = envInQuestion.findEnvContaining(defId)
        if (!containingEnv) {
          envInQuestion.declareGlobalBinding(defId, bbInQestion, inst)
          containingEnv = envInQuestion.findEnvContaining(defId)
          if (!containingEnv) throw new Error("Failed to find binding that was just declared")
        }

        if (checkIfUseDefCrossesClosureBoundary(containingEnv, fgContext)) fgContext.freeVarWrites.add(defId)

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

        if (checkIfUseDefCrossesClosureBoundary(containingEnv, fgContext)) fgContext.freeVarReads.add(useId)

        // Else update info in the containing env
        containingEnv.getBinding(useId).uses.add(inst)
        containingEnv.getBinding(useId).useBBs.add(bbInQestion)
      }
    }
  })
}

