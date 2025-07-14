import { printScopedSpace, printSpace } from "#utils";
import { OptionalCallExpression, OptionalMemberExpression } from "@babel/types";
import {
  isJS3CatchClause,
  isJS3DoWhileStatement,
  isJS3ForInStatement,
  isJS3ForOfStatement,
  isJS3ForStatement,
  isJS3SwitchStatement,
  isJS3TryStatement,
  isJS3WhileStatement,
  JS3AllowedFunctionArgs,
  JS3BlockStatement,
  JS3CatchClause,
  JS3ClassExpression,
  JS3ClassProperty_value,
  JS3ConditionalExpression,
  JS3ContainedExprKey,
  JS3DoWhileStatement,
  JS3ForInStatement,
  JS3ForOfStatement,
  JS3ForStatement,
  JS3FunctionDeclaration,
  JS3IfStatement,
  JS3LabeledStatement,
  JS3Program,
  JS3StaticBlock,
  JS3SwitchCase,
  JS3SwitchStatement,
  JS3TryStatement,
  JS3WhileStatement,
} from "../../classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "./ALL_AMP/ALL_AMP.ts";
import { ALL_IS } from "./ALL_IS/ALL_IS.ts";
import { Environment } from "./I_GENERAL/I_Environment.ts";
import debugConfig from "#debugConfig";
type BBScopes =
  | "Script"
  | "Module"
  | "Function"
  | "Block"
  | "Contained"
  | "FunctionArgInit"
  | "FunctionReturn"
  | "ClassInit"
  | "ClassStatic"
  | "ClassPropValue";

export class BBTerminal {
  getSuccessors(): Array<BB> {
    throw new Error("BBTerminal: getSuccessors UNIMPLEMENTED!!");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toString(_space = 0) {
    throw new Error("BBTerminal: toString UNIMPLEMENTED!!");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    throw new Error("BBTerminal: toDOT UNIMPLEMENTED!!");
  }
}

type BranchTerminal_node =
  | JS3IfStatement
  | JS3ConditionalExpression
  | JS3WhileStatement
  | JS3ForStatement
  | JS3DoWhileStatement
  | JS3SwitchCase
  | JS3ForInStatement
  | JS3ForOfStatement
  | OptionalMemberExpression
  | OptionalCallExpression;
export class BranchTerminal extends BBTerminal {
  node?: BranchTerminal_node;
  on: IV_Identifier;
  t: BB;
  f: BB;

  constructor(node: BranchTerminal_node, on: IV_Identifier, t: BB, f: BB) {
    super();
    this.node = node;
    this.on = on;
    this.t = t;
    this.f = f;
  }

  getSuccessors() {
    return [this.t, this.f];
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ 🤔 (${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`;
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 🤔 (${this.on}) 👍: (BB${this.t.idx}) 👎: (BB${this.f.idx})`;
  }
}

export class BB {
  scope: BBScopes;
  statements: Array<ALL_IS>;
  idx: number;
  static count = 0;
  preds: Set<BB> = new Set(); // Predecessor BBs
  branchTerminal: BranchTerminal | undefined;

  env: Environment;

  getName() {
    return `BB${this.idx}`;
  }

  constructor(env: Environment, scope: BBScopes) {
    this.scope = scope;
    this.statements = [];
    this.idx = BB.count++;
    this.env = env;
  }

  toString(space = 0) {
    const stmts = [];
    // let i = 0;
    this.statements.forEach((s) => {
      stmts.push(`${s.toString(space)}`);
    });

    if (this.branchTerminal) {
      stmts.push(this.branchTerminal.toString(space));
    }

    return stmts.join("\n");
  }

  toDOTData() {
    const terminalData = this.branchTerminal
      ? `\\l${this.branchTerminal.toDOT()}`
      : "";
    return `${this.statements.map((s) => s.toDOT()).join("\\l")}\\l${terminalData}\\l`.replace(
      /"/g,
      '\\"',
    );
  }

  toDOT(space = 0) {
    const stmts = [];
    stmts.push(
      `${printSpace(space)} "${this.getName()}"[shape="box",xlabel="${this.printHeader()}",label="${this.printMetaDOT()}${this.toDOTData()}"]`,
    );
    return stmts.join("\n");
  }

  create(): BB {
    throw new Error("BB: create not implemented!!");
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope}]`;
  }

  printHeaderDOT() {
    return `BB${this.idx}`;
  }

  printMetaDOT() {
    const preds = [...this.preds].map((b) => b.printHeader()).join(",");
    return ` 👪 : ${preds}\\l 🫶 : ${this.scope}\\l\\l`.replace(/"/g, '\\"');
  }
}

// ************************** TOP LEVEL SCOPE **************************
//
// These scopes are allowed to declare: let, const and var bindings
//

export class ScriptBB extends BB {
  node: JS3Program;

  constructor(env: Environment, node: JS3Program) {
    super(env, "Script");
    this.node = node;
  }

  create() {
    return new ScriptBB(this.env, this.node);
  }
}

export class ModuleBB extends BB {
  node: JS3Program;

  constructor(env: Environment, node: JS3Program) {
    super(env, "Module");
    this.node = node;
  }

  create() {
    return new ModuleBB(this.env, this.node);
  }
}

// ************************** FUNCTION LEVEL **************************
//
// These scopes are allowed to declare: let, const and var bindings
//

export class FunctionArgInitBB extends BB {
  args: Array<JS3AllowedFunctionArgs>;

  constructor(env: Environment, args: Array<JS3AllowedFunctionArgs>) {
    super(env, "FunctionArgInit");
    this.args = args;
  }

  create() {
    return new FunctionArgInitBB(this.env, this.args);
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope}] { args: ${this.args.length} }`;
  }
}

export class FunctionBB extends BB {
  node: JS3StaticBlock | JS3FunctionDeclaration | JS3BlockStatement;

  retBB: FunctionReturn;

  constructor(
    env: Environment,
    node: JS3StaticBlock | JS3FunctionDeclaration | JS3BlockStatement,
    retBB: FunctionReturn,
  ) {
    super(env, "Function");
    this.node = node;
    this.retBB = retBB;
  }

  create() {
    return new FunctionBB(this.env, this.node, this.retBB);
  }
}

export class FunctionReturn extends BB {
  arg: IV_Identifier;

  constructor(env: Environment, arg: IV_Identifier) {
    super(env, "FunctionReturn");
    this.arg = arg;
  }

  toDOT(space = 0) {
    const stmts = [];
    stmts.push(
      `${printSpace(space)} "${this.getName()}"[shape="box",xlabel="${this.printHeader()}",label="${this.printMetaDOT()}RETURN ${this.arg.toString()};\\l"]`,
    );
    return stmts.join("\n");
  }

  create() {
    throw new Error("Extending Function Return Block is unexpected");
    return new BB(undefined, "Block");
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope}] { return: ${this.arg.toString()} }`;
  }
}

// ************************** CLASS INIT LEVEL **************************
//
// These are BB contexts used when creating/initializing a class
//

//
// This scope is allowed to declare: let and const bindings; all bindings created in this scope are tempvars
//
export class ClassInitBB extends BB {
  node: JS3ClassExpression;
  className: IV_Identifier | undefined;

  constructor(
    env: Environment,
    node: JS3ClassExpression,
    className: IV_Identifier | undefined,
  ) {
    super(env, "ClassInit");
    this.node = node;
    this.className = className;
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope} ~ ClassInit [${this.className ? this.className.toString() : ""}]]`;
  }

  create() {
    return new ClassInitBB(this.env, this.node, this.className);
  }
}

//
// This scope is allowed to declare: let, const and var bindings
//
export class ClassStaticBB extends BB {
  node: JS3StaticBlock;
  comment: string;

  constructor(env: Environment, node: JS3StaticBlock, comment: string = "") {
    super(env, "ClassStatic");
    this.node = node;
    this.comment = comment;
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope}] ${this.comment !== "" ? "//" + this.comment : ""}`;
  }

  create() {
    return new ClassStaticBB(this.env, this.node, this.comment);
  }
}

//
// This scope is allowed to declare: let and const bindings; all bindings created in this scope are tempvars
//
export class ClassPropInitBB extends BB {
  node: JS3ClassProperty_value | undefined;
  comment: string;

  constructor(
    env: Environment,
    node: JS3ClassProperty_value | undefined = undefined,
    comment = "",
  ) {
    super(env, "ClassPropValue");
    this.node = node;
    this.comment = comment;
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope}] ${this.comment ? "// " + this.comment : ""}`;
  }

  create() {
    return new ClassPropInitBB(this.env, this.node, this.comment);
  }
}

// ************************** BLOCK LEVEL **************************
//
// These scopes are allowed to declare: let and const bindings
//
export type BlockBB_NODE =
  | JS3TryStatement
  | JS3CatchClause
  | JS3ForStatement
  | JS3DoWhileStatement
  | JS3ForInStatement
  | JS3ForOfStatement
  | JS3WhileStatement
  | JS3SwitchStatement
  | JS3ContainedExprKey
  | JS3SwitchCase
  | JS3BlockStatement
  | JS3LabeledStatement;
export class BlockBB extends BB {
  node: BlockBB_NODE | undefined;
  label: IV_Identifier | undefined;

  constructor(env: Environment, node: BlockBB_NODE = undefined) {
    super(env, "Block");
    this.node = node;
  }

  setLabel(label: IV_Identifier) {
    this.label = label;
  }

  create() {
    return new BlockBB(this.env, this.node);
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope}] {${this.label ? `label: ${this.label}` : ""}}`;
  }
}

export class TryBB extends BlockBB {
  constructor(env: Environment, node: JS3TryStatement = undefined) {
    super(env, node);
    this.node = node;
  }

  create() {
    if (!isJS3TryStatement(this.node)) {
      debugConfig.logger.throwIriError("Expected node to be JS3TryStatement");
    } else {
      return new TryBB(this.env, this.node);
    }
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope} ~ Try]`;
  }
}

export class CatchBB extends BlockBB {
  arg: IV_Identifier | null;

  constructor(
    env: Environment,
    node: JS3CatchClause = undefined,
    arg: IV_Identifier,
  ) {
    super(env, node);
    this.arg = arg;
  }

  create() {
    if (!isJS3CatchClause(this.node)) {
      debugConfig.logger.throwIriError("Expected node to be JS3CatchClause");
    } else {
      return new CatchBB(this.env, this.node, this.arg);
    }
  }

  printHeader() {
    return `BB${this.idx} -- E${this.env.idx} [${this.scope} ~ Catch(${this.arg ? this.arg.toString() : ""})]`;
  }
}

//
// LoopHead Signifier
//

export class LoopHeadBB extends BlockBB {
  breakTarget: BB = undefined;
  continueTarget: BB = undefined;

  constructor(
    env: Environment,
    node:
      | JS3ForStatement
      | JS3DoWhileStatement
      | JS3ForInStatement
      | JS3ForOfStatement
      | JS3WhileStatement = undefined,
  ) {
    super(env, node);
  }

  setBreakTarget(bb: BB) {
    this.breakTarget = bb;
  }
  getBreakTarget() {
    return this.breakTarget;
  }

  setContinueTarget(bb: BB) {
    this.continueTarget = bb;
  }
  getContinueTarget() {
    return this.continueTarget;
  }

  create() {
    if (
      isJS3ForStatement(this.node) ||
      isJS3DoWhileStatement(this.node) ||
      isJS3ForInStatement(this.node) ||
      isJS3ForOfStatement(this.node) ||
      isJS3WhileStatement(this.node)
    ) {
      return new LoopHeadBB(this.env, this.node);
    } else {
      debugConfig.logger.throwIriError(
        `Expected node to be JS3ForStatement | JS3DoWhileStatement | JS3ForInStatement | JS3ForOfStatement | JS3WhileStatement, GOT: ${this.node.type}`,
      );
    }
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope} ~ LoopHead${this.label ? ` ~ ${this.label}` : ""}]`;
  }
}

export class LoopInit extends BlockBB {
  constructor(
    env: Environment,
    node: JS3ForInStatement | JS3ForOfStatement | JS3ForStatement = undefined,
  ) {
    super(env, node);
  }

  create() {
    if (
      isJS3ForInStatement(this.node) ||
      isJS3ForOfStatement(this.node) ||
      isJS3ForStatement(this.node)
    ) {
      return new LoopInit(this.env, this.node);
    } else {
      debugConfig.logger.throwIriError(
        "Expected node to be JS3ForStatement | JS3ForInStatement | JS3ForOfStatement",
      );
    }
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope} ~ LoopInit]`;
  }
}

export class SwitchBodyBB extends BlockBB {
  breakTarget: BB = undefined;

  constructor(
    env: Environment,
    node: JS3SwitchStatement = undefined,
    breakTarget = undefined,
  ) {
    super(env, node);
    this.breakTarget = breakTarget;
  }

  setBreakTarget(bb: BB) {
    this.breakTarget = bb;
  }
  getBreakTarget() {
    return this.breakTarget;
  }

  create() {
    if (!isJS3SwitchStatement(this.node)) {
      debugConfig.logger.throwIriError(
        "Expected node to be JS3SwitchStatement",
      );
    } else {
      return new SwitchBodyBB(this.env, this.node, this.breakTarget);
    }
  }

  printHeader(): string {
    return `BB${this.idx} [${this.scope} ~ SwitchBody]`;
  }
}
