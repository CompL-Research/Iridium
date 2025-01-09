import { JS3AllowedProgStatement, JS3ClassExpression } from "classes/builder/JS3Helpers/JS3Types.ts";

export class ALL_IS {
  node : JS3AllowedProgStatement | undefined | JS3ClassExpression
  constructor(node: JS3AllowedProgStatement | undefined | JS3ClassExpression) {
    this.node = node
  }

  toString(space = 0) {
    throw new Error("ALL_IS: toString not implemented!!");
  }
}