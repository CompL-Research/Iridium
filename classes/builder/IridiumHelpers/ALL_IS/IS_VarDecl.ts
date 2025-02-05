import { printScopedSpace, printSpace } from "#utils";
import { isBigIntLiteral, isDecimalLiteral, isIdentifier, isNumericLiteral, isRestElement, isStringLiteral } from "@babel/types";
import { isJS3ArrayPattern, isJS3AssnObjectProperty, isJS3ObjectPattern, JS3ArrayPattern, JS3AssnObjectProperty_key, JS3ClassExpression, JS3ObjectPattern, JS3VariableDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal, IV_ASSIGNABLE } from "../ALL_RVal/ALL_RVal.ts";
import { IV_NUBD } from "../ALL_RVal/IV_NonLang.ts";
import { IV_This } from "../ALL_RVal/IV_This.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { IS_FunDecl } from "./IS_FunDecl.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { IV_ClassExpression } from "../ALL_RVal/IV_ClassExpression.ts";
import { IS_BImport, IS_CImport } from "./IS_Imports_Exports.ts";
import { ISP_ObjectMethod, ISP_Super } from "../ALL_RVal/ALL_ISP.ts";
import { IV_FunctionExpression } from "../ALL_RVal/IV_FunctionExpression.ts";

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

  definedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_SimpleVarDecl")
  }

  usedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_SimpleVarDecl")
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined { return this.RVal && this.RVal.declaredClosure() }


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

export const ArrPatToString = (LVal: JS3ArrayPattern) => {
  let lval = "[ "
  let len = LVal.elements.length
  let i = 0
  LVal.elements.forEach(e => {
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
  return lval
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

  definedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ArrPatVarDecl")
  }

  usedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ArrPatVarDecl")
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined { return this.RVal && this.RVal.declaredClosure() }

  toString(space = 0) {
    let lval = ArrPatToString(this.LVal)

    if (!this.RVal) {
      return `${printScopedSpace(space)}▏ ${this.KIND} ${lval};`
    }

    return `${printScopedSpace(space)}▏ ${this.KIND} ${lval} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    let lval = ArrPatToString(this.LVal)

    if (!this.RVal) {
      return `${printSpace(space)} ${this.KIND} ${lval};`
    }

    return `${printSpace(space)} ${this.KIND} ${lval} = ${this.RVal.toDOT(space + 2)};`
  }
}

export const ObjPatToString = (LVal: JS3ObjectPattern) => {
  let keyToString = (p: JS3AssnObjectProperty_key) => {
    if (isIdentifier(p)) return p.name
    else if (isStringLiteral(p)) return `"${p.value}"`
    else if (isNumericLiteral(p)) return `${p.value}`
    else if (isBigIntLiteral(p)) return `${p.value}`
    else if (isDecimalLiteral(p)) return `${p.value}`
    else return `#${p.id.name}`
  }

  let lval = "{ "
  let len = LVal.properties.length
  let i = 0
  LVal.properties.forEach(p => {
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

  return lval
}

export class IS_ObjPatVarDecl extends ALL_IS {
  KIND: IS_VAR_DECL_KIND
  LVal: JS3ObjectPattern
  RVal: IV_ASSIGNABLE | null
  generatedBindings: Set<IV_Identifier>

  constructor(node: JS3VariableDeclaration | undefined = undefined, KIND: IS_VAR_DECL_KIND, LVal: JS3ObjectPattern, RVal: IV_ASSIGNABLE | null = null) {
    super(node);
    this.KIND = KIND
    this.LVal = LVal
    this.RVal = RVal

    this.generatedBindings = new Set()
    for (let p of LVal.properties) {
      if (isJS3AssnObjectProperty(p)) {
        this.generatedBindings.add(new IV_Identifier(undefined, p.value.name))
      } else {
        this.generatedBindings.add(new IV_Identifier(undefined, p.argument.name))
      }
    }
  }

  definedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ObjPatVarDecl")
  }

  usedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ObjPatVarDecl")
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined { return this.RVal && this.RVal.declaredClosure() }

  toString(space = 0) {
    let lval = ObjPatToString(this.LVal)
    if (!this.RVal) {
      return `${printScopedSpace(space)}▏ ${this.KIND} ${lval};`
    }
    return `${printScopedSpace(space)}▏ ${this.KIND} ${lval} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    let lval = ObjPatToString(this.LVal)

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

  definedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ThisInitStmt")
  }

  usedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ThisInitStmt")
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

  definedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ClassNameInitStmt")
  }

  usedIdentifiers(): Set<string> {
    throw new Error("Expected declaration hoisting pass to remove All IS_ClassNameInitStmt")
  }

  toString(space: number = 0) {
    return `${printScopedSpace(space)}▏ <ClassNameInit> ${this.LVal.toString()} = ${this.RVal.toString()};`
  }

  toDOT(space: number = 0) {
    return `${printSpace(space)} <ClassNameInit> ${this.LVal.toString()} = ${this.RVal.toDOT()};`
  }
}

type IS1_DeclarationStmt_orig = IS_SimpleVarDecl | IS_ArrPatVarDecl | IS_ObjPatVarDecl | IS_FunDecl | IS_ThisInitStmt | IS_ClassNameInitStmt | IS_BImport | IS_CImport | IRIDIUM_FG

export class IS1_DeclarationStmt extends ALL_IS {
  orig: IS1_DeclarationStmt_orig
  LVal: IV_Identifier | JS3ArrayPattern | JS3ObjectPattern
  RVal: IV_ASSIGNABLE

  constructor(orig: IS1_DeclarationStmt_orig, LVal: IV_Identifier | JS3ArrayPattern | JS3ObjectPattern, RVal: IV_ASSIGNABLE) {
    super(undefined);
    this.orig = orig
    this.LVal = LVal
    this.RVal = RVal
  }

  getBindingKind(): IS_VAR_DECL_KIND {
    if (this.orig instanceof IS_FunDecl) return "let" // NUBD
    if (this.orig instanceof IS_ClassNameInitStmt) return "let" // NUBD
    if (this.orig instanceof IS_BImport || this.orig instanceof IS_CImport) return "let" // undefined
    if (this.orig instanceof IS_ThisInitStmt) return "var" // undefined
    if (this.orig instanceof IRIDIUM_FG) return "const" // Defines the contextial THIS reference at function boundaries
    return this.orig.KIND
  }

  definedIdentifiers(): Set<string> {
    let res : Set<string> = new Set()
    // LVal is always defined
    if (this.LVal instanceof IV_Identifier) {
      res.add(this.LVal.name)
    } else if (isJS3ArrayPattern(this.LVal)) {
      for (let id of this.LVal.elements) {
        if (isIdentifier(id)) {
          res.add(id.name)
        } else {
          res.add(id.argument.name)
        }
      }
    } else {
      for (let p of this.LVal.properties) {
        if (isJS3AssnObjectProperty(p)) {
          res.add(p.value.name)
        } else {
          res.add(p.argument.name)
        }
      }
    }

    // If RVal happens to be an assignment or something, account for that
    if (this.RVal instanceof ALL_RVal) {
      let rValBindings = this.RVal.definedIdentifiers()
      rValBindings.forEach(b => res.add(b))
    }
    return res;
  }

  usedIdentifiers(): Set<string> {
    let res : Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.name)
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.name)
    } else if (this.RVal instanceof IV_ThisLookupPA){
      res.add(IV_This.lookupName())
    } else if (this.RVal instanceof IV_SuperLookupPA){
      res.add(ISP_Super.lookupName())
    } else {
      res = this.RVal.usedIdentifiers();
    }
    return res;
  }

  toString(space = 0) {
    let lval = isJS3ArrayPattern(this.LVal) ? ArrPatToString(this.LVal) : isJS3ObjectPattern(this.LVal) ? ObjPatToString(this.LVal) : this.LVal.name;
    return `${printScopedSpace(space)}▏💌 ${lval} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    let lval = isJS3ArrayPattern(this.LVal) ? ArrPatToString(this.LVal) : isJS3ObjectPattern(this.LVal) ? ObjPatToString(this.LVal) : this.LVal.name;
    return `${printScopedSpace(space)} 💌 ${lval} = ${this.RVal.toDOT(space + 2)};`
  }
}

export class IS1_AssignmentStmt extends ALL_IS {
  orig: IV_ClassExpression | IS_SimpleVarDecl | IS_ArrPatVarDecl | IS_ObjPatVarDecl | IS_FunDecl
  LVal: IV_Identifier | JS3ArrayPattern | JS3ObjectPattern
  RVal: IV_ASSIGNABLE

  constructor(orig: IV_ClassExpression | IS_SimpleVarDecl | IS_ArrPatVarDecl | IS_ObjPatVarDecl | IS_FunDecl, LVal: IV_Identifier | JS3ArrayPattern | JS3ObjectPattern, RVal: IV_ASSIGNABLE) {
    super(undefined);
    this.orig = orig
    this.LVal = LVal
    this.RVal = RVal
  }

  definedIdentifiers(): Set<string> {
    let res : Set<string> = new Set()
    // LVal is always defined
    if (this.LVal instanceof IV_Identifier) {
      res.add(this.LVal.name)
    } else if (isJS3ArrayPattern(this.LVal)) {
      for (let id of this.LVal.elements) {
        if (isIdentifier(id)) {
          res.add(id.name)
        } else {
          res.add(id.argument.name)
        }
      }
    } else {
      for (let p of this.LVal.properties) {
        if (isJS3AssnObjectProperty(p)) {
          res.add(p.value.name)
        } else {
          res.add(p.argument.name)
        }
      }
    }

    // If RVal happens to be an assignment or something, account for that
    if (this.RVal instanceof ALL_RVal) {
      let rValBindings = this.RVal.definedIdentifiers()
      rValBindings.forEach(b => res.add(b))
    }
    return res;
  }

  usedIdentifiers(): Set<string> {
    let res : Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.name)
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.name)
    } else if (this.RVal instanceof IV_ThisLookupPA){
      res.add(IV_This.lookupName())
    } else if (this.RVal instanceof IV_SuperLookupPA){
      res.add(ISP_Super.lookupName())
    } else {
      res = this.RVal.usedIdentifiers();
    }
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined { return this.RVal && this.RVal.declaredClosure() }

  toString(space = 0) {
    let lval = isJS3ArrayPattern(this.LVal) ? ArrPatToString(this.LVal) : isJS3ObjectPattern(this.LVal) ? ObjPatToString(this.LVal) : this.LVal.name;
    return `${printScopedSpace(space)}▏ ${lval} = ${this.RVal.toString(space + 2)};`
  }

  toDOT(space = 0) {
    let lval = isJS3ArrayPattern(this.LVal) ? ArrPatToString(this.LVal) : isJS3ObjectPattern(this.LVal) ? ObjPatToString(this.LVal) : this.LVal.name;
    return `${printScopedSpace(space)} ${lval} = ${this.RVal.toDOT(space + 2)};`
  }
}