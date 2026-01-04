import { getLocInfoIfAvailable, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { EnvReadSEXP } from "../Environment";
import { IridiumSEXP } from "../Structural/General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * `await` is used to "await" the completion of an asynchronous function.
 * 
 * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
 * 
 * ```
 * async foo() {
 *  // An asynchronous function
 * }
 * 
 * async bar() {
 *   let res = await foo(); // await is used to pause the flow until an asynchronous function returns
 * }
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: An object, likely a promise returned by an asynchronous function.
 * 
 */
export class AwaitSEXP extends IridiumSEXP {
  constructor(arg: string) {
    super("Await");
    this.setObj(new EnvReadSEXP(arg, getLocInfoIfAvailable()));
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }
  getObj(): IridiumSEXP {
    return this.args[0];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}AWAIT ${this.args[0].toString(0)}`;
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group TODO-RVAL
 * 
 * @remarks
 * 
 * Implements `yield` semantics. Yield can pass arguments which can be read as iterator/next values from the iterator function.
 * When the flow resumes, the yieldDoneIndicator value is check to perform an early return otherwise the flow of the generator function continues until next pause.
 * 
 * [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield)
 * 
 * ```
 * function* foo() {
 *    yield "The";
 *    yield "World is";
 * }
 * 
 * const iterator = foo();
 * console.log(iterator.next().value + " " + iterator.next().value + " " + iterator.next().value);
 * ```
 * 
 * ```
 * <yieldDoneIndicator, yieldReturnResultHolder> = YIELD obj
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: An object, likely a promise returned by an asynchronous function.
 * 
 * - `ARG(doneTarget)`: The target location for yieldDoneIndicator (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(nextValue)`: The target location for yieldReturnResultHolder (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 */
export class YieldSEXP extends IridiumSEXP {
  constructor(arg: IridiumSEXP, yieldReturnIndicator: string, yieldReturnResultHolder: string) {
    super("Yield");
    this.setObj(arg);
    this.setDoneTarget(new ResolveEnvBindingSEXP(yieldReturnIndicator, getLocInfoIfAvailable()));
    this.setNextValue(new ResolveEnvBindingSEXP(yieldReturnResultHolder, getLocInfoIfAvailable()));
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }
  getObj(): IridiumSEXP {
    return this.args[0];
  }

  setDoneTarget(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getDoneTarget(): IridiumSEXP {
    return this.args[1];
  }

  setNextValue(obj: IridiumSEXP) {
    this.args[2] = obj;
  }

  getNextValue(): IridiumSEXP {
    return this.args[2];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}YIELD [${this.args[0].toString(0)}] ↝ ${this.args[1].toString(0)}, ${this.args[2].toString(0)}`;
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
 * Used to return from asynchronous functions in JS.
 * 
 * #### Structure
 * 
 * - `ARG(retVal)`: The value to return.
 * 
 */
export class ReturnAsyncSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("ReturnAsync");
    this.setRetVal(val);
  }

  // Args
  setRetVal(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getRetVal(): IridiumSEXP {
    return this.args[0];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}return[async] ${this.getRetVal().toString(0)}`
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
 * Initializes the stack frame for the generator and pauses the execution.
 * 
 * ```
 * function* foo() {
 *    yield "The";
 *    yield "World is";
 * }
 * 
 * const iterator = foo(); // <- Initial Yield will make this pause before any execution of the body starts
 * ```
 * 
 */
export class JSInitialYieldSEXP extends IridiumSEXP {
  constructor() {
    super("JSInitialYield");
  }
}