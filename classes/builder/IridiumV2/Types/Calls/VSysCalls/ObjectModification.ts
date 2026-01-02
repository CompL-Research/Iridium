import { getLocInfoIfAvailable, printFlagString, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../../AbstractOperations/Resolution";
import { EnvReadSEXP } from "../../Environment";
import { IridiumSEXP } from "../../Structural/General";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Implements the `append` functionality from the ECMA spec.
 * It is currently being used to model the spread functionality when creating arrays.
 * 
 * #### Action
 * 
 * Given the target array `targetObj` and an `insertionIdx` (start index for spread).
 * This call appends the elements of `spreadObj` at the given index.
 * 
 * ```
 * [resultObj,insertionIdx = 2] JSAppend (targetObj, insertionIdx, spreadObj)
 * ```
 * 
 * #### Trigger
 * 
 * ```
 * let b = ["a", "b"];
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
 */
export class JSAppendSEXP extends IridiumSEXP {
  constructor(tmp: IridiumSEXP, insertionIdx: IridiumSEXP, spreadVal: IridiumSEXP) {
    super("JSAppend");
    this.setTargetObj(tmp);
    this.setInsertionIdx(insertionIdx);
    this.setSpreadObj(spreadVal);
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
 * @remarks
 * 
 * Given a JSObject, this call is used to define methods of different kinds on it.
 * 
 * #### Action
 * 
 * Given an `targetObj`, `key` and `value`, it adds the `value` to the specified `field`.
 * 
 * ```
 * [updatedObject = 1] JSDefineObjMethod (targetObj, key, value)
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
 */
export class JSDefineObjMethodSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, key: IridiumSEXP, value: IridiumSEXP, kind: "method" | "get" | "set") {
    super("JSDefineObjMethod");
    this.setTargetObj(obj);
    this.setKey(key);
    this.setValue(value);
    if (kind === "method") this.setMethod();
    else if (kind === "get") this.setGetter();
    else if (kind === "set") this.setSetter();
    else throw new Error("Object method kind is invalid");
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
 * @remarks
 * 
 * Given a JSObject, this call is used to define fields on it.
 * 
 * #### Action
 * 
 * Given an `targetObj`, `key` and `value`, it adds the `value` to the specified `field`.
 * 
 * ```
 * [updatedObject = 1] JSDefineObjProp (targetObj, key, value)
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
 */
export class JSDefineObjPropSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, key: IridiumSEXP, value: IridiumSEXP) {
    super("JSDefineObjProp");
    this.setTargetObj(obj);
    this.setKey(key);
    this.setValue(value);
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
 * Used to copy properties from one object to another module the fields contained in the exclusion object.
 * 
 * #### Action
 * 
 * Copies all fields from source to target object, excluding those fileds specified in the exclude_list.
 * 
 * ```
 * [source,exclude_list,updatedObj = 3] JSCopyDataPropertiesSEXP (exclude_list, source, target)
 * ```
 * 
 * #### Trigger
 * 
 * ```
 * let a = { a: 1, b: 2, c: 3 }
 * let c = { ...a, c: 13 }
 * console.log(c.c)
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
 */
export class JSCopyDataPropertiesSEXP extends IridiumSEXP {
  constructor(exc_obj: string | IridiumSEXP, source: string, target: string) {
    super("JSCopyDataProperties");
    if (typeof exc_obj === "string") this.setExclusionObj(new EnvReadSEXP(exc_obj, getLocInfoIfAvailable()));
    else this.setExclusionObj(exc_obj);
    this.setSourceObj(new EnvReadSEXP(source, getLocInfoIfAvailable()));
    this.setTargetObj(new EnvReadSEXP(target, getLocInfoIfAvailable()));
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