// 
// Import Declaration
// 
// https://tc39.es/ecma262/#prod-ImportDeclaration
// 

import { ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, isIdentifier, isImportDefaultSpecifier, isImportNamespaceSpecifier, isStringLiteral } from "@babel/types"
import assert from "node:assert"
import { ProjectFile } from "../../ProjectFile"
import { ImportDefaultStmt, ImportNameSpaceStmt, ImportRenamedStmt, ImportSameNameStmt, ImportStorelessStmt } from "../JS3Instructions"
import { JS3Module } from "../JS3Module"
export function handleImportDeclaration(node: ImportDeclaration, module: JS3Module, projectFile: ProjectFile) {
  const iDeclStmt = node
  const source = iDeclStmt.source.value
  const specifiers = iDeclStmt.specifiers
  let isResolved: null | string = null
  if (projectFile.resolvedModuleImports.has(node)) {
    let r = projectFile.resolvedModuleImports.get(node); assert(r !== undefined);
    isResolved = r[1]
  }

  specifiers.forEach((specifier) => {
    if (isImportDefaultSpecifier(specifier)) {
      handleImportDefaultSpecifier(node, source, isResolved, specifier, module)

    } else if (isImportNamespaceSpecifier(specifier)) {
      handleImportNamespaceSpecifier(node, source, isResolved, specifier, module)

    } else {
      handleImportSpecifier(node, source, isResolved, specifier, module)
    }
  })

  if (specifiers.length === 0) {
    module.addStatement(new ImportStorelessStmt(node, source, isResolved === null ? "" : isResolved))
  }
}

//
// import ID from "source"
//
export function handleImportDefaultSpecifier(
  node: ImportDeclaration,
  source: string,
  isResolved: string | null,
  specifier: ImportDefaultSpecifier,
  module: JS3Module
) {
  assert(specifier.local.type === "Identifier");
  module.addStatement(new ImportDefaultStmt(node, source, specifier.local.name, isResolved === null ? "" : isResolved))
}

//
// import * as ID from "source"
//
export function handleImportNamespaceSpecifier(
  node: ImportDeclaration,
  source: string,
  isResolved: string | null,
  specifier: ImportNamespaceSpecifier,
  module: JS3Module
) {
  assert(specifier.local.type === "Identifier");
  module.addStatement(new ImportNameSpaceStmt(node, source, specifier.local.name, isResolved === null ? "" : isResolved))
}

//
// import { a, b as c } from "source"
//
export function handleImportSpecifier(
  node: ImportDeclaration,
  source: string,
  isResolved: string | null,
  specifier: ImportSpecifier,
  module: JS3Module
) {
  const imported = specifier.imported
  const localName = specifier.local.name

  let importedName: string;
  if (isStringLiteral(imported)) {
    importedName = imported.value
  } else if (isIdentifier(imported)) {
    importedName = imported.name
  } else assert(false)

  if (localName === importedName) {
    module.addStatement(new ImportSameNameStmt(node, source, importedName, isResolved === null ? "" : isResolved));
  } else {
    module.addStatement(new ImportRenamedStmt(node, source, importedName, localName, isResolved === null ? "" : isResolved));
  }
}