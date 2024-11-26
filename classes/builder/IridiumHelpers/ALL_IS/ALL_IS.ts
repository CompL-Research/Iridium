import { JS3AllowedProgStatement } from "classes/builder/JS3Helpers/JS3Types.ts";

export class ALL_IS {
  node : JS3AllowedProgStatement | undefined
  constructor(node: JS3AllowedProgStatement | undefined) {
    this.node = node
  }
}