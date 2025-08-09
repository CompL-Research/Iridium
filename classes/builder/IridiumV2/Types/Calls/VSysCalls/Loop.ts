import { printFlagString, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../../AbstractOperations/Resolution";
import { EnvReadSEXP } from "../../Environment/index";
import { IridiumSEXP } from "../../Structural/General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * For a given an object, this call stores it's For-In iterator in target.
 * 
 * #### Action
 * 
 * ```
 * [1] JSForInStartSEXP(RVal)
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object instance.
 * 
 */
export class JSForInStartSEXP extends IridiumSEXP {
  constructor(obj: string) {
    super("JSForInStart");
    this.setObj(new EnvReadSEXP(obj));
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getObj(): IridiumSEXP {
    return this.args[0];
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
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Given a For-In iterator, this call stores the loop-done indicator and loop-next object at doneTarget and nextValue respectively.
 * 
 * #### Action
 * 
 * ```
 * [3] JSForInNextSEXP(RVal)
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(iteratorObj)`: The iterator object.
 * 
 */
export class JSForInNextSEXP extends IridiumSEXP {
  constructor(iterator: string) {
    super("JSForInNext");
    this.setIteratorObj(new EnvReadSEXP(iterator));
  }

  // Args
  setIteratorObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getIteratorObj(): IridiumSEXP {
    return this.args[0];
  }

}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * For a given an object, this call stores it's For-Of on the **stack**.
 * 
 * #### Action
 * 
 * ```
 * [3] = JSForOfStartSEXP(RVal)
 * ```
 * 
 * The reason for not popping the stack is the presence of the custom catch handler which can break if stack is restructured.
 * Maybe some analysis passes can simplify this logic in the future.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object instance.
 * 
 */
export class JSForOfStartSEXP extends IridiumSEXP {
  constructor(obj: string | IridiumSEXP) {
    super("JSForOfStart");
    if (typeof (obj) === "string") {
      this.setObj(new EnvReadSEXP(obj));
    } else {
      this.setObj(obj);
    }
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getObj(): IridiumSEXP {
    return this.args[0];
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Given a For-Of iterator context (this is implicit, three objects on stack, see {@link JSForOfStartSEXP}), this call stores the loop-done indicator and loop-next object at doneTarget and nextValue respectively.
 * 
 * #### Action
 * 
 * ```
 * [2] = JSForOfNext([3, implicit])
 * ```
 * 
 */
export class JSForOfNextSEXP extends IridiumSEXP {
  constructor() {
    super("JSForOfNext");
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Marks the end of a for-of iterator loop context, the implicit values on the stack are popped by this call.
 * 
 * #### Action
 * 
 * ```
 * [-3] = JSForOfIteratorClose()
 * ```
 * 
 */
export class JSForOfIteratorCloseSEXP extends IridiumSEXP {
  constructor() {
    super("JSForOfIteratorClose");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}`;
  }
}

/**
 * @hidden
 */
export function isJSForInStartSEXP(o: any): o is JSForInStartSEXP {
  // @ts-ignore
  return o.tag === "JSForInStart";
}

/**
 * @hidden
 */
export function isJSForInNextSEXP(o: any): o is JSForInNextSEXP {
  // @ts-ignore
  return o.tag === "JSForInNext";
}

/**
 * @hidden
 */
export function isJSForOfNextSEXP(o: any): o is JSForOfNextSEXP {
  // @ts-ignore
  return o.tag === "JSForOfNext";
}