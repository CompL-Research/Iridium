import { ClassBody, ClassDeclaration, ClassMethod, ClassPrivateMethod, ClassPrivateProperty, ClassProperty, isBlockStatement, isClassAccessorProperty, isClassBody, isClassImplements, isClassMethod, isClassPrivateMethod, isClassPrivateProperty, isClassProperty, isDecorator, isExpression, isIdentifier, isInterfaceExtends, isNoop, isPattern, isRestElement, isStaticBlock, isTSDeclareMethod, isTSExpressionWithTypeArguments, isTSIndexSignature, isTSParameterProperty, isTSTypeAnnotation, isTSTypeParameterDeclaration, isTSTypeParameterInstantiation, isTypeAnnotation, isTypeParameterDeclaration, isTypeParameterInstantiation, isVariance } from "@babel/types";
import { generateJS3ClassBody, generateJS3ClassDeclaration, generateJS3ClassMethod, generateJS3ClassPrivateMethod, generateJS3ClassPrivateProperty, generateJS3ClassProperty } from "./JS3Constructors.ts";
import { JS3ClassBody, JS3ClassBody_body, JS3ClassDeclaration, JS3ClassDeclaration_body, JS3ClassDeclaration_decorators, JS3ClassDeclaration_implements, JS3ClassDeclaration_mixins, JS3ClassDeclaration_superClass, JS3ClassDeclaration_superTypeParameters, JS3ClassDeclaration_typeParameters, JS3ClassMethod, JS3ClassMethod_body, JS3ClassMethod_decorators, JS3ClassMethod_key, JS3ClassMethod_params, JS3ClassMethod_returnType, JS3ClassMethod_typeParameters, JS3ClassPrivateMethod, JS3ClassPrivateMethod_body, JS3ClassPrivateMethod_decorators, JS3ClassPrivateMethod_params, JS3ClassPrivateMethod_returnType, JS3ClassPrivateMethod_typeParameters, JS3ClassPrivateProperty, JS3ClassPrivateProperty_decorators, JS3ClassPrivateProperty_typeAnnotation, JS3ClassPrivateProperty_value, JS3ClassPrivateProperty_variance, JS3ClassProperty, JS3ClassProperty_decorators, JS3ClassProperty_key, JS3ClassProperty_typeAnnotation, JS3ClassProperty_variance } from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { JS3BuilderUtils } from "../JS3Builder.ts";

import assert from 'node:assert';
import { lowerComputedKey } from "./GenericConstructs.ts";
import { handleBlockStatement } from "./HandleBlocks.ts";

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;



export function handleClassDeclaration(node: ClassDeclaration, otherProps: OtherProps): JS3ClassDeclaration {
  otherProps.debugTrace.push("ClassDeclaration")
  assert(Array.isArray(otherProps.others.holder), "handleClassDeclaration expects an holder to spill intermediate values");

  // 4 fallthrough props, 7 restricted props
  let orig_superClass = node.superClass; // Handling prop superClass
  let fin_superClass: JS3ClassDeclaration_superClass = null; // Handling prop superClass
  if (isExpression(orig_superClass)) {
    fin_superClass = orig_superClass
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
  let fin_body: JS3ClassDeclaration_body; // Handling prop body
  if (isClassBody(orig_body)) {
    fin_body = handleClassBody(orig_body, otherProps)
  }
  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ClassDeclaration_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->[decorators]->Decorator");
      }
    }
  }

  let orig_implements = node.implements; // Handling prop implements
  let fin_implements: JS3ClassDeclaration_implements = null; // Handling prop implements
  if (Array.isArray(orig_implements)) {
    for (const _arrProp of orig_implements) {
      if (isTSExpressionWithTypeArguments(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->[implements]->TSExpressionWithTypeArguments");
      } else if (isClassImplements(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->[implements]->ClassImplements");
      }
    }
  }

  let orig_mixins = node.mixins; // Handling prop mixins
  let fin_mixins: JS3ClassDeclaration_mixins = null; // Handling prop mixins
  if (isInterfaceExtends(orig_mixins)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->mixins->InterfaceExtends");
  }

  let orig_superTypeParameters = node.superTypeParameters; // Handling prop superTypeParameters
  let fin_superTypeParameters: JS3ClassDeclaration_superTypeParameters = null;; // Handling prop superTypeParameters
  if (isTypeParameterInstantiation(orig_superTypeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->superTypeParameters->TypeParameterInstantiation");
  } else if (isTSTypeParameterInstantiation(orig_superTypeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->superTypeParameters->TSTypeParameterInstantiation");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3ClassDeclaration_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassDeclaration->typeParameters->Noop");
  }
  let result: JS3ClassDeclaration = generateJS3ClassDeclaration(fin_superClass, fin_body, fin_decorators, fin_implements, fin_mixins, fin_superTypeParameters, fin_typeParameters, node);
  otherProps.debugTrace.pop()
  return result
}

export function handleClassBody(node: ClassBody, otherProps: OtherProps): JS3ClassBody {
  otherProps.debugTrace.push("ClassBody")
  // 1 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3ClassBody_body = new Array(); // Handling prop body
  if (Array.isArray(orig_body)) {
    for (const _arrProp of orig_body) {
      if (isClassMethod(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassMethod(_arrProp, otherProps))
        // ========================================================================================
      } else if (isClassPrivateMethod(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassPrivateMethod(_arrProp, otherProps))
        // ========================================================================================
      } else if (isClassProperty(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassProperty(_arrProp, otherProps))
        // ========================================================================================
      } else if (isClassPrivateProperty(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassPrivateProperty(_arrProp, otherProps))
        // ========================================================================================
      } else if (isClassAccessorProperty(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassBody->[body]->ClassAccessorProperty");
      } else if (isTSDeclareMethod(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassBody->[body]->TSDeclareMethod");
      } else if (isTSIndexSignature(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassBody->[body]->TSIndexSignature");
      } else if (isStaticBlock(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassBody->[body]->StaticBlock");
      }
    }
  }
  let result: JS3ClassBody = generateJS3ClassBody(fin_body, node);
  otherProps.debugTrace.pop()
  return result
}

export function handleClassProperty(node: ClassProperty, otherProps: OtherProps): JS3ClassProperty {
  otherProps.debugTrace.push("ClassProperty")

  const oldPrefix = otherProps.others.prefix

  // 10 fallthrough props, 5 restricted props
  let orig_key = node.key; // Handling prop key
  let fin_key: JS3ClassProperty_key = lowerComputedKey(orig_key, otherProps); // Handling prop key

  
  let orig_value = node.value; // Handling prop value
  let fin_value: JS3ClassPrivateProperty_value = orig_value;
  
  // = lowerComputedKey(orig_value, otherProps); // <-- This mostly works but breaks super call, due to scoping 
  // 
  // test262/test/language/expressions/class/elements/private-derived-cls-direct-eval-contains-superproperty-2.js

  
  let orig_typeAnnotation = node.typeAnnotation; // Handling prop typeAnnotation
  let fin_typeAnnotation: JS3ClassProperty_typeAnnotation = null; // Handling prop typeAnnotation
  if (isTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassProperty->typeAnnotation->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassProperty->typeAnnotation->TSTypeAnnotation");
  } else if (isNoop(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassProperty->typeAnnotation->Noop");
  }

  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ClassProperty_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassProperty->[decorators]->Decorator");
      }
    }
  }

  let orig_variance = node.variance; // Handling prop variance
  let fin_variance: JS3ClassProperty_variance = null; // Handling prop variance
  if (isVariance(orig_variance)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassProperty->variance->Variance");
  }

  let result: JS3ClassProperty = generateJS3ClassProperty(fin_key, fin_value, fin_typeAnnotation, fin_decorators, fin_variance, node);
  otherProps.debugTrace.pop()
  otherProps.others.prefix = oldPrefix
  return result
}

export function handleClassPrivateProperty(node: ClassPrivateProperty, otherProps: OtherProps) {
  // 5 fallthrough props, 4 restricted props
  let orig_value = node.value; // Handling prop value
  let fin_value: JS3ClassPrivateProperty_value = orig_value;
  
  // = lowerComputedKey(orig_value, otherProps); // <-- This mostly works but breaks super call, due to scoping 
  // 
  // test262/test/language/expressions/class/elements/private-derived-cls-direct-eval-contains-superproperty-2.js

  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ClassPrivateProperty_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateProperty->[decorators]->Decorator");
      }
    }
  }

  let orig_typeAnnotation = node.typeAnnotation; // Handling prop typeAnnotation
  let fin_typeAnnotation: JS3ClassPrivateProperty_typeAnnotation = null; // Handling prop typeAnnotation
  if (isTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateProperty->typeAnnotation->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateProperty->typeAnnotation->TSTypeAnnotation");
  } else if (isNoop(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateProperty->typeAnnotation->Noop");
  }

  let orig_variance = node.variance; // Handling prop variance
  let fin_variance: JS3ClassPrivateProperty_variance = null; // Handling prop variance
  if (isVariance(orig_variance)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateProperty->variance->Variance");
  }

  let result: JS3ClassPrivateProperty = generateJS3ClassPrivateProperty(fin_value, fin_decorators, fin_typeAnnotation, fin_variance, node);
  return result
}

export function handleClassMethod(node: ClassMethod, otherProps: OtherProps): JS3ClassMethod {
  const oldPrefix = otherProps.others.prefix
  // 11 fallthrough props, 6 restricted props
  let orig_key = node.key; // Handling prop key
  let fin_key: JS3ClassMethod_key = lowerComputedKey(orig_key, otherProps); // Handling prop key

  let orig_params = node.params; // Handling prop params
  let fin_params: JS3ClassMethod_params = new Array(); // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isTSParameterProperty(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->[params]->TSParameterProperty");
      }
    }
  }

  let orig_body = node.body; // Handling prop body
  let fin_body: JS3ClassMethod_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
  }

  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators: JS3ClassMethod_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->[decorators]->Decorator");
      }
    }
  }

  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3ClassMethod_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->returnType->Noop");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3ClassMethod_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassMethod->typeParameters->Noop");
  }
  let result: JS3ClassMethod = generateJS3ClassMethod(fin_key, fin_params, fin_body, fin_decorators, fin_returnType, fin_typeParameters, node);
  otherProps.others.prefix = oldPrefix
  return result
}

export function handleClassPrivateMethod(node: ClassPrivateMethod, otherProps: OtherProps) {
  // 12 fallthrough props, 5 restricted props
  let orig_params = node.params; // Handling prop params
  let fin_params : JS3ClassPrivateMethod_params = new Array(); // Handling prop params
  if (Array.isArray ( orig_params )) { 
    for (const _arrProp of orig_params) {
      if(isIdentifier (_arrProp)) {
        fin_params.push(_arrProp)
      } else if(isPattern (_arrProp)) {
        fin_params.push(_arrProp)
      } else if(isRestElement (_arrProp)) {
        fin_params.push(_arrProp)
      } else if(isTSParameterProperty (_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->[params]->TSParameterProperty");
      }
    }
  }

  let orig_body = node.body; // Handling prop body
  let fin_body : JS3ClassPrivateMethod_body; // Handling prop body
  if(isBlockStatement (orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
  }

  let orig_decorators = node.decorators; // Handling prop decorators
  let fin_decorators : JS3ClassPrivateMethod_decorators = null; // Handling prop decorators
  if (Array.isArray ( orig_decorators )) { 
    for (const _arrProp of orig_decorators) {
      if(isDecorator (_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->[decorators]->Decorator");
      }
    }
  }

  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType : JS3ClassPrivateMethod_returnType = null; // Handling prop returnType
  if(isTypeAnnotation (orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->returnType->TypeAnnotation");
  } else if(isTSTypeAnnotation (orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->returnType->TSTypeAnnotation");
  } else if(isNoop (orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->returnType->Noop");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters : JS3ClassPrivateMethod_typeParameters = null; // Handling prop typeParameters
  if(isTypeParameterDeclaration (orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->typeParameters->TypeParameterDeclaration");
  } else if(isTSTypeParameterDeclaration (orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->typeParameters->TSTypeParameterDeclaration");
  } else if(isNoop (orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ClassPrivateMethod->typeParameters->Noop");
  }

  let result: JS3ClassPrivateMethod = generateJS3ClassPrivateMethod(fin_params, fin_body, fin_decorators, fin_returnType, fin_typeParameters, node);
  return result
}
