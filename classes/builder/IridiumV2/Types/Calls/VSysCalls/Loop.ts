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
 * @category TODO
 * 
 * @remarks
 * 
 * For a given an object, this call stores it's For-In iterator in target.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object instance.
 * 
 * - `ARG(targetObj)`: The target location for the iterator object (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSForInStartSEXP extends IridiumSEXP {
  constructor(obj: string, target: string) {
    super("JSForInStart");
    this.setObj(new EnvReadSEXP(obj));
    this.setTargetObj(new ResolveEnvBindingSEXP(target));
    this.setThisInit(false);
    this.setSafe(false);
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getObj(): IridiumSEXP {
    return this.args[0];
  }

  setTargetObj(target: IridiumSEXP) {
    this.args[1] = target;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[1];
  }

  // Flags
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
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @category TODO
 * 
 * @remarks
 * 
 * Given a For-In iterator, this call stores the loop-done indicator and loop-next object at doneTarget and nextValue respectively.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * #### Structure
 * 
 * - `ARG(iteratorObj)`: The iterator object.
 * 
 * - `ARG(doneTarget)`: The target location for the loop-done indicator (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(nextValue)`: The target location for the loop-next indicator (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSForInNextSEXP extends IridiumSEXP {
  constructor(iterator: string, stackTop: string, stackTopNext: string) {
    super("JSForInNext");
    this.setIteratorObj(new EnvReadSEXP(iterator));
    this.setDoneTarget(new ResolveEnvBindingSEXP(stackTop));
    this.setNextValue(new ResolveEnvBindingSEXP(stackTopNext));
    this.setSafe(false);
    this.setThisInit(false);
  }

  // Args
  setIteratorObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getIteratorObj(): IridiumSEXP {
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

  // Flags
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
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group STMT-RVAL?
 * 
 * @category TODO
 * 
 * @remarks
 * 
 * For a given an object, this call stores it's For-Of on the **stack**.
 * 
 * #### TODO Notes
 * 
 * Think about how to model this?
 * 
 * ```
 * JSForOfStartSEXP(RVal, | -> | <loop-iterator>, <loop-method>, <loop-catchoffset>)
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
 * @category TODO
 * 
 * @remarks
 * 
 * Given a For-Of iterator context (this is implicit, three objects on stack, see {@link JSForOfStartSEXP}), this call stores the loop-done indicator and loop-next object at doneTarget and nextValue respectively.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * ```
 * // JSForOfNext(...implicit... | -> | <loop-next>, <loop-done>)
 * ```
 * 
 * The reason for not popping the stack is the presence of the custom catch handler which can break if stack is restructured.
 * Maybe some analysis passes can simplify this logic in the future.
 * 
 * #### Structure
 * 
 * - `ARG(doneTarget)`: The target location for the loop-done indicator (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(nextValue)`: The target location for the loop-next indicator (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 */
export class JSForOfNextSEXP extends IridiumSEXP {
  constructor(stackTop: string, stackTopNext: string) {
    super("JSForOfNext");
    this.setDoneTarget(new ResolveEnvBindingSEXP(stackTop));
    this.setNextValue(new ResolveEnvBindingSEXP(stackTopNext));
    this.setSafe(false);
    this.setThisInit(false);
  }

  // Args
  setDoneTarget(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getDoneTarget(): IridiumSEXP {
    return this.args[0];
  }

  setNextValue(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getNextValue(): IridiumSEXP {
    return this.args[1];
  }

  // Flags
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
 * @group STMT-RVAL?
 * 
 * @category TODO
 * 
 * #### TODO Notes
 * 
 * How to model this meaningfully?
 * 
 * @remarks
 * 
 * Marks the end of a for-of iterator loop context, the implicit values on the stack are popped by this call.
 * 
 * ```
 * // JSForOfNext(<loop-iterator>, <loop-method>, <loop-catchoffset> | -> | )
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