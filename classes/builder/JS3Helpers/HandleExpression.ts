
import debugConfig from "#debugConfig";
import { ArrayExpression, ArrowFunctionExpression, AssignmentExpression, AwaitExpression, binaryExpression, BinaryExpression, CallExpression, ClassExpression, ConditionalExpression, Expression, FunctionExpression, identifier, Identifier, Import, ImportExpression, isArrayExpression, isArrayPattern, isArrowFunctionExpression, isAssignmentExpression, isAssignmentPattern, isAwaitExpression, isBigIntLiteral, isBinaryExpression, isBindExpression, isBlockStatement, isBooleanLiteral, isCallExpression, isClassBody, isClassExpression, isClassImplements, isConditionalExpression, isDecimalLiteral, isDeclaredPredicate, isDecorator, isDoExpression, isExpression, isFunctionExpression, isIdentifier, isImport, isImportExpression, isInferredPredicate, isInterfaceExtends, isJSXElement, isJSXFragment, isLogicalExpression, isMemberExpression, isMetaProperty, isModuleExpression, isNewExpression, isNoop, isNullLiteral, isNumericLiteral, isObjectExpression, isObjectMethod, isObjectPattern, isObjectProperty, isOptionalCallExpression, isOptionalMemberExpression, isParenthesizedExpression, isPattern, isPipelineBareFunction, isPipelinePrimaryTopicReference, isPipelineTopicExpression, isPrivateName, isRecordExpression, isRegExpLiteral, isRestElement, isSequenceExpression, isStringLiteral, isSuper, isTaggedTemplateExpression, isTemplateLiteral, isThisExpression, isTopicReference, isTSAsExpression, isTSExpressionWithTypeArguments, isTSInstantiationExpression, isTSNonNullExpression, isTSParameterProperty, isTSSatisfiesExpression, isTSType, isTSTypeAnnotation, isTSTypeAssertion, isTSTypeParameterDeclaration, isTupleExpression, isTypeAnnotation, isTypeCastExpression, isTypeParameterDeclaration, isUnaryExpression, isUpdateExpression, isYieldExpression, logicalExpression, LogicalExpression, MemberExpression, MetaProperty, NewExpression, nullLiteral, numericLiteral, ObjectExpression, ObjectMethod, ObjectProperty, OptionalCallExpression, OptionalMemberExpression, PrivateName, RegExpLiteral, SequenceExpression, SpreadElement, TaggedTemplateExpression, TemplateLiteral, unaryExpression, UnaryExpression, UpdateExpression, YieldExpression } from "@babel/types";
import assert from 'node:assert';
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { generateDummyJS3VariableDeclaration, generateIdentifier, generateJS3AnonArrayExpressionfromBaseNode, generateJS3AnonMemberExpressionfromBaseNode, generateJS3ArrayExpression, generateJS3ArrowFunctionExpression, generateJS3AssignmentExpression, generateJS3AssignmentExpressionfromBaseNode, generateJS3AwaitExpression, generateJS3BinaryExpression, generateJS3BinaryExpressionfromBaseNode, generateJS3BlockStatementfromBaseNode, generateJS3CallExpression, generateJS3CallExpressionfromBaseNode, generateJS3ClassExpression, generateJS3FunctionExpression, generateJS3IfStatementfromBaseNode, generateJS3Import, generateJS3ImportExpression, generateJS3LogicalExpressionfromBaseNode, generateJS3MemberExpression, generateJS3MemberExpressionfromBaseNode, generateJS3MetaProperty, generateJS3NewExpression, generateJS3ObjectExpression, generateJS3ObjectMethod, generateJS3ObjectProperty, generateJS3PrivateName, generateJS3RegExpLiteral, generateJS3ReturnStatementfromBaseNode, generateJS3SpreadElement, generateJS3TaggedTemplateExpression, generateJS3TemplateLiteral, generateJS3UnaryExpression, generateJS3UpdateExpression, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode, generateJS3YieldExpression } from "./JS3Constructors.ts";
import { JS3ArrayExpression, JS3ArrayExpression_elements, JS3ArrowFunctionExpression, JS3ArrowFunctionExpression_body, JS3ArrowFunctionExpression_params, JS3ArrowFunctionExpression_predicate, JS3ArrowFunctionExpression_returnType, JS3ArrowFunctionExpression_typeParameters, JS3AssignmentExpression, JS3AssignmentExpression_left, JS3AssignmentExpression_right, JS3AwaitExpression, JS3AwaitExpression_argument, JS3BinaryExpression, JS3BinaryExpression_left, JS3BinaryExpression_right, JS3BlockStatement_body, JS3CallExpression, JS3CallExpression_callee, JS3ClassExpression, JS3ClassExpression_body, JS3ClassExpression_decorators, JS3ClassExpression_implements, JS3ClassExpression_mixins, JS3ClassExpression_superClass, JS3ClassExpression_superTypeParameters, JS3ClassExpression_typeParameters, JS3FunctionExpression, JS3FunctionExpression_body, JS3FunctionExpression_id, JS3FunctionExpression_params, JS3FunctionExpression_predicate, JS3FunctionExpression_returnType, JS3FunctionExpression_typeParameters, JS3Import, JS3ImportExpression, JS3ImportExpression_options, JS3ImportExpression_source, JS3LogicalExpression_left, JS3MemberExpression, JS3MemberExpression_object, JS3MemberExpression_property, JS3MetaProperty, JS3NewExpression, JS3NewExpression_arguments, JS3NewExpression_callee, JS3NewExpression_typeArguments, JS3NewExpression_typeParameters, JS3ObjectExpression, JS3ObjectExpression_properties, JS3ObjectMethod, JS3ObjectMethod_body, JS3ObjectMethod_decorators, JS3ObjectMethod_key, JS3ObjectMethod_params, JS3ObjectMethod_returnType, JS3ObjectMethod_typeParameters, JS3ObjectProperty, JS3ObjectProperty_decorators, JS3ObjectProperty_key, JS3ObjectProperty_value, JS3PrivateName, JS3RegExpLiteral, JS3SpreadElement, JS3SpreadElement_argument, JS3TaggedTemplateExpression, JS3TaggedTemplateExpression_quasi, JS3TaggedTemplateExpression_tag, JS3TaggedTemplateExpression_typeParameters, JS3TemplateLiteral, JS3TemplateLiteral_expressions, JS3TemplateLiteral_quasis, JS3UnaryExpression, JS3UnaryExpression_argument, JS3UpdateExpression, JS3UpdateExpression_argument, JS3YieldExpression, JS3YieldExpression_argument } from "./JS3Types.ts";

import { isArgumentPlaceholder, isSpreadElement, isTSTypeParameterInstantiation, isTypeParameterInstantiation, isV8IntrinsicIdentifier } from "@babel/types";
import { lowerComputedKey } from "./GenericConstructs.ts";
import { handleBlockStatement } from "./HandleBlocks.ts";
import { handleClassBody } from "./HandleClassDeclaration.ts";
import { JS3CallExpression_arguments, JS3CallExpression_typeArguments, JS3CallExpression_typeParameters } from "./JS3Types.ts";


type OtherProps = JS3BuilderUtils;

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

//
// Reduces expressions to an Identifier
//
export function handleExpression(node: Expression, otherProps: OtherProps): Identifier {
  otherProps.debugTrace.push("Expression")
  assert(Array.isArray(otherProps.others.holder), `handleExpression expects an holder to spill intermediate values`);

  let resultIdentifier = generateIdentifier(node, "$TODO")

  if (isArrayExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = [id, id, , id]
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleArrayExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isAssignmentExpression(node)) {
    // ========================================================================================
    // (LVal = init)
    // $resultIdentifier = (LVal = init)
    const assnExpr = handleAssignmentExpression(node, otherProps)
    // otherProps.others.holder.push(assnExpr)

    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, assnExpr);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isBinaryExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = a op b
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleBinaryExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isCallExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = JS3CallExpression()
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleCallExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isConditionalExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = JS3ConditionalExpr
    // resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    // const init = handleConditionalExpression(node, otherProps)
    // const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    // otherProps.others.holder.push(varDecl)

    resultIdentifier = handleConditionalExpression(node, otherProps)

    // ========================================================================================
  } else if (isFunctionExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = function () [] ()
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleFunctionExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isIdentifier(node)) {
    // ========================================================================================
    // $resultIdentifier = identifier
    // This fixes 47 tests in expression, but breaks other tests!
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
    // resultIdentifier = node
  } else if (isStringLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = "abc"
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isNumericLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = 123
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isNullLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = null
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isBooleanLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = true/false
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isRegExpLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = /REGEX/FLAGSs
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleRegExpLiteral(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isLogicalExpression(node)) {

    // ========================================================================================
    // $resultIdentifier = a op b
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleLogicalExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================

  } else if (isMemberExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = a.b
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleMemberExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isNewExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = new abc ()
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleNewExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isObjectExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = {JS3ObjectExpression} // All property declarations are spilled into the holder
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleObjectExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isSequenceExpression(node)) {
    // ========================================================================================
    // // $resultIdentifier = (seq1Res, seq2Res, seq3Res...) <- Deprecated...
    // resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    // const init = handleSequenceExpression(node, otherProps)
    // const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    // otherProps.others.holder.push(varDecl)
    
    resultIdentifier = handleSequenceExpression(node, otherProps)
    // ========================================================================================
  } else if (isParenthesizedExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ParenthesizedExpression`, otherProps.debugTrace);
  } else if (isThisExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = this
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isUnaryExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = [unary op]Id
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleUnaryExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isUpdateExpression(node)) {

    // ========================================================================================
    // $resultIdentifier = JS3updateExpr
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleUpdateExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================

  } else if (isArrowFunctionExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = () => JS3Body
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleArrowFunctionExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================

  } else if (isClassExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = JS3 classexpr { ... }
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleClassExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isImportExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = import(..., ...)
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleImportExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================

  } else if (isMetaProperty(node)) {
    // ========================================================================================
    // $resultIdentifier = meta.prop
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleMetaProperty(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isSuper(node)) {
    // ========================================================================================
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->Super [UNSUPPORTED BY DESIGN, will cause a syntax error, adjust case in callee]`, otherProps.debugTrace);
    // ========================================================================================
  } else if (isTaggedTemplateExpression(node)) {
    // ========================================================================================
    // Calling this will cause a syntax error! it is by design.
    // $resultIdentifier = tag`...`
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleTaggedTemplateExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================  
  }

  else if (isTemplateLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = `text${id}text${id}...`
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleTemplateLiteral(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================  
  } else if (isYieldExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = yield ID
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleYieldExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================  
  } else if (isAwaitExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = `text${id}text${id}...`
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleAwaitExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================  
  } else if (isImport(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->Import`, otherProps.debugTrace);
  } else if (isBigIntLiteral(node)) {
    // ========================================================================================
    // $resultIdentifier = 123n
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = node
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================  
  } else if (isOptionalMemberExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = o?.b --> Deprecated
    // $resultIdentifier = ...res
    resultIdentifier = handleOptionalMemberExpression(node, otherProps).evalResId
    // ========================================================================================  
  } else if (isOptionalCallExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = o.b?.() --> Deprecated
    // $resultIdentifier = ...res
    resultIdentifier = handleOptionalCallExpression(node, otherProps)
    // resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    // const init = handleOptionalCallExpression(node, otherProps)
    // const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    // otherProps.others.holder.push(varDecl)
    // ========================================================================================  
  } else if (isTypeCastExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TypeCastExpression`, otherProps.debugTrace);
  } else if (isJSXElement(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->JSXElement`, otherProps.debugTrace);
  } else if (isJSXFragment(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->JSXFragment`, otherProps.debugTrace);
  } else if (isBindExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BindExpression`, otherProps.debugTrace);
  } else if (isDoExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->DoExpression`, otherProps.debugTrace);
  } else if (isRecordExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->RecordExpression`, otherProps.debugTrace);
  } else if (isTupleExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TupleExpression`, otherProps.debugTrace);
  } else if (isDecimalLiteral(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->DecimalLiteral`, otherProps.debugTrace);
  } else if (isModuleExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ModuleExpression`, otherProps.debugTrace);
  } else if (isTopicReference(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TopicReference`, otherProps.debugTrace);
  } else if (isPipelineTopicExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelineTopicExpression`, otherProps.debugTrace);
  } else if (isPipelineBareFunction(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelineBareFunction`, otherProps.debugTrace);
  } else if (isPipelinePrimaryTopicReference(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelinePrimaryTopicReference`, otherProps.debugTrace);
  } else if (isTSInstantiationExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSInstantiationExpression`, otherProps.debugTrace);
  } else if (isTSAsExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSAsExpression`, otherProps.debugTrace);
  } else if (isTSSatisfiesExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSSatisfiesExpression`, otherProps.debugTrace);
  } else if (isTSTypeAssertion(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSTypeAssertion`, otherProps.debugTrace);
  } else if (isTSNonNullExpression(node)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSNonNullExpression`, otherProps.debugTrace);
  }
  otherProps.debugTrace.pop()
  return resultIdentifier;
}

export function lowerToAnonArrayExpr(node: FunctionExpression | ArrowFunctionExpression | ClassExpression, otherProps: OtherProps) : Identifier {
  // All this drama is needed if the function/class is nameless, otherwise normal lowering is fine
  // function foo() { ... }
  if (isFunctionExpression(node) && isIdentifier(node.id)) {
    return handleExpression(node, otherProps)
  }
  // class foo { ... }
  if (isClassExpression(node) && isIdentifier(node.id)) {
    return handleExpression(node, otherProps)
  }
  
  // Otherwise
  // t$res = [function() { ... }][0]
  // t$res = [() => { ... }][0]
  // t$res = [class { ... }][0]

  // Translate it into a FunctionExpression
  let declExpr : JS3FunctionExpression | JS3ArrowFunctionExpression | JS3ClassExpression;
  
  if (isFunctionExpression(node)) {
    declExpr = handleFunctionExpression(node, otherProps)
  } else if (isArrowFunctionExpression(node)) {
    declExpr = handleArrowFunctionExpression(node, otherProps)
  } else {
    declExpr = handleClassExpression(node, otherProps)
  }
  
  const holder: Array<JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression> = new Array();
  holder.push(declExpr);

  // [ function { ... } ]
  const arrNode = generateJS3AnonArrayExpressionfromBaseNode(holder, node)

  // [ function { ... } ] [0]
  const anonArrExpr = generateJS3AnonMemberExpressionfromBaseNode(arrNode, numericLiteral(0), true, false, node)

  // let temp = [func...][0]
  let resHolder = generateIdentifier(node, otherProps.getNewTemporary("NAMELESS_ANON_FN"))
  otherProps.others.holder.push(generateDummyJS3VariableDeclaration(node, resHolder, anonArrExpr, "let", null, null))

  return resHolder
}

export function handleCallExpression(node: CallExpression, otherProps: OtherProps) {
  otherProps.debugTrace.push("CallExpression")
  assert(Array.isArray(otherProps.others.holder), `handleCallExpression expects an holder to spill intermediate values`);

  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments: JS3CallExpression_arguments = new Array(); // Handling prop arguments
  if (Array.isArray(orig_arguments)) {
    for (const _arrProp of orig_arguments) {

      if (isDecimalLiteral(_arrProp) || isBigIntLiteral(_arrProp) || isStringLiteral(_arrProp) || isNumericLiteral(_arrProp) || isNullLiteral(_arrProp) || isBooleanLiteral(_arrProp)) {
        fin_arguments.push(_arrProp)
      } else if (isSpreadElement(_arrProp)) {
        fin_arguments.push(handleSpreadElement(_arrProp, otherProps))
      } else if (isCallExpression(_arrProp)) {
        fin_arguments.push(handleCallExpression(_arrProp, otherProps))
      } else if (isFunctionExpression(_arrProp) || isArrowFunctionExpression(_arrProp) || isClassExpression(_arrProp)) {
        fin_arguments.push(lowerToAnonArrayExpr(_arrProp, otherProps))
      } else if (isExpression(_arrProp)) {
        fin_arguments.push(lowerComputedKey(_arrProp, otherProps))
      } else if (isArgumentPlaceholder(_arrProp)) {
        debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}[arguments]->ArgumentPlaceholder`);
      }
    }
  }


  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let fin_callee: JS3CallExpression_callee; // Handling prop callee

  if (isSuper(orig_callee)) {
    fin_callee = orig_callee
  } else if (isV8IntrinsicIdentifier(orig_callee)) {
    fin_callee = orig_callee
  } else if (isIdentifier(orig_callee)) {
    fin_callee = orig_callee
  } else if (isOptionalMemberExpression(orig_callee)) {

    // This needs special handling to retain context.
    // 
    // Input:
    // (a.b?.foo)(a1, a2, a3...)
    // 
    // Output:
    // let eval$res = ...a.b?.foo
    // let contextObjId = ...a.b
    // 
    // (eval$res.call)(contextObjId, ...args)
    // 

    let { evalResId, contextObjId } = handleOptionalMemberExpression(orig_callee, otherProps)
    fin_callee = generateJS3MemberExpressionfromBaseNode(evalResId, generateIdentifier(node.callee, "call"), false, null, node.callee)
    // Add the context as the first argument to the call...
    fin_arguments = [contextObjId, ...fin_arguments]

  } else if (isMemberExpression(orig_callee)) {
    // We would like to retain the context if the callee is a member expression
    // 
    // Input:
    // a.b.next()
    // 
    // Output:
    // t1 = a.b
    // t1.next()
    // 
    fin_callee = handleMemberExpression(orig_callee, otherProps)
  } else if (isImport(orig_callee)) {
    fin_callee = handleImport(orig_callee, otherProps)
  } else if (isFunctionExpression(orig_callee) || isArrowFunctionExpression(orig_callee) || isClassExpression(orig_callee)) {
    fin_callee = lowerToAnonArrayExpr(orig_callee, otherProps)
  } else if (isExpression(orig_callee)) {
    fin_callee = handleExpression(orig_callee, otherProps)
  }



  let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
  let fin_typeArguments: JS3CallExpression_typeArguments = null; // Handling prop typeArguments
  if (isTypeParameterInstantiation(orig_typeArguments)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}typeArguments->TypeParameterInstantiation`);
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3CallExpression_typeParameters = null; // Handling prop typeParameters
  if (isTSTypeParameterInstantiation(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}typeParameters->TSTypeParameterInstantiation`);
  }

  let result: JS3CallExpression = generateJS3CallExpression(fin_callee, fin_arguments, fin_typeArguments, fin_typeParameters, node);
  return result;
}

export function handleMemberExpression(node: MemberExpression, otherProps: OtherProps): JS3MemberExpression {
  // 3 fallthrough props, 2 restricted props
  let orig_object = node.object; // Handling prop object
  let fin_object: JS3MemberExpression_object; // Handling prop object
  if (isIdentifier(orig_object)) {
    fin_object = orig_object
  } else if (isSuper(orig_object)) {
    fin_object = orig_object
  } else if (isThisExpression(orig_object)) {
    fin_object = orig_object
  } else if (isFunctionExpression(orig_object) || isArrowFunctionExpression(orig_object) || isClassExpression(orig_object)) {
    fin_object = lowerToAnonArrayExpr(orig_object, otherProps)
  } else if (isExpression(orig_object)) {
    fin_object = handleExpression(orig_object, otherProps)
  }

  let orig_property = node.property; // Handling prop property
  let fin_property: JS3MemberExpression_property; // Handling prop property
  if (isIdentifier(orig_property)) {
    fin_property = orig_property
  } else if (isFunctionExpression(orig_property) || isArrowFunctionExpression(orig_property) || isClassExpression(orig_property)) {
    fin_property = lowerToAnonArrayExpr(orig_property, otherProps)
  } else if (isExpression(orig_property)) {
    fin_property = handleExpression(orig_property, otherProps)
  } else if (isPrivateName(orig_property)) {
    fin_property = handlePrivateName(orig_property, otherProps)
  }

  let result: JS3MemberExpression = generateJS3MemberExpression(fin_object, fin_property, node);
  return result
}

export function handleOptionalMemberExpression(node: OptionalMemberExpression, otherProps: OtherProps): { evalResId: Identifier, contextObjId: Identifier } {
  let fin$res = generateIdentifier(node, otherProps.getNewTemporary("OPTE_RESULT"))

  // let fin$res = undefined 
  otherProps.others.holder.push(generateDummyJS3VariableDeclaration(node, fin$res, generateIdentifier(node, "undefined"), "let", null, null))

  let orig_object = node.object; // Handling prop object
  // let obj$res = ...obj
  let obj$res;

  if (isIdentifier(orig_object)) {
    obj$res = orig_object
  } else if (isSuper(orig_object)) {
    obj$res = orig_object
  } else if (isThisExpression(orig_object)) {
    obj$res = orig_object
  } else if (isFunctionExpression(orig_object) || isArrowFunctionExpression(orig_object) || isClassExpression(orig_object)) {
    obj$res = lowerToAnonArrayExpr(orig_object, otherProps)
  } else if (isExpression(orig_object)) {
    obj$res = handleExpression(orig_object, otherProps)
  }

  // let first$cond = obj$res !== undefined
  let first$cond = generateIdentifier(node, otherProps.getNewTemporary("OPTE_C1"))
  let decl = new Array()
  decl.push(generateJS3VariableDeclaratorfromBaseNode(first$cond, // first$cond = 
    generateJS3BinaryExpressionfromBaseNode(obj$res, generateIdentifier(node.object, "undefined"), "!==", node.object), // obj$res !== undefined 
    null, node.object))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(decl, "let", null, node.object)) // let first$cond = obj$res !== undefined

  // let null$literal = null
  let null$literal = generateIdentifier(node, otherProps.getNewTemporary("OPTE_NULL"))
  let declNull = new Array()
  declNull.push(generateJS3VariableDeclaratorfromBaseNode(null$literal, // null$literal = 
    nullLiteral(), // null 
    null, node.object))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(declNull, "let", null, node.object)) // let null$literal = null

  // let second$cond = obj$res !== undefined
  let second$cond = generateIdentifier(node, otherProps.getNewTemporary("OPTE_C2"))
  let declSecond = new Array()
  declSecond.push(generateJS3VariableDeclaratorfromBaseNode(second$cond, // second$cond = 
    generateJS3BinaryExpressionfromBaseNode(obj$res, null$literal, "!==", node.object), // obj$res !== null$literal 
    null, node.object))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(declSecond, "let", null, node.object)) // let second$cond = obj$res !== null$literal 

  // COND_BODY == { 
  //   let prop$res = ...evalProp
  //   fin$res = obj$res[prop$res]
  // }
  const blockHolder: JS3BlockStatement_body = new Array()
  const COND_BODY = generateJS3BlockStatementfromBaseNode(blockHolder, new Array(), node.property)
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockHolder, prefix: "OPTE_PROP" } }

  if (node.computed) {
    let prop$res : Identifier
    if (isFunctionExpression(node.property) || isArrowFunctionExpression(node.property) || isClassExpression(node.property)) { 
      prop$res = lowerToAnonArrayExpr(node.property, updatedProps)
    } else {
      prop$res = handleExpression(node.property, updatedProps)
    }

    blockHolder.push(generateJS3AssignmentExpressionfromBaseNode(fin$res, generateJS3MemberExpressionfromBaseNode(obj$res, prop$res, true, null, node.property), "=", node.property))
  } else {

    if (isIdentifier(node.property) || isPrivateName(node.property)) {
      blockHolder.push(generateJS3AssignmentExpressionfromBaseNode(fin$res, generateJS3MemberExpressionfromBaseNode(obj$res, node.property, false, null, node.property), "=", node.property))
    } else {
      debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}!computed->Not an identifier!`);
    }
  }

  // let final$cond = first$cond && second$cond
  let final$cond = generateIdentifier(node, otherProps.getNewTemporary("OPTE_CFIN"))
  let declFinal = new Array()
  declFinal.push(generateJS3VariableDeclaratorfromBaseNode(final$cond, // final$cond = 
    generateJS3LogicalExpressionfromBaseNode(first$cond, second$cond, "&&", node.object), // first$cond && second$cond 
    null, node.object))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(declFinal, "let", null, node.object))

  // if (final$cond) COND_BODY
  otherProps.others.holder.push(generateJS3IfStatementfromBaseNode(final$cond, COND_BODY, null, node))

  return { evalResId: fin$res, contextObjId: obj$res }
}

export function handleOptionalCallExpression(node: OptionalCallExpression, otherProps: OtherProps): Identifier { 
  // a.b?.()
  // 
  // let fin$res = undefined
  // 
  // let [callee$res, CONTEXT] = ...callee
  // let callee$cond1 = callee$res !== undefined
  // let callee$cond2 = callee$res !== null
  // let callee$condfin = callee$cond1 && callee$cond2
  // if (callee$cond) {
  //   fin$res = ID(...args) | ID.X(...args) | ID.call(CONTEXT,...args)
  // }
  
  let fin$res = generateIdentifier(node, otherProps.getNewTemporary("OPTE_RESULT"))

  // let fin$res = undefined 
  otherProps.others.holder.push(generateDummyJS3VariableDeclaration(node, fin$res, generateIdentifier(node, "undefined"), "let", null, null))

  // ...args
  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments: JS3CallExpression_arguments = new Array(); // Handling prop arguments
  if (Array.isArray(orig_arguments)) {
    for (const _arrProp of orig_arguments) {
      if (isDecimalLiteral(_arrProp) || isBigIntLiteral(_arrProp) || isStringLiteral(_arrProp) || isNumericLiteral(_arrProp) || isNullLiteral(_arrProp) || isBooleanLiteral(_arrProp)) {
        fin_arguments.push(_arrProp)
      } else if (isSpreadElement(_arrProp)) {
        fin_arguments.push(handleSpreadElement(_arrProp, otherProps))
      } else if (isCallExpression(_arrProp)) {
        fin_arguments.push(handleCallExpression(_arrProp, otherProps))
      } else if (isFunctionExpression(_arrProp) || isArrowFunctionExpression(_arrProp) || isClassExpression(_arrProp)) {
        fin_arguments.push(lowerToAnonArrayExpr(_arrProp, otherProps))
      } else if (isExpression(_arrProp)) {
        fin_arguments.push(lowerComputedKey(_arrProp, otherProps))
      } else if (isArgumentPlaceholder(_arrProp)) {
        debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}[arguments]->ArgumentPlaceholder`);
      }
    }
  }

  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let callee$res: Identifier; // Handling prop callee
  let CALLEE_CONTEXT = null
  let IS_SUPER_CONTEXT = false

  if (isSuper(orig_callee)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}!callee->SUPER not handled`);
  } else if (isV8IntrinsicIdentifier(orig_callee)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}!callee->V8 Intrinsic not handled`);
  } else if (isIdentifier(orig_callee)) {
    callee$res = orig_callee
  } else if (isOptionalMemberExpression(orig_callee)) {

    // This needs special handling to retain context.
    // 
    // Input:
    // a.b?.foo
    // 
    // Output:
    // let t1 = ...a.b == CALLEE_CONTEXT
    // let t2 = ...a.b?.foo == CALLEE
    // 
    // 

    let { evalResId, contextObjId } = handleOptionalMemberExpression(orig_callee, otherProps)
    callee$res = evalResId
    CALLEE_CONTEXT = contextObjId

  } else if (isMemberExpression(orig_callee)) {
    // We would like to retain the context if the callee is a member expression
    // 
    // Input:
    // a.boo()
    // 
    // Output:
    // t1 = a <- t1 == CALLEE_CONTEXT
    // t2 = t1.boo <- t2 == CALLEE
    // 
    let mExpr = handleMemberExpression(orig_callee, otherProps)
    callee$res = generateIdentifier(node, otherProps.getNewTemporary("OPTCE_CALLEE"))

    let declarator = generateJS3VariableDeclaratorfromBaseNode(callee$res, mExpr, null, orig_callee)
    let decl = new Array()
    decl.push(declarator)
    otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(decl, "let", null, orig_callee))
    
    if (isIdentifier(mExpr.object)) {
      CALLEE_CONTEXT = generateIdentifier(node, otherProps.getNewTemporary("OPTCE_CALLEE_CON"))
      otherProps.others.holder.push(generateJS3AssignmentExpressionfromBaseNode(CALLEE_CONTEXT, mExpr.object, "=", orig_callee))
    } else if (isSuper(mExpr.object)) {
      IS_SUPER_CONTEXT = true
    } else {
      debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}!callee object is not an Identifier`);
    }

  } else if (isImport(orig_callee)) {
    debugConfig.logger.throwJS3Error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}!callee->import not handled`);
  } else if (isFunctionExpression(orig_callee) || isArrowFunctionExpression(orig_callee) || isClassExpression(orig_callee)) {
    callee$res = lowerToAnonArrayExpr(orig_callee, otherProps)
  } else if (isExpression(orig_callee)) {
    callee$res = handleExpression(orig_callee, otherProps)
  }

  // let first$cond = callee$res !== undefined
  let first$cond = generateIdentifier(node, otherProps.getNewTemporary("OPTCE_C1"))
  let decl = new Array()
  decl.push(generateJS3VariableDeclaratorfromBaseNode(first$cond, // first$cond = 
    generateJS3BinaryExpressionfromBaseNode(callee$res, generateIdentifier(node.callee, "undefined"), "!==", node.callee), // callee$res !== undefined 
    null, node.callee))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(decl, "let", null, node.callee)) // let first$cond = obj$res !== undefined

  // let null$literal = null
  let null$literal = generateIdentifier(node, otherProps.getNewTemporary("OPTCE_NULL"))
  let declNull = new Array()
  declNull.push(generateJS3VariableDeclaratorfromBaseNode(null$literal, // null$literal = 
    nullLiteral(), // null 
    null, node.callee))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(declNull, "let", null, node.callee)) // let null$literal = null

  // let second$cond = obj$res !== undefined
  let second$cond = generateIdentifier(node, otherProps.getNewTemporary("OPTCE_C2"))
  let declSecond = new Array()
  declSecond.push(generateJS3VariableDeclaratorfromBaseNode(second$cond, // second$cond = 
    generateJS3BinaryExpressionfromBaseNode(callee$res, null$literal, "!==", node.callee), // callee$res !== null$literal 
    null, node.callee))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(declSecond, "let", null, node.callee)) // let second$cond = obj$res !== null$literal 

  // COND_BODY == { 
  //   fin$res = ID (...args) | ID.call(CONTEXT, ...args)
  // }
  const blockHolder: JS3BlockStatement_body = new Array()
  const COND_BODY = generateJS3BlockStatementfromBaseNode(blockHolder, new Array(), node)

  if (CALLEE_CONTEXT || IS_SUPER_CONTEXT) {
    let fin_callee = generateJS3MemberExpressionfromBaseNode(callee$res, generateIdentifier(node.callee, "call"), false, null, node.callee)
    if (IS_SUPER_CONTEXT) {
      CALLEE_CONTEXT = generateIdentifier(node.callee, "this")
    }
    let fin_arguments_new = [CALLEE_CONTEXT, ...fin_arguments]

    let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
    let fin_typeArguments = null; // Handling prop typeArguments
    if (isTypeParameterInstantiation(orig_typeArguments)) {
      debugConfig.logger.throwJS3Error("TODO // unhandled OptionalCallExpression->typeArguments->TypeParameterInstantiation");
    }

    let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
    let fin_typeParameters = null; // Handling prop typeParameters
    if (isTSTypeParameterInstantiation(orig_typeParameters)) {
      debugConfig.logger.throwJS3Error("TODO // unhandled OptionalCallExpression->typeParameters->TSTypeParameterInstantiation");
    }

    let result: JS3CallExpression = generateJS3CallExpressionfromBaseNode(fin_callee, fin_arguments_new, fin_typeArguments, fin_typeArguments, null, node);

    blockHolder.push(generateJS3AssignmentExpressionfromBaseNode(fin$res, result, "=", node))
  } else {
    let fin_callee = callee$res
    let fin_arguments_new = fin_arguments

    let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
    let fin_typeArguments = null; // Handling prop typeArguments
    if (isTypeParameterInstantiation(orig_typeArguments)) {
      debugConfig.logger.throwJS3Error("TODO // unhandled OptionalCallExpression->typeArguments->TypeParameterInstantiation");
    }

    let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
    let fin_typeParameters = null; // Handling prop typeParameters
    if (isTSTypeParameterInstantiation(orig_typeParameters)) {
      debugConfig.logger.throwJS3Error("TODO // unhandled OptionalCallExpression->typeParameters->TSTypeParameterInstantiation");
    }

    let result: JS3CallExpression = generateJS3CallExpressionfromBaseNode(fin_callee, fin_arguments_new, fin_typeArguments, fin_typeArguments, null, node);

    blockHolder.push(generateJS3AssignmentExpressionfromBaseNode(fin$res, result, "=", node))
  }

  
  // let final$cond = first$cond && second$cond
  let final$cond = generateIdentifier(node, otherProps.getNewTemporary("OPTE_CFIN"))
  let declFinal = new Array()
  declFinal.push(generateJS3VariableDeclaratorfromBaseNode(final$cond, // final$cond = 
    generateJS3LogicalExpressionfromBaseNode(first$cond, second$cond, "&&", node.callee), // first$cond && second$cond 
    null, node.callee))
  otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(declFinal, "let", null, node.callee))

  // if (final$cond) COND_BODY
  otherProps.others.holder.push(generateJS3IfStatementfromBaseNode(final$cond, COND_BODY, null, node))

  return fin$res
}



export function handleObjectExpression(node: ObjectExpression, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_properties = node.properties; // Handling prop properties
  let fin_properties: JS3ObjectExpression_properties = new Array(); // Handling prop properties
  if (Array.isArray(orig_properties)) {
    for (const _arrProp of orig_properties) {
      if (isObjectMethod(_arrProp)) {
        fin_properties.push(handleObjectMethod(_arrProp, otherProps))
      } else if (isObjectProperty(_arrProp)) {
        fin_properties.push(handleObjectProperty(_arrProp, otherProps))
      } else if (isSpreadElement(_arrProp)) {
        fin_properties.push(handleSpreadElement(_arrProp, otherProps))
      }
    }
  }

  let result: JS3ObjectExpression = generateJS3ObjectExpression(fin_properties, node);
  return result
}

export function handleObjectMethod(node: ObjectMethod, otherProps: OtherProps) {
  // 5 fallthrough props, 6 restricted props
  let orig_key = node.key; // Handling prop key
  let fin_key: JS3ObjectMethod_key; // Handling prop key

  if (isIdentifier(orig_key)) {
    fin_key = orig_key
  } else if (isStringLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isNumericLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isBigIntLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isFunctionExpression(orig_key) || isArrowFunctionExpression(orig_key) || isClassExpression(orig_key)) { 
    fin_key = lowerToAnonArrayExpr(orig_key, otherProps)
  } else {
    fin_key = handleExpression(orig_key, otherProps)
  }

  let orig_params = node.params; // Handling prop params
  let fin_params: JS3ObjectMethod_params = new Array(); // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp)
      }
    }
  }

  let orig_body = node.body; // Handling prop body
  let fin_body: JS3ObjectMethod_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
  }

  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ObjectMethod_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->[decorators]->Decorator");
      }
    }
  }

  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3ObjectMethod_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->returnType->Noop");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3ObjectMethod_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->typeParameters->Noop");
  }

  let result: JS3ObjectMethod = generateJS3ObjectMethod(fin_key, fin_params, fin_body, fin_decorators, fin_returnType, fin_typeParameters, node);
  return result
}

export function handleObjectProperty(node: ObjectProperty, otherProps: OtherProps) {
  // 3 fallthrough props, 3 restricted props
  let orig_key = node.key; // Handling prop key
  let fin_key: JS3ObjectProperty_key; // Handling prop key
  if (isIdentifier(orig_key)) {
    fin_key = orig_key
  } else if (isStringLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isNumericLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isBigIntLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isDecimalLiteral(orig_key)) {
    fin_key = orig_key
  } else if (isPrivateName(orig_key)) {
    fin_key = handlePrivateName(orig_key, otherProps)
  } else if (isFunctionExpression(orig_key) || isArrowFunctionExpression(orig_key) || isClassExpression(orig_key)) { 
    fin_key = lowerToAnonArrayExpr(orig_key, otherProps)
  } else {
    fin_key = handleExpression(orig_key, otherProps)
  }

  let orig_value = node.value; // Handling prop value
  let fin_value: JS3ObjectProperty_value; // Handling prop value
  if (isIdentifier(orig_value)) {
    fin_value = orig_value
  } else if (isClassExpression(orig_value)) {
    fin_value = handleClassExpression(orig_value, otherProps)
  } else if (isDecimalLiteral(orig_value)) {
    fin_value = orig_value
  } else if (isBigIntLiteral(orig_value)) {
    fin_value = orig_value
  } else if (isStringLiteral(orig_value)) {
    fin_value = orig_value
  } else if (isNumericLiteral(orig_value)) {
    fin_value = orig_value
  } else if (isNullLiteral(orig_value)) {
    fin_value = orig_value
  } else if (isBooleanLiteral(orig_value)) {
    fin_value = orig_value
  } else if (isArrowFunctionExpression(orig_value)) {
    fin_value = handleArrowFunctionExpression(orig_value, otherProps)
  } else if (isFunctionExpression(orig_value)) {
    fin_value = handleFunctionExpression(orig_value, otherProps)
  } else if (isExpression(orig_value)) {
    fin_value = handleExpression(orig_value, otherProps)
  } else if (isRestElement(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->RestElement");
  } else if (isAssignmentPattern(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->AssignmentPattern");
  } else if (isArrayPattern(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->ArrayPattern");
  } else if (isObjectPattern(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->ObjectPattern");
  } else if (isTSAsExpression(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->TSAsExpression");
  } else if (isTSSatisfiesExpression(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->TSSatisfiesExpression");
  } else if (isTSTypeAssertion(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->TSTypeAssertion");
  } else if (isTSNonNullExpression(orig_value)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->value->TSNonNullExpression");
  }

  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ObjectProperty_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ObjectProperty->[decorators]->Decorator");
      }
    }
  }

  let result: JS3ObjectProperty = generateJS3ObjectProperty(fin_key, fin_value, fin_decorators, node);
  return result
}







// export function spillObjectExpression(objectHolder: Identifier, node: ObjectExpression, otherProps: OtherProps) {
//   otherProps.debugTrace.push("ObjectExpression")
//   assert(Array.isArray(otherProps.others.holder), `handleObjectExpression expects an holder to spill intermediate values`);

//   // 1 fallthrough props, 1 restricted props
//   let orig_properties = node.properties; // Handling prop properties
//   let fin_properties: JS3ObjectExpression_properties; // Handling prop properties
//   if (Array.isArray(orig_properties)) {
//     for (const _arrProp of orig_properties) {
//       if (isObjectMethod(_arrProp)) {
//         // let tempHolder: Identifier = value: JS3ObjectMethod
//         // objectHolder[key] = tempHolder
//         let key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral | DecimalLiteral | PrivateName;
//         let computed = false
//         if (isIdentifier(_arrProp.key)) {
//           key = _arrProp.key;
//         } else if (isPrivateName(_arrProp.key)) {
//           key = generateIdentifier(_arrProp.key, "$TODO")
//           debugConfig.logger.throwJS3Error("TODO // unhandled spill ObjectExpression->[properties]->ObjectMethod [key is private name]");
//         } else {
//           key = handleExpression(_arrProp.key, otherProps);
//           computed = true
//         }

//         const dummyNode = generateBaseNodeFrom(_arrProp)
//         const tempHolder = generateIdentifier(dummyNode, otherProps.getNewTemporary(otherProps.others.prefix))

//         const objMeth = handleObjectMethod(_arrProp, otherProps)
//         const value = generateJS3FunctionExpressionfromBaseNode(null, objMeth.params, objMeth.body, null, objMeth.returnType, objMeth.typeParameters, objMeth.generator, objMeth.async, dummyNode)

//         const _declarations: JS3VariableDeclaration_declarations = new Array()
//         _declarations.push(generateJS3VariableDeclaratorfromBaseNode(value, tempHolder, null, dummyNode))

//         otherProps.others.holder.push(generateJS3VariableDeclarationfromBaseNode(_declarations, "let", null, dummyNode))



//         const left = generateJS3MemberExpressionfromBaseNode(objectHolder, key, computed, null, dummyNode)
//         const assignmentExpression = generateJS3AssignmentExpressionfromBaseNode(left, tempHolder, "=", dummyNode)
//         const exprStmt = generateJS3ExpressionStatementfromBaseNode(assignmentExpression, dummyNode)
//         otherProps.others.holder.push(exprStmt)


//       } else if (isObjectProperty(_arrProp)) {

//         // objectHolder[key] = [value]
//         let key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral | DecimalLiteral | PrivateName;
//         let computed = false
//         if (isIdentifier(_arrProp.key)) {
//           key = _arrProp.key;
//         } else if (isPrivateName(_arrProp.key)) {
//           key = generateIdentifier(_arrProp.key, "$TODO")
//           debugConfig.logger.throwJS3Error("TODO // unhandled spill ObjectExpression->[properties]->ObjectProperty [key is private name]");
//         } else {
//           key = handleExpression(_arrProp.key, otherProps);
//           computed = true
//         }

//         let value: Identifier
//         if (isExpression(_arrProp.value)) {
//           value = handleExpression(_arrProp.value, otherProps)
//         } else if (isPatternLike(_arrProp.value)) {
//           value = generateIdentifier(_arrProp.value, "$TODO")
//           debugConfig.logger.throwJS3Error("TODO // unhandled spill ObjectExpression->[properties]->ObjectProperty [value is pattern like]");
//         }

//         const dummyNode = generateBaseNodeFrom(_arrProp)

//         const left = generateJS3MemberExpressionfromBaseNode(objectHolder, key, computed, null, dummyNode)
//         const right = value
//         const assignmentExpression = generateJS3AssignmentExpressionfromBaseNode(left, right, "=", dummyNode)
//         const exprStmt = generateJS3ExpressionStatementfromBaseNode(assignmentExpression, dummyNode)
//         otherProps.others.holder.push(exprStmt)
//       } else if (isSpreadElement(_arrProp)) {
//         debugConfig.logger.throwJS3Error("TODO // unhandled spill ObjectExpression->[properties]->SpreadElement", [_arrProp]);
//       }
//     }
//   }
// }

// export function handleObjectMethod(node: ObjectMethod, otherProps: OtherProps) {
//   // 5 fallthrough props, 6 restricted props
//   let orig_key = node.key; // Handling prop key
//   let fin_key : JS3ObjectMethod_key; // Handling prop key
//   if(isExpression (orig_key)) {
//     fin_key = handleExpression(orig_key, otherProps)
//   } else if(isIdentifier (orig_key)) {
//     fin_key = orig_key
//   } else if(isStringLiteral (orig_key)) {
//     fin_key = orig_key
//   } else if(isNumericLiteral (orig_key)) {
//     fin_key = orig_key
//   } else if(isBigIntLiteral (orig_key)) {
//     fin_key = orig_key
//   }

//   let orig_params = node.params; // Handling prop params
//   let fin_params : JS3ObjectMethod_params = new Array(); // Handling prop params
//   if (Array.isArray ( orig_params )) { 
//     for (const _arrProp of orig_params) {
//       if(isIdentifier (_arrProp)) {
//         fin_params.push(_arrProp)
//       } else if(isAssignmentPattern (_arrProp)) {
//         debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->[params]->AssignmentPattern");
//       } else if(isArrayPattern (_arrProp)) {
//         debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->[params]->ArrayPattern");
//       } else if(isObjectPattern (_arrProp)) {
//         debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->[params]->ObjectPattern");
//       } else if(isRestElement (_arrProp)) {
//         debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->[params]->RestElement");
//       } 
//     }
//   }

//   let orig_body = node.body; // Handling prop body
//   let fin_body : JS3ObjectMethod_body; // Handling prop body
//   if(isBlockStatement (orig_body)) {
//     fin_body = handleBlockStatement(orig_body, otherProps);
//   }

//   let orig_decorators = node.decorators; // Handling prop decorators
//   let fin_decorators : JS3ObjectMethod_decorators = null; // Handling prop decorators
//   if (Array.isArray ( orig_decorators )) { 
//     for (const _arrProp of orig_decorators) {
//       if(isDecorator (_arrProp)) {
//         debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->[decorators]->Decorator");
//       } 
//     }
//   }

//   let orig_returnType = node.returnType; // Handling prop returnType
//   let fin_returnType : JS3ObjectMethod_returnType = null; // Handling prop returnType
//   if(isTypeAnnotation (orig_returnType)) {
//     debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->returnType->TypeAnnotation");
//   } else if(isTSTypeAnnotation (orig_returnType)) {
//     debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->returnType->TSTypeAnnotation");
//   } else if(isNoop (orig_returnType)) {
//     debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->returnType->Noop");
//   }

//   let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
//   let fin_typeParameters : JS3ObjectMethod_typeParameters = null; // Handling prop typeParameters
//   if(isTypeParameterDeclaration (orig_typeParameters)) {
//     debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->typeParameters->TypeParameterDeclaration");
//   } else if(isTSTypeParameterDeclaration (orig_typeParameters)) {
//     debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->typeParameters->TSTypeParameterDeclaration");
//   } else if(isNoop (orig_typeParameters)) {
//     debugConfig.logger.throwJS3Error("TODO // unhandled ObjectMethod->typeParameters->Noop");
//   }

//   let result: JS3ObjectMethod = generateJS3ObjectMethod(fin_key, fin_params, fin_body, fin_decorators, fin_returnType, fin_typeParameters, node);
//   return result
// }

export function handleFunctionExpression(node: FunctionExpression, otherProps: OtherProps): JS3FunctionExpression {
  // 3 fallthrough props, 6 restricted props
  let orig_id = node.id; // Handling prop id
  let fin_id: JS3FunctionExpression_id = null; // Handling prop id
  if (isIdentifier(orig_id)) {
    fin_id = orig_id
  }

  let orig_params = node.params; // Handling prop params
  let fin_params: JS3FunctionExpression_params = new Array(); // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp)
      }
    }
  }

  let orig_body = node.body; // Handling prop body

  let fin_body: JS3FunctionExpression_body; // Handling prop body

  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
    // debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->body->BlockStatement");
  }
  let orig_predicate = node.predicate; // Handling prop predicate
  let fin_predicate: JS3FunctionExpression_predicate; // Handling prop predicate
  if (isDeclaredPredicate(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->predicate->DeclaredPredicate");
  } else if (isInferredPredicate(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->predicate->InferredPredicate");
  } else if (isnull(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->predicate->null");
  }
  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3FunctionExpression_returnType; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->returnType->Noop");
  } else if (isnull(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->returnType->null");
  }
  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3FunctionExpression_typeParameters; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->typeParameters->Noop");
  } else if (isnull(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionExpression->typeParameters->null");
  }
  let result: JS3FunctionExpression = generateJS3FunctionExpression(fin_id, fin_params, fin_body, fin_predicate, fin_returnType, fin_typeParameters, node);
  return result
}

export function handleNewExpression(node: NewExpression, otherProps: OtherProps): JS3NewExpression {
  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let fin_callee: JS3NewExpression_callee; // Handling prop callee

  if (isSuper(orig_callee)) {
    fin_callee = orig_callee
  } else if (isV8IntrinsicIdentifier(orig_callee)) {
    fin_callee = orig_callee
  } else if (isFunctionExpression(orig_callee) || isArrowFunctionExpression(orig_callee) || isClassExpression(orig_callee)) { 
    fin_callee = lowerToAnonArrayExpr(orig_callee, otherProps)
  } else {
    fin_callee = handleExpression(orig_callee, otherProps)
  }

  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments: JS3NewExpression_arguments = new Array(); // Handling prop arguments
  if (Array.isArray(orig_arguments)) {
    for (const _arrProp of orig_arguments) {
      if (isFunctionExpression(_arrProp) || isArrowFunctionExpression(_arrProp) || isClassExpression(_arrProp)) { 
        fin_arguments.push(lowerToAnonArrayExpr(_arrProp, otherProps))
      } else if (isExpression(_arrProp)) {
        fin_arguments.push(handleExpression(_arrProp, otherProps))
      } else if (isSpreadElement(_arrProp)) {
        fin_arguments.push(_arrProp)
      } else if (isArgumentPlaceholder(_arrProp)) {
        fin_arguments.push(_arrProp)
      }
    }
  }

  let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
  let fin_typeArguments: JS3NewExpression_typeArguments = null; // Handling prop typeArguments
  if (isTypeParameterInstantiation(orig_typeArguments)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled NewExpression->typeArguments->TypeParameterInstantiation");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3NewExpression_typeParameters = null; // Handling prop typeParameters
  if (isTSTypeParameterInstantiation(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled NewExpression->typeParameters->TSTypeParameterInstantiation");
  }

  let result: JS3NewExpression = generateJS3NewExpression(fin_callee, fin_arguments, fin_typeArguments, fin_typeParameters, node)
  return result;
}

export function handleBinaryExpression(node: BinaryExpression, otherProps: OtherProps): JS3BinaryExpression {
  // 2 fallthrough props, 2 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left: JS3BinaryExpression_left; // Handling prop left
  
  if (isFunctionExpression(orig_left) || isArrowFunctionExpression(orig_left) || isClassExpression(orig_left)) { // Probably redundant but keep it for consistency
    fin_left = lowerToAnonArrayExpr(orig_left, otherProps)
  } else if (isExpression(orig_left)) {
    fin_left = handleExpression(orig_left, otherProps)
  } else if (isPrivateName(orig_left)) {
    fin_left = handlePrivateName(orig_left, otherProps)
  }
  let orig_right = node.right; // Handling prop right
  let fin_right: JS3BinaryExpression_right; // Handling prop right
  
  if (isFunctionExpression(orig_right) || isArrowFunctionExpression(orig_right) || isClassExpression(orig_right)) { // Probably redundant but keep it for consistency
    fin_right = lowerToAnonArrayExpr(orig_right, otherProps)
  } else if (isExpression(orig_right)) {
    fin_right = handleExpression(orig_right, otherProps)
  }
  let result: JS3BinaryExpression = generateJS3BinaryExpression(fin_left, fin_right, node);
  return result
}

export function handleLogicalExpression(node: LogicalExpression, otherProps: OtherProps) {
  // 2 fallthrough props, 2 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left: JS3LogicalExpression_left; // Handling prop left
  if (isFunctionExpression(orig_left) || isArrowFunctionExpression(orig_left) || isClassExpression(orig_left)) { // Probably redundant but keep it for consistency
    fin_left = lowerToAnonArrayExpr(orig_left, otherProps)
  } else if (isExpression(orig_left)) {
    fin_left = handleExpression(orig_left, otherProps)
  }

  const rValFinalResHolder = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
  const lValRes = fin_left;
  const varDecl = generateDummyJS3VariableDeclaration(node, rValFinalResHolder, lValRes);
  otherProps.others.holder.push(varDecl)

  if (node.operator === "&&") {
    // Spill RHS into a temporary block
    // { BODY }
    const blockHolder: JS3BlockStatement_body = new Array()
    const condBody = generateJS3BlockStatementfromBaseNode(blockHolder, new Array(), node.right)
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockHolder } }

    let rvalEvaled;
    let orig_right = node.right; // Handling prop right
    if (isIdentifier(orig_right) || isDecimalLiteral(orig_right) || isBigIntLiteral(orig_right) || isStringLiteral(orig_right) || isNumericLiteral(orig_right) || isNullLiteral(orig_right) || isBooleanLiteral(orig_right)) {
      rvalEvaled = orig_right
    } else if (isFunctionExpression(node.right) || isArrowFunctionExpression(node.right) || isClassExpression(node.right)) { // Probably redundant but keep it for consistency
      rvalEvaled = lowerToAnonArrayExpr(node.right, updatedProps);
    } else if (isExpression(orig_right)) {
      rvalEvaled = handleExpression(node.right, updatedProps);
    }

    // rVal$resHolder = rVal$res
    const updateRes = generateJS3AssignmentExpressionfromBaseNode(rValFinalResHolder, rvalEvaled, "=", node.right);
    blockHolder.push(updateRes)

    // If (lVal$res) { BODY }
    let bCondTrue : Identifier
    if (isFunctionExpression(lValRes) || isArrowFunctionExpression(lValRes) || isClassExpression(lValRes)) { // Probably redundant but keep it for consistency
      bCondTrue = lowerToAnonArrayExpr(lValRes, otherProps)
    } else {
      bCondTrue = handleExpression(lValRes, otherProps)
    }
    const ifStmt = generateJS3IfStatementfromBaseNode(bCondTrue, condBody, null, node)

    otherProps.others.holder.push(ifStmt)
  } else if (node.operator === "||") {
    // Spill RHS into a temporary block
    // { BODY }
    const blockHolder: JS3BlockStatement_body = new Array()
    const condBody = generateJS3BlockStatementfromBaseNode(blockHolder, new Array(), node.right)
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockHolder } }

    let rvalEvaled;
    let orig_right = node.right; // Handling prop right
    if (isIdentifier(orig_right) || isDecimalLiteral(orig_right) || isBigIntLiteral(orig_right) || isStringLiteral(orig_right) || isNumericLiteral(orig_right) || isNullLiteral(orig_right) || isBooleanLiteral(orig_right)) {
      rvalEvaled = orig_right
    } else if (isFunctionExpression(node.right) || isArrowFunctionExpression(node.right) || isClassExpression(node.right)) { // Probably redundant but keep it for consistency
      rvalEvaled = lowerToAnonArrayExpr(node.right, updatedProps);
    } else if (isExpression(orig_right)) {
      rvalEvaled = handleExpression(node.right, updatedProps);
    }

    // rVal$resHolder = rVal$res
    const updateRes = generateJS3AssignmentExpressionfromBaseNode(rValFinalResHolder, rvalEvaled, "=", node.right);
    blockHolder.push(updateRes)

    // if ( !TEST1 ) { BODY }
    const bCondFalse = handleExpression(unaryExpression("!", lValRes), otherProps)
    const ifStmt = generateJS3IfStatementfromBaseNode(bCondFalse, condBody, null, node)

    otherProps.others.holder.push(ifStmt)
  } else if (node.operator === "??") {
    // Spill RHS into a temporary block
    // { BODY }
    const blockHolder: JS3BlockStatement_body = new Array()
    const condBody = generateJS3BlockStatementfromBaseNode(blockHolder, new Array(), node.right)
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockHolder } }

    let rvalEvaled;
    let orig_right = node.right; // Handling prop right
    if (isIdentifier(orig_right) || isDecimalLiteral(orig_right) || isBigIntLiteral(orig_right) || isStringLiteral(orig_right) || isNumericLiteral(orig_right) || isNullLiteral(orig_right) || isBooleanLiteral(orig_right)) {
      rvalEvaled = orig_right
    } else if (isFunctionExpression(node.right) || isArrowFunctionExpression(node.right) || isClassExpression(node.right)) {
      rvalEvaled = lowerToAnonArrayExpr(node.right, updatedProps);
    } else if (isExpression(orig_right)) {
      rvalEvaled = handleExpression(node.right, updatedProps);
    }

    // rVal$resHolder = rVal$res
    const updateRes = generateJS3AssignmentExpressionfromBaseNode(rValFinalResHolder, rvalEvaled, "=", node.right);
    blockHolder.push(updateRes)

    // if (TEST1 || TEST2) { BODY }
    // 
    // TEST1
    const bCondTestUndef = handleExpression(
      binaryExpression("===", fin_left, identifier("undefined")), otherProps
    )
    // TEST2
    const bCondTestNull = handleExpression(
      binaryExpression("===", fin_left, nullLiteral()), otherProps
    )
    // TEST1 || TEST2
    const bCondTest = handleExpression(
      logicalExpression("||", bCondTestUndef, bCondTestNull), otherProps
    )

    const ifStmt = generateJS3IfStatementfromBaseNode(bCondTest, condBody, null, node)

    otherProps.others.holder.push(ifStmt)
  }

  // let orig_right = node.right; // Handling prop right
  // let fin_right: JS3LogicalExpression_right; // Handling prop right
  // if (isExpression(orig_right)) {
  //   fin_right = handleExpression(orig_right, otherProps)
  // }
  // let result: JS3LogicalExpression = generateJS3LogicalExpression(fin_left, fin_right, node);
  return rValFinalResHolder
}

export function handleAssignmentExpression(node: AssignmentExpression, otherProps: OtherProps) {

  // 
  // There are two major cases, one where the LVal is allowed to be destructured and other where it
  // is not.
  // 
  // Destructuring is only allowed for the "=" operator; this can reuse the reduction logic used for
  // variable declaration
  // 




  
  // 2 fallthrough props, 2 restricted props

  let isMemberExpressionContext = false
  let orig_left = node.left; // Handling prop left
  let fin_left: JS3AssignmentExpression_left; // Handling prop left
  if (isIdentifier(orig_left)) {
    fin_left = orig_left
  } else if (isMemberExpression(orig_left)) {
    isMemberExpressionContext = true
    fin_left = handleMemberExpression(orig_left, otherProps)
  } else if (isRestElement(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->RestElement");
  } else if (isAssignmentPattern(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->AssignmentPattern");
  } else if (isArrayPattern(orig_left)) {
    fin_left = orig_left
  } else if (isObjectPattern(orig_left)) {
    fin_left = orig_left
  } else if (isTSParameterProperty(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->TSParameterProperty");
  } else if (isTSAsExpression(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->TSAsExpression");
  } else if (isTSSatisfiesExpression(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->TSSatisfiesExpression");
  } else if (isTSTypeAssertion(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->TSTypeAssertion");
  } else if (isTSNonNullExpression(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->TSNonNullExpression");
  } else if (isOptionalMemberExpression(orig_left)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled AssignmentExpression->left->OptionalMemberExpression");
  }

  // 
  // Ensuring expressions that are conditionally evaluated remain intact is important
  // 
  // 1. Base Case
  // 
  // lVal = rVal
  //   
  //   rVal$res = rVal...
  //   lVal = rVal$res
  // 
  // 2. Operator Case (https://262.ecma-international.org/12.0/#prod-AssignmentOperator)
  // 
  // lVal [OP]= rVal
  // 
  //   rVal$res = rVal...
  //   lVal [OP]= rVal$res
  // 
  // 3. &&= Case (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND_assignment)
  // The logical AND assignment (&&=) operator only evaluates the right operand and assigns to the left if the left operand is truthy.
  // 
  // lVal &&= rVal
  // 
  //   lVal$res = ...lVal
  //   rVal$resHolder = lVal$res
  //   bCond = lVal$res === true
  //   if (bCond) {
  //      rVal$resHolder = ...rVal
  //   }
  //   lVal$res = rVal$ResHolder
  // 
  // 4. ||= Case (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment)
  // The logical OR assignment (||=) operator only evaluates the right operand and assigns to the left if the left operand is falsy.
  // 
  // lVal ||= rVal
  // 
  //   lVal$res = ...lVal
  //   rVal$resHolder = lVal$res
  //   bCond = lVal$res === false
  //   if (bCond) {
  //      rVal$resHolder = ...rVal
  //   }
  //   lVal$res = rVal$ResHolder
  //  
  // 5. ??= Case (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment)
  // The nullish coalescing assignment (??=) operator only evaluates the right operand and assigns to the left if the left operand is nullish (null or undefined).
  // 
  // lVal ??= rVal
  // 
  //   lVal$res = ...lVal
  //   rVal$resHolder = lVal$res
  //   bCond = lVal$res === null || lVal$res === undefined
  //   if (bCond) {
  //      rVal$resHolder = ...rVal
  //   }
  //   lVal$res = rVal$ResHolder
  //


  let orig_right = node.right; // Handling prop right
  let fin_right: JS3AssignmentExpression_right; // Handling prop right

  if (isIdentifier(orig_right) || isDecimalLiteral(orig_right) || isBigIntLiteral(orig_right) || isStringLiteral(orig_right) || isNumericLiteral(orig_right) || isNullLiteral(orig_right) || isBooleanLiteral(orig_right)) {
    fin_right = orig_right
    return generateJS3AssignmentExpression(fin_left, fin_right, node);
  } else if (isArrowFunctionExpression(orig_right)) {
    fin_right = handleArrowFunctionExpression(orig_right, otherProps);
    return generateJS3AssignmentExpression(fin_left, fin_right, node);
  } else if (isFunctionExpression(orig_right)) {
    fin_right = handleFunctionExpression(orig_right, otherProps);
    return generateJS3AssignmentExpression(fin_left, fin_right, node);
  } else if (isClassExpression(orig_right)) {
    fin_right = handleClassExpression(orig_right, otherProps);
    return generateJS3AssignmentExpression(fin_left, fin_right, node);
  } else if (isThisExpression(orig_right)) {
    fin_right = orig_right
    return generateJS3AssignmentExpression(fin_left, fin_right, node);
  } else if (isExpression(orig_right)) {

    if (!(node.operator === "&&=" || node.operator === "||=" || node.operator === "??=")) {
      let fin_right: JS3AssignmentExpression_right; // Handling prop right
      if (isMemberExpressionContext) {
        fin_right = lowerComputedKey(node.right, otherProps);
      } else if (isFunctionExpression(node.right) || isArrowFunctionExpression(node.right) || isClassExpression(node.right)) { // Probably redundant but keep it for consistency
        fin_right = lowerToAnonArrayExpr(node.right, otherProps);
      } else {
        fin_right = handleExpression(node.right, otherProps);
      }

      return generateJS3AssignmentExpression(fin_left, fin_right, node);
    }

    // rVal$resHolder = lVal$res
    const rValFinalResHolder = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const lValRes = fin_left;
    let varDecl;
    // @ts-ignore
    if (isArrayPattern(lValRes) || isObjectPattern(lValRes) || isAssignmentPattern(lValRes) || isRestElement(lValRes)) {
      varDecl = generateIdentifier(node, "$TODO$UNSUPPORTED_LVAL_TYPE")
      debugConfig.logger.throwJS3Error("TODO // unhandled UNSUPPORTED_LVAL_TYPE");
    } else {
      varDecl = generateDummyJS3VariableDeclaration(node, rValFinalResHolder, lValRes);
    }
    otherProps.others.holder.push(varDecl)

    // Spill RHS into a temporary block
    // { BODY }
    const blockHolder: JS3BlockStatement_body = new Array()
    const condBody = generateJS3BlockStatementfromBaseNode(blockHolder, new Array(), node.right)
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockHolder } }
    let rvalEvaled: JS3AssignmentExpression_right;

    if (isMemberExpressionContext) {
      rvalEvaled = lowerComputedKey(node.right, updatedProps);
    } else {
      if (isFunctionExpression(node.right) || isArrowFunctionExpression(node.right) || isClassExpression(node.right)) { // Probably redundant but keep it for consistency
        rvalEvaled = lowerToAnonArrayExpr(node.right, updatedProps);
      } else {
        rvalEvaled = handleExpression(node.right, updatedProps);
      }
    }

    // rVal$resHolder = rVal$res
    const updateRes = generateJS3AssignmentExpressionfromBaseNode(rValFinalResHolder, rvalEvaled, "=", node.right);
    blockHolder.push(updateRes)

    if (node.operator === "&&=") {
      // If (lVal$res) { BODY }
      let bCondTrue;
      // @ts-ignore
      if (isArrayPattern(lValRes) || isObjectPattern(lValRes) || isAssignmentPattern(lValRes) || isRestElement(lValRes)) {
        bCondTrue = generateIdentifier(node, "$TODO$UNSUPPORTED_LVAL_RES")
        debugConfig.logger.throwJS3Error("TODO // unhandled UNSUPPORTED_LVAL_TYPE");
      } else {
        // @ts-ignore
        bCondTrue = handleExpression(lValRes, otherProps)
      }
      const ifStmt = generateJS3IfStatementfromBaseNode(bCondTrue, condBody, null, node)

      otherProps.others.holder.push(ifStmt)
      return generateJS3AssignmentExpression(lValRes, rValFinalResHolder, node);

    } else if (node.operator === "||=") {
      // if ( !TEST1 ) { BODY }
      // @ts-ignore
      const bCondFalse = handleExpression(unaryExpression("!", lValRes), otherProps)
      const ifStmt = generateJS3IfStatementfromBaseNode(bCondFalse, condBody, null, node)

      otherProps.others.holder.push(ifStmt)
      return generateJS3AssignmentExpression(lValRes, rValFinalResHolder, node);
    } else if (node.operator === "??=") {
      // if (TEST1 || TEST2) { BODY }
      // TEST1
      const bCondTestUndef = handleExpression(
        // @ts-ignore
        binaryExpression("===", fin_left, identifier("undefined")), otherProps
      )
      // TEST2
      const bCondTestNull = handleExpression(
        // @ts-ignore
        binaryExpression("===", fin_left, nullLiteral()), otherProps
      )
      // TEST1 || TEST2
      const bCondTest = handleExpression(
        logicalExpression("||", bCondTestUndef, bCondTestNull), otherProps
      )

      const ifStmt = generateJS3IfStatementfromBaseNode(bCondTest, condBody, null, node)

      otherProps.others.holder.push(ifStmt)
      return generateJS3AssignmentExpression(fin_left, rValFinalResHolder, node);
    }
  }

  let result: JS3AssignmentExpression = generateJS3AssignmentExpression(fin_left, fin_right, node);
  return result
}



export function handleUnaryExpression(node: UnaryExpression, otherProps: OtherProps) {
  // 3 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3UnaryExpression_argument; // Handling prop argument
  if (isExpression(orig_argument)) {

    // For some unary operators like delete, we expect a member expression as argument
    // 
    // Correct: delete a.foo
    // 
    // Incorrect: t1 = a.foo
    //            delete t1
    // 

    if (node.operator === "delete") {
      if (isMemberExpression(orig_argument)) {
        fin_argument = handleMemberExpression(orig_argument, otherProps);
      } else if (isIdentifier(orig_argument) && orig_argument.name === "arguments") {
        fin_argument = orig_argument
      } else if (isIdentifier(orig_argument)) {
        fin_argument = orig_argument
      } else if (isCallExpression(orig_argument)) {
        fin_argument = handleCallExpression(orig_argument, otherProps)
      } else if (isNumericLiteral(orig_argument)) {
        fin_argument = orig_argument
      } else if (isThisExpression(orig_argument)) {
        fin_argument = orig_argument
      } else {
        debugConfig.logger.throwJS3Error("TODO // unsupported UnaryExpression->delete [forms other than member expressions to delete operator are often meaningless]", [orig_argument]);
      }
    } else if (isIdentifier(orig_argument)) {
      fin_argument = orig_argument
    } else if (isFunctionExpression(orig_argument) || isArrowFunctionExpression(orig_argument) || isClassExpression(orig_argument)) { // Probably redundant but keep it for consistency
      fin_argument = lowerToAnonArrayExpr(orig_argument, otherProps)
    } else {
      fin_argument = handleExpression(orig_argument, otherProps);
    }

  }
  let result: JS3UnaryExpression = generateJS3UnaryExpression(fin_argument, node);
  return result;
}

export function handleArrowFunctionExpression(node: ArrowFunctionExpression, otherProps: OtherProps) {
  // 4 fallthrough props, 5 restricted props
  let orig_params = node.params; // Handling prop params
  let fin_params: JS3ArrowFunctionExpression_params = new Array(); // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp)
      }
    }
  }

  let orig_body = node.body; // Handling prop body
  let fin_body: JS3ArrowFunctionExpression_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
  } else if (isExpression(orig_body)) {
    const body: JS3BlockStatement_body = new Array()
    fin_body = generateJS3BlockStatementfromBaseNode(body, new Array(), orig_body);
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: body } }
    let resultId : Identifier
    if (isFunctionExpression(orig_body) || isArrowFunctionExpression(orig_body) || isClassExpression(orig_body)) { // Probably redundant but keep it for consistency
      resultId = lowerToAnonArrayExpr(orig_body, updatedProps)
    } else {
      resultId = handleExpression(orig_body, updatedProps);
    }
    const retStmt = generateJS3ReturnStatementfromBaseNode(resultId, orig_body)
    body.push(retStmt)
  }

  let orig_predicate = node.predicate; // Handling prop predicate
  let fin_predicate: JS3ArrowFunctionExpression_predicate = null; // Handling prop predicate
  if (isDeclaredPredicate(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->predicate->DeclaredPredicate");
  } else if (isInferredPredicate(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->predicate->InferredPredicate");
  }

  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3ArrowFunctionExpression_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->returnType->Noop");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3ArrowFunctionExpression_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ArrowFunctionExpression->typeParameters->Noop");
  }

  let result: JS3ArrowFunctionExpression = generateJS3ArrowFunctionExpression(fin_params, fin_body, fin_predicate, fin_returnType, fin_typeParameters, node);
  return result
}

export function handleClassExpression(node: ClassExpression, otherProps: OtherProps) {
  // 2 fallthrough props, 7 restricted props
  let orig_superClass = node.superClass; // Handling prop superClass
  let fin_superClass: JS3ClassExpression_superClass = null; // Handling prop superClass
  if (isExpression(orig_superClass)) {
    fin_superClass = lowerComputedKey(orig_superClass, otherProps)
  }
  //
  // This mostly works but breaks a few tests, because spilling breaks scoping for functions :(
  // Failing Test:
  // https://github.com/tc39/test262/blob/main/test/language/expressions/class/scope-name-lex-open-heritage.js
  // 
  // if (isExpression(orig_superClass)) {
  //   // We can spill as directed by the parent class 
  //   fin_superClass = handleExpression(orig_superClass, otherProps)
  // }

  let orig_body = node.body; // Handling prop body
  let fin_body: JS3ClassExpression_body; // Handling prop body
  if (isClassBody(orig_body)) {
    fin_body = handleClassBody(orig_body, otherProps)
  }
  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ClassExpression_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->[decorators]->Decorator");
      }
    }
  }

  let orig_implements = node.implements; // Handling prop implements
  let fin_implements: JS3ClassExpression_implements = null; // Handling prop implements
  if (Array.isArray(orig_implements)) {
    for (const _arrProp of orig_implements) {
      if (isTSExpressionWithTypeArguments(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->[implements]->TSExpressionWithTypeArguments");
      } else if (isClassImplements(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->[implements]->ClassImplements");
      }
    }
  }

  let orig_mixins = node.mixins; // Handling prop mixins
  let fin_mixins: JS3ClassExpression_mixins = null; // Handling prop mixins
  if (isInterfaceExtends(orig_mixins)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->mixins->InterfaceExtends");
  }

  let orig_superTypeParameters = node.superTypeParameters; // Handling prop superTypeParameters
  let fin_superTypeParameters: JS3ClassExpression_superTypeParameters = null; // Handling prop superTypeParameters
  if (isTypeParameterInstantiation(orig_superTypeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->superTypeParameters->TypeParameterInstantiation");
  } else if (isTSTypeParameterInstantiation(orig_superTypeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->superTypeParameters->TSTypeParameterInstantiation");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3ClassExpression_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassExpression->typeParameters->Noop");
  }

  let result: JS3ClassExpression = generateJS3ClassExpression(fin_superClass, fin_body, fin_decorators, fin_implements, fin_mixins, fin_superTypeParameters, fin_typeParameters, node);
  return result
}

export function handleArrayExpression(node: ArrayExpression, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_elements = node.elements; // Handling prop elements
  let fin_elements: JS3ArrayExpression_elements = new Array(); // Handling prop elements
  if (Array.isArray(orig_elements)) {
    for (const _arrProp of orig_elements) {
      if (isnull(_arrProp)) {
        fin_elements.push(null);
      } else if (isFunctionExpression(_arrProp) || isArrowFunctionExpression(_arrProp) || isClassExpression(_arrProp)) {
        fin_elements.push(lowerToAnonArrayExpr(_arrProp, otherProps))
      } else if (isExpression(_arrProp)) {
        fin_elements.push(handleExpression(_arrProp, otherProps));
      } else if (isSpreadElement(_arrProp)) {
        const se = handleSpreadElement(_arrProp, otherProps);
        fin_elements.push(se);
      }
    }
  }
  let result: JS3ArrayExpression = generateJS3ArrayExpression(fin_elements, node);
  return result
}

export function handleSpreadElement(node: SpreadElement, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3SpreadElement_argument; // Handling prop argument
  if (isFunctionExpression(orig_argument) || isArrowFunctionExpression(orig_argument) || isClassExpression(orig_argument)) {
    fin_argument = lowerToAnonArrayExpr(orig_argument, otherProps)
  } else if (isExpression(orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps);
  }
  let result: JS3SpreadElement = generateJS3SpreadElement(fin_argument, node);
  return result
}

export function handleUpdateExpression(node: UpdateExpression, otherProps: OtherProps) {
  // 3 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3UpdateExpression_argument; // Handling prop argument
  if (isIdentifier(orig_argument)) {
    fin_argument = orig_argument
  } else if (isMemberExpression(orig_argument)) {
    fin_argument = handleMemberExpression(orig_argument, otherProps)
  } else if (isFunctionExpression(orig_argument) || isArrowFunctionExpression(orig_argument) || isClassExpression(orig_argument)) {
    fin_argument = lowerToAnonArrayExpr(orig_argument, otherProps)
  } else if (isExpression(orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps)
  }

  let result: JS3UpdateExpression = generateJS3UpdateExpression(fin_argument, node);
  return result
}

export function handleSequenceExpression(node: SequenceExpression, otherProps: OtherProps) : Identifier {
  // 1 fallthrough props, 1 restricted props
  let orig_expressions = node.expressions; // Handling prop expressions
  let result;
  if (Array.isArray(orig_expressions)) {
    for (const _arrProp of orig_expressions) {
      if (isFunctionExpression(_arrProp) || isArrowFunctionExpression(_arrProp) || isClassExpression(_arrProp)) {
        result = lowerToAnonArrayExpr(_arrProp, otherProps)
      } else if (isExpression(_arrProp)) {
        result = handleExpression(_arrProp, otherProps)
      }
    }
  }
  return result
}

export function handleTemplateLiteral(node: TemplateLiteral, otherProps: OtherProps) {
  // 1 fallthrough props, 2 restricted props
  let orig_quasis = node.quasis; // Handling prop quasis
  let fin_quasis: JS3TemplateLiteral_quasis = orig_quasis; // Handling prop quasis
  // if (Array.isArray ( orig_quasis )) { 
  //   for (const _arrProp of orig_quasis) {
  //     if(isTemplateElement (_arrProp)) {
  //       debugConfig.logger.throwJS3Error("TODO // unhandled TemplateLiteral->[quasis]->TemplateElement");
  //     } 
  //   }
  // } 

  let orig_expressions = node.expressions; // Handling prop expressions
  let fin_expressions: JS3TemplateLiteral_expressions = new Array(); // Handling prop expressions
  if (Array.isArray(orig_expressions)) {
    for (const _arrProp of orig_expressions) {
      if (isFunctionExpression(_arrProp) || isArrowFunctionExpression(_arrProp) || isClassExpression(_arrProp)) {
        fin_expressions.push(lowerToAnonArrayExpr(_arrProp, otherProps))
      } else if (isExpression(_arrProp)) {
        fin_expressions.push(handleExpression(_arrProp, otherProps))
      } else if (isTSType(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled TemplateLiteral->[expressions]->TSType");
      }
    }
  }
  let result: JS3TemplateLiteral = generateJS3TemplateLiteral(fin_quasis, fin_expressions, node);
  return result
}

export function handleYieldExpression(node: YieldExpression, otherProps: OtherProps) {
  // 2 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3YieldExpression_argument = null; // Handling prop argument
  if (isFunctionExpression(orig_argument) || isArrowFunctionExpression(orig_argument) || isClassExpression(orig_argument)) {
    fin_argument = lowerToAnonArrayExpr(orig_argument, otherProps)
  } else if (isExpression(orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps)
  }

  let result: JS3YieldExpression = generateJS3YieldExpression(fin_argument, node);
  return result
}

export function handleConditionalExpression(node: ConditionalExpression, otherProps: OtherProps): Identifier {
  // 
  // Simplify this into an if condition check
  // 

  // 1 fallthrough props, 3 restricted props
  let orig_test = node.test; // Handling prop test
  let fin_test: Identifier; // Handling prop test
  if (isFunctionExpression(orig_test) || isArrowFunctionExpression(orig_test) || isClassExpression(orig_test)) {
    fin_test = lowerToAnonArrayExpr(orig_test, otherProps)
  } else if (isExpression(orig_test)) {
    fin_test = handleExpression(orig_test, otherProps)
  }

  // let result;
  let resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
  otherProps.others.holder.push(generateDummyJS3VariableDeclaration(node, resultIdentifier, null, "let", null, null))

  // if (fin_test) { result = ...consequent } else { result = ...alternate }
  let consequentBodyHolder = new Array()
  let alternateBodyHolder = new Array()
  let consequentBody = generateJS3BlockStatementfromBaseNode(consequentBodyHolder, new Array(), node)
  let alternateBody = generateJS3BlockStatementfromBaseNode(alternateBodyHolder, new Array(), node)
  let ifCond = generateJS3IfStatementfromBaseNode(fin_test, consequentBody, alternateBody, node)
  otherProps.others.holder.push(ifCond)

  let orig_consequent = node.consequent; // Handling prop consequent
  if (isExpression(orig_consequent)) {
    let fin_consequent: Identifier; // Handling prop consequent
    // temp = ...consequent
    // result = temp
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: consequentBodyHolder } }

    if (isFunctionExpression(orig_consequent) || isArrowFunctionExpression(orig_consequent) || isClassExpression(orig_consequent)) {
      fin_consequent = lowerToAnonArrayExpr(orig_consequent, updatedProps)
    } else {
      fin_consequent = handleExpression(orig_consequent, updatedProps)
    }

    consequentBodyHolder.push(generateJS3AssignmentExpressionfromBaseNode(resultIdentifier, fin_consequent, "=", orig_consequent));
  }

  let orig_alternate = node.alternate; // Handling prop alternate
  if (isExpression(orig_alternate)) {
    let fin_alternate: Identifier; // Handling prop alternate
    // temp = ...alternate
    // result = temp
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: alternateBodyHolder } }

    if (isFunctionExpression(orig_alternate) || isArrowFunctionExpression(orig_alternate) || isClassExpression(orig_alternate)) {
      fin_alternate = lowerToAnonArrayExpr(orig_alternate, updatedProps)
    } else {
      fin_alternate = handleExpression(orig_alternate, updatedProps)
    }
    
    alternateBodyHolder.push(generateJS3AssignmentExpressionfromBaseNode(resultIdentifier, fin_alternate, "=", orig_alternate));
  }

  return resultIdentifier;
}

export function handleAwaitExpression(node: AwaitExpression, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3AwaitExpression_argument; // Handling prop argument
  // if (isDecimalLiteral(orig_argument) || isBigIntLiteral(orig_argument) || isStringLiteral(orig_argument) || isNumericLiteral(orig_argument) || isNullLiteral(orig_argument) || isBooleanLiteral(orig_argument)) {
  //   fin_argument = orig_argument;
  // } else 
  // if (isRegExpLiteral(orig_argument)) {
  //   fin_argument = handleRegExpLiteral(orig_argument, otherProps)
  // } else 
  if (isExpression(orig_argument)) {
    fin_argument = lowerComputedKey(orig_argument, otherProps)
  }
  let result: JS3AwaitExpression = generateJS3AwaitExpression(fin_argument, node);
  return result
}

export function handleMetaProperty(node: MetaProperty, otherProps: OtherProps) {
  // 3 fallthrough props, 0 restricted props
  let result: JS3MetaProperty = generateJS3MetaProperty(node);
  return result
}

export function handleTaggedTemplateExpression(node: TaggedTemplateExpression, otherProps: OtherProps) {
  // 1 fallthrough props, 3 restricted props
  let orig_tag = node.tag; // Handling prop tag
  let fin_tag: JS3TaggedTemplateExpression_tag; // Handling prop tag

  if (isMemberExpression(orig_tag)) {
    fin_tag = handleMemberExpression(orig_tag, otherProps)
  } else if (isFunctionExpression(orig_tag) || isArrowFunctionExpression(orig_tag) || isClassExpression(orig_tag)) {
    fin_tag = lowerToAnonArrayExpr(orig_tag, otherProps)
  } else if (isExpression(orig_tag)) {
    fin_tag = handleExpression(orig_tag, otherProps)
  }

  let orig_quasi = node.quasi; // Handling prop quasi
  let fin_quasi: JS3TaggedTemplateExpression_quasi; // Handling prop quasi
  if (isTemplateLiteral(orig_quasi)) {
    fin_quasi = handleTemplateLiteral(orig_quasi, otherProps)
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3TaggedTemplateExpression_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterInstantiation(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled TaggedTemplateExpression->typeParameters->TypeParameterInstantiation");
  } else if (isTSTypeParameterInstantiation(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled TaggedTemplateExpression->typeParameters->TSTypeParameterInstantiation");
  }

  let result: JS3TaggedTemplateExpression = generateJS3TaggedTemplateExpression(fin_tag, fin_quasi, fin_typeParameters, node);
  return result
}

export function handleImportExpression(node: ImportExpression, otherProps: OtherProps) {
  // 2 fallthrough props, 2 restricted props
  let orig_source = node.source; // Handling prop source
  let fin_source: JS3ImportExpression_source; // Handling prop source
  if (isFunctionExpression(orig_source) || isArrowFunctionExpression(orig_source) || isClassExpression(orig_source)) {
    fin_source = lowerToAnonArrayExpr(orig_source, otherProps)
  } else if (isExpression(orig_source)) {
    fin_source = handleExpression(orig_source, otherProps)
  }

  let orig_options = node.options; // Handling prop options
  let fin_options: JS3ImportExpression_options = null; // Handling prop options
  if (isFunctionExpression(orig_options) || isArrowFunctionExpression(orig_options) || isClassExpression(orig_options)) {
    fin_options = lowerToAnonArrayExpr(orig_options, otherProps)
  } else if (isExpression(orig_options)) {
    fin_options = handleExpression(orig_options, otherProps)
  }

  let result: JS3ImportExpression = generateJS3ImportExpression(fin_source, fin_options, node);
  return result
}

export function handleImport(node: Import, otherProps: OtherProps) {
  // 1 fallthrough props, 0 restricted props
  let result: JS3Import = generateJS3Import(node);
  return result
}

export function handleRegExpLiteral(node: RegExpLiteral, otherProps: OtherProps) {
  // 3 fallthrough props, 0 restricted props
  let result: JS3RegExpLiteral = generateJS3RegExpLiteral(node);
  return result
}

export function handlePrivateName(node: PrivateName, otherProps: OtherProps) {
  // 2 fallthrough props, 0 restricted props
  let result: JS3PrivateName = generateJS3PrivateName(node);
  return result;
}