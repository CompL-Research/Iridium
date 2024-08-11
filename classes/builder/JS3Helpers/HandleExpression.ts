
import debugConfig from "#debugConfig";
import { AssignmentExpression, BigIntLiteral, BinaryExpression, CallExpression, DecimalLiteral, Expression, FunctionExpression, Identifier, isArrayExpression, isArrayPattern, isArrowFunctionExpression, isAssignmentExpression, isAssignmentPattern, isAwaitExpression, isBigIntLiteral, isBinaryExpression, isBindExpression, isBlockStatement, isBooleanLiteral, isCallExpression, isClassExpression, isConditionalExpression, isDecimalLiteral, isDeclaredPredicate, isDoExpression, isExpression, isFunctionExpression, isIdentifier, isImport, isImportExpression, isInferredPredicate, isJSXElement, isJSXFragment, isLogicalExpression, isMemberExpression, isMetaProperty, isModuleExpression, isNewExpression, isNoop, isNullLiteral, isNumericLiteral, isObjectExpression, isObjectMethod, isObjectPattern, isObjectProperty, isOptionalCallExpression, isOptionalMemberExpression, isParenthesizedExpression, isPatternLike, isPipelineBareFunction, isPipelinePrimaryTopicReference, isPipelineTopicExpression, isPrivateName, isRecordExpression, isRegExpLiteral, isRestElement, isSequenceExpression, isStringLiteral, isSuper, isTaggedTemplateExpression, isTemplateLiteral, isThisExpression, isTopicReference, isTSAsExpression, isTSInstantiationExpression, isTSNonNullExpression, isTSParameterProperty, isTSSatisfiesExpression, isTSTypeAnnotation, isTSTypeAssertion, isTSTypeParameterDeclaration, isTupleExpression, isTypeAnnotation, isTypeCastExpression, isTypeParameterDeclaration, isUnaryExpression, isUpdateExpression, isYieldExpression, LogicalExpression, MemberExpression, NewExpression, NumericLiteral, ObjectExpression, PrivateName, StringLiteral, UnaryExpression } from "@babel/types";
import assert from 'node:assert';
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { generateBaseNodeFrom, generateDummyJS3VariableDeclaration, generateIdentifier, generateJS3AssignmentExpression, generateJS3AssignmentExpressionfromBaseNode, generateJS3BinaryExpression, generateJS3CallExpression, generateJS3ExpressionStatementfromBaseNode, generateJS3FunctionExpression, generateJS3LogicalExpression, generateJS3MemberExpression, generateJS3MemberExpressionfromBaseNode, generateJS3NewExpression, generateJS3ObjectExpression, generateJS3UnaryExpression } from "./JS3Constructors.ts";
import { JS3AssignmentExpression, JS3AssignmentExpression_left, JS3AssignmentExpression_right, JS3BinaryExpression, JS3BinaryExpression_left, JS3BinaryExpression_right, JS3CallExpression, JS3CallExpression_callee, JS3FunctionExpression, JS3FunctionExpression_body, JS3FunctionExpression_id, JS3FunctionExpression_params, JS3FunctionExpression_predicate, JS3FunctionExpression_returnType, JS3FunctionExpression_typeParameters, JS3LogicalExpression, JS3LogicalExpression_left, JS3LogicalExpression_right, JS3MemberExpression, JS3MemberExpression_object, JS3MemberExpression_property, JS3NewExpression, JS3NewExpression_arguments, JS3NewExpression_callee, JS3NewExpression_typeArguments, JS3NewExpression_typeParameters, JS3ObjectExpression_properties, JS3UnaryExpression, JS3UnaryExpression_argument } from "./JS3Types.ts";

import { isArgumentPlaceholder, isSpreadElement, isTSTypeParameterInstantiation, isTypeParameterInstantiation, isV8IntrinsicIdentifier } from "@babel/types";
import { handleBlockStatement } from "./HandleBlocks.ts";
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
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ArrayExpression`, otherProps.debugTrace);
  } else if (isAssignmentExpression(node)) {
    // ========================================================================================
    // (LVal = init)
    // $resultIdentifier = LVal
    const assnExpr = handleAssignmentExpression(node, otherProps)
    otherProps.others.holder.push(assnExpr)
    
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, assnExpr.left);
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
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ConditionalExpression`, otherProps.debugTrace);
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
    resultIdentifier = node
    // ========================================================================================
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
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->RegExpLiteral`, otherProps.debugTrace);
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
    // $resultIdentifier = {} // All property declarations are spilled into the holder
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = generateJS3ObjectExpression(new Array(), node)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)

    // This method spills all node properties into the holder
    spillObjectExpression(resultIdentifier, node, otherProps)

    // ========================================================================================
  } else if (isSequenceExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->SequenceExpression`, otherProps.debugTrace);
  } else if (isParenthesizedExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ParenthesizedExpression`, otherProps.debugTrace);
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
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->UpdateExpression`, otherProps.debugTrace);
  } else if (isArrowFunctionExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ArrowFunctionExpression`, otherProps.debugTrace);
  } else if (isClassExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ClassExpression`, otherProps.debugTrace);
  } else if (isImportExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ImportExpression`, otherProps.debugTrace);
  } else if (isMetaProperty(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->MetaProperty`, otherProps.debugTrace);
  } else if (isSuper(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->Super`, otherProps.debugTrace);
  } else if (isTaggedTemplateExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TaggedTemplateExpression`, otherProps.debugTrace);
  } else if (isTemplateLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TemplateLiteral`, otherProps.debugTrace);
  } else if (isYieldExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->YieldExpression`, otherProps.debugTrace);
  } else if (isAwaitExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->AwaitExpression`, otherProps.debugTrace);
  } else if (isImport(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->Import`, otherProps.debugTrace);
  } else if (isBigIntLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BigIntLiteral`, otherProps.debugTrace);
  } else if (isOptionalMemberExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->OptionalMemberExpression`, otherProps.debugTrace);
  } else if (isOptionalCallExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->OptionalCallExpression`, otherProps.debugTrace);
  } else if (isTypeCastExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TypeCastExpression`, otherProps.debugTrace);
  } else if (isJSXElement(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->JSXElement`, otherProps.debugTrace);
  } else if (isJSXFragment(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->JSXFragment`, otherProps.debugTrace);
  } else if (isBindExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BindExpression`, otherProps.debugTrace);
  } else if (isDoExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->DoExpression`, otherProps.debugTrace);
  } else if (isRecordExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->RecordExpression`, otherProps.debugTrace);
  } else if (isTupleExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TupleExpression`, otherProps.debugTrace);
  } else if (isDecimalLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->DecimalLiteral`, otherProps.debugTrace);
  } else if (isModuleExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ModuleExpression`, otherProps.debugTrace);
  } else if (isTopicReference(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TopicReference`, otherProps.debugTrace);
  } else if (isPipelineTopicExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelineTopicExpression`, otherProps.debugTrace);
  } else if (isPipelineBareFunction(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelineBareFunction`, otherProps.debugTrace);
  } else if (isPipelinePrimaryTopicReference(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelinePrimaryTopicReference`, otherProps.debugTrace);
  } else if (isTSInstantiationExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSInstantiationExpression`, otherProps.debugTrace);
  } else if (isTSAsExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSAsExpression`, otherProps.debugTrace);
  } else if (isTSSatisfiesExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSSatisfiesExpression`, otherProps.debugTrace);
  } else if (isTSTypeAssertion(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSTypeAssertion`, otherProps.debugTrace);
  } else if (isTSNonNullExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSNonNullExpression`, otherProps.debugTrace);
  }
  otherProps.debugTrace.pop()
  return resultIdentifier;
}

export function handleCallExpression(node: CallExpression, otherProps: OtherProps) {
  otherProps.debugTrace.push("CallExpression")
  assert(Array.isArray(otherProps.others.holder), `handleCallExpression expects an holder to spill intermediate values`);

  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let fin_callee: JS3CallExpression_callee; // Handling prop callee
  if (isExpression(orig_callee)) {
    fin_callee = handleExpression(orig_callee, otherProps)
  } else if (isSuper(orig_callee)) {
    fin_callee = orig_callee
  } else if (isV8IntrinsicIdentifier(orig_callee)) {
    fin_callee = orig_callee
  }

  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments: JS3CallExpression_arguments = new Array(); // Handling prop arguments
  if (Array.isArray(orig_arguments)) {
    for (const _arrProp of orig_arguments) {
      if (isExpression(_arrProp)) {
        fin_arguments.push(handleExpression(_arrProp, otherProps))
      } else if (isSpreadElement(_arrProp)) {
        debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}[arguments]->SpreadElement`);
      } else if (isArgumentPlaceholder(_arrProp)) {
        debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}[arguments]->ArgumentPlaceholder`);
      }
    }
  }

  let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
  let fin_typeArguments: JS3CallExpression_typeArguments = null; // Handling prop typeArguments
  if (isTypeParameterInstantiation(orig_typeArguments)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}typeArguments->TypeParameterInstantiation`);
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3CallExpression_typeParameters = null; // Handling prop typeParameters
  if (isTSTypeParameterInstantiation(orig_typeParameters)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}typeParameters->TSTypeParameterInstantiation`);
  }

  let result: JS3CallExpression = generateJS3CallExpression(fin_callee, fin_arguments, fin_typeArguments, fin_typeParameters, node);
  return result;
}

export function handleMemberExpression(node: MemberExpression, otherProps: OtherProps): JS3MemberExpression {

  // 3 fallthrough props, 2 restricted props
  let orig_object = node.object; // Handling prop object
  let fin_object: JS3MemberExpression_object; // Handling prop object
  if (isExpression(orig_object)) {
    fin_object = handleExpression(orig_object, otherProps)
  } else if (isSuper(orig_object)) {
    fin_object = orig_object
  }

  let orig_property = node.property; // Handling prop property
  let fin_property: JS3MemberExpression_property; // Handling prop property
  if (isExpression(orig_property)) {
    fin_property = handleExpression(orig_property, otherProps)
  } else if (isIdentifier(orig_property)) {
    fin_property = orig_property
  } else if (isPrivateName(orig_property)) {
    fin_property = generateIdentifier(orig_property, "$TODO")
    debugConfig.logger.error("TODO // unhandled MemberExpression->property [property is private name]");
  }

  let result: JS3MemberExpression = generateJS3MemberExpression(fin_object, fin_property, node);
  return result
}

export function spillObjectExpression(objectHolder: Identifier, node: ObjectExpression, otherProps: OtherProps) {
  otherProps.debugTrace.push("ObjectExpression")
  assert(Array.isArray(otherProps.others.holder), `handleObjectExpression expects an holder to spill intermediate values`);

  // 1 fallthrough props, 1 restricted props
  let orig_properties = node.properties; // Handling prop properties
  let fin_properties: JS3ObjectExpression_properties; // Handling prop properties
  if (Array.isArray(orig_properties)) {
    for (const _arrProp of orig_properties) {
      if (isObjectMethod(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled spill ObjectExpression->[properties]->ObjectMethod");
      } else if (isObjectProperty(_arrProp)) {

        // objectHolder[key] = [value]
        let key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral | DecimalLiteral | PrivateName;

        if (isExpression(_arrProp.key)) {
          key = handleExpression(_arrProp.key, otherProps)
        } else if (isPrivateName(_arrProp.key)) {
          key = generateIdentifier(_arrProp.key, "$TODO")
          debugConfig.logger.error("TODO // unhandled spill ObjectExpression->[properties]->ObjectProperty [key is private name]");
        } else {
          key = _arrProp.key
        }

        let value: Identifier
        if (isExpression(_arrProp.value)) {
          value = handleExpression(_arrProp.value, otherProps)
        } else if (isPatternLike(_arrProp.value)) {
          value = generateIdentifier(_arrProp.value, "$TODO")
          debugConfig.logger.error("TODO // unhandled spill ObjectExpression->[properties]->ObjectProperty [value is pattern like]");
        }

        const dummyNode = generateBaseNodeFrom(_arrProp)

        const left = generateJS3MemberExpressionfromBaseNode(objectHolder, key, null, null, dummyNode)
        const right = value
        const assignmentExpression = generateJS3AssignmentExpressionfromBaseNode(left, right, "=", dummyNode)
        const exprStmt = generateJS3ExpressionStatementfromBaseNode(assignmentExpression, dummyNode)
        otherProps.others.holder.push(exprStmt)
      } else if (isSpreadElement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled spill ObjectExpression->[properties]->SpreadElement");
      }
    }
  }
}

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
      } else if (isAssignmentPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isArrayPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isObjectPattern(_arrProp)) {
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
    // debugConfig.logger.error("TODO // unhandled FunctionExpression->body->BlockStatement");
  }
  let orig_predicate = node.predicate; // Handling prop predicate
  let fin_predicate: JS3FunctionExpression_predicate; // Handling prop predicate
  if (isDeclaredPredicate(orig_predicate)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->predicate->DeclaredPredicate");
  } else if (isInferredPredicate(orig_predicate)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->predicate->InferredPredicate");
  } else if (isnull(orig_predicate)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->predicate->null");
  }
  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3FunctionExpression_returnType; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->returnType->Noop");
  } else if (isnull(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->returnType->null");
  }
  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3FunctionExpression_typeParameters; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->typeParameters->Noop");
  } else if (isnull(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionExpression->typeParameters->null");
  }
  let result: JS3FunctionExpression = generateJS3FunctionExpression(fin_id, fin_params, fin_body, fin_predicate, fin_returnType, fin_typeParameters, node);
  return result
}

export function handleNewExpression(node: NewExpression, otherProps: OtherProps): JS3NewExpression {
  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let fin_callee : JS3NewExpression_callee; // Handling prop callee
  if(isExpression (orig_callee)) {
    fin_callee = handleExpression(orig_callee, otherProps)
  } else if(isSuper (orig_callee)) {
    fin_callee = orig_callee
  } else if(isV8IntrinsicIdentifier (orig_callee)) {
    fin_callee = orig_callee
  }

  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments : JS3NewExpression_arguments = new Array(); // Handling prop arguments
  if (Array.isArray ( orig_arguments )) { 
    for (const _arrProp of orig_arguments) {
      if(isExpression (_arrProp)) {
        fin_arguments.push(handleExpression(_arrProp, otherProps))
      } else if(isSpreadElement (_arrProp)) {
        fin_arguments.push(_arrProp)
      } else if(isArgumentPlaceholder (_arrProp)) {
        fin_arguments.push(_arrProp)
      }
    }
  }

  let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
  let fin_typeArguments : JS3NewExpression_typeArguments = null; // Handling prop typeArguments
  if(isTypeParameterInstantiation (orig_typeArguments)) {
    debugConfig.logger.error("TODO // unhandled NewExpression->typeArguments->TypeParameterInstantiation");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters : JS3NewExpression_typeParameters = null; // Handling prop typeParameters
  if(isTSTypeParameterInstantiation (orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled NewExpression->typeParameters->TSTypeParameterInstantiation");
  }

  let result: JS3NewExpression = generateJS3NewExpression(fin_callee, fin_arguments, fin_typeArguments, fin_typeParameters, node)
  return result;
}

export function handleBinaryExpression(node: BinaryExpression, otherProps: OtherProps) : JS3BinaryExpression {
  // 2 fallthrough props, 2 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left : JS3BinaryExpression_left; // Handling prop left
  if(isExpression (orig_left)) {
    fin_left = handleExpression(orig_left, otherProps)
  } else if(isPrivateName (orig_left)) {
    debugConfig.logger.error("TODO // unhandled BinaryExpression->left->PrivateName");
  } 
  let orig_right = node.right; // Handling prop right
  let fin_right : JS3BinaryExpression_right; // Handling prop right
  if(isExpression (orig_right)) {
    fin_right = handleExpression(orig_right, otherProps)
  } 
  let result: JS3BinaryExpression = generateJS3BinaryExpression(fin_left, fin_right, node);
  return result
} 

export function handleLogicalExpression(node: LogicalExpression, otherProps: OtherProps) {
  // 2 fallthrough props, 2 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left : JS3LogicalExpression_left; // Handling prop left
  if(isExpression (orig_left)) {
    fin_left = handleExpression(orig_left, otherProps)
  } 
  let orig_right = node.right; // Handling prop right
  let fin_right : JS3LogicalExpression_right; // Handling prop right
  if(isExpression (orig_right)) {
    fin_right = handleExpression(orig_right, otherProps)
  } 
  let result: JS3LogicalExpression = generateJS3LogicalExpression(fin_left, fin_right, node);
  return result
}

export function handleAssignmentExpression(node: AssignmentExpression, otherProps: OtherProps) {
  // 2 fallthrough props, 2 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left : JS3AssignmentExpression_left; // Handling prop left
  if(isIdentifier (orig_left)) {
    fin_left = orig_left
  } else if(isMemberExpression (orig_left)) {
    fin_left = handleMemberExpression(orig_left, otherProps)
  } else if(isRestElement (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->RestElement");
  } else if(isAssignmentPattern (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->AssignmentPattern");
  } else if(isArrayPattern (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->ArrayPattern");
  } else if(isObjectPattern (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->ObjectPattern");
  } else if(isTSAsExpression (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->TSAsExpression");
  } else if(isTSSatisfiesExpression (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->TSSatisfiesExpression");
  } else if(isTSTypeAssertion (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->TSTypeAssertion");
  } else if(isTSNonNullExpression (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->TSNonNullExpression");
  } else if(isOptionalMemberExpression (orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->OptionalMemberExpression");
  } else if (isTSParameterProperty(orig_left)) {
    debugConfig.logger.error("TODO // unhandled AssignmentExpression->left->TSParameterProperty");
  }

  let orig_right = node.right; // Handling prop right
  let fin_right : JS3AssignmentExpression_right; // Handling prop right
  if(isExpression (orig_right)) {
    fin_right = handleExpression(orig_right, otherProps)
  } 
  let result: JS3AssignmentExpression = generateJS3AssignmentExpression(fin_left, fin_right, node);
  return result
}



export function handleUnaryExpression(node: UnaryExpression, otherProps: OtherProps) {
  // 3 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument : JS3UnaryExpression_argument; // Handling prop argument
  if(isExpression (orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps);
  } 
  let result: JS3UnaryExpression = generateJS3UnaryExpression(fin_argument, node);
  return result;
} 