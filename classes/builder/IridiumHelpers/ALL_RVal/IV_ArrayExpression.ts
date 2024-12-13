import { JS3ArrayExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_ArgSpread } from "./ALL_ISP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_ArrayExpression extends ALL_RVal {
  
  elements: Array<null | IV_Identifier | ISP_ArgSpread>
  
  constructor(node: JS3ArrayExpression | undefined = undefined, elements: Array<null | IV_Identifier | ISP_ArgSpread>) {
    super(node, "ArrayExpression");
    this.elements = elements
  }

  toString(space = 0) {
    return `<ArrayExpression> [ ${this.elements.map(e => !e ? "" : e.toString()).join(",")} ]`
  }
}
