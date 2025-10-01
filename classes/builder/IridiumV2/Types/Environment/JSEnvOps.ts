import { printFlagString, printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP } from "../AbstractOperations/Resolution";
import { IridiumSEXP } from "../Structural/General";
import { StringSEXP } from "../RVAL/Primitives";
import { EnvReadSEXP, isEnvReadSEXP } from "./PrimitiveEnvOps";
import { EnvBindingSEXP, RemoteEnvBindingSEXP, GlobalBindingSEXP, PoolBindingSEXP } from "./BindingsObjectConstituents";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Read a private binding from the environment, the read functionality 
 * 
 * #### Structure
 * 
 * - `ARG(obj)`: The binding to be read, can be any environment binding {@link EnvBindingSEXP} | {@link RemoteEnvBindingSEXP} | {@link GlobalBindingSEXP} | {@link PoolBindingSEXP} (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `FLAG(SYMBOL | METHOD)`: Depending on the kind of binding, different checks/resolution semantics are applied. SYMBOL leads to a private field lookup while METHOD leads to a branch check. 
 * 
 * - `FLAG(FULLY_RESOLVE)`: Does the binding context request resolution?
 * 
 */
export class PVTEnvReadSEXP extends IridiumSEXP {
  constructor(id: string, kind: "SYMBOL" | "METHOD", fullyResolve: boolean) {
    super("PVTEnvRead");
    this.setObj(new ResolveEnvBindingSEXP(id));
    if (kind === "METHOD") this.setMethod();
    else this.setSymbol();
    if (fullyResolve) this.setFullyResolve();
  }

  // Args
  setObj(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getObj() : IridiumSEXP {
    return this.args[0];
  }

  // Flags
  setSymbol() {
    this.setFlag("SYMBOL");
  }

  hasSymbol() {
    this.hasFlag("SYMBOL");
  }

  setMethod() {
    this.setFlag("METHOD");
  }

  hasMethod() {
    this.hasFlag("METHOD");
  }

  // Flags
  setFullyResolve() {
    this.setFlag("FULLY_RESOLVE");
  }

  isFullyResolve(): boolean {
    return this.hasFlag("FULLY_RESOLVE");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}PVTEnvRead [${this.getObj().toString(0)}] [${printFlagString(this.flags)}]`
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
  constructor(object: string, field: string | IridiumSEXP) {
    super("JSComputedFieldRead");
    this.setObj(new EnvReadSEXP(object));
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
 * - `ARG(obj)`: The object to be read from (usually {@link ResolveEnvBindingSEXP} before transition).
 * 
 * - `ARG(field)`: The field to be updated.
 * 
 * - `ARG(value)`: The value to be written.
 * 
 */
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: string | IridiumSEXP, right: IridiumSEXP) {
    super("JSComputedFieldWrite");
    this.setObj(new EnvReadSEXP(object));
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
 * - `FLAG(DECL)`: Is it a declaration?
 * 
 */
export class JSPrivateFieldWriteSEXP extends IridiumSEXP {
  constructor(object: string, field: EnvReadSEXP | string, right: IridiumSEXP, isDeclaration: boolean) {
    super("JSPrivateFieldWrite");
    this.setObj(new EnvReadSEXP(object));
    if (isEnvReadSEXP(field)) this.setField(field);
    else this.setField(new ResolvePrivateEnvBindingSEXP(field, false));
    this.setValue(right);
    if (isDeclaration) this.setDeclaration();
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

  // Flags
  setDeclaration() {
    this.setFlag("DECL");
  }

  isDeclaration() : boolean {
    return this.hasFlag("DECL");
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
