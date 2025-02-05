import debugConfig from "#debugConfig";
import { printScopedSpace, printSpace } from "#utils";
import { JS3FunctionDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_RestElement } from "../ALL_RVal/ALL_ISP.ts";
import { I_Function } from "../I_GENERAL/I_Function.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { ALL_IS } from "./ALL_IS.ts";

export class IS_FunDecl extends ALL_IS {
  func: I_Function
  name: IV_Identifier

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return [this.func.funBody] }

  constructor(node: JS3FunctionDeclaration | undefined = undefined, params : Array<IV_Identifier | ISP_RestElement>, funBody: IRIDIUM_FG, name: IV_Identifier, isGenerator: boolean, isAsync: boolean) {
    super(node);
    this.func = new I_Function(node, params, funBody, isGenerator, isAsync);
    this.name = name
  }

  definedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_FunDecl")
  }

  usedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_FunDecl")
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${printScopedSpace(space)}▏ FUNCTION_DECLARATION { name=${this.name.lookupName()} } ${this.func.toString(space + 4)} `)
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    debugConfig.DOTContext.add(this.func.funBody)
    return `${printSpace(space)} FUNCTION_DECLARATION { name=${this.name.lookupName()} } = ${this.func.funBody.getName()}` 
  }
  
  value(value: any) {
    throw new Error("Method not implemented.");
  }

}