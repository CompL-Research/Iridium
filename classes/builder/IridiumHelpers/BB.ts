import { recursivelyTraverseAllBBs } from "#utils"
import _generator from "@babel/generator"
import { ForInStatement, ForOfStatement, OptionalCallExpression, OptionalMemberExpression, SpreadElement } from "@babel/types"
import { JS3AllowedFunctionArgs, JS3BlockStatement, JS3CatchClause, JS3ClassExpression, JS3ClassProperty_value, JS3ConditionalExpression, JS3ContainedExprKey, JS3DoWhileStatement, JS3ForInStatement, JS3ForOfStatement, JS3ForStatement, JS3ForStatement_init, JS3FunctionDeclaration, JS3IfStatement, JS3Program, JS3StaticBlock, JS3SwitchCase, JS3SwitchStatement, JS3TryStatement, JS3UnaryExpression, JS3WhileStatement } from "../JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "./ALL_AMP/ALL_AMP.ts"
import { ALL_IS } from "./ALL_IS/ALL_IS.ts"
import { printScopedSpace, printSpace } from "./IRIDIUM.ts"

const generator = _generator["default"]
type BBScopes = "Script" | "Module" | "Function" | "Block" | "Contained" | "FunctionArgInit" | "ClassInit" | "ClassStatic" | "ClassPropValue"


export class BBTerminal {

  getSuccessors(): Array<BB> {
    throw new Error("BBTerminal: getSuccessors UNIMPLEMENTED!!")
  }

  toString(space = 0) {
    throw new Error("BBTerminal: toString UNIMPLEMENTED!!")
  }

  toDOT(space = 0) {
    throw new Error("BBTerminal: toDOT UNIMPLEMENTED!!")
  }
}

type BranchTerminal_node = JS3IfStatement | JS3ConditionalExpression | JS3WhileStatement | JS3ForStatement | JS3DoWhileStatement | JS3SwitchCase | JS3ForInStatement | JS3ForOfStatement
export class BranchTerminal extends BBTerminal {
  node?: BranchTerminal_node
  on: IV_Identifier
  t: BB
  f: BB

  constructor(node: BranchTerminal_node, on: IV_Identifier, t: BB, f: BB) {
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

  toDOT(space = 0) {
    return `${printSpace(space)} 🤔 (${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`
  }
}

export class SwitchCaseTerminal extends BranchTerminal {
  constructor(node: JS3SwitchCase, on: IV_Identifier, t: BB, f: BB) {
    super(node, on, t, f)
  }
  
  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 🎐 (${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`
  }


  toDOT(space = 0) {
    return `${printSpace(space)}🎐 (${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`
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

  toDOT(space = 0) {
    return `${printSpace(space)} 🤔 (${this.on}) 👍: (BB${this.t.idx}) 🔗: (BB${this.f.idx})`
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

  toDOT(space = 0) {
    return `${printSpace(space)} 🥔 BB${this.to.idx}`
  }
}

export class GotoFunctionBody extends UnconditionalGoto {
  constructor(to: BB) {
    super(to);
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 🔔 BB${this.to.idx}`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 🔔 BB${this.to.idx}`
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

  toDOT(space = 0) {
    return `${printSpace(space)} 👮 🚨: (BB${this.handler.idx}) 👍: (BB${this.finalizer.idx})`
  }
}

export class ClassPropInitExit extends BBTerminal {
  res: IV_Identifier

  constructor(res: IV_Identifier) {
    super()
    this.res = res
  }

  getSuccessors(): Array<BB> {
    return []
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 🙋 PropInit(${this.res.toString()})`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 🙋 PropInit(${this.res.toString()})`
  }
}

export class ClassStaticExit extends UnconditionalGoto {

  constructor(to: BB) {
    super(to)
  }

  getSuccessors(): Array<BB> {
    return []
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 👋 Static Block End`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 👋 Static Block End`
  }
}

export class ExitNode extends BBTerminal {
  
  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 👋 Exit`
  }

  getSuccessors(): Array<BB> {
    return []
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 👋 Exit`
  }
}

export class ErrorNode extends BBTerminal {
  toString(space = 0) {
    return `${printScopedSpace(space)}🬲 🚨🚨 ERROR 🚨🚨`
  }

  getSuccessors(): Array<BB> {
    return []
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 🚨🚨 ERROR 🚨🚨`
  }
}

export class BB {
  scope: BBScopes
  statements: Array<ALL_IS>
  idx: number
  static count = 0
  terminal: BBTerminal | undefined

  getName() { return `BB${this.idx}` }

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
      bb.statements.forEach(s => {
        stmts.push(s.toString(space))
      })
      stmts.push(bb.terminal.toString(space))
    }

    return stmts.join("\n")
  }

  toDOTData() { return `${this.statements.map(s => s.toDOT()).join("\\l")}\\l${this.terminal.toDOT()}\\l` }

  toDOT(space = 0, alreadyVisited : Set<BB> = new Set()) {
    if (alreadyVisited.has(this)) return;
    else alreadyVisited.add(this)
    let stmts = []
    stmts.push(`${printSpace(space + 2)} ${this.getName()}[shape="box",xlabel="${this.printHeader().replace(/"/g, '\\"')}",label="${this.toDOTData().replace(/"/g, '\\"')}"]`)

    // Visit BB's successors and print their data
    let succ = this.terminal.getSuccessors()
    
    for (let s of succ) {
      stmts.push(`${printSpace(space + 2)} ${this.getName()} -> ${s.getName()};`)
    }
    
    stmts.push(...succ.map(s => s.toDOT(space, alreadyVisited)))

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
  node: JS3ClassExpression
  className: IV_Identifier | undefined
  comment: string

  constructor(node: JS3ClassExpression, className: IV_Identifier | undefined, comment: string = "") {
    super("ClassInit")
    this.node = node
    this.className = className
    this.comment = comment
  }

  printHeader() {
    return `BB${this.idx} [${this.scope}${this.className ? `, class="${this.className.toString()}"` : ""}] ${this.comment !== "" ? "//" + this.comment : ""}`
  }

  create() {
    return new ClassInitBB(this.node, this.className, this.comment);
  }
}

export class ClassStaticBB extends BB {
  node: JS3StaticBlock
  comment: string

  constructor(node: JS3StaticBlock, comment: string = "") {
    super("ClassStatic")
    this.node = node
    this.comment = comment
  }

  printHeader() {
    return `BB${this.idx} [${this.scope}] ${this.comment !== "" ? "//" + this.comment : ""}`
  }

  create() {
    return new ClassStaticBB(this.node, this.comment);
  }
}

export class ClassPropInitBB extends BB {
  node: JS3ClassProperty_value | undefined
  comment: string

  constructor(node: JS3ClassProperty_value | undefined = undefined, comment = "") {
    super("ClassPropValue")
    this.node = node
    this.comment = comment
  }

  printHeader() {
    return `BB${this.idx} [${this.scope}] ${this.comment ? "// " + this.comment : ""}`
  }

  create() {
    return new ClassPropInitBB(this.node, this.comment);
  }
}

// ************************** FUNCTION LEVEL **************************

export class FunctionBB extends BB {
  node: JS3StaticBlock | JS3FunctionDeclaration | JS3BlockStatement

  constructor(node: JS3StaticBlock | JS3FunctionDeclaration | JS3BlockStatement) {
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
  label: IV_Identifier | undefined

  constructor(node: any = undefined) {
    super("Block")
    this.node = node
  }

  setLabel(label: IV_Identifier) {
    this.label = label
  }

  create() {
    return new BlockBB(this.node);
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope}] {${this.label ? `label: ${this.label}` : ""}}`
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
    return `BB${this.idx} [${this.scope} ~ Catch(${this.arg ? this.arg.toString() : ""})]`
  }
}

export class ForLoopInitBB extends BlockBB {

  constructor(node: JS3ForStatement_init = undefined) {
    super(node)  
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope} ~ ForLoopInit]`
  }

}

export class ForInOfLoopInitBB extends BlockBB {

  constructor(node: JS3ForInStatement | JS3ForOfStatement = undefined) {
    super(node)  
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope} ~ ForInOfLoopInit]`
  }

}

export class SwitchBodyBB extends BlockBB {

  constructor(node: JS3SwitchStatement = undefined) {
    super(node)
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope} ~ SwitchBody]`
  }
}

// ************************** CONTAINED **************************
type ContainedBB_node = undefined | OptionalMemberExpression | OptionalCallExpression | JS3ContainedExprKey | JS3UnaryExpression | SpreadElement | JS3SwitchCase | ForInStatement | ForOfStatement
export class ContainedBB extends BB {
  node: ContainedBB_node
  parentBB: BB
  comment: string

  constructor(node: ContainedBB_node, parentBB: BB, comment = "") {
    super("Contained")
    this.node = node
    this.parentBB = parentBB
    this.comment = comment
  }

  create() {
    return new ContainedBB(this.node, this.parentBB, this.comment);
  }

  printHeader() {
    let comment = ""
    if (this.comment) {
      comment = "// " + this.comment
    }
    return `BB${this.idx} [${this.scope} in BB${this.parentBB.idx}] ${comment}`
  }

}

export class ContainedOptionalChainBB extends ContainedBB {
  node: OptionalMemberExpression | OptionalCallExpression | JS3ContainedExprKey | undefined
  isOptional: boolean
  isTerminal: boolean
  isShortcircuit: boolean

  constructor(node: OptionalMemberExpression | OptionalCallExpression | JS3ContainedExprKey | undefined = undefined, comment = "", isOptional: boolean, isTerminal: boolean = false, isShortcircuit = false) {
    super(node, undefined, comment)
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