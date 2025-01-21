import { JS3UpdateExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { BB } from "../BB.ts";

export class IV_UpdateExpression extends ALL_RVal {
  argument: IV_Identifier | IV_MemberExpressionPA | IV_ThisLookupPA | IV_SuperLookupPA;
  operator: "++" | "--";
  prefix: boolean;
  
  constructor(node: JS3UpdateExpression | undefined = undefined, argument: IV_Identifier | IV_MemberExpressionPA | IV_ThisLookupPA | IV_SuperLookupPA, operator: "++" | "--", prefix: boolean) {
    super(node, "UpdateExpression");
    this.argument = argument
    this.operator = operator
    this.prefix = prefix
  }

  declaredClosure() : BB | undefined { return this.argument.declaredClosure() }

  toString() {
    return this.prefix ? `${this.operator} ${this.argument.toString()}` : `${this.argument.toString()} ${this.operator}`
  }
  
  toDOT() {
    return this.toString()
  }
}
