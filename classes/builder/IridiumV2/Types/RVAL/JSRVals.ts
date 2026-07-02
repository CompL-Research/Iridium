import { printIriSpace } from "#utils";
import { IridiumSEXP } from "../Structural/General";
import { LambdaSEXP, StringSEXP } from "./Primitives";



/**
 *
 * @extends {IridiumSEXP}
 *
 * @group RVAL
 *
 * @remarks
 *
 * An field reference which must not be resolved, this identifier and possibly computed field names are used by the delete operator to delete the binding.
 *
 * #### Structure
 *
 * - `ARG(receiver)`: {@link IridiumSEXP} referencing the receiver object.
 *
 * - `ARG(field)`: {@link IridiumSEXP} if the field is computed, {@link StringSEXP} otherwise.
 *
 */
export class UNOPDelMemberExprSEXP extends IridiumSEXP {
  constructor(receiver: IridiumSEXP, field: IridiumSEXP) {
    super("UNOPDelMemberExpr");

    this.setReceiver(receiver);
    this.setField(field);
  }

  // Args
  setReceiver(receiver: IridiumSEXP) {
    this.args[0] = receiver;
  }

  getReceiver(): IridiumSEXP {
    return this.args[0];
  }

  setField(receiver: IridiumSEXP) {
    this.args[1] = receiver;
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
 * An identifier which must not be resolved, this identifier name is used by the delete operator to delete the binding.
 *
 * #### Structure
 *
 * - `FLAG(NAME : string)`: Name of the binding to delete.
 *
 */
export class UNOPDelVarSEXP extends IridiumSEXP {
  constructor(name: string) {
    super("UNOPDelVar");
    this.setName(name);

  }

  // Flags
  setName(name: string) {
    super.setFlag("NAME", name);
  }

  getName(flag: string): string {
    return super.getFlagString(flag);
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
 * A JS binop operation.
 *
 * #### Structure
 *
 * - `ARG(lBinop)`: the left operand.
 *
 * - `ARG(rBinop)`: the right operand.
 *
 * - `FLAG(OP : string)`: a string.
 *
 */
export class JSBinopSEXP extends IridiumSEXP {
  constructor(op: string, lBinop: IridiumSEXP, rBinop: IridiumSEXP) {
    super("JSBinop");
    this.setLBinop(lBinop);
    this.setRBinop(rBinop);
    this.setOP(op);
  }

  // Args
  setLBinop(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getLBinop() {
    return this.args[0];
  }

  setRBinop(val: IridiumSEXP) {
    this.args[1] = val;
  }

  getRBinop() {
    return this.args[1];
  }

  // Flags
  setOP(op: string) {
    this.setFlag("OP", op);
  }

  getOP(): string {
    return this.getFlagString("OP");
  }

  getVal(): boolean {
    return this.getFlagBoolean("IridiumPrimitive");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.getLBinop()} JOP[${this.getOP()}] ${this.getRBinop()}`
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
 * ToNumeric Operation.
 *
 * #### Structure
 *
 * - `ARG(val)`: the operand.
 *
 * - `FLAG(OP : string)`: a string.
 *
 */
export class ToNumericSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP) {
    super("ToNumeric");
    this.setObj(obj);
  }

  // Args
  setObj(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getObj() {
    return this.args[0];
  }

  toString(space?: number): string {
    return `${printIriSpace(space)} ToNumeric ${this.getObj()}`
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
 * A JS unop operation.
 *
 * #### Structure
 *
 * - `ARG(val)`: the operand.
 *
 * - `FLAG(OP : string)`: a string.
 *
 */
export class JSUnopSEXP extends IridiumSEXP {
  constructor(op: string, val: IridiumSEXP) {
    super("JSUnop");
    this.setVal(val);
    this.setOP(op);
  }

  // Args
  setVal(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getVal() {
    return this.args[0];
  }

  // Flags
  setOP(op: string) {
    this.setFlag("OP", op);
  }

  getOP(): string {
    return this.getFlagString("OP");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)} JOP[${this.getOP()}] ${this.getVal()}`
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
 * An untagged JS template object.
 * When untagged, the default behaviour is to call the `concat` function as follows.
 *
 * ```
 * "".concat(...args)
 * ```
 *
 * #### Structure
 *
 * - `...ARG(vals)`: the intermix of quasis and expressions.
 *
 */
export class JSTemplateSEXP extends IridiumSEXP {
  constructor(elements: Array<IridiumSEXP>) {
    super("JSTemplate");
    elements.forEach(e => this.args.push(e));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}JSTempalte(${this.args.map(e => e.toString(0)).join(", ")})`;
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
 * An JS BigInt object.
 * (Ref: [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt))
 *
 * #### Structure
 *
 * - `FLAG(IridiumPrimitive : string)`: a string.
 *
 */
export class JSBigIntSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("JSBigInt");
    this.flags.push(["IridiumPrimitive", str]);
  }

  getVal(): string {
    return this.getFlagString("IridiumPrimitive");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.getVal()}n`
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
 * An JS Private object.
 * (Ref: [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements))
 *
 * #### Structure
 *
 * - `FLAG(IridiumPrimitive : string)`: a string.
 *
 */
export class JSPrivateSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("JSPrivate");
    this.flags.push(["IridiumPrimitive", str]);
  }

  getVal(): string {
    return this.getFlagString("IridiumPrimitive");
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
 * A new JS Array object.
 * (Ref: [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))
 *
 * #### Structure
 *
 * - `...ARG(vals)`: values to be inserted into the array.
 *
 */
export class JSArraySEXP extends IridiumSEXP {
  constructor(vals: Array<IridiumSEXP>) {
    super("JSArray");
    vals.forEach(e => this.args.push(e));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}JSArray [${this.args.map(e => e.toString(0)).join(", ")}]`
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
 * An JS special that is used to model the no-use-before-def semantics.
 *
 */
export class JSNUBDSEXP extends IridiumSEXP {
  constructor() {
    super("JSNUBD");
  }

  toString(space?: number): string {
    return "❌";
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
 * A JavaScript Class Object.
 *
 * #### Structure
 *
 * - `ARG(Parent)`: The parent class object.
 *
 * - `ARG(Constructor)`: The constructor closure.
 *
 * - `FLAG(NAME : string)`: Name of the class.
 *
 * - `FLAG(DERIVED : void)`: This flag is set if the class is a derived class.
 *
 */
export class JSClassSEXP extends IridiumSEXP {
  constructor(parent: IridiumSEXP, constructor: LambdaSEXP, name: string = "", isDerived: boolean) {
    super("JSClass");
    this.setParent(parent);
    this.setConstructor(constructor);
    this.setNAME(name);
    if (isDerived) this.setDERIVED();
  }

  // Args
  setParent(parent: IridiumSEXP) {
    this.args[0] = parent;
  }

  getParent(): IridiumSEXP {
    return this.args[0];
  }

  setConstructor(constructor: IridiumSEXP) {
    this.args[1] = constructor;
  }

  getConstructor(): IridiumSEXP {
    return this.args[1];
  }

  // Flags
  setNAME(name: string) {
    this.setFlag("NAME", name);
  }

  getName(): string {
    return this.getFlagString("NAME");
  }

  setDERIVED() {
    this.setFlag("DERIVED");
  }

  isDERIVED(): boolean {
    return this.hasFlag("DERIVED");
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
 * Creates a new empty JS Object.
 *
 */
export class JSObjectSEXP extends IridiumSEXP {
  constructor() {
    super("JSObject");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}{}`;
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
 * Increment Decrement Operator on JSComputedFieldRead.
 *
 * #### Structure
 *
 * - `ARG(obj)`: JSComputedFieldRead
 * - `FLAG(PREFIX : boolean)`: Is the operation in the prefix
 * - `FLAG(INCREMENT : boolean)`: Is the operation performing increment (true = increment, false = decrement)
 *
 */
export class JSIDOPSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, isPrefix: boolean, isIncrement: boolean) {
    super("JSIDOP");
    this.setObj(obj);
    this.setPREFIX(isPrefix);
    this.setINCREMENT(isIncrement);
  }

  // Args
  setObj(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getObj() {
    return this.args[0];
  }

  // Flags
  setPREFIX(isPrefix: boolean) {
    this.setFlag("PREFIX", isPrefix);
  }

  getPREFIX() {
    return this.getFlagBoolean("PREFIX");
  }

  setINCREMENT(isIncrement: boolean) {
    this.setFlag("INCREMENT", isIncrement);
  }

  getINCREMENT() {
    return this.getFlagBoolean("INCREMENT");
  }
}

/**
 * @hidden
 */
export function isJSObjectSEXP(o: any): o is JSObjectSEXP {
  // @ts-ignore
  return o.tag === "JSObject";
}

/**
 * @hidden
 */
export function isJSArraySEXP(o: any): o is JSArraySEXP {
  // @ts-ignore
  return o.tag === "JSArray";
}

/**
 * @hidden
 */
export function isJSPrivateSEXP(o: any): o is JSPrivateSEXP {
  // @ts-ignore
  return o.tag === "JSPrivate";
}

/**
 * @hidden
 */
export function isJSBitIntSEXP(o: any): o is JSBigIntSEXP {
  // @ts-ignore
  return o.tag === "BitInt";
}


/**
 * @hidden
 */
export function isUNOPDelMemberExprSEXP(o: any): o is UNOPDelMemberExprSEXP {
  // @ts-ignore
  return o.tag === "UNOPDelMemberExpr";
}

/**
 * @hidden
 */
export function isUNOPDelVarSEXP(o: any): o is UNOPDelVarSEXP {
  // @ts-ignore
  return o.tag === "UNOPDelVar";
}
