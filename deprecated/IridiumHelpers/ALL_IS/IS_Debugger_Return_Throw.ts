import { printScopedSpace, printSpace } from "#utils";
import {
  JS3DebuggerStatement,
  JS3ReturnStatement,
  JS3ThrowStatement,
} from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { FunctionReturn } from "../BB.ts";
import { ALL_IS } from "./ALL_IS.ts";

export class IS_Debugger extends ALL_IS {
  constructor(node: JS3DebuggerStatement | undefined = undefined) {
    super(node);
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ DEBUGGER;`;
  }

  toDOT(space = 0) {
    return `${printSpace(space)} DEBUGGER;`;
  }
}

export class IS_Return extends ALL_IS {
  argument: null | IV_Identifier;
  bb: FunctionReturn | undefined;

  constructor(
    node: JS3ReturnStatement | undefined = undefined,
    argument: IV_Identifier | null,
  ) {
    super(node);
    this.argument = argument;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    if (this.argument) res.add(this.argument.lookupName());
    return res;
  }

  toString(space = 0) {
    if (this.argument) {
      return `${printScopedSpace(space)}▏ RETURN ${this.argument.toString()} [${this.bb ? `BB${this.bb.idx}` : "UNRESOLVED"}];`;
    } else {
      return `${printScopedSpace(space)}▏ RETURN [${this.bb ? `BB${this.bb.idx}` : "UNRESOLVED"}];`;
    }
  }

  toDOT(space = 0) {
    if (this.argument) {
      return `${printSpace(space)} RETURN ${this.argument.lookupName()} [${this.bb ? `BB${this.bb.idx}` : "UNRESOLVED"}];`;
    } else {
      return `${printSpace(space)} RETURN [${this.bb ? `BB${this.bb.idx}` : "UNRESOLVED"}];`;
    }
  }
}

export class IS_Throw extends ALL_IS {
  argument: IV_Identifier;

  constructor(
    node: JS3ThrowStatement | undefined = undefined,
    argument: IV_Identifier,
  ) {
    super(node);
    this.argument = argument;
  }

  usedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(this.argument.lookupName());
    return res;
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ THROW ${this.argument.lookupName()};`;
  }

  toDOT(space = 0) {
    return `${printSpace(space)} THROW ${this.argument.lookupName()};`;
  }
}
