import { JS3ObjectExpression } from "classes/builder/JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts"
import { IV_BigIntLiteral, IV_NumericLiteral, IV_StringLiteral } from "./IV_Literals.ts"
import { FunctionArgInitBB } from "../BB.ts"
import { ISP_RestElement } from "./ALL_ISP.ts"

export type IV_FunctionExpression_key = IV_Identifier | IV_StringLiteral | IV_NumericLiteral | IV_BigIntLiteral
export class IV_FunctionExpression {
  node: JS3ObjectExpression
  kind: "method" | "get" | "set"
  key: IV_FunctionExpression_key
  params : Array<IV_Identifier | ISP_RestElement>
  funBody: FunctionArgInitBB
  computed: boolean;
  generator: boolean;
  async: boolean;

  constructor(node: JS3ObjectExpression, kind: "method" | "get" | "set", key: IV_FunctionExpression_key, params: Array<IV_Identifier | ISP_RestElement>, funBody: FunctionArgInitBB, computed: boolean, generator: boolean, async: boolean) {
    this.node = node
    this.kind = kind
    this.key = key
    this.params = params
    this.funBody = funBody
    this.computed = computed
    this.generator = generator
    this.async = async
  }

  toString(space = 0) {

    let params = this.params.map(i => i.toString()).join(",")

    let stmts = []
    if (this.computed) {
      stmts.push(`<ObjMethod> { kind: ${this.kind}, name: [${this.key.toString()}], params: [${params}], async: ${this.async}, generator: ${this.generator} }`)
    } else {
      stmts.push(`<ObjMethod> { kind: ${this.kind}, name: ${this.key.toString()}, params: [${params}], async: ${this.async}, generator: ${this.generator} }`)
    }

    stmts.push(this.funBody.toString(space))
    
    return stmts.join("\n")
  }


}