import { printScopedSpace, printSpace } from "#utils";
import { JS3BreakStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { BB } from "../BB.ts";

export class IS_LBreak extends ALL_IS {
  label: IV_Identifier
  bb: undefined | BB = undefined

  constructor(node: JS3BreakStatement | undefined = undefined, label: IV_Identifier, bb : undefined | BB = undefined) {
    super(node);
    this.label = label;
    this.bb = bb
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ LBREAK ${this.label.lookupName()} [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} LBREAK ${this.label.lookupName()} [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }
}

export class IS_Break extends ALL_IS {
  bb: undefined | BB = undefined

  constructor(node: JS3BreakStatement | undefined = undefined, bb : undefined | BB = undefined) {
    super(node);
    this.bb = bb
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ BREAK [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} BREAK [${this.bb ? this.bb.getName() : "UNRESOLVED"}];`
  }
}