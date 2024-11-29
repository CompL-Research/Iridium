import { BigIntLiteral, BooleanLiteral, DecimalLiteral, Identifier, NullLiteral, NumericLiteral, StringLiteral } from "@babel/types";
import { ALL_RVal } from "./ALL_RVal.ts";

export class IV_DecimalLiteral extends ALL_RVal {
  value: string
  constructor(node: DecimalLiteral | undefined = undefined, value: string) {
    super(node);
    this.value = value
  }

  toString() {
    return `${this.value}`
  }
}


export class IV_BigIntLiteral extends ALL_RVal {
  value: string
  constructor(node: BigIntLiteral | undefined = undefined, value: string) {
    super(node);
    this.value = value
  }

  toString() {
    return `${this.value}`
  }
}

export class IV_StringLiteral extends ALL_RVal {
  value: string
  constructor(node: StringLiteral | undefined = undefined, value: string) {
    super(node);
    this.value = value
  }

  toString() {
    return `"${this.value}"`
  }
}

export class IV_NumericLiteral extends ALL_RVal {
  value: number
  constructor(node: NumericLiteral | undefined = undefined, value: number) {
    super(node);
    this.value = value
  }

  toString() {
    return `${this.value}`
  }
}

export class IV_NullLiteral extends ALL_RVal {
  constructor(node: NullLiteral | undefined = undefined) {
    super(node);
  }

  toString() {
    return `NULL`
  }
}

export class IV_BooleanLiteral extends ALL_RVal {
  value: boolean
  constructor(node: BooleanLiteral | undefined = undefined, value : boolean) {
    super(node);
    this.value = value
  }

  toString() {
    return `${this.value}`
  }
}

export class IV_Identifer extends ALL_RVal {
  name: string
  constructor(node: Identifier | undefined = undefined, name: string) {
    super(node);
    this.name = name
  }

  toString() {
    return `${this.name}`
  }
}