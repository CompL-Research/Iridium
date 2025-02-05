import { JS3AllowedProgStatement, JS3ClassExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { printScopedSpace, printSpace } from "#utils";

export class ALL_IS {
  node : JS3AllowedProgStatement | undefined | JS3ClassExpression
  constructor(node: JS3AllowedProgStatement | undefined | JS3ClassExpression) {
    this.node = node
  }

  toDOT() {
    throw new Error("ALL_IS: toDOT not implemented!!");
  }

  definedIdentifiers() : Set<string> { return new Set() }
  usedIdentifiers() : Set<string> { return new Set() }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return undefined }

  toString(space = 0) {
    throw new Error("ALL_IS: toString not implemented!!");
  }
}

export class IS_Noop extends ALL_IS {
  constructor() {
    super(undefined);
  }

  toString(space = 0) {
    return `${printScopedSpace(space)} 🪹🐦NOOP`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 🪹🐦NOOP`
  }
}