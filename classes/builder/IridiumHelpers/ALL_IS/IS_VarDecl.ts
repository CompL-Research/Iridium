import { isBigIntLiteral, isDecimalLiteral, isIdentifier, isNumericLiteral, isRestElement, isStringLiteral } from "@babel/types";
import { isJS3AssnObjectProperty, JS3ArrayPattern, JS3AssnObjectProperty_key, JS3ObjectPattern, JS3VarDeclLVal, JS3VariableDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "../ALL_RVal/ALL_RVal.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { IV_Identifer } from "../ALL_RVal/IV_Identifier.ts";

export type IS_VAR_DECL_KIND = "var" | "let" | "const"

export class IS_SimpleVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: IV_Identifer
  RVal: ALL_RVal
  generatedBindings: Set<IV_Identifer>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, ID: IV_Identifer, RVal: ALL_RVal) {
    super(node);
    this.KIND = KIND
    this.LVal = ID
    this.RVal = RVal

    this.generatedBindings = new Set()
    this.generatedBindings.add(this.LVal)
  }

  toString(space = 0) {
    return `${" ".repeat(space)}SIMPLE_VAR_DECL ${this.KIND} ${this.LVal.toString()} = ${this.RVal.toString()};`
  }
}

export class IS_ArrPatVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: JS3ArrayPattern
  RVal: ALL_RVal
  generatedBindings: Set<IV_Identifer>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, LVal: JS3ArrayPattern, RVal: ALL_RVal) {
    super(node);
    this.KIND = KIND
    this.LVal = LVal
    this.RVal = RVal

    this.generatedBindings = new Set()
    for (let id of LVal.elements) {
      if (isIdentifier(id)) {
        this.generatedBindings.add(new IV_Identifer(id, id.name))
      } else {
        this.generatedBindings.add(new IV_Identifer(id.argument, id.argument.name))
      }
    }
  }

  toString(space = 0) {
    let lval = "[ "
    let len = this.LVal.elements.length
    let i = 0
    this.LVal.elements.forEach(e => {
      i++;
      if (isRestElement(e)) {
        lval += `...${e.argument}`
      } else {
        lval += `${e.name} `
      }

      if (i !== len) {
        lval += `, `
      } else {
        lval += ` `
      }
    })
    lval += "]"

    return `${" ".repeat(space)}ARRPAT_VAR_DECL ${this.KIND} ${lval} = ${this.RVal.toString()};`
  }
}

export class IS_ObjPatVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: JS3ObjectPattern
  RVal: ALL_RVal
  generatedBindings: Set<string>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, LVal: JS3ObjectPattern, RVal: ALL_RVal) {
    super(node);
    this.KIND = KIND
    this.LVal = LVal
    this.RVal = RVal

    this.generatedBindings = new Set()
    for (let p of LVal.properties) {
      if (isJS3AssnObjectProperty(p)) {
        this.generatedBindings.add(p.value.name)
      } else {
        this.generatedBindings.add(p.argument.name)
      }
    }
  }

  toString(space = 0) {

    let keyToString = (p: JS3AssnObjectProperty_key) => {
      if (isIdentifier(p)) return p.name
      else if (isStringLiteral(p)) return `"${p.value}"`
      else if (isNumericLiteral(p)) return `${p.value}`
      else if (isBigIntLiteral(p)) return `${p.value}`
      else if (isDecimalLiteral(p)) return `${p.value}`
      else return `#${p.id.name}`
    }

    let lval = "[ "
    let len = this.LVal.properties.length
    let i = 0
    this.LVal.properties.forEach(p => {
      i++;
      if (isRestElement(p)) {
        lval += `...${p.argument}`
      } else {
        lval += `${keyToString(p.key)} : ${p.value.name}`
      }

      if (i !== len) {
        lval += `, `
      } else {
        lval += ` `
      }
    })
    lval += "]"

    return `${" ".repeat(space)}ARRPAT_VAR_DECL ${this.KIND} ${lval} = ${this.RVal.toString()};`
  }
}