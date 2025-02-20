import {
  JS3AllowedProgStatement,
  JS3ClassExpression,
} from "classes/builder/JS3Helpers/JS3Types.ts";
import { printScopedSpace, printSpace } from "#utils";
import { IRIDIUM_FG } from "../Passes/PTA/IRIDIUM_FG.ts";

export type ALL_IS_NODE =
  | JS3AllowedProgStatement
  | undefined
  | JS3ClassExpression;
export class ALL_IS {
  node: ALL_IS_NODE;
  constructor(node: ALL_IS_NODE) {
    this.node = node;
  }

  toDOT() {
    throw new Error("ALL_IS: toDOT not implemented!!");
  }

  definedIdentifiers(): Set<string> {
    return new Set();
  }
  usedIdentifiers(): Set<string> {
    return new Set();
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toString(_space = 0): string {
    throw new Error("ALL_IS: toString not implemented!!");
  }
}

export class IS_Noop extends ALL_IS {
  constructor() {
    super(undefined);
  }

  toString(space = 0) {
    return `${printScopedSpace(space)} 🪹🐦NOOP`;
  }

  toDOT(space = 0) {
    return `${printSpace(space)} 🪹🐦NOOP`;
  }
}
