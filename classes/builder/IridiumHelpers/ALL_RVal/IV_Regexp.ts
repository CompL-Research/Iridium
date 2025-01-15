import { JS3RegExpLiteral } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_Regexp extends ALL_RVal {
  pattern: string
  flags: string
  
  constructor(node: JS3RegExpLiteral | undefined = undefined, pattern: string, flags: string) {
    super(node, "Regexp");
    this.pattern = pattern
    this.flags   = flags
  }

  toString() {
    return `<${this.type}> ${this.pattern} ${this.flags}`
  }

  toDOT() {
    return this.toString()
  }
}
