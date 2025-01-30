import { JS3UnaryExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

export type U_OPA = "!" | "+" | "-" | "~"
export type U_OPB = "void"
export type U_OPC = "typeof"
export type U_OPD = "delete"

export class IV_AUNOP extends ALL_RVal {
  operator: U_OPA
  argument: IV_Identifier;
  
  constructor(node: JS3UnaryExpression | undefined = undefined, argument: IV_Identifier, operator: U_OPA) {
    super(node, "UArtihOP");
    this.argument = argument
    this.operator = operator
  }

  toString() {
    return `<U_OPA> ${this.argument} ${this.argument.toString()}`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_BUNOP extends ALL_RVal {
  argument: IV_Identifier;
  
  constructor(node: JS3UnaryExpression | undefined = undefined, argument: IV_Identifier) {
    super(node, "UVoidOP");
    this.argument = argument
  }

  toString() {
    return `<U_OPB> VOID ${this.argument.toString()}`
  }
  
  toDOT() {
    return this.toString()
  }
}

export class IV_CUNOP extends ALL_RVal {
  argument: IV_Identifier;
  
  constructor(node: JS3UnaryExpression | undefined = undefined, argument: IV_Identifier) {
    super(node, "UTypeOP");
    this.argument = argument
  }

  toString() {
    return `<U_OPC> TYPEOF ${this.argument.toString()}`
  }
  
  toDOT() {
    return this.toString()
  }
}


export class IV_DUNOP extends ALL_RVal {
  argument: IV_Identifier;
  
  constructor(node: JS3UnaryExpression | undefined = undefined, argument: IV_Identifier) {
    super(node, "UDelOP");
    this.argument = argument
  }

  toString() {
    return `<U_OPD> DELETE ${this.argument.toString()}`
  }
  
  toDOT() {
    return this.toString()
  }
}

