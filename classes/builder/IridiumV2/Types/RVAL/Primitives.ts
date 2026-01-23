import { printIriSpace } from "#utils";
import { IridiumPrimitives, IridiumSEXP } from "../Structural/General";


/**
 * 
 * @group TSHelper
 * 
 * @remarks
 * 
 * Basic allowed types during codegen for homogenous lists in Iridium.
 * 
 */
export type ListSEXPFlags = "ModuleRequest" | "StaticImport" | "StarExport" | "EnvBinding" | "RemoteEnvBinding" | "PoolBinding" | "BB";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * A generic List container. May contain homogenous or heterogenous elements.
 * 
 * #### Structure
 * 
 * - `FLAG(TYPE? : string)`: A flag that signifies that the list is homogenous, the value of this flag is the expected tag value.
 * 
 */
export class ListSEXP extends IridiumSEXP {
  constructor(elems: Array<IridiumSEXP>) {
    super("List");
    elems.forEach(e => this.args.push(e));
  }
  
  setFlag(flag: string, val?: IridiumPrimitives): void {
    if (flag !== "TYPE") throw new Error("only TYPE flag is allowed in ListSEXP");
    if (typeof val !== "string") throw new Error("only TYPE flag with string value is allowed in ListSEXP");
    super.setFlag(flag, val);
  }

  setType(flag: ListSEXPFlags) {
    this.setFlag("TYPE", flag);
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
 * A primitive string.
 * 
 * #### Structure
 * 
 * - `FLAG(IridiumPrimitive : string)`: string value container.
 * 
 */
export class StringSEXP extends IridiumSEXP {
  constructor(str: string) {
    super("String");
    this.flags.push(["IridiumPrimitive", str]);
  }

  getVal(): string {
    return this.getFlagString("IridiumPrimitive");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}"${this.getVal()}"`
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
 * A primitive string.
 * 
 * #### Structure
 * 
 * - `FLAG(IridiumPrimitive: void)`: string value container.
 * 
 */
export class NullSEXP extends IridiumSEXP {
  constructor() {
    super("Null");
    this.flags.push(["IridiumPrimitive", null]);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}🤮`
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
 * A Regular Expression Value.
 * 
 * #### Structure
 * 
 * - `FLAG(EXP : string)`: the regular expression string.
 * 
 * - `FLAG(FLAGS : string)`: flags for the regular expression.
 * 
 */
export class RegExpSEXP extends IridiumSEXP {
  constructor(exp: string, flags: string) {
    super("RegExp");
    this.flags.push(["EXP", exp]);
    this.flags.push(["FLAGS", flags]);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}REGEXP(${this.getFlagString("EXP")},${this.getFlagString("FLAGS")})`
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
 * A possibly signed numeric value.
 * 
 * #### Structure
 * 
 * - `FLAG(IridiumPrimitive : number)`: a number.
 * 
 */
export class NumberSEXP extends IridiumSEXP {
  constructor(number: number) {
    super("Number");
    this.flags.push(["IridiumPrimitive", number]);
  }

  getVal(): number {
    return this.getFlagNumber("IridiumPrimitive");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.getVal()}`
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
 * A boolean value.
 * 
 * #### Structure
 * 
 * - `FLAG(IridiumPrimitive : boolean)`: a boolean.
 * 
 */
export class BooleanSEXP extends IridiumSEXP {
  constructor(value: boolean) {
    super("Boolean");
    this.flags.push(["IridiumPrimitive", value]);
  }

  getVal(): boolean {
    return this.getFlagBoolean("IridiumPrimitive");
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
 * A primitive binop operation.
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
export class BinopSEXP extends IridiumSEXP {
  constructor(op: string, lBinop: IridiumSEXP, rBinop: IridiumSEXP) {
    super("Binop");
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

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.getLBinop()} OP[${this.getOP()}] ${this.getRBinop()}`
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
 * A primitive unop operation.
 * 
 * #### Structure
 * 
 * - `ARG(val)`: the operand.
 * 
 * - `FLAG(OP : string)`: a string.
 * 
 */
export class UnopSEXP extends IridiumSEXP {
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
    return `${printIriSpace(space)} OP[${this.getOP()}] ${this.getVal()}`
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
 * A Lambda :)
 * 
 * #### Structure
 * 
 * - `FLAG(StartBBIDX)`: IDX of the first BB in the Lambda.
 * 
 * - `FLAG(NAME : string)`: Name for the closure, "" by default.
 * 
 * - `FLAG(CNAME : boolean)`: Is it a computed name context?
 * 
 * - `FLAG(SETNAME : boolean)`: boolean specifying whether the name needs to be explicitly set.
 * 
 */
export class LambdaSEXP extends IridiumSEXP {
  constructor(bbIdx: number, name: string = "", cName: boolean = false, setName: boolean = false) {
    super("Lambda");
    this.setStartBBIDX(bbIdx);
    this.setNAME(name);
    this.setCNAME(cName);
    this.setSETNAME(setName);
  }

  // Flags
  setStartBBIDX(startBBIDX: number) {
    this.setFlag("StartBBIDX", startBBIDX);
  }

  getStartBBIDX() {
    return this.getFlagNumber("StartBBIDX");
  }

  setNAME(name: string) {
    this.setFlag("NAME", name);
  }

  getNAME() {
    return this.getFlagString("NAME");
  }

  setCNAME(val: boolean) {
    this.setFlag("CNAME", val);
  }

  getCNAME() {
    return this.getFlagBoolean("CNAME");
  }

  setSETNAME(val: boolean) {
    this.setFlag("SETNAME", val);
  }

  getSETNAME() {
    return this.getFlagBoolean("SETNAME");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}λ[${this.getStartBBIDX()}]`
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
 * Increment Decrement Operator on simple FieldReadSEXP.
 * 
 * #### Structure
 * 
 * - `ARG(Obj)`: FieldReadSEXP
 * - `FLAG(PREFIX : boolean)`: Is the operation in the prefix
 * - `FLAG(INCREMENT : boolean)`: Is the operation performing increment (true = increment, false = decrement)
 * 
 */
export class IDOPSEXP extends IridiumSEXP {
  constructor(obj: IridiumSEXP, isPrefix: boolean, isIncrement: boolean) {
    super("IDOP");
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
export function isLambdaSEXP(o: any): o is LambdaSEXP {
  // @ts-ignore
  return o.tag === "Lambda";
}

/**
 * @hidden
 */
export function isBinopSEXP(o: any): o is BinopSEXP {
  // @ts-ignore
  return o.tag === "Binop";
}

/**
 * @hidden
 */
export function isBooleanSEXP(o: any): o is BooleanSEXP {
  // @ts-ignore
  return o.tag === "Boolean";
}

/**
 * @hidden
 */
export function isNumberSEXP(o: any): o is NumberSEXP {
  // @ts-ignore
  return o.tag === "Number";
}

/**
 * @hidden
 */
export function isStringSEXP(o: any): o is StringSEXP {
  // @ts-ignore
  return o.tag === "String";
}

/**
 * @hidden
 */
export function isListSEXP(o: any): o is ListSEXP {
  // @ts-ignore
  return o.tag === "List";
}