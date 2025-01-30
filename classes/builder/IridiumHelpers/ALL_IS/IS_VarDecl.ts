import { printScopedSpace, printSpace } from "#utils";
import { isBigIntLiteral, isDecimalLiteral, isIdentifier, isNumericLiteral, isRestElement, isStringLiteral } from "@babel/types";
import { isJS3AssnObjectProperty, JS3ArrayPattern, JS3AssnObjectProperty_key, JS3ClassExpression, JS3ObjectPattern, JS3VariableDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IV_ASSIGNABLE } from "../ALL_RVal/ALL_RVal.ts";
import { IV_NUBD } from "../ALL_RVal/IV_NonLang.ts";
import { IV_This } from "../ALL_RVal/IV_This.ts";
import { ALL_IS } from "./ALL_IS.ts";

export type IS_VAR_DECL_KIND = "var" | "let" | "const"

export class IS_SimpleVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: IV_Identifier
  RVal: IV_ASSIGNABLE | null
  generatedBindings: Set<IV_Identifier>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, ID: IV_Identifier, RVal: IV_ASSIGNABLE | null = null) {
    super(node);
    this.KIND = KIND
    this.LVal = ID
    this.RVal = RVal

    this.generatedBindings = new Set()
    this.generatedBindings.add(this.LVal)
  }
  
  declaredClosure() { return this.RVal && this.RVal.declaredClosure() }

  toString(space = 0) {
    if (!this.RVal) {
      return `${printScopedSpace(space)}▏ ${this.KIND} ${this.LVal.name};`
    }
    return `${printScopedSpace(space)}▏ ${this.KIND} ${this.LVal.name} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    if (!this.RVal) {
      return `${printSpace(space)} ${this.KIND} ${this.LVal.name};`
    }
    return `${printSpace(space)} ${this.KIND} ${this.LVal.name} = ${this.RVal.toDOT(space + 2)};`
  }
}

export class IS_ArrPatVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: JS3ArrayPattern
  RVal: IV_ASSIGNABLE | null
  generatedBindings: Set<IV_Identifier>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, LVal: JS3ArrayPattern, RVal: IV_ASSIGNABLE | null = null) {
    super(node);
    this.KIND = KIND
    this.LVal = LVal
    this.RVal = RVal

    this.generatedBindings = new Set()
    for (let id of LVal.elements) {
      if (isIdentifier(id)) {
        this.generatedBindings.add(new IV_Identifier(id, id.name))
      } else {
        this.generatedBindings.add(new IV_Identifier(id.argument, id.argument.name))
      }
    }
  }

  declaredClosure() { return this.RVal && this.RVal.declaredClosure() }

  toString(space = 0) {
    let lval = "[ "
    let len = this.LVal.elements.length
    let i = 0
    this.LVal.elements.forEach(e => {
      i++;
      if (isRestElement(e)) {
        lval += `...${e.argument.name}`
      } else {
        lval += `${e.name}`
      }

      if (i !== len) {
        lval += `, `
      } else {
        lval += ` `
      }
    })
    lval += "]"

    if (!this.RVal) {
      return `${printScopedSpace(space)}▏ ${this.KIND} ${lval};`
    }

    return `${printScopedSpace(space)}▏ ${this.KIND} ${lval} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    let lval = "[ "
    let len = this.LVal.elements.length
    let i = 0
    this.LVal.elements.forEach(e => {
      i++;
      if (isRestElement(e)) {
        lval += `...${e.argument.name}`
      } else {
        lval += `${e.name}`
      }

      if (i !== len) {
        lval += `, `
      } else {
        lval += ` `
      }
    })
    lval += "]"

    if (!this.RVal) {
      return `${printSpace(space)} ${this.KIND} ${lval};`
    }

    return `${printSpace(space)} ${this.KIND} ${lval} = ${this.RVal.toDOT(space + 2)};`
  }
}

export class IS_ObjPatVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: JS3ObjectPattern
  RVal: IV_ASSIGNABLE | null
  generatedBindings: Set<string>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, LVal: JS3ObjectPattern, RVal: IV_ASSIGNABLE | null = null) {
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

  declaredClosure() { return this.RVal && this.RVal.declaredClosure() }

  toString(space = 0) {
    let keyToString = (p: JS3AssnObjectProperty_key) => {
      if (isIdentifier(p)) return p.name
      else if (isStringLiteral(p)) return `"${p.value}"`
      else if (isNumericLiteral(p)) return `${p.value}`
      else if (isBigIntLiteral(p)) return `${p.value}`
      else if (isDecimalLiteral(p)) return `${p.value}`
      else return `#${p.id.name}`
    }

    let lval = "{ "
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
    lval += "}"

    if (!this.RVal) {
      return `${printScopedSpace(space)}▏ ${this.KIND} ${lval};`
    }

    return `${printScopedSpace(space)}▏ ${this.KIND} ${lval} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    let keyToString = (p: JS3AssnObjectProperty_key) => {
      if (isIdentifier(p)) return p.name
      else if (isStringLiteral(p)) return `"${p.value}"`
      else if (isNumericLiteral(p)) return `${p.value}`
      else if (isBigIntLiteral(p)) return `${p.value}`
      else if (isDecimalLiteral(p)) return `${p.value}`
      else return `#${p.id.name}`
    }

    let lval = "{ "
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
    lval += "}"

    if (!this.RVal) {
      return `${printSpace(space)} ${this.KIND} ${lval};`
    }

    return `${printSpace(space)} ${this.KIND} ${lval} = ${this.RVal.toDOT(space + 2)};`
  }
}

export class IS_ThisInitStmt extends ALL_IS {
  LVal: IV_This = new IV_This()
  RVal: IV_Identifier = new IV_Identifier(undefined, "undefined");

  constructor(node: JS3ClassExpression) {
    super(node)
  }

  toString(space: number = 0) {
    return `${printScopedSpace(space)}▏ <ThisInit> ${this.LVal.toString()} = ${this.RVal.toString()};`
  }

  toDOT(space: number = 0) {
    return `${printSpace(space)} <ThisInit> ${this.LVal.toString()} = ${this.RVal.toDOT()};`
  }
}

export class IS_ClassNameInitStmt extends ALL_IS {
  LVal: IV_Identifier
  RVal: IV_NUBD | IV_Identifier = new IV_NUBD()

  constructor(node: JS3ClassExpression, id: IV_Identifier) {
    super(node)
    this.LVal = id
  }

  toString(space: number = 0) {
    return `${printScopedSpace(space)}▏ <ClassNameInit> ${this.LVal.toString()} = ${this.RVal.toString()};`
  }

  toDOT(space: number = 0) {
    return `${printSpace(space)} <ClassNameInit> ${this.LVal.toString()} = ${this.RVal.toDOT()};`
  }
}