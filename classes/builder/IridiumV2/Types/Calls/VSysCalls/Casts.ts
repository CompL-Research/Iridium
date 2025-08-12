import { IridiumSEXP } from "../../Structural/General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Given an object, calls the `ToObject` ECMA abstract operation on it.
 * 
 * #### Action
 * 
 * Given an `targetObj`, calls the `ToObject` ECMA abstract operation and returns the new object;
 * 
 * ```
 * [toObjectResult = 1] JSToObject (targetObj)
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
 */
export class JSToObjectSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP) {
    super("JSToObject");
    this.setTargetObj(obj);
  }

  // Args
  setTargetObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[0];
  }

}