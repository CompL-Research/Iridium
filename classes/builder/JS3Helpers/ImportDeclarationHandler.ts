// 
// Import Declaration
// 
// https://tc39.es/ecma262/#prod-ImportDeclaration
// 

import { ImportDeclaration, isImportDefaultSpecifier, isImportNamespaceSpecifier } from "@babel/types"
import { JS3ImportDeclaration, JS3ImportDefaultSpecifier, JS3ImportNamespaceSpecifier, JS3ImportSpecifier, JS3Statement, JS3_VERSION } from "../JS3Instructions"
import { generateCommentLine } from "#utils"

export function handleImportDeclaration(node: ImportDeclaration, holder: Array<JS3Statement>, resolvedPath: string | null = null) {
  
  // Case with no specifiers: import 'abc'
  const specifiers = node.specifiers
  if (specifiers.length === 0) {
    const duplicatedNode = { ...node } as JS3ImportDeclaration
    duplicatedNode.js3version = JS3_VERSION
    duplicatedNode.resolvedPath = resolvedPath
    duplicatedNode.trailingComments = []
    duplicatedNode.trailingComments.push(generateCommentLine(resolvedPath ? "Resolved: " + resolvedPath : "Unresolved"))
    holder.push(duplicatedNode)
    return;
  }

  specifiers.forEach((specifier) => {
    const duplicatedNode = { ...node } as JS3ImportDeclaration
    duplicatedNode.js3version = JS3_VERSION
    duplicatedNode.resolvedPath = resolvedPath
    duplicatedNode.specifiers = new Array<JS3ImportSpecifier>()
    duplicatedNode.trailingComments = []
    duplicatedNode.trailingComments.push(generateCommentLine(resolvedPath ? "Resolved: " + resolvedPath : "Unresolved"))

    if (isImportDefaultSpecifier(specifier)) {
      duplicatedNode.specifiers.push(specifier as JS3ImportDefaultSpecifier)
    }
    else if (isImportNamespaceSpecifier(specifier)) {
      duplicatedNode.specifiers.push(specifier as JS3ImportNamespaceSpecifier)
    }
    else {
      duplicatedNode.specifiers.push(specifier as JS3ImportSpecifier)
    }

    holder.push(duplicatedNode)
  });
}
