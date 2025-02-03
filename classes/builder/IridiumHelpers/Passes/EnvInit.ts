// 
// This pass basically visits all the instructions, and for each statement which can 
// generate bindings we populate the environments.
// 

import debugConfig from "#debugConfig";
import { ALL_IS } from "../ALL_IS/ALL_IS.ts";
import { IS_BImport, IS_CExport } from "../ALL_IS/IS_Imports_Exports.ts";
import { IS1_DeclarationStmt, IS_ArrPatVarDecl, IS_ClassNameInitStmt, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_ThisInitStmt, IS_VAR_DECL_KIND } from "../ALL_IS/IS_VarDecl.ts";
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
    // Imports
    // 
    if (inst instanceof IS_BImport) {
      let binding = inst.local
      let kind: IS_VAR_DECL_KIND = "let"
      envInQuestion.declareBinding(binding.name, inst, kind)
    } else if (inst instanceof IS_CExport) {
      let binding = inst.local
      let kind: IS_VAR_DECL_KIND = "let"
      envInQuestion.declareBinding(binding.name, inst, kind)
    }

    // 
    // Hoisted Declarations
    // 
    else if (inst instanceof IS1_DeclarationStmt) {
      let kind = inst.getBindingKind()
      for (let binding of inst.generatedBindings()) {
        envInQuestion.declareBinding(binding.name, inst, kind)
      }
    }

    // 
    // Error cases, we would have gotten rid of these nodes beforehand...
    // 
    else if (inst instanceof IS_ThisInitStmt || inst instanceof IS_ClassNameInitStmt ||
      inst instanceof IS_SimpleVarDecl || inst instanceof IS_ArrPatVarDecl || inst instanceof IS_ObjPatVarDecl) {
      debugConfig.logger.throwIriError("Expected Hoisting Pass to Get Rid of these nodes!")
    }
  })
}

