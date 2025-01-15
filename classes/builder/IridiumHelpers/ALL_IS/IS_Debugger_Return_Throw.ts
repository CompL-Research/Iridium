import { JS3DebuggerStatement, JS3ReturnStatement, JS3ThrowStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { printScopedSpace, printSpace } from "../IRIDIUM.ts";

export class IS_Debugger extends ALL_IS {
  constructor(node: JS3DebuggerStatement | undefined = undefined) {
    super(node);
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ DEBUGGER;`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} DEBUGGER;`
  }
}

export class IS_Return extends ALL_IS {
  argument : null | IV_Identifier

  constructor(node: JS3ReturnStatement | undefined = undefined, argument: IV_Identifier | null) {
    super(node);
    this.argument = argument
  }

  toString(space = 0) {
    if (this.argument) {
      return `${printScopedSpace(space)}▏ RETURN ${this.argument.toString()};`
    } else {
      return `${printScopedSpace(space)}▏ RETURN;`
    }
  }

  toDOT(space = 0) {
    if (this.argument) {
      return `${printSpace(space)} RETURN ${this.argument.toString()};`
    } else {
      return `${printSpace(space)} RETURN;`
    }
  }
}

export class IS_Throw extends ALL_IS {
  argument : IV_Identifier

  constructor(node: JS3ThrowStatement | undefined = undefined, argument: IV_Identifier) {
    super(node);
    this.argument = argument
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ THROW ${this.argument.toString()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} THROW ${this.argument.toString()};`
  }
}