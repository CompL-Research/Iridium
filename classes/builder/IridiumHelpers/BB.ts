import { recursivelyTraverseAllBBs } from "#utils"
import { JS3AllowedFunctionArgs, JS3BlockStatement, JS3CatchClause, JS3ConditionalExpression, JS3ContainedExprKey, JS3FunctionDeclaration, JS3IfStatement, JS3Program, JS3TryStatement, JS3UnaryExpression } from "../JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "./ALL_AMP/ALL_AMP.ts"
import { ALL_IS } from "./ALL_IS/ALL_IS.ts"
import { printScopedSpace } from "./IRIDIUM.ts"
import _generator from "@babel/generator"
import { OptionalCallExpression, OptionalMemberExpression } from "@babel/types"

const generator = _generator["default"]
type BBScopes = "Script" | "Module" | "Function" | "Block" | "Contained" | "FunctionArgInit" | "ClassInit" | "ClassStatic"


export class BBTerminal {

  getSuccessors() : Array<BB> {
    throw new Error("BBTerminal: getSuccessors UNIMPLEMENTED!!")
  }

  toString(space = 0) {
    throw new Error("BBTerminal: toString UNIMPLEMENTED!!")
  }
}

export class BranchTerminal extends BBTerminal {
  node?: JS3IfStatement | JS3ConditionalExpression
  on: IV_Identifier
  t: BB
  f: BB

  constructor(node: JS3IfStatement | JS3ConditionalExpression | undefined, on: IV_Identifier, t: BB, f: BB) {
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
    return `${printScopedSpace(space)}🬲 🤔 (${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`
  }
}

export class OptionalBranchTerminal extends BBTerminal {
  node?: OptionalCallExpression | OptionalMemberExpression
  on: IV_Identifier
  t: BB
  f: BB

  constructor(node: OptionalCallExpression | OptionalMemberExpression | undefined, on: IV_Identifier, t: BB, f: BB) {
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
    return `${printScopedSpace(space)}🬲 🤔 (${this.on}) 👍: (BB${this.t.idx}) 🔗: (BB${this.f.idx})`
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
    return `${printScopedSpace(space)}🬲 🥔 BB${this.to.idx}`
  }
}

export class GotoFunctionBody extends UnconditionalGoto {
  constructor(to: BB) {
    super(to);
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 🔔 BB${this.to.idx}`
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
    return `${printScopedSpace(space)}🬲 👮 🚨: (BB${this.handler.idx}) 👍: (BB${this.finalizer.idx})`
  }
}

export class ClassInitExit extends BBTerminal {
  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 👋 Class`
  }
}

export class ExitNode extends BBTerminal {
  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 👋 Exit`
  }
}

export class ErrorNode extends BBTerminal {
  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 🚨🚨 ERROR 🚨🚨`
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
      stmts.push(`${printScopedSpace(space)}`)
      stmts.push(`${printScopedSpace(space)}🬕 ${bb.printHeader()}`)
      // stmts.push(`${printScopedSpace(space)}BB${bb.idx} [${bb.scope}]:`)
      bb.statements.forEach(s => {
        stmts.push(s.toString(space))
      })
      stmts.push(bb.terminal.toString(space))
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

// ************************** TOP LEVEL **************************

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

// ************************** CLASS LEVEL **************************

export class ClassInitBB extends BB {
  
  constructor(args: Array<JS3AllowedFunctionArgs>) {
    super("ClassInit")
    throw new Error("Unhandled")
  }
}

export class ClassStaticBB extends BB {
  
  constructor(args: Array<JS3AllowedFunctionArgs>) {
    super("ClassStatic")
    throw new Error("Unhandled")
  }

}

// ************************** FUNCTION LEVEL **************************

export class FunctionBB extends BB {

  node: JS3FunctionDeclaration | JS3BlockStatement

  constructor(node: JS3FunctionDeclaration | JS3BlockStatement) {
    super("Function")
    this.node = node
  }

  create() {
    return new FunctionBB(this.node);
  }

}

export class FunctionArgInitBB extends BB {
  
  args: Array<JS3AllowedFunctionArgs>

  constructor(args: Array<JS3AllowedFunctionArgs>) {
    super("FunctionArgInit")
    this.args = args
  }

  create() {
    return new FunctionArgInitBB(this.args);
  }

  printHeader() {
    return `BB${this.idx} [${this.scope}] { args: ${this.args.length} }`
  }
}

// ************************** BLOCK LEVEL **************************

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

export class TryBB extends BlockBB {

  constructor(node: JS3TryStatement = undefined) {
    super(node)
    this.node = node
  }

  create() {
    return new TryBB(this.node);
  }

  printHeader() {
    return `BB${this.idx} [${this.scope} ~ Try]`
  }

}

export class CatchBB extends BlockBB {
  arg: IV_Identifier | null

  constructor(node: JS3CatchClause = undefined, arg: IV_Identifier) {
    super(node)
    this.arg = arg
  }

  create() {
    return new CatchBB(this.node, this.arg);
  }

  printHeader() {
    return `BB${this.idx} [${this.scope} ~ Catch(${this.arg ? this.arg.toString() : ""})] `
  }
}

// ************************** CONTAINED **************************

export class ContainedBB extends BB {
  node: OptionalMemberExpression | OptionalCallExpression | JS3UnaryExpression | JS3ContainedExprKey | undefined 
  comment: string

  constructor(node: OptionalMemberExpression | OptionalCallExpression | JS3ContainedExprKey | JS3UnaryExpression | undefined = undefined, comment = "") {
    super("Contained")
    this.node = node
    this.comment = comment
  }

  create() {
    return new ContainedBB(this.node, this.comment);
  }

  printHeader() {
    let comment = ""
    if (this.comment) {
      comment = "// " + this.comment
    } else if (this.node) {
      comment = "// " + generator(this.node).code
    }
    return `BB${this.idx} [${this.scope}] ${comment}`
  }

}

export class ContainedOptionalChainBB extends ContainedBB {
  node: OptionalMemberExpression | OptionalCallExpression | JS3ContainedExprKey | undefined 
  isOptional: boolean
  isTerminal: boolean
  isShortcircuit: boolean

  constructor(node: OptionalMemberExpression | OptionalCallExpression | JS3ContainedExprKey | undefined = undefined,comment = "", isOptional: boolean, isTerminal: boolean = false, isShortcircuit = false) {
    super(node, comment)
    this.isOptional = isOptional
    this.isTerminal = isTerminal
    this.isShortcircuit = isShortcircuit
  }

  create() {
    return new ContainedOptionalChainBB(this.node, this.comment, this.isOptional, this.isTerminal, this.isShortcircuit);
  }

  printHeader() {
    return `BB${this.idx} [${this.scope} ~ Optional=${this.isOptional}, Terminal=${this.isTerminal}, Shortcircuit=${this.isShortcircuit}] // ${this.comment}`
  }

}