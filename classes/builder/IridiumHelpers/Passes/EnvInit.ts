// 
// This pass basically visits all the instructions, and for each statement which can 
// generate bindings we populate the environments.
// 

import { IS_FunDecl } from "../ALL_IS/IS_FunDecl.ts";
import { IS_BImport, IS_CExport } from "../ALL_IS/IS_Imports_Exports.ts";
import { IS_ArrPatVarDecl, IS_ClassNameInitStmt, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_ThisInitStmt, IS_VAR_DECL_KIND } from "../ALL_IS/IS_VarDecl.ts";
import { BB } from "../BB.ts";
import { traverseInstructionLexical } from "../Visitors/traverse.ts";

export function initializeEnvDefs(bb: BB) {
  traverseInstructionLexical(bb, (inst, context) => {
    // console.log("STUB, CALLBACK")
    // return; 

    // 
    // Imports that create bindings
    // 
    let bbInQestion   = context.bb
    let envInQuestion = bbInQestion.env
    
    if (inst instanceof IS_BImport) {
      let binding = inst.local
      let kind : IS_VAR_DECL_KIND = "let"
      envInQuestion.declareBinding(binding.name, inst, kind)  
    } else if (inst instanceof IS_CExport) {
      let binding = inst.local
      let kind : IS_VAR_DECL_KIND = "let"
      envInQuestion.declareBinding(binding.name, inst, kind)
    } else if (inst instanceof IS_SimpleVarDecl) {
      let binding = inst.LVal
      let kind = inst.KIND
      envInQuestion.declareBinding(binding.name, inst, kind)
    } else if (inst instanceof IS_ArrPatVarDecl) {
      let bindings = inst.generatedBindings
      let kind = inst.KIND
      for (let b of bindings) {
        envInQuestion.declareBinding(b.name, inst, kind)
      }
    } else if (inst instanceof IS_ObjPatVarDecl) {
      let bindings = inst.generatedBindings
      let kind = inst.KIND
      for (let b of bindings) {
        envInQuestion.declareBinding(b, inst, kind)
      }
    } else if (inst instanceof IS_ThisInitStmt) {
      // We dont want to redeclare the THIS binding, although code generation will make it so for class blockinit BB
      if (!envInQuestion.hasBinding(inst.LVal.lookupName()))
        envInQuestion.declareBinding(inst.LVal.lookupName(), inst, "let")
    } else if (inst instanceof IS_ClassNameInitStmt) {
      // We dont want to redeclare the ClassName binding, although code generation will make it so for class blockinit BB
      if (!envInQuestion.hasBinding(inst.LVal.lookupName()))
        envInQuestion.declareBinding(inst.LVal.lookupName(), inst, "let")
    } else if (inst instanceof IS_FunDecl) {
      envInQuestion.declareBinding(inst.name.lookupName(), inst, "const")
    }
    
  })
}

