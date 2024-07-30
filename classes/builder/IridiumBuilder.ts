import { Project } from '../Project'
import { ProjectFile } from '../ProjectFile'
import { JS3Module } from './JS3Module'
import assert from 'node:assert/strict'
import * as js3 from './JS3Instructions'
import _traverse from "@babel/traverse"
import { declareTypeAlias, isArrayPattern, isFunctionDeclaration, isIdentifier, isImportDeclaration, isImportDefaultSpecifier, isImportNamespaceSpecifier, isImportSpecifier, isModuleSpecifier, isProgram, isStringLiteral, isVariableDeclaration, Node, variableDeclaration, VariableDeclarator } from '@babel/types'
import { NoInitVariableDeclaration } from './JS3Instructions'
const traverse = _traverse["default"];

export class IridiumBuilder {
  project: Project
  moduleMap: Map<string, JS3Module>
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



  handleProjectFile(file: ProjectFile) {
    console.warn(`[Generating Iridium Module] ${file.relativeFilePath}`)
    const parseResult = file.parseResult
    const module = new JS3Module(file)

    // Generate Import Statements
    module.addStatement(new js3.Comment("Module Imports"))

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
        
        else if (isVariableDeclaration(node)) {
          const varDecl = node
          const declarators = varDecl.declarations

          declarators.forEach((d) => {
            this.handleVariableDeclarator(node, varDecl.kind, d, module)
          })
        }

      });
    }

    module.dumpIR()
  }

  handleVariableDeclarator(node: Node, kind: string, declarator: VariableDeclarator, module: JS3Module) {
    const id = declarator.id
    const init = declarator.init

    // "ArrayPattern" | "AssignmentPattern" | "Identifier" | "MemberExpression" | "ObjectPattern" | "RestElement" | "TSAsExpression" | "TSNonNullExpression" | "TSParameterProperty" | "TSSatisfiesExpression" | "TSTypeAssertion"

    // Case 1: let a, var b
    if (isIdentifier(id) && !init) {
      const noInitVarDecl = new NoInitVariableDeclaration(kind, id.name)
      module.addStatement(noInitVarDecl)
    }
    // // Case 2: let [a, b, c] = ...
    // else if (isArrayPattern(id)) {
      
    // }

    else {
      console.error("// TODO: VariableDeclarator with init")
    }
  }

  handleImportSpecifier(node: Node, from: string, isResolved: boolean, specifier: Node, module: JS3Module) {
    if (isImportDefaultSpecifier(specifier)) {
      assert(specifier.local.type === "Identifier");

      const irS = new js3.ImportDefaultStmt(from, specifier.local.name, isResolved);

      irS.node = node
      irS.loc = node.loc

      module.addStatement(irS)
    } else if (isImportNamespaceSpecifier(specifier)) {
      assert(specifier.local.type === "Identifier");

      const irS = new js3.ImportDefaultStmt(from, specifier.local.name, isResolved);

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

      let irS: js3.JS3Stmt

      if (localName === importedName) {
        irS = new js3.ImportSameNameStmt(from, importedName, isResolved);
      } else {
        irS = new js3.ImportRenamedStmt(from, importedName, localName, isResolved);
      }

      irS.node = node
      irS.loc = node.loc

      module.addStatement(irS)
    } else assert(false)
  }

}