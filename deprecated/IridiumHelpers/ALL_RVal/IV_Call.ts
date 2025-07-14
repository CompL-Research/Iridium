import { V8IntrinsicIdentifier } from "@babel/types";
import {
  JS3CallExpression,
  JS3ContextualCallExpression,
} from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import {
  ISP_ArgSpread,
  ISP_Import,
  ISP_Super,
  ISP_V8Intrinsic,
} from "./ALL_ISP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import debugConfig from "#debugConfig";
export class IV_ImportCall extends ALL_RVal {
  args: Array<IV_Identifier | ISP_ArgSpread>;

  constructor(
    node: JS3CallExpression | undefined = undefined,
    args: Array<IV_Identifier | ISP_ArgSpread>,
  ) {
    super(node, "ImportCall");
    this.args = args;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    this.args.forEach((i) =>
      i instanceof IV_Identifier
        ? res.add(i.lookupName())
        : res.add(i.arg.lookupName()),
    );
    res.add(ISP_Import.lookupName());
    return res;
  }

  toString() {
    const args = this.args.map((e) => e.toString()).join(",");
    return `<IMPORTCALL> ${ISP_Import.lookupName()}(${args})`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}

export class IV_Call extends ALL_RVal {
  callee: IV_Identifier;
  args: Array<IV_Identifier | ISP_ArgSpread>;
  staticThis: boolean;
  context: string = undefined;

  constructor(
    node:
      | JS3CallExpression
      | JS3ContextualCallExpression
      | undefined = undefined,
    staticThis: boolean,
    callee: IV_Identifier,
    args: Array<IV_Identifier | ISP_ArgSpread>,
    context: string = undefined,
  ) {
    super(node, "Call");
    this.staticThis = staticThis;
    this.callee = callee;
    this.args = args;
    if (staticThis) {
      if (!context) debugConfig.logger.throwIriError("Expected context to be provided for IV_Call");
      this.context = context;
    }
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    this.args.forEach((i) =>
      i instanceof IV_Identifier
        ? res.add(i.lookupName())
        : res.add(i.arg.lookupName()),
    );
    res.add(this.callee.lookupName());
    return res;
  }

  toString() {
    const args = this.args.map((e) => e.toString()).join(",");
    return `<CALL${this.staticThis ? `, MaybeCalleeContext(${this.context})` : ""}> ${this.callee.toString()}(${args})`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}

export class IV_SuperCall extends ALL_RVal {
  args: Array<IV_Identifier | ISP_ArgSpread>;

  constructor(
    node: JS3CallExpression | undefined = undefined,
    args: Array<IV_Identifier | ISP_ArgSpread>,
  ) {
    super(node, "SuperCall");
    this.args = args;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    this.args.forEach((i) =>
      i instanceof IV_Identifier
        ? res.add(i.lookupName())
        : res.add(i.arg.lookupName()),
    );
    res.add(ISP_Super.lookupName());
    return res;
  }

  toString() {
    const args = this.args.map((e) => e.toString()).join(",");
    return `<SUPERCALL> ${ISP_Super.lookupName()}(${args})`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}

export class IV_V8IntrinsicCall extends ALL_RVal {
  callee: ISP_V8Intrinsic;
  args: Array<IV_Identifier | ISP_ArgSpread>;

  constructor(
    node: JS3CallExpression | undefined = undefined,
    callee: V8IntrinsicIdentifier,
    args: Array<IV_Identifier | ISP_ArgSpread>,
  ) {
    super(node, "V8IntrinsicCall");
    this.callee = new ISP_V8Intrinsic(
      callee,
      new IV_Identifier(undefined, callee.name),
    );
    this.args = args;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    this.args.forEach((i) =>
      i instanceof IV_Identifier
        ? res.add(i.lookupName())
        : res.add(i.arg.lookupName()),
    );
    res.add(this.callee.lookupName());
    return res;
  }

  toString() {
    const args = this.args.map((e) => e.toString()).join(",");
    return `<V8INTRINSICCALL> ${this.callee.lookupName()}(${args})`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}
