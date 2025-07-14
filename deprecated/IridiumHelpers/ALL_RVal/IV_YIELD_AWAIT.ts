import {
  JS3AwaitExpression,
  JS3YieldExpression,
} from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_YIELD extends ALL_RVal {
  argument: IV_Identifier | undefined;

  constructor(
    node: JS3YieldExpression | undefined = undefined,
    argument: IV_Identifier | undefined = undefined,
  ) {
    super(node, "YieldExpression");
    this.argument = argument;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    if (this.argument) res.add(this.argument.lookupName());
    return res;
  }

  toString() {
    if (!this.argument) {
      return `<YIELD> YIELD`;
    } else {
      return `<YIELD> YIELD ${this.argument.toString()}`;
    }
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_AWAIT extends ALL_RVal {
  argument: IV_Identifier;

  constructor(
    node: JS3AwaitExpression | undefined = undefined,
    argument: IV_Identifier,
  ) {
    super(node, "AwaitExpression");
    this.argument = argument;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    if (this.argument) res.add(this.argument.lookupName());
    return res;
  }

  toString() {
    return `<AWAIT> AWAIT ${this.argument.toString()}`;
  }

  toDOT() {
    return this.toString();
  }
}
