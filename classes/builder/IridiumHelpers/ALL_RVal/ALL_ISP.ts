import { JS3ClassMethod, JS3ClassPrivateMethod, JS3ClassPrivateProperty, JS3ClassProperty, JS3Import, JS3ObjectMethod, JS3ObjectProperty, JS3RestElement, JS3SpreadElement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_PrivateName } from "../ALL_AMP/ALL_AMP.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_Literals, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "./IV_Literals.ts";

import debugConfig from "#debugConfig";
import { printScopedSpace } from "#utils";
import { isBigIntLiteral, isBooleanLiteral, isDecimalLiteral, isIdentifier, isNullLiteral, isNumericLiteral, isStringLiteral, Super, V8IntrinsicIdentifier } from "@babel/types";
import { I_Function } from "../I_GENERAL/I_Function.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { IV_CTHIS } from "./IV_NonLang.ts";

// ISP = Iridium SPecial; values that appear as a part of an R Value but never as R_Values directly.
export class ISP_Super {
  node: Super
  constructor(node: Super) {
    this.node = node
  }

  static lookupName() {
    return `SUPER`
  }

  lookupName() {
    return ISP_Super.lookupName()
  }

  toString() {
    return `${ISP_Super.lookupName()}`
  }

  toDOT() {
    return this.toString();
  }

}

export class ISP_Import {
  node: JS3Import
  constructor(node: JS3Import) {
    this.node = node
  }

  static lookupName() {
    return `IMPORT`
  }

  toString() {
    return `${ISP_Import.lookupName()}`
  }

  toDOT() {
    return this.toString();
  }

}

export class ISP_V8Intrinsic {
  id: IV_Identifier
  constructor(node: V8IntrinsicIdentifier, id: IV_Identifier) {
    this.id = id
  }

  lookupName() {
    return `${this.id.lookupName()}`
  }

  toString() {
    return `<V8> ${this.lookupName()}`
  }

  toDOT() {
    return this.toString();
  }
}

export class ISP_ArgSpread {
  node: JS3SpreadElement
  arg: IV_Identifier
  constructor(node: JS3SpreadElement, arg: IV_Identifier) {
    this.node = node
    this.arg = arg
  }

  declaredClosure() : Array<IRIDIUM_FG> {
    return []
  }

  toString() {
    return `...${this.arg.toString()}`
  }

  toDOT() {
    return this.toString();
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

  toDOT() {
    return this.toString();
  }

}
export type ISP_ObjectMethod_key = IV_Identifier | IV_StringLiteral | IV_NumericLiteral | IV_BigIntLiteral
export class ISP_ObjectMethod extends I_Function {
  kind: "method" | "get" | "set"
  key: ISP_ObjectMethod_key
  computed: boolean;

  constructor(node: JS3ObjectMethod, kind: "method" | "get" | "set", key: ISP_ObjectMethod_key, params: Array<IV_Identifier | ISP_RestElement>, funBody: IRIDIUM_FG, computed: boolean, generator: boolean, async: boolean) {
    super(node, params, funBody, generator, async)
    this.node = node
    this.kind = kind
    this.key = key
    this.computed = computed
    this.funBody.rootBB.env.declareBinding(IV_CTHIS.lookupName(), undefined, this.funBody.rootBB, "var")
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.computed) {
      if (this.key instanceof IV_Identifier) {
        res.add(this.key.lookupName())
      }
    }
    return res;
  }

  declaredClosure() : Array<IRIDIUM_FG> {
    return [this.funBody]
  }

  toString(space = 0) {
    let params = this.params.map(i => i.toString()).join(",")
    let stmts = []
    stmts.push(`<ObjMethod> { kind: ${this.kind}, name: ${this.computed ? "[" + this.key.toString() + "" : this.key.toString()}, params: [${params}], async: ${this.async}, generator: ${this.generator} }`)
    stmts.push(this.funBody.saveIridiumToString(space))
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    debugConfig.DOTContext.add(this.funBody)
    let params = this.params.map(i => i.toString()).join(",")
    return `<ObjMethod> { kind: ${this.kind}, name: ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()}, params: [${params}], async: ${this.async}, generator: ${this.generator} } = ${this.funBody.getName()}`;
  }

}

type ISP_ObjectProperty_key = IV_Identifier | IV_StringLiteral | IV_NumericLiteral | IV_BigIntLiteral
type ISP_ObjectProperty_value = IV_Identifier
export class ISP_ObjectProperty {
  node: JS3ObjectProperty
  key: ISP_ObjectProperty_key
  value: ISP_ObjectProperty_value
  computed: boolean

  constructor(node: JS3ObjectProperty, key: ISP_ObjectProperty_key, value: ISP_ObjectProperty_value, computed: boolean) {
    this.node = node
    this.key = key
    this.value = value
    this.computed = computed
  }
  
  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.computed) {
      if (this.key instanceof IV_Identifier) {
        res.add(this.key.lookupName())
      }
    }
    return res;
  }

  declaredClosure() : Array<IRIDIUM_FG> {
    return []
  }

  static from(node: JS3ObjectProperty) {
    let orig_key = node.key
    let fin_key: ISP_ObjectProperty_key
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
    let fin_value: ISP_ObjectProperty_value = new IV_Identifier(orig_value, orig_value.name)
    return new ISP_ObjectProperty(node, fin_key, fin_value, node.computed)
  }

  toString() {
    return `<ObjProp> ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()} : ${this.value.toString()}`
  }

  toDOT() {
    return this.toString();
  }

}

export type ISP_ClassProperty_node = JS3ClassProperty | JS3ClassPrivateProperty
export type ISP_ClassProperty_key = IV_Identifier | IV_DecimalLiteral | IV_BigIntLiteral | IV_StringLiteral | IV_NumericLiteral | IV_NullLiteral | IV_BooleanLiteral | IV_PrivateName
export type ISP_ClassProperty_value = IRIDIUM_FG

export class ISP_ClassProperty {
  node: ISP_ClassProperty_node
  key: ISP_ClassProperty_key
  value: ISP_ClassProperty_value
  computed: boolean

  constructor(node: JS3ClassProperty | JS3ClassPrivateProperty, key: ISP_ClassProperty_key, value: ISP_ClassProperty_value, computed: boolean) {
    this.node = node
    this.key = key
    this.value = value
    this.computed = computed
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.computed) {
      if (this.key instanceof IV_Identifier || this.key instanceof IV_PrivateName) {
        res.add(this.key.lookupName())
      }
    }
    return res;
  }

  declaredClosure() : Array<IRIDIUM_FG> {
    return [this.value]
  }

  isPrivate() { return this.key instanceof IV_PrivateName }

  toString(space = 0) {
    return `<ClassProp> ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()} =\n${this.value.saveIridiumToString(space+2)}\n${printScopedSpace(space)}`
  }

  toDOT(space = 0) {
    debugConfig.DOTContext.add(this.value)
    return `<ClassProp> ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()} = BB${this.value.getName()}`
  }
}

export type ISP_StaticClassProperty_value = IV_Identifier
export class ISP_StaticClassProperty {
  node: ISP_ClassProperty_node
  key: ISP_ClassProperty_key
  value: ISP_StaticClassProperty_value
  computed: boolean

  constructor(node: JS3ClassProperty | JS3ClassPrivateProperty, key: ISP_ClassProperty_key, value: IV_Identifier, computed: boolean) {
    this.node = node
    this.key = key
    this.value = value
    this.computed = computed
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.computed) {
      res.add(this.key.lookupName())
    }
    return res;
  }

  declaredClosure() : Array<IRIDIUM_FG> {
    return []
  }

  isPrivate() { return this.key instanceof IV_PrivateName }

  toString(space = 0) {
    return `<StaticClassProp> ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()} = ${this.value.toString()}\n${printScopedSpace(space)}`
  }

  toDOT(space = 0) {
    return `<StaticClassProp> ${this.computed ? "[" + this.key.toString() + "]" : this.key.toString()} = ${this.value.toString()}`
  }
}

export type ISP_ClassMethod_key = IV_Identifier | IV_DecimalLiteral | IV_BigIntLiteral | IV_StringLiteral | IV_NumericLiteral | IV_NullLiteral | IV_BooleanLiteral | IV_PrivateName
export class ISP_ClassMethod extends I_Function {
  kind: "method" | "get" | "set" | "constructor"
  key: ISP_ClassMethod_key
  computed: boolean
  isStatic: boolean;

  constructor(node: JS3ClassMethod | JS3ClassPrivateMethod, kind: "method" | "get" | "set" | "constructor", key: ISP_ClassMethod_key, params: Array<IV_Identifier | ISP_RestElement>, funBody: IRIDIUM_FG, computed: boolean, generator: boolean, async: boolean, isStatic: boolean) {
    super(node, params, funBody, generator, async)
    this.node = node
    this.kind = kind
    this.key = key
    this.computed = computed
    this.isStatic = isStatic

    this.funBody.rootBB.env.declareBinding(IV_CTHIS.lookupName(), undefined, this.funBody.rootBB, "var")
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.computed) {
      if (this.key instanceof IV_Identifier || this.key instanceof IV_PrivateName) {
        res.add(this.key.lookupName())
      }
    }
    return res;
  }

  declaredClosure() : Array<IRIDIUM_FG> {
    return [this.funBody]
  }

  isPrivate() { return this.key instanceof IV_PrivateName }

  toString(space = 0) {
    let params = this.params.map(i => i.toString()).join(",")
    let stmts = []
    stmts.push(`<${this.isStatic ? "Static" : ""}ClassMethod> { kind: ${this.kind}, name: ${this.computed ? "[" + this.key.toString() + "" : this.key.toString()}, params: [${params}], async: ${this.async}, generator: ${this.generator} }`)
    stmts.push(this.funBody.saveIridiumToString(space))
    return stmts.join("\n")
  }

  toDOT(space = 0) {
    debugConfig.DOTContext.add(this.funBody)
    let params = this.params.map(i => i.toString()).join(",")
    return `<${this.isStatic ? "Static" : ""}ClassMethod> { kind: ${this.kind}, name: ${this.computed ? "[" + this.key.toString() + "" : this.key.toString()}, params: [${params}], async: ${this.async}, generator: ${this.generator} } = ${this.funBody.getName()}`
  }
}