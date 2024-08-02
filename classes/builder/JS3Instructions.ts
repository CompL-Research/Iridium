import t from "@babel/types"
import assert from "node:assert"
import { JS3Block, JS3CatchClause } from "./JS3Module"
//////////////////////////////////////////////////////////////////////////////////
// GENERIC
//////////////////////////////////////////////////////////////////////////////////
export class JS3Stmt {
  node: t.Node | null = null
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

//////////////////////////////////////////////////////////////////////////////////
// TRY STATEMENT 
//////////////////////////////////////////////////////////////////////////////////

export class TryStmt extends JS3Stmt {
  toTry: JS3Block
  ifCaught: JS3CatchClause | null
  inTheEnd: JS3Block | null
  constructor(node: t.Node, toTry: JS3Block, ifCaught: JS3CatchClause | null, inTheEnd: JS3Block | null) {
    super()
    this.node = node;
    this.toTry = toTry
    this.ifCaught = ifCaught
    this.inTheEnd = inTheEnd
    if (this.ifCaught === null) assert(this.inTheEnd !== null)
    if (this.inTheEnd === null) assert(this.ifCaught !== null)
  }

  getString() {
    let result = "try " + this.toTry.getIRString(2) + "\n";
    if (this.ifCaught !== null) {
      result += this.ifCaught.getIRString(4) + "\n";
    }

    if (this.inTheEnd !== null) {
      result += "finally " + this.inTheEnd.getIRString(4) + "\n";
    }

    return result
  }
}


//////////////////////////////////////////////////////////////////////////////////
// VARIABLE DECLARATION 
//////////////////////////////////////////////////////////////////////////////////

export class NoInitVariableDeclaration extends JS3Stmt {
  kind: "var" | "let" | "const" | "using" | "await using"
  id: string
  constructor(node: t.Node, kind: "var" | "let" | "const" | "using" | "await using", id: string) {
    super()
    this.node = node
    this.kind = kind
    this.id = id
  }

  getString() {
    return `${this.kind} ${this.id};`
  }
}

export class InitVariableDeclaration extends JS3Stmt {
  kind: "var" | "let" | "const" | "using" | "await using"
  id: string
  init: string
  constructor(node: t.Node, kind: "var" | "let" | "const" | "using" | "await using", id: string, init: string) {
    super()
    this.node = node
    this.kind = kind
    this.id = id
    this.init = init
  }

  getString() {
    return `${this.kind} ${this.id} = ${this.init};`
  }
}

//////////////////////////////////////////////////////////////////////////////////
// IMPORTS 
//////////////////////////////////////////////////////////////////////////////////
export class ImportStorelessStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  isResolved: string  // Has the file been resolved

  constructor(node, from, isResolved: string) {
    super()
    this.node = node
    this.importsFrom = from
    this.isResolved = isResolved
  }

  getString() {
    return `import "${this.importsFrom} // ${this.isResolved}"`
  }
}

export class ImportDefaultStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  storesAs: string   // The binding we create in the environment
  isResolved: string  // Has the file been resolved

  constructor(node, from, as, isResolved: string) {
    super()
    this.node = node
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import ${this.storesAs} from "${this.importsFrom} // ${this.isResolved}"`
  }
}

export class ImportNameSpaceStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  storesAs: string   // The binding we create in the environment
  isResolved: string  // Has the file been resolved

  constructor(node, from, as, isResolved : string) {
    super()
    this.node = node
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import * as ${this.storesAs} from "${this.importsFrom} // ${this.isResolved}"`
  }
}

export class ImportSameNameStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  storesAs: string   // The binding we create in the environment
  isResolved: string  // Has the file been resolved

  constructor(node, from, as, isResolved: string) {
    super()
    this.node = node
    this.importsFrom = from
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import { ${this.storesAs} } from "${this.importsFrom} // ${this.isResolved}"`
  }
}

export class ImportRenamedStmt extends JS3Stmt {
  importsFrom: string   // The path from where the import happens
  importedItem: string   // The thing we want to import
  storesAs: string   // The binding we create in the environment
  isResolved: string  // Has the file been resolved

  constructor(node, from, item, as, isResolved: string) {
    super()
    this.node = node
    this.importsFrom = from
    this.importedItem = item
    this.storesAs = as
    this.isResolved = isResolved
  }

  getString() {
    return `import { "${this.importedItem}" as ${this.storesAs} } from "${this.importsFrom} // ${this.isResolved}"`
  }
}