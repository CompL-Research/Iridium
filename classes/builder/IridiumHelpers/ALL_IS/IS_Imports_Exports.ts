import { JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3ImportDeclaration } from "classes/builder/JS3Helpers/JS3Types.ts";
import { ALL_IS } from "./ALL_IS.ts";
import { IV_StringLiteral } from "../ALL_RVal/IV_StringLiteral.ts";
import { IV_Identifer } from "../ALL_RVal/IV_Identifier.ts";

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
    return `${" ".repeat(space)}█ AIMPORT ${this.FROM.toString()};`
  }
}

export class IS_BImport extends ALL_IS {
  defaultImport: boolean
  remote: IV_Identifer | IV_StringLiteral
  local: IV_Identifer
  FROM: IV_StringLiteral

  constructor(node: JS3ImportDeclaration | undefined = undefined, remote: IV_Identifer | IV_StringLiteral, local: IV_Identifer, FROM: IV_StringLiteral) {
    super(node);
    this.defaultImport = remote instanceof IV_Identifer && remote.name === "default"
    this.remote = remote
    this.local = local
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ BIMPORT { ${this.remote.toString()} as ${this.local.toString()} } from ${this.FROM.toString()};`
  }
}

export class IS_CImport extends ALL_IS {
  local: IV_Identifer
  FROM: IV_StringLiteral

  constructor(node: JS3ImportDeclaration | undefined = undefined, local: IV_Identifer, FROM: IV_StringLiteral) {
    super(node);
    this.local = local
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ CIMPORT * as ${this.local.toString()} from ${this.FROM.toString()};`
  }
}

// 
// Exports
// 

export class IS_AExport extends ALL_IS {
  id: IV_Identifer

  constructor(node: JS3ExportDefaultDeclaration | undefined = undefined, id: IV_Identifer) {
    super(node);
    this.id = id
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ AEXPORT ${this.id.toString()};`
  }
}

export class IS_BExport extends ALL_IS {
  local: IV_Identifer
  remote: IV_Identifer | IV_StringLiteral

  constructor(node: JS3ExportNamedDeclaration | undefined = undefined, local: IV_Identifer, remote: IV_Identifer | IV_StringLiteral) {
    super(node);
    this.local = local
    this.remote = remote
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ BEXPORT { ${this.local.toString()} as ${this.remote.toString()} };`
  }
}

export class IS_CExport extends ALL_IS {
  local: IV_Identifer
  remote: IV_Identifer | IV_StringLiteral
  FROM: IV_StringLiteral

  constructor(node: JS3ExportNamedDeclaration | undefined = undefined, local: IV_Identifer, remote: IV_Identifer | IV_StringLiteral, FROM: IV_StringLiteral) {
    super(node);
    this.local = local
    this.remote = remote
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ CEXPORT { ${this.local.toString()} as ${this.remote.toString()} } from ${this.FROM.toString()};`
  }
}

export class IS_DExport extends ALL_IS {
  remote: IV_Identifer
  FROM: IV_StringLiteral

  constructor(node: JS3ExportNamedDeclaration | undefined = undefined, remote: IV_Identifer, FROM: IV_StringLiteral) {
    super(node);
    this.remote = remote
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ DEXPORT * as ${this.remote.toString()} from ${this.FROM.toString()};`
  }
}

export class IS_EExport extends ALL_IS {
  FROM: IV_StringLiteral

  constructor(node: JS3ExportAllDeclaration | undefined = undefined, FROM: IV_StringLiteral) {
    super(node);
    this.FROM = FROM
  }

  toString(space = 0) {
    return `${" ".repeat(space)}█ EEXPORT * from ${this.FROM.toString()};`
  }
}