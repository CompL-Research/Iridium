import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP } from "../AbstractOperations/Resolution";
import { IridiumSEXP } from "../Structural/General";
import { EnvReadSEXP, isEnvReadSEXP } from "./PrimitiveEnvOps";

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group RVAL
 *
 * @remarks
 *
 * Read a (dynamic) field from an object.
 *
 * #### Structure
 *
 * - `ARG(obj)`: The object to be read from (usually {@link ResolveEnvBindingSEXP} before transition).
 *
 * - `ARG(field)`: The field to be read.
 *
 */
export class JSComputedFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP, receiver?: IridiumSEXP) {
    super("JSComputedFieldRead");
    this.setObj(new EnvReadSEXP(object));
    if (typeof field === "string")
      this.setField(new EnvReadSEXP(field));
    else
      this.setField(field);
    if (receiver) this.args[2] = receiver;
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
}

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group RVAL
 *
 * @remarks
 *
 * Write to a (dynamic) field of an object.
 *
 * #### Structure
 *
 * - `ARG(obj)`: The object to be read from (usually {@link ResolveEnvBindingSEXP} before transition).
 *
 * - `ARG(field)`: The field to be updated.
 *
 * - `ARG(value)`: The value to be written.
 *
 */
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP, right: IridiumSEXP, receiver?: IridiumSEXP) {
    super("JSComputedFieldWrite");
    this.setObj(new EnvReadSEXP(object));
    if (typeof field === "string")
      this.setField(new EnvReadSEXP(field));
    else
      this.setField(field);
    this.setValue(right);
    if (receiver) this.args[3] = receiver;
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

  setValue(field: IridiumSEXP) {
    this.args[2] = field;
  }

  getValue(): IridiumSEXP {
    return this.args[2];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[0].toString(0)}.${this.args[1].toString(0)} = ${this.args[2].toString(0)}`
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
 * Read a private field from an object.
 *
 * #### Structure
 *
 * - `ARG(obj)`: The object to be read from (usually {@link ResolveEnvBindingSEXP} before transition).
 *
 * - `ARG(field)`: The field to be read.
 *
 */
export class JSPrivateFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("JSPrivateFieldRead");
    this.setObj(new EnvReadSEXP(object));
    this.setField(new ResolvePrivateEnvBindingSEXP(field));
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
}

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group RVAL
 *
 * @remarks
 *
 * Write to a private field of an object.
 *
 * #### Structure
 *
 * - `ARG(obj)`: The object to be read from (usually {@link ResolveEnvBindingSEXP} before transition).
 *
 * - `ARG(field)`: The field to be updated.
 *
 * - `ARG(value)`: The value to be written.
 *
 */
export class JSPrivateFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: EnvReadSEXP | string, right: IridiumSEXP) {
    super("JSPrivateFieldWrite");
    this.setObj(new EnvReadSEXP(object));
    if (isEnvReadSEXP(field)) this.setField(field);
    else this.setField(new ResolvePrivateEnvBindingSEXP(field));
    this.setValue(right);
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

  setValue(field: IridiumSEXP) {
    this.args[2] = field;
  }

  getValue(): IridiumSEXP {
    return this.args[2];
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
 * Define a private field on an object (`PrivateFieldAdd`); throws if it already has it.
 *
 * #### Structure
 *
 * - `ARG(obj)`, `ARG(field)`, `ARG(value)`: As in {@link JSPrivateFieldWriteSEXP}.
 *
 */
export class JSPrivateFieldDefineSEXP extends JSPrivateFieldWriteSEXP {
  constructor(object: string, field: EnvReadSEXP | string, right: IridiumSEXP) {
    super(object, field, right);
    this.tag = "JSPrivateFieldDefine";
  }
}

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group AMP
 *
 * @remarks
 *
 * `#name in obj`: does obj have the private element.
 *
 * #### Structure
 *
 * - `ARG(obj)`: The object.
 *
 * - `ARG(name)`: The private name (resolved to the read of its symbol).
 *
 */
export class JSHasPrivateSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, name: string) {
    super("JSHasPrivate");
    this.args[0] = obj;
    this.args[1] = new ResolvePrivateEnvBindingSEXP(name);
  }
}

