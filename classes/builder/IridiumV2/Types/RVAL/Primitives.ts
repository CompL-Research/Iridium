import { printIriSpace } from "#utils";
import { IridiumPrimitives, IridiumSEXP } from "../Structural/General";


/**
 * 
 * @group Primitive
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
 * @group Primitive
 * 
 * @remarks
 * 
 * A generic List container. May contain homogenous or heterogenous elements.
 * 
 * #### Structure
 * 
 * - `FLAG(TYPE)`: A flag that signifies that the list is homogenous, the value of this flag is the expected tag value.
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
 * @group Primitive
 * 
 * @remarks
 * 
 * A primitive string.
 * 
 * #### Structure
 * 
 * - `FLAG(IridiumPrimitive)`: string value container.
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


export class NullSEXP extends IridiumSEXP {
  constructor() {
    super("Null");
    this.flags.push(["IridiumPrimitive", null]);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}🤮`
  }

}


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

export class BooleanSEXP extends IridiumSEXP {
  constructor(value: boolean) {
    super("Boolean");
    this.flags.push(["IridiumPrimitive", value]);
  }

  getVal(): boolean {
    return this.getFlagBoolean("IridiumPrimitive");
  }
}

const PrimitiveArithOP = ["+", "-", "/", "%", "*"];
const PrimitiveBitwiseOP = ["&", "|", "^", "<<", ">>"];
const PrimitiveComparisonOP = [">", "<", ">=", "<="];

const isPrimitiveBinop = (b: string) => {
  return PrimitiveArithOP.includes(b) || PrimitiveBitwiseOP.includes(b) || PrimitiveComparisonOP.includes(b)
}


export type BinopSEXPFlags = "Primitive" | "JSBINOP";
export class BinopSEXP extends IridiumSEXP {
  constructor(op: string, lBinop: IridiumSEXP, rBinop: IridiumSEXP) {
    super("Binop");
    this.args.push(new StringSEXP(op));
    this.args.push(lBinop);
    this.args.push(rBinop);
    if (isPrimitiveBinop(op)) this.flags.push(["Primitive", null]);
    else this.flags.push(["JSBINOP", null]);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.args[1].toString(0)} OP[${this.args[0].toString(0)}] ${this.args[2].toString(0)}`
  }
}

// (Primitive) Unop
export class UnopSEXP extends IridiumSEXP {
  constructor(op: string, val: IridiumSEXP) {
    super("Unop");
    this.args.push(new StringSEXP(op));
    this.args.push(val);
  }

  // toString(space?: number): string {
  //   return `${printIriSpace(space)}UNOP[${this.args[0].toString(0)}] ${this.args[1].toString(0)}`
  // }
  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${s.toString(10)}`);
    }
    return res.join("\n");
  }
}

export class LambdaSEXP extends IridiumSEXP {
  constructor(bbIdx: number) {
    super("Lambda");
    this.setStartBBIDX(bbIdx);
  }

  // Flags
  setStartBBIDX(startBBIDX: number) {
    this.setFlag("StartBBIDX", startBBIDX);
  }

  getStartBBIDX() {
    return this.getFlagNumber("StartBBIDX");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}λ[${this.getStartBBIDX()}]`
  }
}


// (Primitive) NOP
export class NOPSEXP extends IridiumSEXP {
  constructor() {
    super("NOP");
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