import { JS3FunctionExpression } from "classes/builder/JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts"
import { FunctionArgInitBB } from "../BB.ts"
import { I_Function } from "../I_GENERAL/I_Function.ts"
import { ISP_RestElement } from "./ALL_ISP.ts"
import { ALL_RVal } from "./ALL_RVal.ts"
import { printScopedSpace } from "../IRIDIUM.ts"

export class IV_FunctionExpression extends ALL_RVal {
  func: I_Function
  name: IV_Identifier | undefined
  dropName: boolean

  constructor(node: JS3FunctionExpression | undefined = undefined, params : Array<IV_Identifier | ISP_RestElement>, funBody: FunctionArgInitBB, name: IV_Identifier | undefined, isGenerator: boolean, isAsync: boolean, dropName : boolean = false) {
    super(node, "FunctionExpression");
    this.func = new I_Function(node, params, funBody, isGenerator, isAsync);
    this.name = name
  }

  toString(space = 0) {
    return `<FunctionExpression> { ${this.dropName ? "" : (this.name ? `name: ${this.name.toString()}` : "name: UKN")} }\n${printScopedSpace(space)}${this.func.toString(space + 2)}`

  }

}