import { printFlagString, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../../AbstractOperations/Resolution";
import { EnvReadSEXP } from "../../Environment";
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
 * Implements the `append` functionality from the ECMA spec.
 * It is currently being used to model the spread functionality when creating arrays.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * #### Action
 * 
 * Given the target array `targetObj` and an `insertionIdx` (start index for spread).
 * This call appends the elements of `spreadObj` at the given index.
 * The `updatedLengthHolder` and `updatedTargetObjHolder` store the resultant length and final array respectively.
 * 
 * ```
 * [updatedLengthHolder, updatedTargetObjHolder] <- append (targetObj, insertionIdx, spreadObj)
 * ```
 * 
 * #### Trigger
 * 
 * ```
 * let b = ["a", b];
 * let c = ["foo", "bar"];
 * let a = [1,2,...b, 3, ...c];
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(targetObj)`: The source object.
 * 
 * - `ARG(insertionIdx)`: The index where the insertion must be performed.
 * 
 * - `ARG(spreadObj)`: The value to be spread.
 * 
 * - `ARG(updatedLengthHolder)`: The location to store the updated length (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(updatedTargetObjHolder)`: The location to store the updated object (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSAppendSEXP extends IridiumSEXP {
  constructor(tmp: IridiumSEXP, insertionIdx: IridiumSEXP, spreadVal: IridiumSEXP, insertionIdxLoc: string, tmpLoc: string) {
    super("JSAppend");
    this.setTargetObj(tmp);
    this.setInsertionIdx(insertionIdx);
    this.setSpreadObj(spreadVal);
    this.setUpdatedLengthHolder(new ResolveEnvBindingSEXP(insertionIdxLoc));
    this.setUpdatedTargetObjHolder(new ResolveEnvBindingSEXP(tmpLoc));
    this.setSafe(false);
    this.setThisInit(false);
  }

  // Args
  setTargetObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[0];
  }

  setInsertionIdx(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getInsertionIdx(): IridiumSEXP {
    return this.args[1];
  }

  setSpreadObj(obj: IridiumSEXP) {
    this.args[2] = obj;
  }

  getSpreadObj(): IridiumSEXP {
    return this.args[2];
  }

  setUpdatedLengthHolder(obj: IridiumSEXP) {
    this.args[3] = obj;
  }

  getUpdatedLengthHolder(): IridiumSEXP {
    return this.args[3];
  }

  setUpdatedTargetObjHolder(obj: IridiumSEXP) {
    this.args[4] = obj;
  }

  getUpdatedTargetObjHolder(): IridiumSEXP {
    return this.args[4];
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
    return `${printIriSpace(space)}JSAppend [${this.args.map(e => e.toString(0)).join(", ")}]`
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
 * Given a JSObject, this call is used to define methods of different kinds on it.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * #### Action
 * 
 * Given an `targetObj`, `key` and `value`, it adds the `value` to the specified `field` and stores the result in `updatedTargetObjHolder`;
 * 
 * ```
 * updatedTargetObjHolder <- JSDefineObjMethod (targetObj, key, value)
 * ```
 * 
 * #### Trigger
 * 
 * ```
 * let a = {
 *  m() {},
 *  set f(val) {},
 *  get f() {}
 * };
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(targetObj)`: The source object.
 * 
 * - `ARG(key)`: The field where the value must be stored.
 * 
 * - `ARG(value)`: The value, in this case a lambda.
 * 
 * - `ARG(updatedTargetObjHolder)`: The location to store the updated object (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSDefineObjMethodSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, key: IridiumSEXP, value: IridiumSEXP, kind: "method" | "get" | "set", store: string) {
    super("JSDefineObjMethod");
    this.setTargetObj(obj);
    this.setKey(key);
    this.setValue(value);
    this.setUpdatedTargetObjHolder(new ResolveEnvBindingSEXP(store));
    if (kind === "method") this.setMethod();
    else if (kind === "get") this.setGetter();
    else if (kind === "set") this.setSetter();
    else throw new Error("Object method kind is invalid");
    this.setSafe(false);
    this.setThisInit(false);
  }

  // Args
  setTargetObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[0];
  }

  setKey(key: IridiumSEXP) {
    this.args[1] = key;
  }

  getKey(): IridiumSEXP {
    return this.args[1];
  }

  setValue(value: IridiumSEXP) {
    this.args[2] = value;
  }

  getValue(): IridiumSEXP {
    return this.args[2];
  }

  setUpdatedTargetObjHolder(obj: IridiumSEXP) {
    this.args[3] = obj;
  }

  getUpdatedTargetObjHolder(): IridiumSEXP {
    return this.args[3];
  }

  // Flags
  setMethod() {
    this.setFlag("METHOD");
  }

  isMethod() {
    return this.hasFlag("METHOD");
  }

  setGetter() {
    this.setFlag("GET");
  }

  isGetter() {
    return this.hasFlag("GET");
  }

  setSetter() {
    this.setFlag("SET");
  }

  isSetter() {
    return this.hasFlag("SET");
  }

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
 * @group STMT
 * 
 * @category TODO
 * 
 * @remarks
 * 
 * Given a JSObject, this call is used to define fields on it.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
 * 
 * #### Action
 * 
 * Given an `targetObj`, `key` and `value`, it adds the `value` to the specified `field` and stores the result in `updatedTargetObjHolder`;
 * 
 * ```
 * updatedTargetObjHolder <- JSDefineObjProp (targetObj, key, value)
 * ```
 * 
 * #### Trigger
 * 
 * ```
 * let a = {
 *  f: 12
 * };
 * ```
 * 
 * #### Structure
 * 
 * - `ARG(targetObj)`: The source object.
 * 
 * - `ARG(key)`: The field where the value must be stored.
 * 
 * - `ARG(value)`: The value, in this case a lambda.
 * 
 * - `ARG(updatedTargetObjHolder)`: The location to store the updated object (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSDefineObjPropSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, key: IridiumSEXP, value: IridiumSEXP, store: string) {
    super("JSDefineObjProp");
    this.setTargetObj(obj);
    this.setKey(key);
    this.setValue(value);
    this.setUpdatedTargetObjHolder(new ResolveEnvBindingSEXP(store));
    this.setSafe(false);
    this.setThisInit(false);
  }

  // Args
  setTargetObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[0];
  }

  setKey(key: IridiumSEXP) {
    this.args[1] = key;
  }

  getKey(): IridiumSEXP {
    return this.args[1];
  }

  setValue(value: IridiumSEXP) {
    this.args[2] = value;
  }

  getValue(): IridiumSEXP {
    return this.args[2];
  }

  setUpdatedTargetObjHolder(obj: IridiumSEXP) {
    this.args[3] = obj;
  }

  getUpdatedTargetObjHolder(): IridiumSEXP {
    return this.args[3];
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
 * Used to copy properties from one object to another module the fields contained in the exclusion object.
 * 
 * #### TODO Notes
 * 
 * Convert to RVal.
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
 * - `ARG(exclusionObj)`: The exclusion object, fields that exist in this object will not be copied to the targetObj.
 * 
 * - `ARG(sourceObj)`: The source object.
 * 
 * - `ARG(targetObj)`: The target object.
 * 
 * - `ARG(updatedTargetObjHolder)`: The location to store the resultant object (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class JSCopyDataPropertiesSEXP extends IridiumSEXP {
  constructor(exc_obj: string | IridiumSEXP, source: string, target: string, store: string) {
    super("JSCopyDataProperties");
    if (typeof exc_obj === "string") this.setExclusionObj(new EnvReadSEXP(exc_obj));
    else this.setExclusionObj(exc_obj);
    this.setSourceObj(new EnvReadSEXP(source));
    this.setTargetObj(new EnvReadSEXP(target));
    this.setUpdatedTargetObjHolder(new ResolveEnvBindingSEXP(store));
    this.setSafe(false);
    this.setThisInit(false);
  }

  // Args
  setExclusionObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getExclusionObj(): IridiumSEXP {
    return this.args[0];
  }

  setSourceObj(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getSourceObj(): IridiumSEXP {
    return this.args[1];
  }
  
  setTargetObj(obj: IridiumSEXP) {
    this.args[2] = obj;
  }

  getTargetObj(): IridiumSEXP {
    return this.args[2];
  }
  
  setUpdatedTargetObjHolder(obj: IridiumSEXP) {
    this.args[3] = obj;
  }

  getUpdatedTargetObjHolder(): IridiumSEXP {
    return this.args[3];
  }

  // flags
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
    res.push(`${printIriSpace(space)}${this.tag} ${printFlagString(this.flags)}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

/**
 * @hidden
 */
export function isJSDefineObjPropSEXP(o: any): o is JSDefineObjPropSEXP {
  // @ts-ignore
  return o.tag === "JSDefineObjProp";
}

/**
 * @hidden
 */
export function isJSDefineObjMethodSEXP(o: any): o is JSDefineObjMethodSEXP {
  // @ts-ignore
  return o.tag === "JSDefineObjMethod";
}

/**
 * @hidden
 */
export function isJSAppendSEXP(o: any): o is JSAppendSEXP {
  // @ts-ignore
  return o.tag === "JSAppend";
}

/**
 * @hidden
 */
export function isJSCopyDataPropertiesSEXP(o: any): o is JSCopyDataPropertiesSEXP {
  // @ts-ignore
  return o.tag === "JSCopyDataProperties";
}