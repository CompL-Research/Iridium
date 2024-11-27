import { JS3Program } from "../JS3Helpers/JS3Types.ts"
import { ALL_IS } from "./ALL_IS/ALL_IS.ts"

type BBScopes = "Script" | "Module" | "Function" | "AnonFunction" | "Block" | "CKE"

// IS_Debugger
// | IS_VarDecl
// | IS_Return
// | IS_ES
// | IS_Throw
// | IS_FunDecl

export class BB {
  scope: BBScopes
  statements: Array<ALL_IS>
  idx: number
  static count = 0

  constructor(scope: BBScopes) {
    this.scope = scope
    this.statements = []
    this.idx = BB.count++
  }

  toString(space = 0) {
    throw new Error("ALL_IS: toString not implemented!!");
  }

}

export class ScriptBB extends BB {
  node: JS3Program

  constructor(node: JS3Program) {
    super("Script")
    this.node = node
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${" ".repeat(space)}BB${this.idx} [Script]:`)
    this.statements.forEach(s => {
        stmts.push(s.toString(space + 2))
      }
    )

    return stmts.join("\n")
  }

}

export class ModuleBB extends BB {
  node: JS3Program
  
  constructor(node: JS3Program) {
    super("Module")
    this.node = node
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${" ".repeat(space)}BB${this.idx} [Module]:`)
    this.statements.forEach(s => {
        stmts.push(s.toString(space + 2))
      }
    )

    return stmts.join("\n")
  }

}

export class FunctionBB extends BB {

  constructor() {
    super("Function")
  }

  toString(space = 0) {
    let stmts = []
    stmts.push(`${" ".repeat(space)}BB${this.idx} [Function]:`)
    this.statements.forEach(s => {
        stmts.push(s.toString(space + 2))
      }
    )

    return stmts.join("\n")
  }

}

export class AnonFunctionBB extends BB {

  constructor() {
    super("AnonFunction")
  }

  toString() {
    throw new Error("AnonFunctionBB: toString not implemented!!");
  }

}

export class BlockBB extends BB {

  constructor() {
    super("Block")
  }

  toString() {
    throw new Error("BlockBB: toString not implemented!!");
  }

}

export class CKEBB extends BB {

  constructor() {
    super("CKE")
  }

  toString() {
    throw new Error("CKEBB: toString not implemented!!");
  }

}