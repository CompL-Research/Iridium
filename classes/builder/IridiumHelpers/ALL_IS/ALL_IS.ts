import { JS3AllowedProgStatement, JS3ClassExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";

export class ALL_IS {
  node : JS3AllowedProgStatement | undefined | JS3ClassExpression
  constructor(node: JS3AllowedProgStatement | undefined | JS3ClassExpression) {
    this.node = node
  }

  toDOT() {
    throw new Error("ALL_IS: toDOT not implemented!!");
  }

  declaredClosure() : IRIDIUM_FG | undefined { return undefined }

  toString(space = 0) {
    throw new Error("ALL_IS: toString not implemented!!");
  }
}