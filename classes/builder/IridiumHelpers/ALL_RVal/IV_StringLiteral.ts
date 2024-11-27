import { ALL_RVal } from "./ALL_RVal.ts";
import { StringLiteral } from "@babel/types"

export class IV_StringLiteral extends ALL_RVal {
  value: string
  constructor(node: StringLiteral | undefined = undefined, value: string) {
    super(node);
    this.value = value
  }

  toString() {
    return `"${this.value}"`
  }
}
