import { Project } from '../Project'
import { ProjectFile } from '../ProjectFile'
import { IRModule } from './IRModule'
import assert from 'node:assert/strict'
import * as i from './Instructions'
import _traverse from "@babel/traverse"
import { isFunctionDeclaration, isIdentifier, isImportDeclaration, isImportDefaultSpecifier, isImportNamespaceSpecifier, isImportSpecifier, isModuleSpecifier, isProgram, isStringLiteral, Node } from '@babel/types'
const traverse = _traverse["default"];

export class IridiumBuilder {
  project: Project
  moduleMap: Map<string, IRModule>
  constructor(prj: Project) {
    this.project = prj
  }

  start() {
    const that = this
    const project = this.project
    const importsGraph = project.importsGraph
    const rootNodes = importsGraph.rootNodes;
    rootNodes.forEach((f) => {
      const importsGraphProp = importsGraph.getNodeProp(f)
      if (importsGraphProp) {
        if (importsGraphProp.sourceFile) {
          that.handleProjectFile(importsGraphProp.sourceFile)
        } else {
          console.error(`Project File not found for "${f}"`)
        }
      } else assert(false)
    })
  }

  handleImportSpecifier(node : Node, from: string, isResolved: boolean, specifier : Node, module: IRModule) {
    if (isImportDefaultSpecifier(specifier)) {
      assert(specifier.local.type === "Identifier");

      const irS = new i.ImportDefaultStmt(from, specifier.local.name, isResolved);

      irS.node = node
      irS.loc = node.loc

      module.addStatement(irS)
    } else if (isImportNamespaceSpecifier(specifier)) {
      assert(specifier.local.type === "Identifier");

      const irS = new i.ImportDefaultStmt(from, specifier.local.name, isResolved);

      irS.node = node
      irS.loc = node.loc

      module.addStatement(irS)
    } else if (isImportSpecifier(specifier)) {
      const imported = specifier.imported
      const localName = specifier.local.name

      let importedName: string;
      if (isStringLiteral(imported)) {
        importedName = imported.value
      } else if (isIdentifier(imported)) {
        importedName = imported.name
      } else assert(false)

      let irS: i.IrStmt

      if (localName === importedName) {
        irS = new i.ImportSameNameStmt(from, importedName, isResolved);
      } else {
        irS = new i.ImportRenamedStmt(from, importedName, localName, isResolved);
      }

      irS.node = node
      irS.loc = node.loc

      module.addStatement(irS)
    } else assert(false)
  }

  handleProjectFile(file: ProjectFile) {
    console.warn(`[Generating Iridium Module] ${file.relativeFilePath}`)
    const parseResult = file.parseResult
    const module = new IRModule(file)

    // Generate Import Statements
    module.addStatement(new i.Comment("Module Imports"))

    assert(parseResult !== undefined)

    const program = parseResult.program
    // console.log(program)
    if (isProgram(program)) {
      program.body.forEach(node => {
        if (isImportDeclaration(node)) {
          const iDeclStmt = node
          const from = iDeclStmt.source.value
          const specifiers = iDeclStmt.specifiers
          const isResolved = file.resolvedModuleImports.has(node)

          specifiers.forEach((s) => {
            this.handleImportSpecifier(node, from, isResolved, s, module)
          })
        }
      });
    }



    module.dumpIR()
  }

}