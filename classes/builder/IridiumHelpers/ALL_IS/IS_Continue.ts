import { printScopedSpace, printSpace } from "#utils";
import { JS3ContinueStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_IS } from "./ALL_IS.ts";

export class IS_LContinue extends ALL_IS {
  label: IV_Identifier
  idx: undefined | number = undefined

  constructor(node: JS3ContinueStatement | undefined = undefined, label: IV_Identifier, idx : undefined | number = undefined) {
    super(node);
    this.label = label;
    this.idx = idx
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ LCONTINUE ${this.label.lookupName()} [${this.idx ? "BB" + this.idx : "UNRESOLVED"}];`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} LCONTINUE ${this.label.lookupName()} [${this.idx ? "BB" + this.idx : "UNRESOLVED"}];`
  }
}

export class IS_Continue extends ALL_IS {
  idx: undefined | number = undefined

  constructor(node: JS3ContinueStatement | undefined = undefined, idx : undefined | number = undefined) {
    super(node);
    this.idx = idx
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ CONTINUE [${this.idx ? "BB" + this.idx : "UNRESOLVED"}];`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} CONTINUE [${this.idx ? "BB" + this.idx : "UNRESOLVED"}];`
  }
}