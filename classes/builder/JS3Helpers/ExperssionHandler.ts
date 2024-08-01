
import { ArrayExpression, Expression, isBigIntLiteral, isBooleanLiteral, isIdentifier, isNullLiteral, isNumericLiteral, isStringLiteral } from "@babel/types"
import { ProjectFile } from "../../ProjectFile"
import { JS3Module } from "../JS3Module"

import debugConfig from "#debugConfig"
import { isArrayExpression, isExpression, isSpreadElement } from "@babel/types"
import { Comment, InitVariableDeclaration } from "../JS3Instructions"

// Identifier
// StringLiteral 
// NumericLiteral 
// NullLiteral 
// BooleanLiteral 
// BigIntLiteral 


// ArrayExpression 
// AssignmentExpression 
// BinaryExpression 
// CallExpression
// ConditionalExpression
// FunctionExpression
// RegExpLiteral 
// LogicalExpression 
// MemberExpression 
// NewExpression 
// ObjectExpression 
// SequenceExpression 
// ParenthesizedExpression 
// ThisExpression 
// UnaryExpression 
// UpdateExpression 
// ArrowFunctionExpression 
// ClassExpression 
// ImportExpression 
// MetaProperty 
// Super 
// TaggedTemplateExpression 
// TemplateLiteral 
// YieldExpression 
// AwaitExpression 
// Import 
// OptionalMemberExpression 
// OptionalCallExpression 
// TypeCastExpression 
// JSXElement 
// JSXFragment 
// BindExpression 
// DoExpression 
// RecordExpression 
// TupleExpression 
// DecimalLiteral 
// ModuleExpression 
// TopicReference 
// PipelineTopicExpression 
// PipelineBareFunction 
// PipelinePrimaryTopicReference
// TSInstantiationExpression
// TSAsExpression
// TSSatisfiesExpression
// TSTypeAssertion
// TSNonNullExpression

export function handleExpression(node: Expression, module: JS3Module, projectFile: ProjectFile) : string {
  if (isIdentifier(node)) {
    return node.name
  } else if (isStringLiteral(node)) {
    return `"${node.value}"`
  } else if (isNumericLiteral(node)) {
    return `${node.value}`
  } else if (isNullLiteral(node)) {
    return "null"
  } else if (isBooleanLiteral(node)) {
    return node.value ? "true" : "false"
  } else if (isBigIntLiteral(node)) {
    return `${node.value}n`
  } else if (isArrayExpression(node)) {
    return handleArrayExpression(node, module, projectFile)
  }
  debugConfig.logger.error(`// ERR HANDLE EXPRESSION: ${node.type}`, [node])
  return "$TODO$"
}

// 
// https://tc39.es/ecma262/#prod-ArrayLiteral
// 
export function handleArrayExpression(node: ArrayExpression, module: JS3Module, projectFile: ProjectFile) : string {
  module.addStatement(new Comment("Start: Array Expression"))
  const arrayResultHolder = module.getNewLocal()
  const elementResults = Array<string>()

  for (const e of node.elements) {
    if (isExpression(e)) {
      const lVal = module.getNewLocal()
      const rVal = handleExpression(e, module, projectFile)
      module.addStatement(new InitVariableDeclaration(e, "let", lVal, rVal))
      elementResults.push(lVal)

    } else if (isSpreadElement(e)) {
      debugConfig.logger.error(`// ERR HANDLE ARRAY EXPRESSION: ${e.type}`, [e]);
      const lVal = module.getNewLocal()
      const rVal = "$TODO$" // Here is a TODO
      module.addStatement(new InitVariableDeclaration(e, "let", lVal, rVal))
      elementResults.push(lVal)
    } else {
      // let a = [,2,3]
      // a[0]
      // $ undefined
      const lVal = module.getNewLocal()
      const rVal = "undefined"
      module.addStatement(new InitVariableDeclaration(node, "let", lVal, rVal))
      elementResults.push(lVal)
    }
  }

  let finalRVal = "[ "
  for (const rValLocation of elementResults) {
    finalRVal += rValLocation + ", "
  }
  finalRVal += "]"

  module.addStatement(new InitVariableDeclaration(node, "let", arrayResultHolder, finalRVal))
  module.addStatement(new Comment("End: Array Expression \n"))
  return arrayResultHolder
}