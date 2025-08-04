import { printIriSpace } from "#utils";
import { IridiumSEXP } from "./General";

/**
 * 
 */
export type ListSEXPFlags = "UNOP_DEL_VAR" | "UNOP_DEL_MEMBEREXPR" | "ModuleRequests" | "ImportedBinding" | "LocalBindings" | "RemoteBindings" | "LambdaPool" | "BBs";
export class ListSEXP extends IridiumSEXP {
  constructor(elems: Array<IridiumSEXP>) {
    super("List");
    elems.forEach(e => this.args.push(e));
  }

  setFlag(flag: ListSEXPFlags) {
    super.setFlag(flag);
  }

  // toString(space?: number): string {
  //   if (!space) space = 0;
  //   let res;
  //   if (this.hasFlag("BBs")) {
  //     res = `${printIriSpace(space)}BBs${this.args.length > 0 ? "\n" + this.args.map(e => e.toString(space + 2)).join("\n") : ""}`;
  //   } else if (this.hasFlag("LambdaPool")) {
  //     res = `${printIriSpace(space)}LambdaPool${this.args.length > 0 ? "\n" + this.args.map(e => e.toString(space + 2)).join("\n") : ""}`;
  //   } else if (this.hasFlag("RemoteBindings")) {
  //     res = `${printIriSpace(space)}RemoteBindings${this.args.length > 0 ? "\n" + this.args.map(e => e.toString(space + 2)).join("\n") : ""}`;
  //   } else if (this.hasFlag("LocalBindings")) {
  //     res = `${printIriSpace(space)}LocalBindings${this.args.length > 0 ? "\n" + this.args.map(e => e.toString(space + 2)).join("\n") : ""}`;
  //   } else {
  //     return super.toString(space)
  //   }
  //   return res;
  // }
}

// @ts-ignore
export function isListSEXP(o: any): o is ListSEXP {
  // @ts-ignore
  return o.tag === "List";
}

// (Primitive) String
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

// @ts-ignore
export function isStringSEXP(o: any): o is StringSEXP {
  // @ts-ignore
  return o.tag === "String";
}