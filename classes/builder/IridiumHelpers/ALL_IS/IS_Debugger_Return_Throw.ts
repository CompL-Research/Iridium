import { JS3DebuggerStatement, JS3ReturnStatement, JS3ThrowStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { IV_Identifer } from "../ALL_RVal/IV_Identifier.ts";

export class IS_Debugger extends ALL_IS {
  constructor(node: JS3DebuggerStatement | undefined = undefined) {
    super(node);
  }

  toString(space = 0) {
    return `${" ".repeat(space)}DEBUGGER;`
  }
}

export class IS_Return extends ALL_IS {
  argument : null | IV_Identifer

  constructor(node: JS3ReturnStatement | undefined = undefined, argument: IV_Identifer | null) {
    super(node);
    this.argument = argument
  }

  toString(space = 0) {
    if (this.argument) {
      return `${" ".repeat(space)}RETURN ${this.argument.toString()};`
    } else {
      return `${" ".repeat(space)}RETURN;`
    }
  }
}

export class IS_Throw extends ALL_IS {
  argument : IV_Identifer

  constructor(node: JS3ThrowStatement | undefined = undefined, argument: IV_Identifer) {
    super(node);
    this.argument = argument
  }

  toString(space = 0) {
    return `${" ".repeat(space)}THROW ${this.argument.toString()};`
  }
}