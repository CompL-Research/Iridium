import { BigIntLiteral, BooleanLiteral, DecimalLiteral, NullLiteral, NumericLiteral, StringLiteral } from "@babel/types";
import { ALL_RVal } from "./ALL_RVal.ts";

export type IV_Literals = IV_DecimalLiteral | IV_BigIntLiteral | IV_StringLiteral | IV_NumericLiteral | IV_NullLiteral | IV_BooleanLiteral


export class IV_DecimalLiteral extends ALL_RVal {
  value: string
  constructor(node: DecimalLiteral | undefined = undefined, value: string) {
    super(node, "DecimalLiteral");
    this.value = value
  }

  toString() {
    return `<${this.type}> ${this.value}`
  }

  toDOT() {
    return this.toString()
  }
}


export class IV_BigIntLiteral extends ALL_RVal {
  value: string
  constructor(node: BigIntLiteral | undefined = undefined, value: string) {
    super(node, "BigIntLiteral");
    this.value = value
  }

  toString() {
    return `<${this.type}> ${this.value}`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_StringLiteral extends ALL_RVal {
  value: string
  constructor(node: StringLiteral | undefined = undefined, value: string) {
    super(node, "StringLiteral");
    this.value = value
  }

  toString() {
    return `<${this.type}> "${this.value}"`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_NumericLiteral extends ALL_RVal {
  value: number
  constructor(node: NumericLiteral | undefined = undefined, value: number) {
    super(node, "NumericLiteral");
    this.value = value
  }

  toString() {
    return `<${this.type}> ${this.value}`
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_NullLiteral extends ALL_RVal {
  constructor(node: NullLiteral | undefined = undefined) {
    super(node, "NullLiteral");
  }

  toString() {
    return `<${this.type}> NULL`
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_BooleanLiteral extends ALL_RVal {
  value: boolean
  constructor(node: BooleanLiteral | undefined = undefined, value : boolean) {
    super(node, "BooleanLiteral");
    this.value = value
  }

  toString() {
    return `<${this.type}> ${this.value}`
  }

  toDOT() {
    return this.toString();
  }
}

