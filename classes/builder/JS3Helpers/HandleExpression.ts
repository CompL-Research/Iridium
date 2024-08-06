
import debugConfig from "#debugConfig";
import { isPrivateName, MemberExpression, CallExpression, Expression, Identifier, isArrayExpression, isArrowFunctionExpression, isAssignmentExpression, isAwaitExpression, isBigIntLiteral, isBinaryExpression, isBindExpression, isBooleanLiteral, isCallExpression, isClassExpression, isConditionalExpression, isDecimalLiteral, isDoExpression, isExpression, isFunctionExpression, isIdentifier, isImport, isImportExpression, isJSXElement, isJSXFragment, isLogicalExpression, isMemberExpression, isMetaProperty, isModuleExpression, isNewExpression, isNullLiteral, isNumericLiteral, isObjectExpression, isOptionalCallExpression, isOptionalMemberExpression, isParenthesizedExpression, isPipelineBareFunction, isPipelinePrimaryTopicReference, isPipelineTopicExpression, isRecordExpression, isRegExpLiteral, isSequenceExpression, isStringLiteral, isSuper, isTaggedTemplateExpression, isTemplateLiteral, isThisExpression, isTopicReference, isTSAsExpression, isTSInstantiationExpression, isTSNonNullExpression, isTSSatisfiesExpression, isTSTypeAssertion, isTupleExpression, isTypeCastExpression, isUnaryExpression, isUpdateExpression, isYieldExpression } from "@babel/types";
import assert from 'node:assert';
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { generateDummyJS3VariableDeclaration, generateIdentifier, generateJS3CallExpression, generateJS3MemberExpression } from "./JS3Constructors.ts";
import { JS3CallExpression, JS3CallExpression_callee, JS3MemberExpression, JS3MemberExpression_object, JS3MemberExpression_property } from "./JS3Types.ts";

import { isArgumentPlaceholder, isSpreadElement, isTSTypeParameterInstantiation, isTypeParameterInstantiation, isV8IntrinsicIdentifier } from "@babel/types";
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
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ArrayExpression`,otherProps.debugTrace);
  } else if (isAssignmentExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->AssignmentExpression`,otherProps.debugTrace);
  } else if (isBinaryExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BinaryExpression`,otherProps.debugTrace);
  } else if (isCallExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = JS3CallExpression()
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleCallExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isConditionalExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ConditionalExpression`,otherProps.debugTrace);
  } else if (isFunctionExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->FunctionExpression`,otherProps.debugTrace);
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
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->NumericLiteral`,otherProps.debugTrace);
  } else if (isNullLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->NullLiteral`,otherProps.debugTrace);
  } else if (isBooleanLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BooleanLiteral`,otherProps.debugTrace);
  } else if (isRegExpLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->RegExpLiteral`,otherProps.debugTrace);
  } else if (isLogicalExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->LogicalExpression`,otherProps.debugTrace);
  } else if (isMemberExpression(node)) {
    // ========================================================================================
    // $resultIdentifier = a.b
    resultIdentifier = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
    const init = handleMemberExpression(node, otherProps)
    const varDecl = generateDummyJS3VariableDeclaration(node, resultIdentifier, init);
    otherProps.others.holder.push(varDecl)
    // ========================================================================================
  } else if (isNewExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->NewExpression`,otherProps.debugTrace);
  } else if (isObjectExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ObjectExpression`,otherProps.debugTrace);
  } else if (isSequenceExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->SequenceExpression`,otherProps.debugTrace);
  } else if (isParenthesizedExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ParenthesizedExpression`,otherProps.debugTrace);
  } else if (isThisExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ThisExpression`,otherProps.debugTrace);
  } else if (isUnaryExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->UnaryExpression`,otherProps.debugTrace);
  } else if (isUpdateExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->UpdateExpression`,otherProps.debugTrace);
  } else if (isArrowFunctionExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ArrowFunctionExpression`,otherProps.debugTrace);
  } else if (isClassExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ClassExpression`,otherProps.debugTrace);
  } else if (isImportExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ImportExpression`,otherProps.debugTrace);
  } else if (isMetaProperty(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->MetaProperty`,otherProps.debugTrace);
  } else if (isSuper(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->Super`,otherProps.debugTrace);
  } else if (isTaggedTemplateExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TaggedTemplateExpression`,otherProps.debugTrace);
  } else if (isTemplateLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TemplateLiteral`,otherProps.debugTrace);
  } else if (isYieldExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->YieldExpression`,otherProps.debugTrace);
  } else if (isAwaitExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->AwaitExpression`,otherProps.debugTrace);
  } else if (isImport(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->Import`,otherProps.debugTrace);
  } else if (isBigIntLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BigIntLiteral`,otherProps.debugTrace);
  } else if (isOptionalMemberExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->OptionalMemberExpression`,otherProps.debugTrace);
  } else if (isOptionalCallExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->OptionalCallExpression`,otherProps.debugTrace);
  } else if (isTypeCastExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TypeCastExpression`,otherProps.debugTrace);
  } else if (isJSXElement(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->JSXElement`,otherProps.debugTrace);
  } else if (isJSXFragment(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->JSXFragment`,otherProps.debugTrace);
  } else if (isBindExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->BindExpression`,otherProps.debugTrace);
  } else if (isDoExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->DoExpression`,otherProps.debugTrace);
  } else if (isRecordExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->RecordExpression`,otherProps.debugTrace);
  } else if (isTupleExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TupleExpression`,otherProps.debugTrace);
  } else if (isDecimalLiteral(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->DecimalLiteral`,otherProps.debugTrace);
  } else if (isModuleExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->ModuleExpression`,otherProps.debugTrace);
  } else if (isTopicReference(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TopicReference`,otherProps.debugTrace);
  } else if (isPipelineTopicExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelineTopicExpression`,otherProps.debugTrace);
  } else if (isPipelineBareFunction(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelineBareFunction`,otherProps.debugTrace);
  } else if (isPipelinePrimaryTopicReference(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->PipelinePrimaryTopicReference`,otherProps.debugTrace);
  } else if (isTSInstantiationExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSInstantiationExpression`,otherProps.debugTrace);
  } else if (isTSAsExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSAsExpression`,otherProps.debugTrace);
  } else if (isTSSatisfiesExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSSatisfiesExpression`,otherProps.debugTrace);
  } else if (isTSTypeAssertion(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSTypeAssertion`,otherProps.debugTrace);
  } else if (isTSNonNullExpression(node)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}->TSNonNullExpression`,otherProps.debugTrace);
  }
  otherProps.debugTrace.pop()
  return resultIdentifier;
}

export function handleCallExpression(node: CallExpression, otherProps: OtherProps) {
  otherProps.debugTrace.push("CallExpression")
  assert(Array.isArray(otherProps.others.holder), `handleCallExpression expects an holder to spill intermediate values`);

  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let fin_callee : JS3CallExpression_callee; // Handling prop callee
  if(isExpression (orig_callee)) {
    fin_callee = handleExpression(orig_callee, otherProps)
  } else if(isSuper (orig_callee)) {
    fin_callee = orig_callee
  } else if(isV8IntrinsicIdentifier (orig_callee)) {
    fin_callee = orig_callee
  }

  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments : JS3CallExpression_arguments = new Array(); // Handling prop arguments
  if (Array.isArray ( orig_arguments )) { 
    for (const _arrProp of orig_arguments) {
      if(isExpression (_arrProp)) {
        fin_arguments.push(handleExpression(_arrProp, otherProps))
      } else if(isSpreadElement (_arrProp)) {
        debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}[arguments]->SpreadElement`);
      } else if(isArgumentPlaceholder (_arrProp)) {
        debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}[arguments]->ArgumentPlaceholder`);
      } 
    }
  }

  let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
  let fin_typeArguments : JS3CallExpression_typeArguments = null; // Handling prop typeArguments
  if(isTypeParameterInstantiation (orig_typeArguments)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}typeArguments->TypeParameterInstantiation`);
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters : JS3CallExpression_typeParameters = null; // Handling prop typeParameters
  if(isTSTypeParameterInstantiation (orig_typeParameters)) {
    debugConfig.logger.error(`TODO // unhandled ${otherProps.debugTrace.reduce((acc, curr) => acc + "->" + curr)}typeParameters->TSTypeParameterInstantiation`);
  }

  let result: JS3CallExpression = generateJS3CallExpression(fin_callee, fin_arguments, fin_typeArguments, fin_typeParameters, node);
  return result;
}

export function handleMemberExpression(node: MemberExpression, otherProps: OtherProps): JS3MemberExpression {
  
  // 3 fallthrough props, 2 restricted props
  let orig_object = node.object; // Handling prop object
  let fin_object : JS3MemberExpression_object; // Handling prop object
  if(isExpression (orig_object)) {
    fin_object = handleExpression(orig_object, otherProps)
  } else if(isSuper (orig_object)) {
    fin_object = orig_object
  }
  
  let orig_property = node.property; // Handling prop property
  let fin_property : JS3MemberExpression_property; // Handling prop property
  if(isExpression (orig_property)) {
    fin_property = handleExpression(orig_property, otherProps)
  } else if(isIdentifier (orig_property)) {
    fin_property = orig_property
  } else if(isPrivateName (orig_property)) {
    fin_property = orig_property
  } 

  let result: JS3MemberExpression = generateJS3MemberExpression(fin_object, fin_property, node);
  return result
} 