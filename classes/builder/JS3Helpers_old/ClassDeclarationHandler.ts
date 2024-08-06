import { isIdentifier, isStringLiteral, isNumericLiteral, isBigIntLiteral, ClassProperty, ClassDeclaration, Identifier, ClassBody, isClassProperty, isClassBody, StringLiteral, NumericLiteral, BigIntLiteral } from "@babel/types"
import { JS3ClassBody, JS3ClassDeclaration, JS3ClassProperty, JS3Decorator, JS3Statement } from "../JS3Instructions"
import { JS3BuilderUtils } from "../JS3Builder"
import { generateIdentifier, generateJS3ClassBody, generateJS3ClassDeclaration, generateJS3ClassProperty, generateJS3Decorator } from "#utils";
import { handleExpression } from "./ExperssionHandler";
import debugConfig from "#debugConfig"

export function handleClassDeclaration(node: ClassDeclaration, holder: Array<JS3Statement>, utils: JS3BuilderUtils): JS3ClassDeclaration {

  let decorators: Array<JS3Decorator> | null;

  if (node.decorators) {
    decorators = new Array<JS3Decorator>()
    for (const decorator of node.decorators) {
      const js3Decorator = generateJS3Decorator(decorator, handleExpression(decorator.expression, holder, utils))
      decorators.push(js3Decorator)
    }
  } else {
    decorators = null
  }

  let superClass: Identifier | null | undefined
  if (node.superClass) {
    superClass = handleExpression(node.superClass, holder, utils);
  } else {
    superClass = null
  }

  let js3ClassBody: JS3ClassBody = handleClassBody(node.body, holder, utils);

  let implements_: null | undefined
  if (node.implements) {
    debugConfig.logger.error(`TODO // Handle class-decl-implements @ ClassDeclarationHandler.ts`, node.implements)
  } else {
    implements_ = null
  }

  let mixins: null | undefined
  if (node.mixins) {
    debugConfig.logger.error(`TODO // Handle class-decl-mixins: ${node.mixins.type} @ ClassDeclarationHandler.ts`, [node.mixins])
  } else {
    mixins = null
  }

  let superTypeParameters: null | undefined
  if (node.superTypeParameters) {
    debugConfig.logger.error(`TODO // Handle class-decl-superTypeParameters: ${node.superTypeParameters.type} @ ClassDeclarationHandler.ts`, [node.superTypeParameters])
  } else {
    superTypeParameters = null
  }

  let typeParameters: null | undefined
  if (node.typeParameters) {
    debugConfig.logger.error(`TODO // Handle class-decl-typeParameters: ${node.typeParameters.type} @ ClassDeclarationHandler.ts`, [node.typeParameters])
  } else {
    typeParameters = null
  }

  return generateJS3ClassDeclaration(
    node,
    node.id,
    superClass,
    js3ClassBody,
    decorators,
    node.abstract,
    node.declare,
    implements_,
    mixins,
    superTypeParameters,
    typeParameters
  )
}

function handleClassBody(node: ClassBody, holder: Array<JS3Statement>, utils: JS3BuilderUtils): JS3ClassBody {
  const body = new Array<JS3ClassProperty>()
  for (const cb of node.body) {
    if (isClassProperty(cb)) {
      handleClassProperty(cb, body, utils)
    }
    else {
      debugConfig.logger.error(`TODO // Handle class-body : ${cb.type} @ ClassDeclarationHandler.ts`, [cb])
    }
  }
  return generateJS3ClassBody(node, body)
}

function handleClassProperty(
  node: ClassProperty,
  holder: Array<JS3ClassProperty>,
  utils: JS3BuilderUtils) {

  let key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral
  if (isIdentifier(node.key) || isStringLiteral(node.key) || isNumericLiteral(node.key) || isBigIntLiteral(node.key)) {
    key = node.key
  } else {
    key = generateIdentifier(node.key, "$TODO")
    debugConfig.logger.error(`TODO // Handle class-property-key : ${node.key.type} @ ClassDeclarationHandler.ts`, [node.key])
  }

  let value: Identifier | null | undefined
  if (isIdentifier(node.value)) {
    value = node.value
  }
  else if (null || undefined) {
    value = null
  }
  else {
    debugConfig.logger.error(`TODO // [THIS NEEDS DISCUSSION] Handle class-property-value @ ClassDeclarationHandler.ts`, [node.value])
  }

  let typeAnnotation: null | undefined
  if (!node.typeAnnotation) {
    typeAnnotation = null
  } else {
    debugConfig.logger.error(`TODO // Handle class-property-type-annotation : ${node.key.type} @ ClassDeclarationHandler.ts`, [node.typeAnnotation])
  }

  let decorators: null | undefined
  if (!node.decorators) {
    decorators = null
  } else {
    debugConfig.logger.error(`TODO // Handle class-property-type-decorators @ ClassDeclarationHandler.ts`, [node.decorators])
  }

  let variance: null | undefined
  if (!node.variance) {
    variance = null
  } else {
    debugConfig.logger.error(`TODO // Handle class-property-type-variance: ${node.variance.type} @ ClassDeclarationHandler.ts`, [node.variance])
  }

  // Push to holder
  holder.push(
    generateJS3ClassProperty(
      node,
      key,
      value,
      typeAnnotation,
      decorators,
      node.computed,
      node.static,
      node.abstract,
      node.accessibility,
      node.declare,
      node.definite,
      node.optional,
      node.override,
      node.readonly,
      variance
    )
  )
}