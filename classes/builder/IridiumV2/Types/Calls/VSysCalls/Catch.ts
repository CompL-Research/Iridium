import { IridiumSEXP } from "../../Structural";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Used to catch the received catch value in a catch block.
 * 
 * #### Action
 * 
 * ```
 * [caughtValue = 1] JSCatchContext ([1, implicit])
 * ```
 * #### Trigger
 * 
 * ```
 * try {  } catch(e) {  } // result of e will be obtained using JSCatchContext
 * ```
 * 
 * #### Structure
 * 
 * - `FLAG(NAME)`: The name of the variable holding the catch value.
 * 
 */
export class JSCatchContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSCatchContext");
  }
}

/**
 * @hidden
 */
export function isJSCatchContextSEXP(o: any): o is JSCatchContextSEXP {
  // @ts-ignore
  return o.tag === "JSCatchContext";
}
