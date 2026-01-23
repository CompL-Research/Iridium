import { printIriSpace } from "#utils";
import { NullSEXP } from "../RVAL/Primitives";
import { IridiumSEXP } from "../Structural/General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Standard Goto statement.
 * 
 * #### Structure
 * 
 * - `FLAG(IDX : number)`: IDX of the BB to flow the control to.
 * 
 */
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

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Pushes Catch Offset onto the stack.
 * 
 * #### Structure
 * 
 * - `FLAG(IDX : number)`: IDX of the BB to flow the control to.
 * 
 */
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

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Throws a value, which will be caught by the corresponding catch target.
 * 
 * #### Structure
 * 
 * - `ARG(throwVal)`: The value to be thrown.
 * 
 */
export class ThrowSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Throw");
    this.setThrowVal(val);
  }

  // Args
  setThrowVal(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getThrowVal(): IridiumSEXP {
    return this.args[0];
  }

  // Flags
  toString(space?: number): string {
    return `${printIriSpace(space)}Throw ${this.args[0].toString(0)}`
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Exits the `catch` context.
 * 
 */
export class PopCatchContextSEXP extends IridiumSEXP {
  constructor() {
    super("PopCatchContext");
  }

  // Flags
  toString(space?: number): string {
    return `${printIriSpace(space)}POP CATCH`
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Invokes the finalizer block.
 * 
 * #### Structure
 * 
 * - `FLAG(IDX : number)`: IDX of the BB to flow the control to.
 * 
 */
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

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Used to return control back to the caller.
 * `ModuleEarlyReturn` is a special case where a JavaScript module may call an synchronous return if the module does not need to be evaluated.
 * A JavaScript module, after evaluation always returns asynchronously except for the aforementioned case. 
 * 
 * #### Structure
 * 
 * - `ARG(Obj)`: The value to return
 * 
 * - `FLAG(ModuleEarlyReturn : void)`: Signifies a synchronous return from a module, this happens if the module is just to be loaded and not evaluated.
 * 
 */
export class ReturnSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("Return");
    this.setObj(val);
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getObj() : IridiumSEXP {
    return this.args[0];
  }

  // Flags
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

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Used to return from a finalizer block, even though this is just a BasicBlock, the execution treats it like a lightweight function call.
 * 
 */
export class RetSEXP extends IridiumSEXP {
  constructor() {
    super("Ret");
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT
 * 
 * @remarks
 * 
 * Used to jump to a TRUE/FALSE branch based on the test value.
 * 
 * #### Structure
 * 
 * - `ARG(test)`: Stores the value of the object to be tested.
 * 
 * - `FLAG(TRUE : number)`: IDX of the BB to flow the control to if the test is true.
 * 
 * - `FLAG(FALSE : number)`: IDX of the BB to flow the control to if the test is false.
 * 
 * - `FLAG(NOT : void)`: Negate the test condition
 * 
 */
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

  setNOT() {
    this.setFlag("NOT")
  }

  unsetNOT() {
    this.removeFlag("NOT")
  }

  hasNOT(): boolean {
    return this.hasFlag("NOT");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}GOTO (${this.getTest().toString(0)}) ? ${this.getTRUE()} : ${this.getFALSE()}`;
  }
}


/**
 * @hidden
 */
export function isReturnSEXP(o: any): o is ReturnSEXP {
  // @ts-ignore
  return o.tag === "Return";
}