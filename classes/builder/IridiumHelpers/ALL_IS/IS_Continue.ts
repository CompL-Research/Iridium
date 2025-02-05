import { printScopedSpace, printSpace } from "#utils";
import { JS3ContinueStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { BB } from "../BB.ts";

export class IS_LContinue extends ALL_IS {
  label: IV_Identifier
  bb: undefined | BB = undefined

  constructor(node: JS3ContinueStatement | undefined = undefined, label: IV_Identifier, bb : undefined | BB = undefined) {
    super(node);
    this.label = label;
    this.bb = bb
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ LCONTINUE ${this.label.lookupName()} [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} LCONTINUE ${this.label.lookupName()} [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }
}

export class IS_Continue extends ALL_IS {
  bb: undefined | BB = undefined

  constructor(node: JS3ContinueStatement | undefined = undefined, bb : undefined | BB = undefined) {
    super(node);
    this.bb = bb
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ CONTINUE [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} CONTINUE [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }
}