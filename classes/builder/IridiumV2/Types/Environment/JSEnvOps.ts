import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations/Resolution";
import { IridiumSEXP } from "../Structural/General";
import { EnvReadSEXP } from "./PrimitiveEnvOps";

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
  // field: the read of the binding holding the private symbol
  constructor(object: string, field: IridiumSEXP) {
    super("JSPrivateFieldRead");
    this.setObj(new EnvReadSEXP(object));
    this.setField(field);
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
  // field: the read of the binding holding the private symbol
  constructor(object: string, field: IridiumSEXP, right: IridiumSEXP) {
    super("JSPrivateFieldWrite");
    this.setObj(new EnvReadSEXP(object));
    this.setField(field);
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
  constructor(object: string, field: IridiumSEXP, right: IridiumSEXP) {
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
 * - `ARG(name)`: The read of the binding holding the private symbol (or method / accessor).
 *
 */
export class JSHasPrivateSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, name: IridiumSEXP) {
    super("JSHasPrivate");
    this.args[0] = obj;
    this.args[1] = name;
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
 * `obj.#m` for a private method (or the getter / setter of a private accessor): throws unless obj has
 * the brand of the declaring class; the value is the function.
 *
 * #### Structure
 *
 * - `ARG(obj)`: The object.
 *
 * - `ARG(method)`: The read of the binding holding the private method.
 *
 */
export class JSCheckBrandSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, method: IridiumSEXP) {
    super("JSCheckBrand");
    this.args[0] = obj;
    this.args[1] = method;
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
 * Throws TypeError "'NAME' is read-only", e.g. writing a private method or getter-only accessor.
 *
 * #### Structure
 *
 * - `FLAG(NAME : string)`: The name in the message.
 *
 */
export class JSThrowErrorSEXP extends IridiumSEXP {
  constructor(name: string) {
    super("JSThrowError");
    this.setFlag("NAME", name);
  }
}

