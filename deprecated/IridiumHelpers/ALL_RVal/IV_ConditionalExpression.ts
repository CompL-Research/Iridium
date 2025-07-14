import { JS3ConditionalExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_ConditionalExpression extends ALL_RVal {
  test: IV_Identifier;
  consequent: IV_Identifier;
  alternate: IV_Identifier;
  constructor(
    node: JS3ConditionalExpression | undefined = undefined,
    test: IV_Identifier,
    consequent: IV_Identifier,
    alternate: IV_Identifier,
  ) {
    super(node, "ConditionalExpression");
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(this.test.lookupName());
    res.add(this.consequent.lookupName());
    res.add(this.alternate.lookupName());
    return res;
  }

  toString() {
    return `<CONDEXPR> ${this.test} ? ${this.consequent} : ${this.alternate}`;
  }

  toDOT() {
    return this.toString();
  }
}
