import { printIriSpace } from "#utils";
import { IridiumSEXP } from "./General";

// (Extension) JSEnvWrite
export class JSFuncDeclSEXP extends IridiumSEXP {
  constructor(lval: IridiumSEXP, rval: IridiumSEXP) {
    super("JSFuncDecl");
    this.args.push(lval);
    this.args.push(rval);
  }

  toString(space?: number): string {
    if (!space) space = 0;
    let res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    const args = this.args.map(e => e.toString(10));
    res = [...res, ...args];
    return res.join("\n");
  }
}

// @ts-ignore
export function isJSFuncDeclSEXP(o: any): o is JSFuncDeclSEXP {
  // @ts-ignore
  return o.tag === "JSFuncDecl";
}

// (Primitive) NOP
export class NOPSEXP extends IridiumSEXP {
  constructor() {
    super("NOP");
  }
}
