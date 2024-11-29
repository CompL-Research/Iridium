import { recursivelyTraverseAllBBs } from "#utils"
import { JS3BlockStatement, JS3CatchClause, JS3FunctionDeclaration, JS3IfStatement, JS3Program, JS3TryStatement, JS3TryStatement_block } from "../JS3Helpers/JS3Types.ts"
import { ALL_IS } from "./ALL_IS/ALL_IS.ts"
import { IV_Identifer } from "./ALL_RVal/IV_Identifier.ts"

type BBScopes = "Script" | "Module" | "Function" | "AnonFunction" | "Block" | "CKE" | "Catch" | "Try"

export class BBTerminal {

  getSuccessors() : Array<BB> {
    throw new Error("BBTerminal: getSuccessors UNIMPLEMENTED!!")
  }

  toString(space = 0) {
    throw new Error("BBTerminal: toString UNIMPLEMENTED!!")
  }
}

export class BranchTerminal extends BBTerminal {
  node?: JS3IfStatement
  on: IV_Identifer
  t: BB
  f: BB

  constructor(node: JS3IfStatement | undefined, on: IV_Identifer, t: BB, f: BB) {
    super();
    this.node = node;
    this.on = on
    this.t = t;
    this.f = f;
  }

  getSuccessors() {
    return [this.t, this.f]
  }

  toString(space = 0) {
    return `${" ".repeat(space)}███ BRANCH(${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`
  }
}

export class UnconditionalGoto extends BBTerminal {
  to: BB
  constructor(to: BB) {
    super();
    this.to = to;
  }

  getSuccessors() {
    return [this.to]
  }

  toString(space = 0) {
    return `${" ".repeat(space)}███ GOTO BB${this.to.idx}`
  }
}

export class TryCatchConditionalGoto extends BBTerminal {
  handler: BB
  finalizer: BB
  
  constructor(handler: BB, finalizer: BB) {
    super();
    this.handler = handler;
    this.finalizer = finalizer;
  }

  getSuccessors() {
    return [this.handler, this.finalizer]
  }

  toString(space = 0) {
    return `${" ".repeat(space)}███ ERR_BRANCH ERR: (BB${this.handler.idx}) NORM: (BB${this.finalizer.idx})`
  }
}

export class ExitNode extends BBTerminal {
  toString(space = 0) {
    return `${" ".repeat(space)}███ EXIT`
  }
}

export class BB {
  scope: BBScopes
  statements: Array<ALL_IS>
  idx: number
  static count = 0
  terminal: BBTerminal | undefined

  constructor(scope: BBScopes) {
    this.scope = scope
    this.statements = []
    this.idx = BB.count++
  }

  toString(space = 0) {
    let stmts = []

    // Traverse all BB's
    let BBs = recursivelyTraverseAllBBs(this)

    for (let bb of BBs) {
      stmts.push(`${" ".repeat(space)}  ███ ${bb.printHeader()}`)
      // stmts.push(`${" ".repeat(space)}BB${bb.idx} [${bb.scope}]:`)
      bb.statements.forEach(s => {
        stmts.push(s.toString(space + 2))
      })
      stmts.push(bb.terminal.toString(space + 2))
      stmts.push(``)
    }

    return stmts.join("\n")
  }

  create(): BB {
    throw new Error("BB: create not implemented!!");
  }

  printHeader() {
    return `BB${this.idx} [${this.scope}]`
  }

}

export class CatchBB extends BB {
  arg: IV_Identifer | null

  constructor(arg: IV_Identifer) {
    super("Catch")
    this.arg = arg
  }

  toString(space = 0) {
    let stmts = []

    // Traverse all BB's
    let BBs = recursivelyTraverseAllBBs(this)

    for (let bb of BBs) {
      stmts.push(`${" ".repeat(space)}BB${bb.idx} [${bb.scope}] (${this.arg}):`)
      bb.statements.forEach(s => {
        stmts.push(s.toString(space + 2))
      })
      stmts.push(bb.terminal.toString(space + 2))
    }

    return stmts.join("\n")
  }

  create() {
    return new CatchBB(this.arg);
  }

  printHeader() {
    return `BB${this.idx} [${this.scope}] (${this.arg ? this.arg.toString() : ""})`
  }
}

export class ScriptBB extends BB {
  node: JS3Program

  constructor(node: JS3Program) {
    super("Script")
    this.node = node
  }

  create() {
    return new ScriptBB(this.node);
  }

}

export class ModuleBB extends BB {
  node: JS3Program

  constructor(node: JS3Program) {
    super("Module")
    this.node = node
  }

  create() {
    return new ModuleBB(this.node);
  }

}

export class FunctionDeclBB extends BB {

  node: JS3FunctionDeclaration

  constructor(node: JS3FunctionDeclaration) {
    super("Function")
    this.node = node
  }

  create() {
    return new FunctionDeclBB(this.node);
  }

}

export class AnonFunctionBB extends BB {

  constructor() {
    super("AnonFunction")
  }

}

export class BlockBB extends BB {
  node?: any

  constructor(node: any = undefined) {
    super("Block")
    this.node = node
  }

  create() {
    return new BlockBB(this.node);
  }
}

export class TryBlockBB extends BB {
  node: JS3BlockStatement

  constructor(node: JS3BlockStatement = undefined) {
    super("Try")
    this.node = node
  }

  create() {
    return new TryBlockBB(this.node);
  }
}

export class CKEBB extends BB {

  constructor() {
    super("CKE")
  }

}