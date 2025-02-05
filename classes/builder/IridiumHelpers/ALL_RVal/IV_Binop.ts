import { JS3BinaryExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_PrivateName } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";

// type IV_BINOP = "ArtihOP" | "BitwiseOP" | "EqCheckOP" | "PropCheckOP" | "NarrowingOP" | "CompOP"

export type OPA = "+" | "-" | "/" | "%" | "*" | "**"
export type OPB = "&" | "|" | ">>" | ">>>" | "<<" | "^"
export type OPC = "==" | "===" | "!=" | "!=="
export type OPD = "in"
export type OPE = "instanceof"
export type OPF = ">" | "<" | ">=" | "<="

export class IV_ABINOP extends ALL_RVal {
  left: IV_Identifier
  right: IV_Identifier
  op: OPA

  constructor(node: JS3BinaryExpression | undefined = undefined, left: IV_Identifier, right: IV_Identifier, op: OPA) {
    super(node, "ArtihOP");
    this.left = left
    this.right = right
    this.op = op
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    res.add(this.left.lookupName())
    res.add(this.right.lookupName())
    return res;
  }

  toString() {
    return `<OPA> ${this.left.toString()} ${this.op} ${this.right.toString()}`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_BBINOP extends ALL_RVal {
  left: IV_Identifier
  right: IV_Identifier
  op: OPB

  constructor(node: JS3BinaryExpression | undefined = undefined, left: IV_Identifier, right: IV_Identifier, op: OPB) {
    super(node, "BitwiseOP");
    this.left = left
    this.right = right
    this.op = op
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    res.add(this.left.lookupName())
    res.add(this.right.lookupName())
    return res;
  }

  toString() {
    return `<OPB> ${this.left.toString()} ${this.op} ${this.right.toString()}`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_CBINOP extends ALL_RVal {
  left: IV_Identifier
  right: IV_Identifier
  op: OPC

  constructor(node: JS3BinaryExpression | undefined = undefined, left: IV_Identifier, right: IV_Identifier, op: OPC) {
    super(node, "CheckOP");
    this.left = left
    this.right = right
    this.op = op
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    res.add(this.left.lookupName())
    res.add(this.right.lookupName())
    return res;
  }

  toString() {
    return `<OPC> ${this.left.toString()} ${this.op} ${this.right.toString()}`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_DBINOP extends ALL_RVal {
  left: IV_Identifier | IV_PrivateName
  right: IV_Identifier
  op: OPD

  constructor(node: JS3BinaryExpression | undefined = undefined, left: IV_Identifier | IV_PrivateName, right: IV_Identifier, op: OPD) {
    super(node, "PropCheckOP");
    this.left = left
    this.right = right
    this.op = op
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    res.add(this.right.lookupName())
    return res;
  }

  toString() {
    return `<OPD> ${this.left.toString()} ${this.op} ${this.right.toString()}`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_EBINOP extends ALL_RVal {
  left: IV_Identifier
  right: IV_Identifier
  op: OPE

  constructor(node: JS3BinaryExpression | undefined = undefined, left: IV_Identifier, right: IV_Identifier, op: OPE) {
    super(node, "NarrowingOP");
    this.left = left
    this.right = right
    this.op = op
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    res.add(this.left.lookupName())
    res.add(this.right.lookupName())
    return res;
  }

  toString() {
    return `<OPE> ${this.left.toString()} ${this.op} ${this.right.toString()}`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_FBINOP extends ALL_RVal {
  left: IV_Identifier
  right: IV_Identifier
  op: OPF

  constructor(node: JS3BinaryExpression | undefined = undefined, left: IV_Identifier, right: IV_Identifier, op: OPF) {
    super(node, "CompOP");
    this.left = left
    this.right = right
    this.op = op
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    res.add(this.left.lookupName())
    res.add(this.right.lookupName())
    return res;
  }

  toString() {
    return `<OPF> ${this.left.toString()} ${this.op} ${this.right.toString()}`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}