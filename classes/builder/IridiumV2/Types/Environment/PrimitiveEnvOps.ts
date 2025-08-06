import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { IridiumSEXP } from "../General";
import { StringSEXP } from "../Primitives";

export class EnvReadSEXP extends IridiumSEXP {
  constructor(id: string) {
    super("EnvRead");
    this.args.push(new ResolveEnvBindingSEXP(id));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}EnvRead [${this.args[0].toString(0)}]`
  }
}

export type EnvWriteFlags = "SAFE" | "THISINIT" | "SLOPPY";
export class EnvWriteSEXP extends IridiumSEXP {
  lval: string
  constructor(lval: string, rval: IridiumSEXP, safe: boolean, thisInit: boolean) {
    super("EnvWrite");
    this.lval = lval
    this.setLValTarget(new ResolveEnvBindingSEXP(lval));
    this.setRVal(rval);
    this.setSafe(safe);
    this.setThisInit(thisInit);
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
    return `${printIriSpace(space)}${this.isSloppy() ? "[SLOP]" : ""}${this.args[0].toString(0)} ${this.isSafe() ? "=" : "=."} ${this.args[1].toString(0)}`
  }
}

// (Primitive) FieldRead
export class FieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("FieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new StringSEXP(field));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)}`
  }
}

// (Primitive) FieldWrite
export class FieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string, right: IridiumSEXP) {
    super("FieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new StringSEXP(field));
    this.args.push(right);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)} = ${this.args[2].toString(0)}`
  }
}

/**
 * @group TSHelper
 */
export function isEnvReadSEXP(o: any): o is EnvReadSEXP {
  // @ts-ignore
  return o.tag === "EnvRead";
}

/**
 * @group TSHelper
 */
export function isEnvWriteSEXP(o: any): o is EnvWriteSEXP {
  // @ts-ignore
  return o.tag === "EnvWrite";
}
