// 
// Ensure that the code is in JS3 Spec 
// 

import { isJS3BlockStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportNamespaceSpecifier, isJS3ExportSpecifier, isJS3ImportDeclaration, isJS3Program, isJS3VariableDeclaration, isJS3WhileStatement, isJS3WithStatement, JS3AllowedBlockStatement, JS3AssnInit, JS3ContainedExprKey, JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3File, JS3ImportDeclaration, JS3Program, JS3VariableDeclaration, JS3VariableDeclarator, JS3WithStatement } from "../JS3Types.ts";
import assert from "node:assert";
import * as t from '@babel/types'
import debugConfig from "#debugConfig";

// Input: JS3File
// Output: None / Error

export function verifyJS3File(file: JS3File) {
  assert(isJS3Program(file.program));
  verifyJS3Program(file.program)
}

export function verifyJS3Program(prog: JS3Program) {
  for (const s of prog.body) {
    if (isJS3ImportDeclaration(s)) verifyJS3ImportDeclaration(s);
    else if (isJS3ExportDefaultDeclaration(s)) verifyJS3ExportDefaultDeclaration(s);
    else if (isJS3ExportNamedDeclaration(s)) verifyJS3ExportNamedDeclaration(s);
    else if (isJS3ExportAllDeclaration(s)) verifyJS3ExportAllDeclaration(s);
    else verifyJS3AllowedBlockStatement(s)
  }
}

export function verifyJS3ImportDeclaration(decl: JS3ImportDeclaration) {
  assert(decl.assertions === null || decl.assertions === undefined)
  assert(decl.attributes === null || decl.attributes === undefined)
  assert(decl.specifiers.length === 1)
  const specifier = decl.specifiers[0]
  if (!(t.isImportSpecifier(specifier) || t.isImportDefaultSpecifier(specifier) || t.isImportNamespaceSpecifier(specifier))) {
    assert(false)
  }
}

export function verifyJS3ExportDefaultDeclaration(decl: JS3ExportDefaultDeclaration) {
  assert(t.isIdentifier(decl.declaration))
}

export function verifyJS3ExportNamedDeclaration(decl: JS3ExportNamedDeclaration) {
  assert(decl.assertions === null)
  assert(decl.attributes === null)
  
  // let hasDeclaration = false
  // // Declarations are only allowed if there is a pattern like LVal
  // if (decl.declaration !== null) {
  //   hasDeclaration = true
  //   assert(isJS3VariableDeclaration(decl.declaration))
  //   verifyJS3VariableDeclaration(decl.declaration)
  //   let lval = decl.declaration.declarations[0].id
  //   assert(t.isArrayPattern(lval) || t.isObjectPattern(lval) )
  // }

  if (decl.specifiers.length > 0) {
    // Either declaration or specifier, not both
    // assert(!hasDeclaration)
    
    assert(decl.specifiers.length === 1)
    assert(isJS3ExportSpecifier(decl.specifiers[0]) || isJS3ExportNamespaceSpecifier(decl.specifiers[0]))
  }
}

export function verifyJS3ExportAllDeclaration(decl: JS3ExportAllDeclaration) {
  assert(decl.assertions === null)
  assert(decl.attributes === null)  
}

export function verifyJS3VariableDeclaration(decl: JS3VariableDeclaration) {
  assert(decl.declarations.length === 1)
  verifyJS3VariableDeclarator(decl.declarations[0])
}

export function verifyJS3VariableDeclarator(decl: JS3VariableDeclarator) {
  // // LVal
  // // TODO
  // assert(t.isIdentifier(decl.id) || t.isArrayPattern(decl.id) || t.isObjectPattern(decl.id))

  // Init
  let isNullOrUndef = decl.init === null || decl.init === undefined
  if (!isNullOrUndef) verifyJS3AssnInit(decl.init)
}

export function verifyJS3AssnInit(init: JS3AssnInit) {
  // TODO
}

export function verifyJS3AllowedBlockStatement(node: JS3AllowedBlockStatement) {
  // JS3ReturnStatement | JS3ExpressionStatement | JS3IfStatement | JS3TryStatement | JS3ThrowStatement | JS3FunctionDeclaration | JS3AssignmentExpression | JS3ClassDeclaration | JS3EmptyStatement | JS3WhileStatement | JS3BreakStatement | JS3ContinueStatement | JS3BlockStatement | JS3ForInStatement | JS3LabeledStatement | JS3ForStatement | JS3DoWhileStatement | JS3SwitchStatement | JS3ForOfStatement
  
  if (isJS3WithStatement(node)) {
    // Assert that support for this language feature was enabled in the flags, might be off in which case we throw an error
    assert(debugConfig.allowLangWithSupport)
    verifyJS3WithStatement(node)
  } else if (isJS3WhileStatement(node)) {
    verifyJS3ContainedExprKey(node.test)
    assert(isJS3BlockStatement(node.body))
    for (let s of node.body.body) verifyJS3AllowedBlockStatement(s)
  } else if (isJS3VariableDeclaration(node)) {
    verifyJS3VariableDeclaration(node)
  }
  // TODO
}

export function verifyJS3WithStatement(node: JS3WithStatement) {
  assert(t.isIdentifier(node.object))
  assert(isJS3BlockStatement(node.body))
  for (let s of node.body.body) verifyJS3AllowedBlockStatement(s)
}

export function verifyJS3ContainedExprKey(test: JS3ContainedExprKey) {
  // TODO
}