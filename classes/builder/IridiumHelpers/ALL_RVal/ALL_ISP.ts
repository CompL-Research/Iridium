import { JS3ObjectMethod, JS3ObjectProperty, JS3RestElement, JS3SpreadElement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_Literals, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "./IV_Literals.ts";

import { isBigIntLiteral, isBooleanLiteral, isDecimalLiteral, isIdentifier, isNullLiteral, isNumericLiteral, isStringLiteral, Super, V8IntrinsicIdentifier } from "@babel/types";
import { FunctionArgInitBB } from "../BB.ts";
import { I_Function } from "../I_GENERAL/I_Function.ts";

// ISP = Iridium SPecial; values that appear as a part of an R Value but never as R_Values directly.
export class ISP_Super {
  node: Super
  constructor(node: Super) {
    this.node = node
  }

  toString() {
    return `SUPER`
  }
}

export class ISP_V8Intrinsic {
  id: IV_Identifier
  constructor(node: V8IntrinsicIdentifier, id: IV_Identifier) {
    this.id = id
  }
  
  toString() {
    return `<V8> ${this.id.toString()}`
  }
}

export class ISP_ArgSpread {
  node: JS3SpreadElement
  arg: IV_Identifier
  constructor(node: JS3SpreadElement, arg: IV_Identifier) {
    this.node = node
    this.arg = arg
  }

  toString() {
    return `...${this.arg.toString()}`
  }
}
export class ISP_RestElement {
  node: JS3RestElement
  arg: IV_Identifier
  constructor(node: JS3RestElement, arg: IV_Identifier) {
    this.node = node
    this.arg = arg
  }

  toString() {
    return `...${this.arg.toString()}`
  }
}
export type ISP_ObjectMethod_key = IV_Identifier | IV_StringLiteral | IV_NumericLiteral | IV_BigIntLiteral
export class ISP_ObjectMethod extends I_Function {
  kind: "method" | "get" | "set"
  key: ISP_ObjectMethod_key
  computed: boolean;

  constructor(node: JS3ObjectMethod, kind: "method" | "get" | "set", key: ISP_ObjectMethod_key, params: Array<IV_Identifier | ISP_RestElement>, funBody: FunctionArgInitBB, computed: boolean, generator: boolean, async: boolean) {
    super(node, params, funBody, generator, async)
    this.node = node
    this.kind = kind
    this.key = key
    this.computed = computed
  }

  toString(space = 0) {
    let params = this.params.map(i => i.toString()).join(",")
    let stmts = []
    stmts.push(`<ObjMethod> { kind: ${this.kind}, name: ${this.computed ? "[" + this.key.toString() + "" : this.key.toString() }, params: [${params}], async: ${this.async}, generator: ${this.generator} }`)
    stmts.push(this.funBody.toString(space))
    return stmts.join("\n")
  }
}

type ISP_ObjectProperty_key = IV_Identifier | IV_StringLiteral | IV_NumericLiteral | IV_BigIntLiteral
type ISP_ObjectProperty_value = IV_Identifier | IV_Literals
export class ISP_ObjectProperty {
  node     : JS3ObjectProperty
  key      : ISP_ObjectProperty_key
  value    : ISP_ObjectProperty_value
  computed : boolean

  constructor(node: JS3ObjectProperty, key: ISP_ObjectProperty_key, value: ISP_ObjectProperty_value, computed: boolean) {
    this.node = node
    this.key = key
    this.value = value
    this.computed = computed
  }

  static from(node: JS3ObjectProperty) {
    let orig_key = node.key
    let fin_key : ISP_ObjectProperty_key
    if (isIdentifier(orig_key)) {
      fin_key = new IV_Identifier(orig_key, orig_key.name)
    } else if (isStringLiteral(orig_key)) {
      fin_key = new IV_StringLiteral(orig_key, orig_key.value)
    } else if (isNumericLiteral(orig_key)) {
      fin_key = new IV_NumericLiteral(orig_key, orig_key.value)
    } else if (isBigIntLiteral(orig_key)) {
      fin_key = new IV_BigIntLiteral(orig_key, orig_key.value)
    }

    let orig_value = node.value
    let fin_value : ISP_ObjectProperty_value
    if (isIdentifier(orig_value)) {
      fin_value = new IV_Identifier(orig_value, orig_value.name)
    } else if (isDecimalLiteral(orig_value)) {
      fin_value = new IV_DecimalLiteral(orig_value, orig_value.value)
    } else if (isBigIntLiteral(orig_value)) {
      fin_value = new IV_BigIntLiteral(orig_value, orig_value.value)
    } else if (isStringLiteral(orig_value)) {
      fin_value = new IV_StringLiteral(orig_value, orig_value.value)
    } else if (isNumericLiteral(orig_value)) {
      fin_value = new IV_NumericLiteral(orig_value, orig_value.value)
    } else if (isNullLiteral(orig_value)) {
      fin_value = new IV_NullLiteral(orig_value)
    } else if (isBooleanLiteral(orig_value)) {
      fin_value = new IV_BooleanLiteral(orig_value, orig_value.value)
    }
    return new ISP_ObjectProperty(node, fin_key, fin_value, node.computed)
  }

  toString() {
    return `<ObjProp> ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()} : ${this.value.toString()}`
  }
}