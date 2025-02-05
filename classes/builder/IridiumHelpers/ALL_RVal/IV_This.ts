import { Super, ThisExpression } from "@babel/types";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_This extends ALL_RVal {  
  constructor(node: ThisExpression | undefined = undefined) {
    super(node, "ThisExpression");
  }

  static lookupName() { return "THIS" }

  toString() {
    return `<THIS> ${IV_This.lookupName()}`
  }

  toDOT() {
    return this.toString()
  }
}