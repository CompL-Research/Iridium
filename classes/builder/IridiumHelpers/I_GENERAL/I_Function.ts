import { JS3ArrowFunctionExpression, JS3ClassMethod, JS3ClassPrivateMethod, JS3FunctionDeclaration, JS3FunctionExpression, JS3ObjectExpression, JS3ObjectMethod } from "classes/builder/JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_RestElement } from "../ALL_RVal/ALL_ISP.ts";
import { FunctionArgInitBB } from "../BB.ts";

export type I_Function_node = JS3FunctionDeclaration | JS3FunctionExpression | JS3ArrowFunctionExpression | JS3ObjectMethod | JS3ClassMethod | JS3ClassPrivateMethod
export type I_Function_params = Array<IV_Identifier | ISP_RestElement>
export class I_Function {
  node: I_Function_node
  params : I_Function_params
  funBody: FunctionArgInitBB
  generator: boolean;
  async: boolean;

  constructor(node: I_Function_node, params: I_Function_params, funBody: FunctionArgInitBB, generator: boolean, async: boolean) {
    this.node = node
    this.params = params
    this.funBody = funBody
    this.generator = generator
    this.async = async
  }

  toString(space = 0) {
    let params = this.params.map(i => i.toString()).join(",")
    let stmts = []
    stmts.push(`<I_Function> { params: [${params}], async: ${this.async}, generator: ${this.generator} }`)
    stmts.push(this.funBody.toString(space))
    return stmts.join("\n")
  }
}