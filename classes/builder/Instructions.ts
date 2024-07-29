import t, { SourceLocation } from "@babel/types"
import assert from "node:assert"

export class IrStmt {
  node: t.Node | null = null
  loc: SourceLocation | undefined | null = null
  getString() {
    assert(false)
  }
}

export class Comment extends IrStmt {
  value: string
  constructor(comment: string) {
    super()
    this.value = comment
  }

  getString() {
    return "// " + this.value
  }
}

export class ImportDefaultStmt extends IrStmt {
  importsFrom    : string   // The path from where the import happens
  storesAs       : string   // The binding we create in the environment
  isResolved     : boolean  // Has the file been resolved
  
  constructor(from, as, isResolved) {
    super()
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `defImport ${this.storesAs} from "${this.importsFrom}" ${this.isResolved ? "🗹" : "🗷"}`
  }
}

export class ImportNameSpaceStmt extends IrStmt {
  importsFrom    : string   // The path from where the import happens
  storesAs       : string   // The binding we create in the environment
  isResolved     : boolean  // Has the file been resolved
  
  constructor(from, as, isResolved) {
    super()
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `nsImport ${this.storesAs} from "${this.importsFrom}" ${this.isResolved ? "🗹" : "🗷"}`
  }
}

export class ImportSameNameStmt extends IrStmt {
  importsFrom    : string   // The path from where the import happens
  storesAs       : string   // The binding we create in the environment
  isResolved     : boolean  // Has the file been resolved
  
  constructor(from, as, isResolved) {
    super()
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `itemImport {${this.storesAs}} from "${this.importsFrom}" ${this.isResolved ? "🗹" : "🗷"}`
  }
}

export class ImportRenamedStmt extends IrStmt {
  importsFrom    : string   // The path from where the import happens
  importedItem   : string   // The thing we want to import
  storesAs       : string   // The binding we create in the environment
  isResolved     : boolean  // Has the file been resolved
  
  constructor(from, item, as, isResolved) {
    super()
    this.importsFrom = from
    this.importedItem = item
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `itemImport {"${this.importedItem}" as ${this.storesAs}} from "${this.importsFrom}" ${this.isResolved ? "🗹" : "🗷"}`
  }
}