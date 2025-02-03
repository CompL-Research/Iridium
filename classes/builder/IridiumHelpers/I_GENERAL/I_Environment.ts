

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
  defs: Array<ALL_IS>
  kind: IS_VAR_DECL_KIND
  uses: Array<ALL_IS>
  props: {
    shadowsParentBinding: Environment | undefined
  }

  constructor(name: string, defs: Array<ALL_IS>, kind: IS_VAR_DECL_KIND, uses: Array<ALL_IS> = new Array(), props = { shadowsParentBinding: undefined }) {
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
    
      res.push(`${key}  :  (Kind: ${b[1].kind}, DefAt: ${b[1].defs.length}, UseAt: ${b[1].uses.length})`)
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
  declareBinding(id : string, def: ALL_IS, kind: IS_VAR_DECL_KIND) {
    let record : EnvironmentRecord;
    if (this.hasBinding(id)) {
      record = this.getBinding(id)
      if (record.kind !== "var") debugConfig.logger.throwIriError(`Multiple declaration are only possible for \"var\" bindings!!! tried to redeclare: ${id}`)
      record.defs.push(def)
    } else record = new EnvironmentRecord(id, [def], kind)

    this.bindings.set(id, record)
  }

  // set binding, this will process assignments and such 
  setBinding(id: string, def: ALL_IS) {
    debugConfig.logger.throwIriError("TODO STUB, set binding function for env is unimplemented.")
  }
}