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

  usedIdentifiers() : Set<string> {
    let res : Set<string> = new Set()
    this.elements.forEach(e => {
      if (!e) return;
      if (e instanceof IV_Identifier) {
        res.add(e.lookupName())
      } else {
        res.add(e.arg.lookupName())
      }
    })
    return res;
  }

  toString(space = 0) {
    return `<ArrayExpression> [ ${this.elements.map(e => !e ? "" : e.toString()).join(",")} ]`
  }

  toDOT(space = 0) {
    return this.toString(space)
  }
}
