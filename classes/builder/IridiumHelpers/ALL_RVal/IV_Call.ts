import { JS3CallExpression, JS3ContextualCallExpression, JS3RestElement, JS3SpreadElement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ISP_ArgSpread } from "./ALL_ISP.ts";

export class IV_ImportCall extends ALL_RVal {
  args: Array<IV_Identifier | ISP_ArgSpread>

  constructor(node: JS3CallExpression | undefined = undefined, args: Array<IV_Identifier | ISP_ArgSpread>) {
    super(node, "ImportCall");
    this.args = args
  }

  toString() {
    let args = this.args.map(e => e.toString()).join(",")
    return `<IMPORTCALL> IMPORT(${args})`
  }
}

export class IV_Call extends ALL_RVal {
  callee: IV_Identifier
  args: Array<IV_Identifier | ISP_ArgSpread>
  staticThis: boolean

  constructor(node: JS3CallExpression | JS3ContextualCallExpression | undefined = undefined, staticThis: boolean, callee: IV_Identifier, args: Array<IV_Identifier | ISP_ArgSpread>) {
    super(node, "Call");
    this.staticThis = staticThis;
    this.callee = callee
    this.args = args
  }

  toString() {
    let args = this.args.map(e => e.toString()).join(",")
    return `<CALL, ${this.staticThis ? "MaybeCalleeContext" : "" }> ${this.callee.toString()}(${args})`
  }
}

export class IV_SuperCall extends ALL_RVal {
  args: Array<IV_Identifier | ISP_ArgSpread>

  constructor(node: JS3CallExpression | undefined = undefined, args: Array<IV_Identifier | ISP_ArgSpread>) {
    super(node, "SuperCall");
    this.args = args
  }

  toString() {
    let args = this.args.map(e => e.toString()).join(",")
    return `<SUPERCALL> SUPER(${args})`
  }
}

export class IV_V8IntrinsicCall extends ALL_RVal {
  callee: IV_Identifier
  args: Array<IV_Identifier | ISP_ArgSpread>

  constructor(node: JS3CallExpression | undefined = undefined, callee: IV_Identifier, args: Array<IV_Identifier | ISP_ArgSpread>) {
    super(node, "V8IntrinsicCall");
    this.callee = callee
    this.args = args
  }

  toString() {
    let args = this.args.map(e => e.toString()).join(",")
    return `<V8INTRINSICCALL> ${this.callee.toString()}(${args})`
  }
}

