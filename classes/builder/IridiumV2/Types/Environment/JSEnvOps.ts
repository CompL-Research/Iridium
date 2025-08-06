import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP } from "../AbstractOperations";
import { IridiumSEXP } from "../General";
import { StringSEXP } from "../Primitives";
import { EnvReadSEXP, isEnvReadSEXP } from "./PrimitiveEnvOps";

// (Extended) JSComputedFieldRead
export class JSComputedFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP) {
    super("JSComputedFieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    if (typeof field === "string")
      this.args.push(new EnvReadSEXP(field));
    else
      this.args.push(field);
  }
}

// (Extended) JSComputedFieldWrite
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP, right: IridiumSEXP) {
    super("JSComputedFieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    if (typeof field === "string")
      this.args.push(new EnvReadSEXP(field));
    else
      this.args.push(field);
    this.args.push(right);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)} = ${this.args[2].toString(0)}`
  }
}

// (Extended) JSPrivateFieldRead
export class JSPrivateFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("JSPrivateFieldRead");
    this.args.push(new ResolveEnvBindingSEXP(object));
    this.args.push(new ResolvePrivateEnvBindingSEXP(field));
  }
}

// (Extended) JSPrivateFieldWrite
export class JSPrivateFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: EnvReadSEXP | string, right: IridiumSEXP) {
    super("JSPrivateFieldWrite");
    this.args.push(new ResolveEnvBindingSEXP(object));
    if (isEnvReadSEXP(field)) this.args.push(field);
    else this.args.push(new ResolvePrivateEnvBindingSEXP(field));
    this.args.push(right);
  }
}

// (Extended) JSSuperFieldRead
export class JSSuperFieldReadSEXP extends IridiumSEXP {
  constructor(field: string) {
    super("JSSuperFieldRead");
    this.args.push(new EnvReadSEXP("this"));
    this.args.push(new EnvReadSEXP("<super_obj>"));
    this.args.push(new StringSEXP(field));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}[${this.args[0].toString(0)}, ${this.args[1].toString(0)}].${this.args[2].toString(0)}`
  }
}

// (Extended) JSSuperFieldWrite
export class JSSuperFieldWriteSEXP extends IridiumSEXP {
  constructor(field: string, value: IridiumSEXP) {
    super("JSSuperFieldWrite");
    this.args.push(new EnvReadSEXP("this"));
    this.args.push(new EnvReadSEXP("<super_obj>"));
    this.args.push(new StringSEXP(field));
    this.args.push(value);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}super.${this.args[2].toString(0)} = ${this.args[3].toString(0)}`
  }
}
