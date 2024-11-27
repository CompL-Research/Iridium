import { JS3AssnInit } from "classes/builder/JS3Helpers/JS3Types.ts";

export class ALL_RVal {
  node : JS3AssnInit | undefined
  constructor(node: JS3AssnInit | undefined) {
    this.node = node
  }

  toString(space = 0) {
    if (this.node) {
      return `${" ".repeat(space)}RVAL_TODO(${this.node.type})`; 
    }
    return `${" ".repeat(space)}RVAL_TODO(UKN)`;
  }
}