import { JS3NewExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_ArgSpread, ISP_Super, ISP_V8Intrinsic } from "./ALL_ISP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_NewExpression extends ALL_RVal {
  callee: IV_Identifier | ISP_Super | ISP_V8Intrinsic
  args: Array<IV_Identifier | ISP_ArgSpread>

  constructor(node: JS3NewExpression | undefined = undefined, callee: IV_Identifier | ISP_Super | ISP_V8Intrinsic, args: Array<IV_Identifier | ISP_ArgSpread>) {
    super(node, "NewExpression");
    this.callee = callee
    this.args = args
  }

  toString() {
    return `NEW ${this.callee.toString()}(${this.args.map(a => a.toString()).join(",")})`
  }
}
