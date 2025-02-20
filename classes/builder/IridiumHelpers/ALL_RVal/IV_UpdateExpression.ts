import { JS3UpdateExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import {
  IV_Identifier,
  IV_MemberExpressionPA,
  IV_SuperLookupPA,
  IV_ThisLookupPA,
} from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { ISP_Super } from "./ALL_ISP.ts";
import { IV_This } from "./IV_This.ts";
import { IRIDIUM_FG } from "../Passes/PTA/IRIDIUM_FG.ts";

export class IV_UpdateExpression extends ALL_RVal {
  argument:
    | IV_Identifier
    | IV_MemberExpressionPA
    | IV_ThisLookupPA
    | IV_SuperLookupPA;
  operator: "++" | "--";
  prefix: boolean;

  constructor(
    node: JS3UpdateExpression | undefined = undefined,
    argument:
      | IV_Identifier
      | IV_MemberExpressionPA
      | IV_ThisLookupPA
      | IV_SuperLookupPA,
    operator: "++" | "--",
    prefix: boolean,
  ) {
    super(node, "UpdateExpression");
    this.argument = argument;
    this.operator = operator;
    this.prefix = prefix;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    if (this.argument instanceof IV_MemberExpressionPA)
      res.add(this.argument.object.lookupName());
    else if (this.argument instanceof IV_SuperLookupPA)
      res.add(ISP_Super.lookupName());
    else if (this.argument instanceof IV_ThisLookupPA)
      res.add(IV_This.lookupName());
    else res.add(this.argument.lookupName());
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.argument.declaredClosure();
  }

  toString() {
    return this.prefix
      ? `${this.operator}${this.argument.toString()}`
      : `${this.argument.toString()}${this.operator}`;
  }

  toDOT() {
    return this.toString();
  }
}
