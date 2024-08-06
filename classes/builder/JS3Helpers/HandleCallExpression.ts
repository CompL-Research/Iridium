// Generated on 6/8/2024, 12:00:44 pm, generated 5 handlers 

import { CallExpression, isArgumentPlaceholder, isArrayExpression, isArrowFunctionExpression, isAssignmentExpression, isAwaitExpression, isBigIntLiteral, isBinaryExpression, isBindExpression, isBooleanLiteral, isCallExpression, isClassExpression, isConditionalExpression, isDecimalLiteral, isDoExpression, isFunctionExpression, isIdentifier, isImport, isImportExpression, isJSXElement, isJSXFragment, isLogicalExpression, isMemberExpression, isMetaProperty, isModuleExpression, isNewExpression, isNullLiteral, isNumericLiteral, isObjectExpression, isOptionalCallExpression, isOptionalMemberExpression, isParenthesizedExpression, isPipelineBareFunction, isPipelinePrimaryTopicReference, isPipelineTopicExpression, isRecordExpression, isRegExpLiteral, isSequenceExpression, isSpreadElement, isStringLiteral, isSuper, isTaggedTemplateExpression, isTemplateLiteral, isThisExpression, isTopicReference, isTSAsExpression, isTSInstantiationExpression, isTSNonNullExpression, isTSSatisfiesExpression, isTSTypeAssertion, isTSTypeParameterInstantiation, isTupleExpression, isTypeCastExpression, isTypeParameterInstantiation, isUnaryExpression, isUpdateExpression, isV8IntrinsicIdentifier, isYieldExpression, Identifier } from "@babel/types";
import { JS3CallExpression, JS3CallExpression_arguments, JS3CallExpression_callee, JS3CallExpression_typeArguments, JS3CallExpression_typeParameters } from "./JS3Types.ts";
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import assert from "node:assert";

import debugConfig from "#debugConfig";
import { generateIdentifier,  generateBaseNodeFrom, generateJS3CallExpression, generateJS3VariableDeclaration, generateDummyJS3VariableDeclaration } from "./JS3Constructors.ts";

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;

export function handleCallExpressionAndGetResultIdentifier(node: CallExpression, otherProps: OtherProps) : Identifier {
  assert(Array.isArray(otherProps.others.holder), "handleCallExpressionAndGetResultIdentifier expects an holder to spill intermediate values");
  const resultHolder = generateIdentifier(node, otherProps.getNewTemporary(otherProps.others.prefix))
  const rVal = handleCallExpression(node, otherProps)
  otherProps.others.holder.push(generateDummyJS3VariableDeclaration(node, resultHolder, rVal));
  return resultHolder
}

// Take a call expression node and return an identifier containing the result of the call expression
export function handleCallExpression(node: CallExpression, otherProps: OtherProps): JS3CallExpression {
  // 2 fallthrough props, 4 restricted props
  let orig_callee = node.callee; // Handling prop callee
  let fin_callee : JS3CallExpression_callee; // Handling prop callee
  if(isArrayExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ArrayExpression");
  } else if(isAssignmentExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->AssignmentExpression");
  } else if(isBinaryExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->BinaryExpression");
  } else if(isCallExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->CallExpression");
  } else if(isConditionalExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ConditionalExpression");
  } else if(isFunctionExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->FunctionExpression");
  } else if(isIdentifier (orig_callee)) {
    
    fin_callee = orig_callee;

  } else if(isStringLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->StringLiteral");
  } else if(isNumericLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->NumericLiteral");
  } else if(isNullLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->NullLiteral");
  } else if(isBooleanLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->BooleanLiteral");
  } else if(isRegExpLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->RegExpLiteral");
  } else if(isLogicalExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->LogicalExpression");
  } else if(isMemberExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->MemberExpression");
  } else if(isNewExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->NewExpression");
  } else if(isObjectExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ObjectExpression");
  } else if(isSequenceExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->SequenceExpression");
  } else if(isParenthesizedExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ParenthesizedExpression");
  } else if(isThisExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ThisExpression");
  } else if(isUnaryExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->UnaryExpression");
  } else if(isUpdateExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->UpdateExpression");
  } else if(isArrowFunctionExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ArrowFunctionExpression");
  } else if(isClassExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ClassExpression");
  } else if(isImportExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ImportExpression");
  } else if(isMetaProperty (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->MetaProperty");
  } else if(isSuper (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->Super");
  } else if(isTaggedTemplateExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TaggedTemplateExpression");
  } else if(isTemplateLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TemplateLiteral");
  } else if(isYieldExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->YieldExpression");
  } else if(isAwaitExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->AwaitExpression");
  } else if(isImport (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->Import");
  } else if(isBigIntLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->BigIntLiteral");
  } else if(isOptionalMemberExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->OptionalMemberExpression");
  } else if(isOptionalCallExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->OptionalCallExpression");
  } else if(isTypeCastExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TypeCastExpression");
  } else if(isJSXElement (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->JSXElement");
  } else if(isJSXFragment (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->JSXFragment");
  } else if(isBindExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->BindExpression");
  } else if(isDoExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->DoExpression");
  } else if(isRecordExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->RecordExpression");
  } else if(isTupleExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TupleExpression");
  } else if(isDecimalLiteral (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->DecimalLiteral");
  } else if(isModuleExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->ModuleExpression");
  } else if(isTopicReference (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TopicReference");
  } else if(isPipelineTopicExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->PipelineTopicExpression");
  } else if(isPipelineBareFunction (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->PipelineBareFunction");
  } else if(isPipelinePrimaryTopicReference (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->PipelinePrimaryTopicReference");
  } else if(isTSInstantiationExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TSInstantiationExpression");
  } else if(isTSAsExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TSAsExpression");
  } else if(isTSSatisfiesExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TSSatisfiesExpression");
  } else if(isTSTypeAssertion (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TSTypeAssertion");
  } else if(isTSNonNullExpression (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->TSNonNullExpression");
  } else if(isSuper (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->Super");
  } else if(isV8IntrinsicIdentifier (orig_callee)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->callee->V8IntrinsicIdentifier");
  } 
  let orig_arguments = node.arguments; // Handling prop arguments
  let fin_arguments : JS3CallExpression_arguments = new Array() // Handling prop arguments
  if (Array.isArray ( orig_arguments )) { 
    for (const _arrProp of orig_arguments) {
      if(isArrayExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ArrayExpression");
      } else if(isAssignmentExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->AssignmentExpression");
      } else if(isBinaryExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->BinaryExpression");
      } else if(isCallExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->CallExpression");
      } else if(isConditionalExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ConditionalExpression");
      } else if(isFunctionExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->FunctionExpression");
      } else if(isIdentifier (_arrProp)) {

        fin_arguments.push(_arrProp)

      } else if(isStringLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->StringLiteral");
      } else if(isNumericLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->NumericLiteral");
      } else if(isNullLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->NullLiteral");
      } else if(isBooleanLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->BooleanLiteral");
      } else if(isRegExpLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->RegExpLiteral");
      } else if(isLogicalExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->LogicalExpression");
      } else if(isMemberExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->MemberExpression");
      } else if(isNewExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->NewExpression");
      } else if(isObjectExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ObjectExpression");
      } else if(isSequenceExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->SequenceExpression");
      } else if(isParenthesizedExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ParenthesizedExpression");
      } else if(isThisExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ThisExpression");
      } else if(isUnaryExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->UnaryExpression");
      } else if(isUpdateExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->UpdateExpression");
      } else if(isArrowFunctionExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ArrowFunctionExpression");
      } else if(isClassExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ClassExpression");
      } else if(isImportExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ImportExpression");
      } else if(isMetaProperty (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->MetaProperty");
      } else if(isSuper (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->Super");
      } else if(isTaggedTemplateExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TaggedTemplateExpression");
      } else if(isTemplateLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TemplateLiteral");
      } else if(isYieldExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->YieldExpression");
      } else if(isAwaitExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->AwaitExpression");
      } else if(isImport (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->Import");
      } else if(isBigIntLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->BigIntLiteral");
      } else if(isOptionalMemberExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->OptionalMemberExpression");
      } else if(isOptionalCallExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->OptionalCallExpression");
      } else if(isTypeCastExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TypeCastExpression");
      } else if(isJSXElement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->JSXElement");
      } else if(isJSXFragment (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->JSXFragment");
      } else if(isBindExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->BindExpression");
      } else if(isDoExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->DoExpression");
      } else if(isRecordExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->RecordExpression");
      } else if(isTupleExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TupleExpression");
      } else if(isDecimalLiteral (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->DecimalLiteral");
      } else if(isModuleExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ModuleExpression");
      } else if(isTopicReference (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TopicReference");
      } else if(isPipelineTopicExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->PipelineTopicExpression");
      } else if(isPipelineBareFunction (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->PipelineBareFunction");
      } else if(isPipelinePrimaryTopicReference (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->PipelinePrimaryTopicReference");
      } else if(isTSInstantiationExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TSInstantiationExpression");
      } else if(isTSAsExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TSAsExpression");
      } else if(isTSSatisfiesExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TSSatisfiesExpression");
      } else if(isTSTypeAssertion (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TSTypeAssertion");
      } else if(isTSNonNullExpression (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->TSNonNullExpression");
      } else if(isSpreadElement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->SpreadElement");
      } else if(isArgumentPlaceholder (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled CallExpression->[arguments]->ArgumentPlaceholder");
      } 
    }
  } 
  let orig_typeArguments = node.typeArguments; // Handling prop typeArguments
  let fin_typeArguments : JS3CallExpression_typeArguments = null; // Handling prop typeArguments
  if(isTypeParameterInstantiation (orig_typeArguments)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->typeArguments->TypeParameterInstantiation");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters : JS3CallExpression_typeParameters = null; // Handling prop typeParameters
  if(isTSTypeParameterInstantiation (orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled CallExpression->typeParameters->TSTypeParameterInstantiation");
  }
  
  let result: JS3CallExpression = generateJS3CallExpression(fin_callee, fin_arguments, fin_typeArguments, fin_typeParameters, node);
  return result
}