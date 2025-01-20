

// 
// An environment contains a set of bindings, each BB is associated with an Environment, this environment may be duplicated at each 
// statement during analysis, but let see how we implement that...
// 

import { printSpace } from "../IRIDIUM.ts"

export class Environment {
  idx: number
  parent: Environment | undefined
  children: Set<Environment> = new Set() // This might make it easier to print the graph, I see not much practical use yet

  static i = 0

  constructor(parent : Environment | undefined = undefined) {
    this.idx = Environment.i++
    this.parent = parent
    if (parent !== undefined)
      parent.children.add(this)
  }

  getName() { return `ENV(${this.idx})` }

  toDOT(space = 0) {
    let res = []
    for (let c of this.children) {
      res.push(`${printSpace(space)} "${c.getName()}" -> "${this.getName()}";`)
      res.push(c.toDOT(space))
    }
    return res.join("\n")
  }

}