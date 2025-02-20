import {
  ClassBody,
  ClassDeclaration,
  ClassMethod,
  ClassPrivateMethod,
  ClassPrivateProperty,
  ClassProperty,
  isArrowFunctionExpression,
  isBigIntLiteral,
  isBlockStatement,
  isBooleanLiteral,
  isClassAccessorProperty,
  isClassExpression,
  isClassMethod,
  isClassPrivateMethod,
  isClassPrivateProperty,
  isClassProperty,
  isDecimalLiteral,
  isDecorator,
  isExpression,
  isFunctionExpression,
  isIdentifier,
  isNoop,
  isNullLiteral,
  isNumericLiteral,
  isPattern,
  isRestElement,
  isStaticBlock,
  isStringLiteral,
  isTSDeclareMethod,
  isTSIndexSignature,
  isTSParameterProperty,
  isTSTypeAnnotation,
  isTSTypeParameterDeclaration,
  isTypeAnnotation,
  isTypeParameterDeclaration,
  isVariance,
  StaticBlock,
  variableDeclaration,
  variableDeclarator,
} from "@babel/types";
import {
  generateJS3ClassBody,
  generateJS3ClassMethod,
  generateJS3ClassPrivateMethod,
  generateJS3ClassPrivateProperty,
  generateJS3ClassProperty,
  generateJS3PrivateName,
  generateJS3StaticBlock,
} from "./JS3Constructors.ts";
import {
  JS3AllowedBlockStatement,
  JS3ClassBody,
  JS3ClassBody_body,
  JS3ClassMethod,
  JS3ClassMethod_body,
  JS3ClassMethod_decorators,
  JS3ClassMethod_key,
  JS3ClassMethod_params,
  JS3ClassMethod_returnType,
  JS3ClassMethod_typeParameters,
  JS3ClassPrivateMethod,
  JS3ClassPrivateMethod_body,
  JS3ClassPrivateMethod_decorators,
  JS3ClassPrivateMethod_params,
  JS3ClassPrivateMethod_returnType,
  JS3ClassPrivateMethod_typeParameters,
  JS3ClassPrivateProperty,
  JS3ClassPrivateProperty_decorators,
  JS3ClassPrivateProperty_typeAnnotation,
  JS3ClassPrivateProperty_value,
  JS3ClassPrivateProperty_variance,
  JS3ClassProperty,
  JS3ClassProperty_decorators,
  JS3ClassProperty_key,
  JS3ClassProperty_typeAnnotation,
  JS3ClassProperty_value,
  JS3ClassProperty_variance,
  JS3StaticBlock,
  JS3StaticBlock_body,
} from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { JS3BuilderUtils } from "../JS3Builder.ts";

import { lowerComputedKey } from "./GenericConstructs.ts";
import {
  handleBlockStatement,
  handleStatement,
  handleVariableDeclaration,
} from "./HandleBlocks.ts";
import {
  handleArrowFunctionExpression,
  handleClassExpression,
  handleFunctionExpression,
} from "./HandleExpression.ts";

type OtherProps = JS3BuilderUtils;

export function handleClassDeclaration(
  node: ClassDeclaration,
  otherProps: OtherProps,
): Array<JS3AllowedBlockStatement> {
  //
  // Change : class NAME ...
  //
  // To     : const NAME = class NAME {  }
  //
  // Class declarations behave like "const" in JS.
  //
  //  They are not hoisted like other function declarations, so its safe to reduce it down to a const declaration.
  //

  //@ts-expect-error: We are processing class declaration as a class expression here.
  node.type = "ClassExpression";

  const patchedNode = variableDeclaration("const", [
    //@ts-expect-error: We are processing class declaration as a class expression here.
    variableDeclarator(node.id, node),
  ]);

  const result = handleVariableDeclaration(patchedNode, otherProps);

  node.type = "ClassDeclaration";

  return result;
}

export function handleClassBody(
  node: ClassBody,
  otherProps: OtherProps,
): JS3ClassBody {
  // 1 fallthrough props, 1 restricted props
  const orig_body = node.body; // Handling prop body
  const fin_body: JS3ClassBody_body = []; // Handling prop body
  if (Array.isArray(orig_body)) {
    for (const _arrProp of orig_body) {
      if (isClassMethod(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassMethod(_arrProp, otherProps));
        // ========================================================================================
      } else if (isClassPrivateMethod(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassPrivateMethod(_arrProp, otherProps));
        // ========================================================================================
      } else if (isClassProperty(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassProperty(_arrProp, otherProps));
        // ========================================================================================
      } else if (isClassPrivateProperty(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleClassPrivateProperty(_arrProp, otherProps));
        // ========================================================================================
      } else if (isClassAccessorProperty(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassBody->[body]->ClassAccessorProperty",
        );
      } else if (isTSDeclareMethod(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassBody->[body]->TSDeclareMethod",
        );
      } else if (isTSIndexSignature(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassBody->[body]->TSIndexSignature",
        );
      } else if (isStaticBlock(_arrProp)) {
        // ========================================================================================
        fin_body.push(handleStaticBlock(_arrProp, otherProps));
        // ========================================================================================
      }
    }
  }
  const result: JS3ClassBody = generateJS3ClassBody(fin_body, node);
  return result;
}

export function handleClassProperty(
  node: ClassProperty,
  otherProps: OtherProps,
): JS3ClassProperty {
  const oldPrefix = otherProps.others.prefix;

  // 10 fallthrough props, 5 restricted props
  const orig_key = node.key; // Handling prop key
  const fin_key: JS3ClassProperty_key = lowerComputedKey(orig_key, otherProps); // Handling prop key

  const orig_value = node.value; // Handling prop value
  let fin_value: JS3ClassProperty_value = null;

  if (isClassExpression(orig_value)) {
    fin_value = handleClassExpression(orig_value, otherProps);
  } else if (isDecimalLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isBigIntLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isStringLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isNumericLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isNullLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isBooleanLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isArrowFunctionExpression(orig_value)) {
    fin_value = handleArrowFunctionExpression(orig_value, otherProps);
  } else if (isFunctionExpression(orig_value)) {
    fin_value = handleFunctionExpression(orig_value, otherProps);
  } else if (isExpression(orig_value)) {
    fin_value = lowerComputedKey(orig_value, otherProps);
  }

  // = lowerComputedKey(orig_value, otherProps); // <-- This mostly works but breaks super call, due to scoping
  //
  // test262/test/language/expressions/class/elements/private-derived-cls-direct-eval-contains-superproperty-2.js

  const orig_typeAnnotation = node.typeAnnotation; // Handling prop typeAnnotation
  const fin_typeAnnotation: JS3ClassProperty_typeAnnotation = null; // Handling prop typeAnnotation
  if (isTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassProperty->typeAnnotation->TypeAnnotation",
    );
  } else if (isTSTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassProperty->typeAnnotation->TSTypeAnnotation",
    );
  } else if (isNoop(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassProperty->typeAnnotation->Noop",
    );
  }

  const orig_decorators = node.decorators; // Handling prop decorators
  const fin_decorators: JS3ClassProperty_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassProperty->[decorators]->Decorator",
        );
      }
    }
  }

  const orig_variance = node.variance; // Handling prop variance
  const fin_variance: JS3ClassProperty_variance = null; // Handling prop variance
  if (isVariance(orig_variance)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassProperty->variance->Variance",
    );
  }

  const result: JS3ClassProperty = generateJS3ClassProperty(
    fin_key,
    fin_value,
    fin_typeAnnotation,
    fin_decorators,
    fin_variance,
    node,
  );
  otherProps.others.prefix = oldPrefix;
  return result;
}

export function handleClassPrivateProperty(
  node: ClassPrivateProperty,
  otherProps: OtherProps,
) {
  // 5 fallthrough props, 4 restricted props
  const orig_value = node.value; // Handling prop value
  let fin_value: JS3ClassPrivateProperty_value = null;

  if (isClassExpression(orig_value)) {
    fin_value = handleClassExpression(orig_value, otherProps);
  } else if (isDecimalLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isBigIntLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isStringLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isNumericLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isNullLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isBooleanLiteral(orig_value)) {
    fin_value = orig_value;
  } else if (isArrowFunctionExpression(orig_value)) {
    fin_value = handleArrowFunctionExpression(orig_value, otherProps);
  } else if (isFunctionExpression(orig_value)) {
    fin_value = handleFunctionExpression(orig_value, otherProps);
  } else if (isExpression(orig_value)) {
    fin_value = lowerComputedKey(orig_value, otherProps);
  }

  // test262/test/language/expressions/class/elements/private-derived-cls-direct-eval-contains-superproperty-2.js

  const orig_decorators = node.decorators; // Handling prop decorators
  const fin_decorators: JS3ClassPrivateProperty_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassPrivateProperty->[decorators]->Decorator",
        );
      }
    }
  }

  const orig_typeAnnotation = node.typeAnnotation; // Handling prop typeAnnotation
  const fin_typeAnnotation: JS3ClassPrivateProperty_typeAnnotation = null; // Handling prop typeAnnotation
  if (isTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateProperty->typeAnnotation->TypeAnnotation",
    );
  } else if (isTSTypeAnnotation(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateProperty->typeAnnotation->TSTypeAnnotation",
    );
  } else if (isNoop(orig_typeAnnotation)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateProperty->typeAnnotation->Noop",
    );
  }

  const orig_variance = node.variance; // Handling prop variance
  const fin_variance: JS3ClassPrivateProperty_variance = null; // Handling prop variance
  if (isVariance(orig_variance)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateProperty->variance->Variance",
    );
  }

  const result: JS3ClassPrivateProperty = generateJS3ClassPrivateProperty(
    generateJS3PrivateName(node.key),
    fin_value,
    fin_decorators,
    fin_typeAnnotation,
    fin_variance,
    node,
  );
  return result;
}

export function handleClassMethod(
  node: ClassMethod,
  otherProps: OtherProps,
): JS3ClassMethod {
  const oldPrefix = otherProps.others.prefix;
  // 11 fallthrough props, 6 restricted props
  const orig_key = node.key; // Handling prop key
  const fin_key: JS3ClassMethod_key = lowerComputedKey(orig_key, otherProps); // Handling prop key

  const orig_params = node.params; // Handling prop params
  const fin_params: JS3ClassMethod_params = []; // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp);
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp);
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp);
      } else if (isTSParameterProperty(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassMethod->[params]->TSParameterProperty",
        );
      }
    }
  }

  const orig_body = node.body; // Handling prop body
  let fin_body: JS3ClassMethod_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps);
  }

  const orig_decorators = node.decorators; // Handling prop decorators
  const fin_decorators: JS3ClassMethod_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassMethod->[decorators]->Decorator",
        );
      }
    }
  }

  const orig_returnType = node.returnType; // Handling prop returnType
  const fin_returnType: JS3ClassMethod_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassMethod->returnType->TypeAnnotation",
    );
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassMethod->returnType->TSTypeAnnotation",
    );
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassMethod->returnType->Noop",
    );
  }

  const orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  const fin_typeParameters: JS3ClassMethod_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassMethod->typeParameters->TypeParameterDeclaration",
    );
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassMethod->typeParameters->TSTypeParameterDeclaration",
    );
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassMethod->typeParameters->Noop",
    );
  }
  const result: JS3ClassMethod = generateJS3ClassMethod(
    fin_key,
    fin_params,
    fin_body,
    fin_decorators,
    fin_returnType,
    fin_typeParameters,
    node,
  );
  otherProps.others.prefix = oldPrefix;
  return result;
}

export function handleClassPrivateMethod(
  node: ClassPrivateMethod,
  otherProps: OtherProps,
) {
  // 12 fallthrough props, 5 restricted props
  const orig_params = node.params; // Handling prop params
  const fin_params: JS3ClassPrivateMethod_params = []; // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp);
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp);
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp);
      } else if (isTSParameterProperty(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassPrivateMethod->[params]->TSParameterProperty",
        );
      }
    }
  }

  const orig_body = node.body; // Handling prop body
  let fin_body: JS3ClassPrivateMethod_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps);
  }

  const orig_decorators = node.decorators; // Handling prop decorators
  const fin_decorators: JS3ClassPrivateMethod_decorators = null; // Handling prop decorators
  if (Array.isArray(orig_decorators)) {
    for (const _arrProp of orig_decorators) {
      if (isDecorator(_arrProp)) {
        debugConfig.logger.throwJS3Error(
          "TODO // unhandled ClassPrivateMethod->[decorators]->Decorator",
        );
      }
    }
  }

  const orig_returnType = node.returnType; // Handling prop returnType
  const fin_returnType: JS3ClassPrivateMethod_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateMethod->returnType->TypeAnnotation",
    );
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateMethod->returnType->TSTypeAnnotation",
    );
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateMethod->returnType->Noop",
    );
  }

  const orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  const fin_typeParameters: JS3ClassPrivateMethod_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateMethod->typeParameters->TypeParameterDeclaration",
    );
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateMethod->typeParameters->TSTypeParameterDeclaration",
    );
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error(
      "TODO // unhandled ClassPrivateMethod->typeParameters->Noop",
    );
  }

  const result: JS3ClassPrivateMethod = generateJS3ClassPrivateMethod(
    generateJS3PrivateName(node.key),
    fin_params,
    fin_body,
    fin_decorators,
    fin_returnType,
    fin_typeParameters,
    node,
  );
  return result;
}

export function handleStaticBlock(node: StaticBlock, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  const orig_body = node.body; // Handling prop body
  const fin_body: JS3StaticBlock_body = []; // Handling prop body

  // Block Scope
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: fin_body },
  };

  for (const stmt of orig_body) {
    const blockStmt:
      | JS3AllowedBlockStatement
      | Array<JS3AllowedBlockStatement> = handleStatement(stmt, updatedProps);
    if (Array.isArray(blockStmt)) blockStmt.forEach((s) => fin_body.push(s));
    else fin_body.push(blockStmt);
  }

  const result: JS3StaticBlock = generateJS3StaticBlock(fin_body, node);
  return result;
}
