import { ClassDeclaration, isClassBody, isClassImplements, isDecorator, isExpression, isInterfaceExtends, isNoop, isTSExpressionWithTypeArguments, isTSTypeParameterDeclaration, isTSTypeParameterInstantiation, isTypeParameterDeclaration, isTypeParameterInstantiation } from "@babel/types";
import { JS3ClassDeclaration, JS3ClassDeclaration_body, JS3ClassDeclaration_decorators, JS3ClassDeclaration_implements, JS3ClassDeclaration_mixins, JS3ClassDeclaration_superClass, JS3ClassDeclaration_superTypeParameters, JS3ClassDeclaration_typeParameters } from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { JS3BuilderUtils } from "../JS3Builder.ts";
import { generateJS3ClassDeclaration } from "./JS3Constructors.ts";

import assert from 'node:assert'
import { handleExpression } from "./HandleExpression.ts";

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;

export function handleClassDeclaration(node: ClassDeclaration, otherProps: OtherProps) : JS3ClassDeclaration {
  otherProps.debugTrace.push("ClassDeclaration")
  assert(Array.isArray(otherProps.others.holder), "handleClassDeclaration expects an holder to spill intermediate values");

  // 4 fallthrough props, 7 restricted props
  let orig_superClass = node.superClass; // Handling prop superClass
  let fin_superClass : JS3ClassDeclaration_superClass = null; // Handling prop superClass
  if(isExpression (orig_superClass)) {
    otherProps.debugTrace.push("ClassDeclaration.superClass")
    // We can spill as directed by the parent class 
    fin_superClass = handleExpression(orig_superClass, otherProps)
    otherProps.debugTrace.pop()
  } 
  let orig_body = node.body; // Handling prop body
  let fin_body : JS3ClassDeclaration_body; // Handling prop body
  if(isClassBody (orig_body)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->body->ClassBody");
  } 
  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators : JS3ClassDeclaration_decorators = null; // Handling prop decorators
  if (Array.isArray ( orig_decorators )) { 
    for (const _arrProp of orig_decorators) {
      if(isDecorator (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled ClassDeclaration->[decorators]->Decorator");
      } 
    }
  }

  let orig_implements = node.implements; // Handling prop implements
  let fin_implements : JS3ClassDeclaration_implements = null; // Handling prop implements
  if (Array.isArray ( orig_implements )) { 
    for (const _arrProp of orig_implements) {
      if(isTSExpressionWithTypeArguments (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled ClassDeclaration->[implements]->TSExpressionWithTypeArguments");
      } else if(isClassImplements (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled ClassDeclaration->[implements]->ClassImplements");
      } 
    }
  }

  let orig_mixins = node.mixins; // Handling prop mixins
  let fin_mixins : JS3ClassDeclaration_mixins = null; // Handling prop mixins
  if(isInterfaceExtends (orig_mixins)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->mixins->InterfaceExtends");
  }

  let orig_superTypeParameters = node.superTypeParameters; // Handling prop superTypeParameters
  let fin_superTypeParameters : JS3ClassDeclaration_superTypeParameters = null;; // Handling prop superTypeParameters
  if(isTypeParameterInstantiation (orig_superTypeParameters)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->superTypeParameters->TypeParameterInstantiation");
  } else if(isTSTypeParameterInstantiation (orig_superTypeParameters)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->superTypeParameters->TSTypeParameterInstantiation");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters : JS3ClassDeclaration_typeParameters = null; // Handling prop typeParameters
  if(isTypeParameterDeclaration (orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->typeParameters->TypeParameterDeclaration");
  } else if(isTSTypeParameterDeclaration (orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->typeParameters->TSTypeParameterDeclaration");
  } else if(isNoop (orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled ClassDeclaration->typeParameters->Noop");
  }
  let result: JS3ClassDeclaration = generateJS3ClassDeclaration(fin_superClass, fin_body, fin_decorators, fin_implements, fin_mixins, fin_superTypeParameters, fin_typeParameters, node);
  otherProps.debugTrace.pop()
  return result
}