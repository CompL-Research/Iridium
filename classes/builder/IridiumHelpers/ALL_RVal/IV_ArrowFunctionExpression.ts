import { JS3ArrowFunctionExpression } from "classes/builder/JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts"
import { FunctionArgInitBB } from "../BB.ts"
import { I_Function } from "../I_GENERAL/I_Function.ts"
import { printScopedSpace } from "../IRIDIUM.ts"
import { ISP_RestElement } from "./ALL_ISP.ts"
import { ALL_RVal } from "./ALL_RVal.ts"
import debugConfig from "#debugConfig"

export class IV_ArrowFunctionExpression extends ALL_RVal {
  func: I_Function
  name: IV_Identifier | undefined
  dropName: boolean

  constructor(node: JS3ArrowFunctionExpression | undefined = undefined, params: Array<IV_Identifier | ISP_RestElement>, funBody: FunctionArgInitBB, name: IV_Identifier | undefined, isGenerator: boolean, isAsync: boolean, dropName: boolean = false) {
    super(node, "ArrowFunctionExpression");
    this.func = new I_Function(node, params, funBody, isGenerator, isAsync);
    this.name = name
    this.dropName = dropName
  }

  toString(space = 0) {
    return `<ArrowFunctionExpression> { ${this.dropName ? "" : (this.name ? `name: ${this.name.toString()}` : "name: UKN")} }\n${printScopedSpace(space)}${this.func.toString(space + 2)}`
  }

  toDOT(space = 0) {
    debugConfig.DOTContext.add(this.func.funBody)
    return `<ArrowFunctionExpression> { ${this.dropName ? "" : (this.name ? `name: ${this.name.toString()}` : "name: UKN")} } = ${this.func.funBody.getName()}`
  }

}