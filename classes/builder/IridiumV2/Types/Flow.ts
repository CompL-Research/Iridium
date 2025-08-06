import { printIriSpace } from "#utils";
import { isResolveEnvBindingSEXP, ResolveEnvBindingSEXP } from "./AbstractOperations";
import { IridiumSEXP } from "./General";
import { NullSEXP } from "./Primitives";

export class JSCatchContextSEXP extends IridiumSEXP {
  constructor(val: string) {
    super("JSCatchContext");
    this.args.push(new ResolveEnvBindingSEXP(val));
  }

  getBindingName(): string {
    if (isResolveEnvBindingSEXP(this.args[0])) {
      return this.args[0].getBindingName();
    } else throw new Error("Expected binding in JSCatchContext Node");
  }
}

export type GotoSEXPFlags = "IDX";
export class GotoSEXP extends IridiumSEXP {
  constructor(idx: number) {
    super("Goto");
    this.setIDX(idx);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO[${this.getIDX()}]`
  }
}

// (Extended) PushCatchContext
export type PushCatchContextFlags = "IDX";
export class PushCatchContextSEXP extends IridiumSEXP {
  constructor(idx: number) {
    super("PushCatchContext");
    this.setIDX(idx);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}CATCH[${this.getIDX()}]`
  }
}

// (Extended) PushForOfCatchContext
export type PushForOfCatchContextFlags = "IDX";
export class PushForOfCatchContextSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP) {
    super("PushForOfCatchContext");
    this.args.push(obj);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}FOR-OF-CATCH[${this.args[0].toString(0)}]`
  }
}

// (Extended) ThrowSEXP
export class ThrowSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Throw");
    this.args.push(val);
  }

  // Flags
  toString(space?: number): string {
    return `${printIriSpace(space)}Throw ${this.args[0].toString(0)}`
  }
}

// (Extended) PopCatchContext
export type PopCatchContextFlags = "IDX";
export class PopCatchContextSEXP extends IridiumSEXP {
  constructor() {
    super("PopCatchContext");
  }

  // Flags
  toString(space?: number): string {
    return `${printIriSpace(space)}POP CATCH`
  }
}

// (Extended) InvokeFinalizer
export type InvokeFinalizerFlags = "IDX";
export class InvokeFinalizerSEXP extends IridiumSEXP {
  constructor(idx: number) {
    super("InvokeFinalizer");
    this.setIDX(idx);
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}FINALIZER[${this.getIDX()}]`
  }
}

export class ReturnSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Return");
    this.args.push(val);
  }

  setModuleEarlyReturn() {
    this.setFlag("ModuleEarlyReturn");
  }

  isModuleEarlyReturn() : boolean {
    return this.hasFlag("ModuleEarlyReturn");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}return ${this.args[0].toString(0)}`
  }
}

export class RetSEXP extends IridiumSEXP {
  constructor() {
    super("Ret");
  }
}

// (Primitive) IfElseJump
export type IfElseJumpSEXPFlags = "TRUE" | "FALSE";
export class IfElseJumpSEXP extends IridiumSEXP {
  constructor(test: IridiumSEXP | null, trueTarget: number, falseTarget: number) {
    super("IfElseJump");
    if (test) this.setTest(test);
    else this.setTest(new NullSEXP());
    this.setTRUE(trueTarget);
    this.setFALSE(falseTarget);
  }

  // Args
  setTest(test: IridiumSEXP) {
    this.args[0] = test;
  }

  getTest() {
    return this.args[0];
  }

  // Flags
  setTRUE(idx: number) {
    this.setFlag("TRUE", idx)
  }

  getTRUE(): number {
    return this.getFlagNumber("TRUE");
  }

  setFALSE(idx: number) {
    this.setFlag("FALSE", idx)
  }

  getFALSE(): number {
    return this.getFlagNumber("FALSE");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO (${this.getTest().toString(0)}) ? ${this.getTRUE()} : ${this.getFALSE()}`;
  }
}

// (Primitive) IfJumpSEXP
export type IfJumpSEXPFlags = "IDX" | "NOT";
export class IfJumpSEXP extends IridiumSEXP {
  constructor(test: IridiumSEXP | null, target: number) {
    super("IfJump");
    if (test) this.setTest(test);
    else this.setTest(new NullSEXP());
    this.setIDX(target);
  }

  // Args
  setNot() {
    this.setFlag("NOT");
  }

  unsetNot() {
    this.removeFlag("NOT");
  }

  isNot() {
    return this.hasFlag("NOT");
  }

  setTest(test: IridiumSEXP) {
    this.args[0] = test;
  }

  getTest() {
    return this.args[0];
  }

  // Flags
  setIDX(idx: number) {
    this.setFlag("IDX", idx)
  }

  getIDX(): number {
    return this.getFlagNumber("IDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO (${this.isNot() ? "! " : ""}${this.getTest().toString(0)}) ? GOTO ${this.getIDX()} : 👇`;
  }
}


// @ts-ignore
export function isReturnSEXP(o: any): o is ReturnSEXP {
  // @ts-ignore
  return o.tag === "Return";
}


// @ts-ignore
export function isJSCatchContextSEXP(o: any): o is JSCatchContextSEXP {
  // @ts-ignore
  return o.tag === "JSCatchContext";
}
