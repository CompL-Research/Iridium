import { getLocInfoIfAvailable, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { IridiumSEXP } from "../Structural";
import { StringSEXP } from "../RVAL";
import { EnvBindingSEXP, RemoteEnvBindingSEXP, GlobalBindingSEXP, PoolBindingSEXP } from "./BindingsObjectConstituents";


/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Read a binding from the environment.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The binding to be read, can be any environment binding {@link EnvBindingSEXP} | {@link RemoteEnvBindingSEXP} | {@link GlobalBindingSEXP} | {@link PoolBindingSEXP} (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SAFE)`: Is it safe to read this binding?
 * 
 */
export class EnvReadSEXP extends IridiumSEXP {
  constructor(id: string, mapInf: string) {
    super("EnvRead");
    this.setFlag("MAP_INF", mapInf);
    this.setObj(new ResolveEnvBindingSEXP(id, getLocInfoIfAvailable(mapInf)));
  }

  // Flags
  markSAFE() {
    this.setFlag("SAFE");
  }

  isSAFE() {
    return this.hasFlag("SAFE");
  }

  // Args
  setObj(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getObj() : IridiumSEXP {
    return this.args[0];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}EnvRead [${this.args[0].toString(0)}]`
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
 * A TDZ check for the binding before it is written to.
 * 
 */
export class TDZReadSEXP extends EnvReadSEXP {
  constructor(id: string, mapInf: string) {
    super(id, mapInf);
    this.tag = "TDZRead";
  }
}

/**
 * 
 * @group TSHelper
 */
export type EnvWriteFlags = "SAFE" | "THISINIT" | "SLOPPY";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group AMP
 * 
 * @remarks
 * 
 * Write to an environment binding.
 * 
 * #### Structure
 * 
 * - `ARG(lValTarget)`: The storage target location(s) (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(rVal)`: The value to store.
 * 
 * - `FLAG(SAFE)`: Indicates whether the writes being performed are safe.
 * 
 * - `FLAG(THISINIT)`: Indicates whether the write is being performed to `this`, in this case it will never be true but is kept around for implementation consistency during lowering.
 * 
 * - `FLAG(SLOPPY)`: Indicates whether the writes to target locations is sloppy.
 * 
 */
export class EnvWriteSEXP extends IridiumSEXP {
  lval: string
  constructor(lval: string, rval: IridiumSEXP, safe: boolean, thisInit: boolean, mapInf: string) {
    super("EnvWrite");
    this.lval = lval
    this.setLValTarget(new ResolveEnvBindingSEXP(lval, getLocInfoIfAvailable()));
    this.setRVal(rval);
    this.setSafe(safe);
    this.setThisInit(thisInit);
    this.setFlag("MAP_INF", mapInf);
  }

  // Args
  setLValTarget(target: IridiumSEXP) {
    this.args[0] = target;
  }

  getLValTarget(): IridiumSEXP {
    return this.args[0];
  }

  setRVal(rval: IridiumSEXP) {
    this.args[1] = rval;
  }

  getRVal(): IridiumSEXP {
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
    return `${printIriSpace(space)}${this.isSloppy() ? "[SLOP]" : ""}${this.args[0].toString(0)} ${this.isSafe() ? "=" : this.isThisInit() ? "=this=" : "=."} ${this.args[1].toString(0)}`
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
 * Non local EnvWrite, this is used to write to sibling environments in JS.
 * This will be reduced to a normal {@link EnvWriteSEXP} after scope resolution.
 * 
 * #### Structure
 * 
 * - `FLAG(ScopeIDX)`: Target Scope IDX.
 * 
 */
export class SiblingSpecialWriteSEXP extends EnvWriteSEXP {
  constructor(lval: string, rval: IridiumSEXP, safe: boolean, thisInit: boolean, mapInf: string, scopeIDX: number) {
    super(lval, rval, safe, thisInit, mapInf);
    this.tag = "SiblingSpecialWrite";
    this.setScopeIDX(scopeIDX);
  }

  // Flags
  setScopeIDX(val: number) {
    this.setFlag("ScopeIDX", val);
  }

  getScopeIDX(): number {
    return this.getFlagNumber("ScopeIDX");
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
 * Read a (static) field from an object.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object to be read from (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(field)`: The field to be read.
 * 
 */
export class FieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string, mapInf: string) {
    super("FieldRead");
    this.setFlag("MAP_INF", mapInf)
    this.setObj(new EnvReadSEXP(object, mapInf));
    this.setField(new StringSEXP(field));
  }

  // Args
  setObj(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getObj(): IridiumSEXP {
    return this.args[0];
  }

  setField(field: IridiumSEXP) {
    this.args[1] = field;
  }

  getField(): IridiumSEXP {
    return this.args[1];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)}`
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
 * Write to a (static) field of an object.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object to be written to (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(field)`: The field to be updated.
 * 
 * - `ARG(value)`: The value to be written.
 * 
 */
export class FieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string, right: IridiumSEXP, mapInf: string) {
    super("FieldWrite");
    this.setFlag("MAP_INF", mapInf)
    this.args.push(new EnvReadSEXP(object, mapInf));
    this.args.push(new StringSEXP(field));
    this.args.push(right);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)} = ${this.args[2].toString(0)}`
  }
}

/**
 * @hidden
 */
export function isEnvReadSEXP(o: any): o is EnvReadSEXP {
  // @ts-ignore
  return o.tag === "EnvRead";
}

/**
 * @hidden
 */
export function isEnvWriteSEXP(o: any): o is EnvWriteSEXP {
  // @ts-ignore
  return o.tag === "EnvWrite";
}
