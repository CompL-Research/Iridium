import { JS3BreakStatement, JS3LabeledStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { printScopedSpace } from "../IRIDIUM.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";

export class IS_LBreak extends ALL_IS {
  label: IV_Identifier
  idx: undefined | number = undefined

  constructor(node: JS3BreakStatement | undefined = undefined, label: IV_Identifier, idx : undefined | number = undefined) {
    super(node);
    this.label = label;
    this.idx = idx
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ LBREAK ${this.label} [${this.idx ? "BB" + this.idx : "UNRESOLVED"}];`
  }
}

export class IS_Break extends ALL_IS {
  idx: undefined | number = undefined

  constructor(node: JS3BreakStatement | undefined = undefined, idx : undefined | number = undefined) {
    super(node);
    this.idx = idx
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ BREAK [${this.idx ? "BB" + this.idx : "UNRESOLVED"}];`
  }
}