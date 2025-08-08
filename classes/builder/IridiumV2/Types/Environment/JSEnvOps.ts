import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP } from "../AbstractOperations/Resolution";
import { IridiumSEXP } from "../Structural/General";
import { StringSEXP } from "../RVAL/Primitives";
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
 * - `ARG(obj)`: The object to be read from.
 * 
 * - `ARG(field)`: The field to be read.
 * 
 */
export class JSComputedFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP) {
    super("JSComputedFieldRead");
    this.setObj(new ResolveEnvBindingSEXP(object));
    if (typeof field === "string")
      this.setField(new EnvReadSEXP(field));
    else
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
 * Write to a (dynamic) field of an object.
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The object to be read from.
 * 
 * - `ARG(field)`: The field to be updated.
 * 
 * - `ARG(value)`: The value to be written.
 * 
 */
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP, right: IridiumSEXP) {
    super("JSComputedFieldWrite");
    this.setObj(new ResolveEnvBindingSEXP(object));
    if (typeof field === "string")
      this.setField(new EnvReadSEXP(field));
    else
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
 * - `ARG(obj)`: The object to be read from.
 * 
 * - `ARG(field)`: The field to be read.
 * 
 */
export class JSPrivateFieldReadSEXP extends IridiumSEXP {
  constructor(object: string, field: string) {
    super("JSPrivateFieldRead");
    this.setObj(new ResolveEnvBindingSEXP(object));
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
 * - `ARG(obj)`: The object to be read from.
 * 
 * - `ARG(field)`: The field to be updated.
 * 
 * - `ARG(value)`: The value to be written.
 * 
 */
export class JSPrivateFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: EnvReadSEXP | string, right: IridiumSEXP) {
    super("JSPrivateFieldWrite");
    this.setObj(new ResolveEnvBindingSEXP(object));
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
 * @group RVAL
 * 
 * @remarks
 * 
 * Read a field from `super`.
 * 
 * #### Structure
 * 
 * - `ARG(this)`: The lexical `this` object.
 * 
 * - `ARG(<super_obj>)`: The lexical `<super_obj>` object.
 * 
 * - `ARG(field)`: The field to be read.
 * 
 */
export class JSSuperFieldReadSEXP extends IridiumSEXP {
  constructor(field: string) {
    super("JSSuperFieldRead");
    this.setThis(new EnvReadSEXP("this"));
    this.setSuper(new EnvReadSEXP("<super_obj>"));
    this.setField(new StringSEXP(field));
  }

  // Args
  setThis(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getThis(): IridiumSEXP {
    return this.args[0];
  }

  setSuper(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getSuper(): IridiumSEXP {
    return this.args[1];
  }

  setField(field: IridiumSEXP) {
    this.args[2] = field;
  }

  getField(): IridiumSEXP {
    return this.args[2];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}[${this.args[0].toString(0)}, ${this.args[1].toString(0)}].${this.args[2].toString(0)}`
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
 * Write to field of `super`.
 * 
 * #### Structure
 * 
 * - `ARG(this)`: The lexical `this` object.
 * 
 * - `ARG(<super_obj>)`: The lexical `<super_obj>` object.
 * 
 * - `ARG(field)`: The field to be updated.
 * 
 * - `ARG(value)`: The value to be written.
 * 
 */
export class JSSuperFieldWriteSEXP extends IridiumSEXP {
  constructor(field: string, value: IridiumSEXP) {
    super("JSSuperFieldWrite");
    this.setThis(new EnvReadSEXP("this"));
    this.setSuper(new EnvReadSEXP("<super_obj>"));
    this.setField(new StringSEXP(field));
    this.setValue(value);
  }

  // Args
  setThis(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getThis(): IridiumSEXP {
    return this.args[0];
  }

  setSuper(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getSuper(): IridiumSEXP {
    return this.args[1];
  }

  setField(field: IridiumSEXP) {
    this.args[2] = field;
  }

  getField(): IridiumSEXP {
    return this.args[2];
  }

  setValue(field: IridiumSEXP) {
    this.args[3] = field;
  }

  getValue(): IridiumSEXP {
    return this.args[3];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}super.${this.args[2].toString(0)} = ${this.args[3].toString(0)}`
  }
}
