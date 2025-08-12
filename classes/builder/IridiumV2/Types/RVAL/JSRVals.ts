import { printFlagString, printIriSpace } from "#utils";
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
 * - `FLAG(NAME)`: Name of the binding to delete.
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
 * - `FLAG(OP)`: a string.
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
 * A JS unop operation.
 * 
 * #### Structure
 * 
 * - `ARG(val)`: the operand.
 * 
 * - `FLAG(OP)`: a string.
 * 
 */
export class JSUnopSEXP extends IridiumSEXP {
  constructor(op: string, val: IridiumSEXP) {
    super("Unop");
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
 * - `FLAG(IridiumPrimitive)`: a string.
 * 
 */
export class JSBitIntSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("BitInt");
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
 * - `FLAG(IridiumPrimitive)`: a string.
 * 
 */
export class JSPrivateSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("Private");
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
 * An JS Array object.
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
 * An JS Spread node.
 * (Ref: [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax))
 * 
 * #### Structure
 * 
 * - `ARG(val)`: value to be spread.
 * 
 */
export class JSSpreadSEXP extends IridiumSEXP {
  constructor(id: IridiumSEXP) {
    super("JSSpread");
    this.setVal(id);
  }

  // Args
  setVal(val: IridiumSEXP) {
    this.args[0] = val;
  }

  getVal() {
    return this.args[0];
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
 * - `ARG(Name)`: The name of the class, stored as {@link StringSEXP}.
 * 
 * - `ARG(Parent)`: The parent class object.
 * 
 * - `ARG(Constructor)`: The constructor closure.
 * 
 * - `ARG(PropInit)`: Property initializer closure, this initializes the class fields of the created instance.
 * 
 * - `ARG(MethodList)`: List of class methods.
 * 
 * - `ARG(StaticMethodList)`: List of **static** class methods.
 * 
 * - `ARG(StaticPropInit)`: List of **static** class methods.
 * 
 * - `FLAG(Derived)`: This flag is set if the class is a derived class.
 * 
 * - `FLAG(BrandPrototype)`: This flag is set if the prototype needs to be branded i.e. the class has private method(s).
 * 
 * - `FLAG(BrandConstructor)`: This flag is set if the static prototype needs to be branded i.e. the class has static private method(s).
 * 
 */
export class JSClassSEXP extends IridiumSEXP {
  constructor(hasSuper: boolean, name: string, parent: IridiumSEXP, constructorLambda: LambdaSEXP, propInitLambda: IridiumSEXP, methodList: IridiumSEXP, staticMethodList: IridiumSEXP, brandPrototype: boolean, brandConstructor: boolean, staticPropInitLambda: IridiumSEXP) {
    super("JSClass");
    if (hasSuper) this.setDerived();
    if (brandPrototype) this.setBrandPrototype();
    if (brandConstructor) this.setBrandConstructor();
    this.setName(new StringSEXP(name));
    this.setParent(parent);
    this.setConstructor(constructorLambda);
    this.setPropInit(propInitLambda);
    this.setMethodList(methodList);
    this.setStaticMethodList(staticMethodList);
    this.setStaticPropInit(staticPropInitLambda);
  }

  // Args
  setName(name: IridiumSEXP) {
    this.args[0] = name;
  }

  getName(): IridiumSEXP {
    return this.args[0];
  }

  setParent(parent: IridiumSEXP) {
    this.args[1] = parent;
  }

  getParent(): IridiumSEXP {
    return this.args[1];
  }

  setConstructor(constructor: IridiumSEXP) {
    this.args[2] = constructor;
  }

  getConstructor(): IridiumSEXP {
    return this.args[2];
  }

  setPropInit(propInit: IridiumSEXP) {
    this.args[3] = propInit;
  }

  getPropInit(): IridiumSEXP {
    return this.args[3];
  }

  setMethodList(methodList: IridiumSEXP) {
    this.args[4] = methodList;
  }

  getMethodList(): IridiumSEXP {
    return this.args[4];
  }

  setStaticMethodList(methodList: IridiumSEXP) {
    this.args[5] = methodList;
  }

  getStaticMethodList(): IridiumSEXP {
    return this.args[5];
  }

  setStaticPropInit(propInit: IridiumSEXP) {
    this.args[6] = propInit;
  }

  getStaticPropInit(): IridiumSEXP {
    return this.args[6];
  }

  // Flags
  setDerived() {
    this.setFlag("Derived");
  }

  isDerived(): boolean {
    return this.hasFlag("Derived")
  }

  setBrandPrototype() {
    this.setFlag("BrandPrototype");
  }

  isBrandPrototype(): boolean {
    return this.hasFlag("BrandPrototype")
  }

  setBrandConstructor() {
    this.setFlag("BrandConstructor");
  }

  isBrandConstructor(): boolean {
    return this.hasFlag("BrandConstructor")
  }

  toString(space?: number): string {
    let res = [];

    res.push(`${printIriSpace(space)}JSClass${printFlagString(this.flags)}`)
    if (!space) space = 8;
    res.push(`${printIriSpace(space + 2)}Name: ${this.getName().toString(0)}`)
    res.push(`${printIriSpace(space + 2)}Parent: ${this.getParent().toString(0)}`)
    res.push(`${printIriSpace(space + 2)}Constructor: ${this.getConstructor().toString(0)}`)
    res.push(`${printIriSpace(space + 2)}PropInit: ${this.getPropInit().toString(0)}`)
    res.push(`${printIriSpace(space + 2)}MethodList:\n${this.getMethodList().toString(space + 4)}`)
    res.push(`${printIriSpace(space + 2)}StaticMethodList:\n${this.getStaticMethodList().toString(space + 4)}`)
    res.push(`${printIriSpace(space + 2)}StaticPropInit: ${this.getStaticPropInit().toString(0)}`)
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
  return o.tag === "Private";
}

/**
 * @hidden
 */
export function isJSBitIntSEXP(o: any): o is JSBitIntSEXP {
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