

// 
// An environment contains a set of bindings, each BB is associated with an Environment, this environment may be duplicated at each 
// statement during analysis, but let see how we implement that...
// 



// 
// 1. Bindings: key -> IS_
// 
// 

import debugConfig from "#debugConfig"
import { ALL_IS } from "../ALL_IS/ALL_IS.ts"
import { IS_VAR_DECL_KIND } from "../ALL_IS/IS_VarDecl.ts"
import { printSpace } from "#utils"
import { BB } from "../BB.ts"


// 
// Generating DU - Chains
// 
// Algorithm (use : Identifier | PrivateIdentifier | PrivateIdentifier, env: Environment): 
// 
// 
// 
//   Inside Iridium we might have reaching defs from 
//      1. Current Environment on the STACK <- Base Case
//      2. Some Closure Environment declared inside the file <- Closure Case
//      3. Some Global Environment Object <- Global
// 
//   Some meta properties for an environment may also be derived:
//      For instance, a use 
// 
// 


class EnvironmentRecord {
  name: string // The binding that we are interested in
  defs: Set<ALL_IS>
  defBBs: Set<BB> = new Set()
  kind: IS_VAR_DECL_KIND
  uses: Set<ALL_IS>
  useBBs: Set<BB> = new Set()
  props: {
    shadowsParentBinding: Environment | undefined
  }

  constructor(name: string, defs: Set<ALL_IS>, kind: IS_VAR_DECL_KIND, uses: Set<ALL_IS> = new Set(), props = { shadowsParentBinding: undefined }) {
    this.name = name
    this.defs = defs
    this.kind = kind
    this.uses = uses
    this.props = props
  }
}

export class Environment {
  idx             : number
  parent          : Environment | undefined
  children        : Set<Environment> = new Set() // This might make it easier to print the graph, I see not much practical use yet
  bindings        : Map<string, EnvironmentRecord> = new Map() // environment bindings --> IS
  privateEnv      : Environment | undefined = undefined

  static i = 0

  constructor(parent : Environment | undefined = undefined) {
    this.idx = Environment.i++
    this.parent = parent
    if (parent !== undefined)
      parent.children.add(this)
  }

  getName() { return `ENV(${this.idx})` }

  toDotBindings() {
    let res = []
    
    for (let b of this.bindings) {
      let key : any = " ".repeat(25).split("")
      let i = 0
      let spilledName = false
      for (let c of b[0]) {
        if (i < 25) 
          key[i++] = c
        else spilledName = true;
      }
      if (spilledName) { key[key.length - 1] = "^" }
      key = key.join("")
    
      res.push(`${key}  :  (DefAt: ${b[1].defs.size} [${[...b[1].defBBs].map(b => b.getName()).join(",")}], UseAt: ${b[1].uses.size} [${[...b[1].useBBs].map(b => b.getName()).join(",")}])`)
    }

    return res.join("\\l")
  }

  toDOT(space = 0) {
    let res = []
    res.push(`${printSpace(space)} "${this.getName()}"[shape="box",xlabel="${this.getName()}",label="${this.toDotBindings()}"]`)
    for (let c of this.children) {
      res.push(`${printSpace(space)} "${c.getName()}" -> "${this.getName()}";`)
      res.push(c.toDOT(space))
    }
    return res.join("\n")
  }

  hasPrivateEnv() : boolean {
    return this.privateEnv ? true : false
  }

  getEnclosingPrivateEnv() : Environment {
    if      (this.privateEnv)  return  this.privateEnv
    else if (this.parent)      return this.parent.getEnclosingPrivateEnv()
    
    debugConfig.logger.throwIriError("Failed to find the enclosing private env")
  }

  // Does this environment have the binding
  hasBinding(id : string) {
    return this.bindings.has(id)
  }

  // Does a lexical lookup of the environment find the binding?
  hasBindingLexical(id: string) {
    if       (this.hasBinding(id))  return true;
    else if  (this.parent)          return this.parent.hasBindingLexical(id)
    
    return false;
  }

  // Get Binding, lexically traverse the parent until null
  getBinding(id : string) : EnvironmentRecord {
    if       (this.hasBinding(id))  return this.bindings.get(id);
    else if  (this.parent)          return this.parent.hasBindingLexical(id)
    
    debugConfig.logger.throwIriError("Tried to retrieve an non-existant binding")
  }

  // Declare Binding, creates a new binding in the current environment
  declareBinding(id : string, def: ALL_IS, bb: BB, kind: IS_VAR_DECL_KIND) {
    let record : EnvironmentRecord;
    if (this.hasBinding(id)) {
      record = this.getBinding(id)
      if (record.kind !== "var") debugConfig.logger.throwIriError(`Multiple declaration are only possible for \"var\" bindings!!! tried to redeclare: ${id}`)
    } else record = new EnvironmentRecord(id, new Set(), kind)

    // Hoisted declarations can set a value to the binding, may not set in case of arguments
    if (def) {
      record.defs.add(def)
      record.defBBs.add(bb)
    }
    
    this.bindings.set(id, record)
  }

  // Declare a binding in the global env
  declareGlobalBinding(id : string, bb: BB, def: ALL_IS) {
    let curr: Environment = this;
    while (curr.parent) {
      curr = curr.parent;
    }
    
    if (!(curr instanceof GlobalEnvironment)) throw new Error("Expected parentmost env to be GlobalEnvironment")
    
    let record : EnvironmentRecord;
    if (curr.hasBinding(id)) {
      record = curr.getBinding(id)
      if (record.kind !== "var") debugConfig.logger.throwIriError(`Multiple declaration are only possible for \"var\" bindings!!! tried to redeclare: ${id}`)
    } else record = new EnvironmentRecord(id, new Set(), "var")

    // Hoisted declarations always set a value to the binding
    record.defs.add(def)
    record.defBBs.add(bb)

    curr.bindings.set(id, record)
  }

  // Find the environment containing a specific binding
  findEnvContaining(id: string) : Environment | undefined {
    if (this.hasBinding(id)) return this;
    if (this.parent) return this.parent.findEnvContaining(id)
    return undefined
  }

}

export class GlobalEnvironment extends Environment {
  getName() { return `GLOBENV(${this.idx})` }
}