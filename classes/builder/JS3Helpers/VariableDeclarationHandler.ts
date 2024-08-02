// 
// Variable Declaration
// 
// https://tc39.es/ecma262/#sec-declarations-and-the-variable-statement
// 

import debugConfig from "#debugConfig"
import { isIdentifier, LVal, VariableDeclaration } from "@babel/types"
import { ProjectFile } from "../../ProjectFile"
import { InitVariableDeclaration, NoInitVariableDeclaration } from "../JS3Instructions"
import { JS3Module } from "../JS3Module"
import { handleExpression } from "./ExperssionHandler"

// interface VariableDeclaration extends BaseNode {
//   type: "VariableDeclaration";
//   kind: "var" | "let" | "const" | "using" | "await using";
//   declarations: Array<VariableDeclarator>;
//   declare?: boolean | null;
// }
export function handleVariableDeclaration(node: VariableDeclaration, module: JS3Module, projectFile: ProjectFile) {
  if (node.kind === "var") handleVarDeclaration(node, module, projectFile)
  if (node.kind === "let") handleLetDeclaration(node, module, projectFile)
  if (node.kind === "const") handleConstDeclaration(node, module, projectFile)
  if (node.kind === "using") handleUsingDeclaration(node, module, projectFile)
  if (node.kind === "await using") handleAwaitUsingDeclaration(node, module, projectFile)
}

// interface VariableDeclarator extends BaseNode {
//   type: "VariableDeclarator";
//   id: LVal;
//   init?: Expression | null;
//   definite?: boolean | null;
// }

// LVal: Identifier | MemberExpression | RestElement | AssignmentPattern | ArrayPattern | ObjectPattern | TSParameterProperty | TSAsExpression | TSSatisfiesExpression | TSTypeAssertion | TSNonNullExpression

export function handleVarDeclaration(node: VariableDeclaration, module: JS3Module, projectFile: ProjectFile) {
  for (const d of node.declarations) {
    const lval = handleLVal(d.id)
    const init = d.init
    if (init === null || init === undefined) {
      module.addStatement(new NoInitVariableDeclaration(node, "var", lval))
    } else {
      module.addStatement(new InitVariableDeclaration(node, "var", lval, handleExpression(init, module, projectFile)))
    } 
  }
}

export function handleLetDeclaration(node: VariableDeclaration, module: JS3Module, projectFile: ProjectFile) {
  for (const d of node.declarations) {
    const lval = handleLVal(d.id)
    const init = d.init
    if (init === null || init === undefined) {
      module.addStatement(new NoInitVariableDeclaration(node, "let", lval))
    } else {
      module.addStatement(new InitVariableDeclaration(node, "let", lval, handleExpression(init, module, projectFile)))
    } 
  }
}

export function handleConstDeclaration(node: VariableDeclaration, module: JS3Module, projectFile: ProjectFile) {
  for (const d of node.declarations) {
    const lval = handleLVal(d.id)
    const init = d.init
    if (init === null || init === undefined) {
      module.addStatement(new NoInitVariableDeclaration(node, "const", lval))
    } else {
      module.addStatement(new InitVariableDeclaration(node, "const", lval, handleExpression(init, module, projectFile)))
    } 
  }
}

export function handleUsingDeclaration(node: VariableDeclaration, module: JS3Module, projectFile: ProjectFile) {
  debugConfig.logger.error("// TODO UsingDeclaration", [node]);
}

export function handleAwaitUsingDeclaration(node: VariableDeclaration, module: JS3Module, projectFile: ProjectFile) {
  debugConfig.logger.error("// TODO AwaitUsingDeclaration", [node]);
}

export function handleLVal(node: LVal) : string {
  if (isIdentifier(node)) {
    return node.name;
  } else {
    debugConfig.logger.error("// TODO LVAL", [node]);
  }
  return "$TODO$"

}