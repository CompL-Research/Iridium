import t, { SourceLocation } from "@babel/types"
import assert from "node:assert"

export class JS3Stmt {
  node: t.Node | null = null
  loc: SourceLocation | undefined | null = null
  getString() {
    assert(false)
  }
}

export class Comment extends JS3Stmt {
  value: string
  constructor(comment: string) {
    super()
    this.value = comment
  }

  getString() {
    return "// " + this.value
  }
}

export class ImportDefaultStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  storesAs: string   // The binding we create in the environment
  isResolved: boolean  // Has the file been resolved

  constructor(from, as, isResolved) {
    super()
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import ${this.storesAs} from "${this.importsFrom}"`
  }
}

export class ImportNameSpaceStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  storesAs: string   // The binding we create in the environment
  isResolved: boolean  // Has the file been resolved

  constructor(from, as, isResolved) {
    super()
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import * as ${this.storesAs} from "${this.importsFrom}"`
  }
}

export class ImportSameNameStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  storesAs: string   // The binding we create in the environment
  isResolved: boolean  // Has the file been resolved

  constructor(from, as, isResolved) {
    super()
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import { ${this.storesAs} } from "${this.importsFrom}"`
  }
}

export class ImportRenamedStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  importedItem: string   // The thing we want to import
  storesAs: string   // The binding we create in the environment
  isResolved: boolean  // Has the file been resolved

  constructor(from, item, as, isResolved) {
    super()
    this.importsFrom = from
    this.importedItem = item
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import { "${this.importedItem}" as ${this.storesAs} } from "${this.importsFrom}"`
  }
}

export class NoInitVariableDeclaration extends JS3Stmt {
  kind: string
  id: string
  constructor(kind, id) {
    super()
    this.kind = kind
    this.id = id
  }

  getString() {
    return `${this.kind} ${this.id};`
  }
}

export class InitVariableDeclaration extends JS3Stmt {
  kind: string
  id: string
  init: string
  constructor(kind, id, init) {
    super()
    this.kind = kind
    this.id = id
    this.init = init
  }

  getString() {
    return `${this.kind} ${this.id} = ${this.init};`
  }
}