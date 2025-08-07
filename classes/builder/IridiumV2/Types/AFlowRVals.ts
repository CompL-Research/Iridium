import { printIriSpace } from "#utils";
import { EnvReadSEXP } from "./Environment";
import { IridiumSEXP } from "./General";

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