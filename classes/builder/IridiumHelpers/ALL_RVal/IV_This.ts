import { ThisExpression } from "@babel/types";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_This extends ALL_RVal {  
  constructor(node: ThisExpression | undefined = undefined) {
    super(node, "ThisExpression");
  }

  toString() {
    return `<THIS> THIS`
  }
}
