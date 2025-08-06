import { printFlagString, printIriSpace } from "#utils";
import { IridiumPrimitives, IridiumSEXP } from "./General";

export type CallSiteSEXPFlags = "Import" | "Super" | "V8Intrinsic" | "CCall" | "ConstructorCall" | "PrivateCall";
export class CallSiteSEXP extends IridiumSEXP {
  constructor(args: Array<IridiumSEXP>, closureFlag: [CallSiteSEXPFlags, IridiumPrimitives][]) {
    super("CallSite");
    args.forEach(a => this.args.push(a));
    closureFlag.forEach(flag => this.flags.push(flag));
  }

  // Utility
  isConstructorCall() {
    return this.hasFlag("ConstructorCall");
  }

  isImportCall() {
    return this.hasFlag("Import");
  }

  isSuperCall() {
    return this.hasFlag("Super");
  }

  isV8IntrinsicCall() {
    return this.hasFlag("V8Intrinsic");
  }

  isSimpleCall() {
    return !(this.isImportCall() || this.isSuperCall() || this.isV8IntrinsicCall());
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}CallSite[${printFlagString(this.flags)}](${this.args.map(e => e.toString(0)).join(", ")})`
  }
}