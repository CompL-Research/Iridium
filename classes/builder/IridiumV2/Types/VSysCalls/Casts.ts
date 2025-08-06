import { printFlagString, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { IridiumSEXP } from "../General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group JSObject Cast
 * 
 * @description
 * 
 * Given an object, calls the `ToObject` ECMA abstract operation on it.
 * 
 * #### Action
 * 
 * Given an `targetObj`, calls the `ToObject` ECMA abstract operation and stores the result in `updatedTargetObjHolder`;
 * 
 * ```
 * updatedTargetObjHolder <- JSToObject (targetObj)
 * ```
 * 
 * #### Trigger
 * 
 * ```
 * let {a, b} = { a: 1, b: 2, c: 3 };
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(targetObj)`: The source object.
 * 
 * - `ARG(updatedTargetObjHolder)`: The location to store the updated objec`t.
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSToObjectSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, target: string) {
    super("JSToObject");
    this.setTargetObj(obj);
    this.setUpdatedTargetObjHolder(new ResolveEnvBindingSEXP(target));
    this.setThisInit(false);
    this.setSafe(false);
  }

  // Args
  setTargetObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[0];
  } 
  
  setUpdatedTargetObjHolder(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getUpdatedTargetObjHolder(): IridiumSEXP {
    return this.args[1];
  }

  // Fields
  markSloppy() {
    this.setFlag("SLOPPY");
  }

  isSloppy() {
    return this.hasFlag("SLOPPY");
  }

  setThisInit(val: boolean) {
    this.setFlag("THISINIT", val);
  }

  isThisInit(): boolean {
    return this.getFlagBoolean("THISINIT")
  }

  setSafe(val: boolean) {
    this.setFlag("SAFE", val);
  }

  isSafe(): boolean {
    return this.getFlagBoolean("SAFE")
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}${printFlagString(this.flags)}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

/**
 * @group TSHelper
 */
export function isJSToObjectSEXP(o: any): o is JSToObjectSEXP {
  // @ts-ignore
  return o.tag === "JSToObject";
}