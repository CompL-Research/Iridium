import assert from 'node:assert/strict'
import t, { isImportDeclaration } from "@babel/types"
import { ProjectFile } from "./ProjectFile"

type Identifier = string

class ImportStmt {
  node: t.Node
  importSource: ProjectModule | undefined // undefined in case of unsupported file types; currently libraries
  importKey: string // Imports can be string literals which may or may not be identifiers
  environmentBinding: string // This is what it binds to in the local environment
}

class Environment {
  bindings: Map<Identifier, t.Node>

  hasBinding(id: string): boolean {
    return this.bindings.has(id)
  }

  setBinding(id: string, node: t.Node) {
    this.bindings.set(id, node)
  }

  getBinding(id: string): t.Node | undefined {
    return this.bindings.has(id) ? this.bindings.get(id) : undefined
  }

  // addImport(node: t.ImportStmt) {
  //   // this.bindings
  //   // if (!isImportDeclaration(node)) assert(false);
  //   // const importNode : t.ImportDeclaration = node;
  //   // console.log("")

  // }

}

export class ProjectModule {
  environment : Environment
  projectFile : ProjectFile
  
  constructor(pf : ProjectFile) {
    this.projectFile = pf
    this.environment = new Environment()
    this.processImports()
  }

  processImports() {
    const unresolved = this.projectFile.unresolvedModuleImports
    const resolved = this.projectFile.resolvedModuleImports

  }

}