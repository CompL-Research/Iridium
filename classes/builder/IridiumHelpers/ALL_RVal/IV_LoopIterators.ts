import { JS3ForInStatement, JS3ForOfStatement, JS3MetaProperty } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";

export class IV_InIterator extends ALL_RVal {  
  RVal: IV_Identifier

  constructor(node: JS3ForInStatement | undefined = undefined, RVal: IV_Identifier) {
    super(node, "ForInIterator");
    this.RVal = RVal
  }

  toString() {
    return `<InIterator> in ${this.RVal.toString()}`
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_OfIterator extends ALL_RVal {  
  RVal: IV_Identifier

  constructor(node: JS3ForOfStatement | undefined = undefined, RVal: IV_Identifier) {
    super(node, "ForOfIterator");
    this.RVal = RVal
  }

  toString() {
    return `<OfIterator> of ${this.RVal.toString()}`
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_LoopNext extends ALL_RVal {  
  RVal: IV_Identifier

  constructor(node: JS3ForOfStatement | JS3ForInStatement | undefined = undefined, RVal: IV_Identifier) {
    super(node, "LoopNext");
    this.RVal = RVal
  }

  toString() {
    return `<LoopNext> next ${this.RVal.toString()}`
  }

  toDOT() {
    return this.toString();
  }
}

export class IV_HasLoopNext extends ALL_RVal {  
  RVal: IV_Identifier

  constructor(node: JS3ForOfStatement | JS3ForInStatement | undefined = undefined, RVal: IV_Identifier) {
    super(node, "HasLoopNext");
    this.RVal = RVal
  }

  toString() {
    return `<HasLoopNext> hasnext ${this.RVal.toString()}`
  }

  toDOT() {
    return this.toString();
  }
}