import { printScopedSpace, printSpace } from "#utils";
import { JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3ImportDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { IV_StringLiteral } from "../ALL_RVal/IV_Literals.ts";
import { ALL_IS } from "./ALL_IS.ts";

// 
// Imports
// 

export class IS_AImport extends ALL_IS {
  FROM: IV_StringLiteral

  constructor(node: JS3ImportDeclaration | undefined = undefined, FROM: IV_StringLiteral) {
    super(node);
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ AIMPORT ${this.FROM.lookupName()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} AIMPORT ${this.FROM.lookupName()};`
  }
}

export class IS_BImport extends ALL_IS {
  defaultImport: boolean
  remote: IV_Identifier | IV_StringLiteral
  local: IV_Identifier
  FROM: IV_StringLiteral

  constructor(node: JS3ImportDeclaration | undefined = undefined, remote: IV_Identifier | IV_StringLiteral, local: IV_Identifier, FROM: IV_StringLiteral) {
    super(node);
    this.defaultImport = remote instanceof IV_Identifier && remote.name === "default"
    this.remote = remote
    this.local = local
    this.FROM = FROM
  }

  definedIdentifiers() : Set<string> { 
    let res : Set<string> = new Set();
    res.add(this.local.lookupName())
    return res;
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ BIMPORT { ${this.remote.toString()} as ${this.local.toString()} } from ${this.FROM.toString()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} BIMPORT { ${this.remote.toString()} as ${this.local.toString()} } from ${this.FROM.toString()};`
  }
}

export class IS_CImport extends ALL_IS {
  local: IV_Identifier
  FROM: IV_StringLiteral

  constructor(node: JS3ImportDeclaration | undefined = undefined, local: IV_Identifier, FROM: IV_StringLiteral) {
    super(node);
    this.local = local
    this.FROM = FROM
  }

  definedIdentifiers() : Set<string> { 
    let res : Set<string> = new Set();
    res.add(this.local.lookupName())
    return res;
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ CIMPORT * as ${this.local.toString()} from ${this.FROM.toString()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} CIMPORT * as ${this.local.toString()} from ${this.FROM.toString()};`
  }
}

// 
// Exports
// 

export class IS_AExport extends ALL_IS {
  id: IV_Identifier

  constructor(node: JS3ExportDefaultDeclaration | undefined = undefined, id: IV_Identifier) {
    super(node);
    this.id = id
  }

  usedIdentifiers() : Set<string> { 
    let res : Set<string> = new Set();
    res.add(this.id.lookupName())
    return res;
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ AEXPORT ${this.id.toString()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} AEXPORT ${this.id.toString()};`
  }
}

export class IS_BExport extends ALL_IS {
  local: IV_Identifier
  remote: IV_Identifier | IV_StringLiteral

  constructor(node: JS3ExportNamedDeclaration | undefined = undefined, local: IV_Identifier, remote: IV_Identifier | IV_StringLiteral) {
    super(node);
    this.local = local
    this.remote = remote
  }

  usedIdentifiers() : Set<string> { 
    let res : Set<string> = new Set();
    res.add(this.local.lookupName())
    return res;
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ BEXPORT { ${this.local.toString()} as ${this.remote.toString()} };`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} BEXPORT { ${this.local.toString()} as ${this.remote.toString()} };`
  }
}

export class IS_CExport extends ALL_IS {
  local: IV_Identifier
  remote: IV_Identifier | IV_StringLiteral
  FROM: IV_StringLiteral

  constructor(node: JS3ExportNamedDeclaration | undefined = undefined, local: IV_Identifier, remote: IV_Identifier | IV_StringLiteral, FROM: IV_StringLiteral) {
    super(node);
    this.local = local
    this.remote = remote
    this.FROM = FROM
  }

  usedIdentifiers() : Set<string> { 
    let res : Set<string> = new Set();
    res.add(this.local.lookupName())
    return res;
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ CEXPORT { ${this.local.toString()} as ${this.remote.toString()} } from ${this.FROM.toString()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} CEXPORT { ${this.local.toString()} as ${this.remote.toString()} } from ${this.FROM.toString()};`
  }
}

export class IS_DExport extends ALL_IS {
  remote: IV_Identifier
  FROM: IV_StringLiteral

  constructor(node: JS3ExportNamedDeclaration | undefined = undefined, remote: IV_Identifier, FROM: IV_StringLiteral) {
    super(node);
    this.remote = remote
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ DEXPORT * as ${this.remote.toString()} from ${this.FROM.toString()};`
  }

  toDOT(space = 0) {
    return `${printSpace(space)} DEXPORT * as ${this.remote.toString()} from ${this.FROM.toString()};`
  }
}

export class IS_EExport extends ALL_IS {
  FROM: IV_StringLiteral

  constructor(node: JS3ExportAllDeclaration | undefined = undefined, FROM: IV_StringLiteral) {
    super(node);
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${printScopedSpace(space)}▏ EEXPORT * from ${this.FROM.toString()};`
  }
  
  toDOT(space = 0) {
    return `${printSpace(space)} EEXPORT * from ${this.FROM.toString()};`
  }

}