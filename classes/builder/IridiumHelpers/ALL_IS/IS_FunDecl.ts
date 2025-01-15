import { isJS3FunctionDeclaration, JS3FunctionDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { FunctionArgInitBB } from "../BB.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { printScopedSpace, printSpace } from "../IRIDIUM.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_RestElement } from "../ALL_RVal/ALL_ISP.ts";
import { I_Function } from "../I_GENERAL/I_Function.ts";

export class IS_FunDecl extends ALL_IS {
  func: I_Function
  name: IV_Identifier

  constructor(node: JS3FunctionDeclaration | undefined = undefined, params : Array<IV_Identifier | ISP_RestElement>, funBody: FunctionArgInitBB, name: IV_Identifier, isGenerator: boolean, isAsync: boolean) {
    super(node);
    this.func = new I_Function(node, params, funBody, isGenerator, isAsync);
    this.name = name
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${printScopedSpace(space)}▏ FUNCTION_DECLARATION { name=${this.name} } ${this.func.toString(space + 4)} `)
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    return `${printSpace(space)} FUNCTION_DECLARATION { name=${this.name} } = ${this.func.funBody.getName()}` 
  }

}