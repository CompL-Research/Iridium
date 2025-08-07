import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { EnvReadSEXP } from "../Environment";
import { IridiumSEXP } from "../Structural/General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group Thread Pause
 * 
 * @remarks
 * 
 * `await` is used to await the completion of an asynchronous function.
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
    this.args.push(new EnvReadSEXP(arg));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}AWAIT ${this.args[0].toString(0)}`;
  }
}

export class YieldSEXP extends IridiumSEXP {
  constructor(arg: string, yieldReturnIndicator: string, yieldReturnResultHolder: string) {
    super("Yield");
    this.args.push(new EnvReadSEXP(arg));
    this.args.push(new ResolveEnvBindingSEXP(yieldReturnIndicator));
    this.args.push(new ResolveEnvBindingSEXP(yieldReturnResultHolder));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}YIELD [${this.args[0].toString(0)}] ↝ ${this.args[1].toString(0)}, ${this.args[2].toString(0)}`;
  }
}

export class ReturnAsyncSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("ReturnAsync");
    this.args.push(val);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}return[async] ${this.args[0].toString(0)}`
  }
}

// (Extension) JSInitialYield
export class JSInitialYieldSEXP extends IridiumSEXP {
  constructor() {
    super("JSInitialYield");
  }
}