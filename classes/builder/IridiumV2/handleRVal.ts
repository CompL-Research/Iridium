import { isJS3ArrayExpression, isJS3ArrayPattern, isJS3ArrowFunctionExpression, isJS3AssignmentExpression, isJS3BinaryExpression, isJS3CallExpression, isJS3ClassExpression, isJS3ClassMethod, isJS3ClassPrivateMethod, isJS3ClassPrivateProperty, isJS3ClassProperty, isJS3ConditionalExpression, isJS3ContextualCallExpression, isJS3FunctionExpression, isJS3Import, isJS3MemberExpression, isJS3NewExpression, isJS3ObjectExpression, isJS3ObjectMethod, isJS3ObjectPattern, isJS3ObjectProperty, isJS3PrivateName, isJS3StaticBlock, JS3ArrayExpression, JS3ArrowFunctionExpression, JS3AssignmentExpression, JS3AssnInit, JS3BlockStatement_body, JS3CallExpression, JS3ClassExpression, JS3ClassMethod, JS3ClassProperty, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3FunctionExpression, JS3NewExpression, JS3ObjectExpression, JS3ObjectMethod } from "../JS3Helpers/JS3Types.ts";
import { IRIDIUMV2 } from "./IRIDIUMV2.ts";
import debugConfig from "#debugConfig";
import { BinopSEXP, BooleanSEXP, CallSiteSEXP, EnvReadSEXP, EnvWriteSEXP, FieldReadSEXP, FieldWriteSEXP, GlobalBindingSEXP, GotoSEXP, IfElseJumpSEXP, IridiumSEXP, JSArraySEXP, JSCheckConstructorSEXP, JSClassSEXP, JSComputedFieldReadSEXP, JSComputedFieldWriteSEXP, JSComputedObjectMethodSEXP, JSComputedObjectPropSEXP, JSEnvWriteSEXP, JSNUBDSEXP, JSObjectMethodSEXP, JSObjectPropSEXP, JSObjectSEXP, JSSpreadSEXP, JSThisContextSEXP, JSTHISINITSEXP, LambdaSEXP, NumberSEXP, ResolveEnvBindingSEXP, ReturnSEXP, StringSEXP } from "./Types.ts";
import { assignmentExpression, BigIntLiteral, Expression, identifier, Identifier, isArrowFunctionExpression, isBigIntLiteral, isBooleanLiteral, isClassExpression, isDecimalLiteral, isFunctionExpression, isIdentifier, isNullLiteral, isNumericLiteral, isOptionalMemberExpression, isSpreadElement, isStringLiteral, isSuper, isThisExpression, isV8IntrinsicIdentifier, memberExpression, NumericLiteral, StringLiteral, thisExpression } from "@babel/types";
import { handleExpression, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression.ts";
import { getArrayDestSEXP, getObjectDestSEXP, IRIV2_STMT, lowerArgumentInit } from "./handleStatement.ts";
import { handleMemberAssignment } from "../IridiumHelpers/Passes/PTA-UOW/PTA/handlers.ts";

// Handle RValues | AMP
export const IRIV2_RVAL = (cx: IRIDIUMV2, init: JS3AssnInit): IridiumSEXP => {


  //
  // AMP
  //
  if (isIdentifier(init)) {
    return new EnvReadSEXP(init.name);
  } else if (isJS3MemberExpression(init)) {
    let obj: string;
    let prop: string;

    if (isIdentifier(init.object)) {
      obj = init.object.name;
    } else if (isThisExpression(init.object)) {
      obj = "this";
    } else {
      obj = "super";
    }

    if (isIdentifier(init.property)) {
      prop = init.property.name;
    } else {
      prop = "#" + init.property.id.name;
    }

    if (init.computed) {
      return new JSComputedFieldReadSEXP(obj, prop)
    } else {
      return new FieldReadSEXP(obj, prop);
    }
  }

  //
  // RValues
  //
  // Handle Literals
  if (init.type === "DecimalLiteral") {
    debugConfig.logger.throwIriError("IRIV2 TODO: Decimal Literal");
  } else if (init.type === "BigIntLiteral") {
    debugConfig.logger.throwIriError("IRIV2 TODO: BigInt Literal");
  } else if (init.type === "StringLiteral") {
    return new StringSEXP(init.value);
  } else if (init.type === "NumericLiteral") {
    return new NumberSEXP(init.value);
  } else if (init.type === "NullLiteral") {
    debugConfig.logger.throwIriError("IRIV2 TODO: NULL Literal");
  } else if (init.type === "BooleanLiteral") {
    return new BooleanSEXP(init.value);
  }

  // // JS3RegExp Literal
  // else if (isJS3RegExpLiteral(init)) {
  //   return this.handleJS3RegExpLiteral(init);
  // }

  // // JS3Template Literal
  // else if (isJS3TemplateLiteral(init)) {
  //   return this.handleJS3TemplateLiteral(init);
  // }

  // // JS3TaggedTemplateExpression
  // else if (isJS3TaggedTemplateExpression(init)) {
  //   return this.handleJS3TaggedTemplateExpression(init);
  // }

  // // JS3Meta Property
  // else if (isJS3MetaProperty(init)) {
  //   return this.handleJS3MetaProperty(init);
  // }

  // // JS3YieldExpression / JS3AwaitExpression
  // else if (isJS3YieldExpression(init)) {
  //   return this.handleJS3YieldExpression(init);
  // } else if (isJS3AwaitExpression(init)) {
  //   return this.handleJS3AwaitExpression(init);
  // }

  // This Expression
  else if (isThisExpression(init)) {
    return new EnvReadSEXP("this");
  }

  // JS3CallExpression
  else if (isJS3CallExpression(init)) {
    return handleCallExpression(cx, init);
  }

  // // JS3JSXCallExpression
  // else if (isJS3JSXCallExpression(init)) {
  //   return this.handleJS3JSXCallExpression(init);
  // }

  // JS3ContextualCallExpression
  else if (isJS3ContextualCallExpression(init)) {
    return handleContextualCallExpression(cx, init);
  }

  // JS3BinaryExpression
  else if (isJS3BinaryExpression(init)) {
    let left: IridiumSEXP;
    if (isJS3PrivateName(init.left)) {
      left = new EnvReadSEXP("#" + init.left.id.name);
    } else left = IRIV2_RVAL(cx, init.left);

    return new BinopSEXP(init.operator, left, IRIV2_RVAL(cx, init.right));
  }

  // JS3AssignmentExpression
  else if (isJS3AssignmentExpression(init)) {
    return handleAssignmentExpression(cx, init);
  }

  // JS3ConditionalExpression
  else if (isJS3ConditionalExpression(init)) {
    return handleConditionalExpression(cx, init);
  }

  // JS3ObjectExpression
  else if (isJS3ObjectExpression(init)) {
    return handleObjectExpression(cx, init);
  }

  // JS3FunctionExpression
  else if (isJS3FunctionExpression(init)) {
    return handleFunctionExpression(cx, init);
  }

  // JS3ArrowFunctionExpression
  else if (isJS3ArrowFunctionExpression(init)) {
    return handleArrowFunctionExpression(cx, init);
  }

  // JS3ArrayExpression
  else if (isJS3ArrayExpression(init)) {
    return handleArrayExpression(cx, init);
  }

  // JS3NewExpression
  else if (isJS3NewExpression(init)) {
    return handleNewExpression(cx, init);
  }

  // // JS3UnaryExpression
  // else if (isJS3UnaryExpression(init)) {
  //   return this.handleJS3UnaryExpression(init);
  // }

  // // JS3UpdateExpression
  // else if (isJS3UpdateExpression(init)) {
  //   return this.handleJS3UpdateExpression(init);
  // }

  // JS3ClassExpression
  else if (isJS3ClassExpression(init)) {
    return handleClassExpression(cx, init);
  }

  // //
  // // Handlers
  // //

  // // OptionalMemberExpression | OptionalCallExpression
  // else if (
  //   isOptionalMemberExpression(init) ||
  //   isOptionalCallExpression(init)
  // ) {
  //   return this.handleOptionalChainExpression(init);
  // }

  // // JS3AnonMemberExpression
  // else if (isJS3AnonMemberExpression(init)) {
  //   return this.handleJS3AnonMemberExpression(init);
  // }

  // // JS3DefaultExportMemberExpression
  // else if (isJS3DefaultExportMemberExpression(init)) {
  //   return this.handleJS3DefaultExportMemberExpression(init);
  // }

  debugConfig.logger.throwIriError(// @ts-ignore
    `IRIDIUM: Unhandled RVAL ${init.type}, ${init.js3type ? init.js3type : undefined}`,
  );
  return null;
}

const allocateComputedPropSpaces = (cx: IRIDIUMV2, node: JS3ClassExpression): Map<JS3ClassProperty | JS3ClassMethod, string> => {
  const computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod, string> = new Map();
  for (let classItem of node.body.body) {
    if (isJS3ClassProperty(classItem) || isJS3ClassMethod(classItem)) {
      if (classItem.computed) {
        let targetID = cx.js3Builder.utils.getNewTemporary("computedProp");
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(targetID), null, "JSLET"));
        computedPropMapping.set(classItem, targetID);
      }
    } else if (isJS3ClassPrivateProperty(classItem) || isJS3ClassPrivateMethod(classItem)) {
      debugConfig.logger.throwIriError("Private Fields and methods not yet handled");
    }
  }
  return computedPropMapping;
}

const createNameInitClosure = (cx: IRIDIUMV2, node: JS3ClassExpression, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod, string>) => {
  let targetID = cx.js3Builder.utils.getNewTemporary("nameInitClosure");
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(targetID), null, "JSLET"));

  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBBIdx = funcContext.getCurrentBB().idx;

  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("this"), new GlobalBindingSEXP("undefined"), "JSCONST"));
  if (isIdentifier(node.id))
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(node.id.name), new JSNUBDSEXP(), "JSCONST"));

  for (let classItem of node.body.body) {
    if (isJS3StaticBlock(classItem)) {
      continue;
    } else if (isJS3ClassProperty(classItem) || isJS3ClassMethod(classItem)) {
      if (classItem.computed) {
        if (!computedPropMapping.has(classItem)) debugConfig.logger.throwIriError("Expected computed props to have a location already allocated...");
        const computedPropLoc = computedPropMapping.get(classItem);
        const keyLoweredTo = lowerExprToResolveEnvBindingSEXP(cx, classItem.key);
        cx.getCurrentBB().args.push(new EnvWriteSEXP(computedPropLoc, new EnvReadSEXP(keyLoweredTo.getBindingName())));
      }
    } else if (isJS3ClassPrivateProperty(classItem) || isJS3ClassPrivateMethod(classItem)) {
      debugConfig.logger.throwIriError("Private Fields and methods not yet handled");
    }
  }
  cx.getCurrentBB().args.push(new ReturnSEXP(new GlobalBindingSEXP("undefined")));
  cx.popContext();
  cx.getCurrentBB().args.push(new EnvWriteSEXP(targetID, new LambdaSEXP(funBBIdx)));

  return targetID;
}

const createInstanceFieldInitClosure = (cx: IRIDIUMV2, node: JS3ClassExpression, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod, string>): string => {
  let targetID = cx.js3Builder.utils.getNewTemporary("classInstanceFieldsInit");
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(targetID), null, "JSLET"));

  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBBIdx = funcContext.getCurrentBB().idx;

  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  for (let classItem of node.body.body) {
    if (isJS3StaticBlock(classItem)) {
      continue;
    } else if (isJS3ClassProperty(classItem)) {
      if (!classItem.static) {
        let memberExpr;
        if (classItem.computed) {
          memberExpr = memberExpression(thisExpression(), identifier(computedPropMapping.get(classItem)), true);
        } else {
          let lookupField: string;
          // Identifier | DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | OptionalCallExpression | OptionalMemberExpression | Expression
          if (isIdentifier(classItem.key)) lookupField = classItem.key.name;
          else if (isDecimalLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isBigIntLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isStringLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNumericLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNullLiteral(classItem.key)) lookupField = "null";
          else if (isBooleanLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else debugConfig.logger.throwIriError("Unhandled static lookup field name");
          memberExpr = memberExpression(thisExpression(), identifier(lookupField), false);
        }

        lowerExprToResolveEnvBindingSEXP(cx, assignmentExpression("=", memberExpr, classItem.value));
      }
    } else if (isJS3ClassMethod(classItem)) {
      if (!classItem.static) {
        if (classItem.computed) {
          cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP("this", computedPropMapping.get(classItem), handleFunctionExpression(cx, classItem)));
        } else {
          let lookupField: string;
          // Identifier | DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | OptionalCallExpression | OptionalMemberExpression | Expression
          if (isIdentifier(classItem.key)) lookupField = classItem.key.name;
          else if (isDecimalLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isBigIntLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isStringLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNumericLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNullLiteral(classItem.key)) lookupField = "null";
          else if (isBooleanLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else debugConfig.logger.throwIriError("Unhandled static lookup field name");
          cx.getCurrentBB().args.push(new FieldWriteSEXP("this", lookupField, handleFunctionExpression(cx, classItem)));
        }
      }
    } else if (isJS3ClassPrivateProperty(classItem) || isJS3ClassPrivateMethod(classItem)) {
      debugConfig.logger.throwIriError("Private Fields and methods not yet handled");
    }
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new GlobalBindingSEXP("undefined")));
  cx.popContext();

  cx.getCurrentBB().args.push(new EnvWriteSEXP(targetID, new LambdaSEXP(funBBIdx)));

  return targetID;
}

const createClassConstructorClosure = (cx: IRIDIUMV2, node: JS3ClassExpression, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod, string>): LambdaSEXP => {
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.isConstructor = true;
  const funBBIdx = funcContext.getCurrentBB().idx;

  cx.getCurrentBB().args.push(new JSThisContextSEXP());
  cx.getCurrentBB().args.push(new JSCheckConstructorSEXP());

  let constructorFunc: JS3ClassMethod = undefined;

  // Prop Init code
  for (let classItem of node.body.body) {
    if (isJS3StaticBlock(classItem)) {
      continue;
    } else if (isJS3ClassProperty(classItem)) {
      if (!classItem.static) {
        let memberExpr;
        if (classItem.computed) {
          memberExpr = memberExpression(thisExpression(), identifier(computedPropMapping.get(classItem)), true);
        } else {
          let lookupField: string;
          // Identifier | DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | OptionalCallExpression | OptionalMemberExpression | Expression
          if (isIdentifier(classItem.key)) lookupField = classItem.key.name;
          else if (isDecimalLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isBigIntLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isStringLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNumericLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNullLiteral(classItem.key)) lookupField = "null";
          else if (isBooleanLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else debugConfig.logger.throwIriError("Unhandled static lookup field name");
          memberExpr = memberExpression(thisExpression(), identifier(lookupField), false);
        }

        lowerExprToResolveEnvBindingSEXP(cx, assignmentExpression("=", memberExpr, classItem.value));
      }
    } else if (isJS3ClassMethod(classItem)) {
      if (classItem.kind === "constructor") { constructorFunc = classItem; continue; }
      if (!classItem.static) {
        if (classItem.computed) {
          cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP("this", computedPropMapping.get(classItem), handleFunctionExpression(cx, classItem)));
        } else {
          let lookupField: string;
          // Identifier | DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | OptionalCallExpression | OptionalMemberExpression | Expression
          if (isIdentifier(classItem.key)) lookupField = classItem.key.name;
          else if (isDecimalLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isBigIntLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isStringLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNumericLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else if (isNullLiteral(classItem.key)) lookupField = "null";
          else if (isBooleanLiteral(classItem.key)) lookupField = "" + classItem.key.value;
          else debugConfig.logger.throwIriError("Unhandled static lookup field name");
          cx.getCurrentBB().args.push(new FieldWriteSEXP("this", lookupField, handleFunctionExpression(cx, classItem)));
        }
      }
    } else if (isJS3ClassPrivateProperty(classItem) || isJS3ClassPrivateMethod(classItem)) {
      debugConfig.logger.throwIriError("Private Fields and methods not yet handled");
    }
  }
  
  // Lower constructor code
  if (constructorFunc) {
    for (let item of constructorFunc.body.body) {
      IRIV2_STMT(cx, item);
    }
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new GlobalBindingSEXP("undefined")));
  cx.popContext();

  return new LambdaSEXP(funBBIdx);
}

const handleClassExpression = (cx: IRIDIUMV2, node: JS3ClassExpression): IridiumSEXP => {
  if (node.superClass) debugConfig.logger.throwIriError("Super class not yet supported");
  // 1. [top level] Allocate locations to store names of computed fields
  // 2. [closure + call] Initialize computed field name locations (this = undefined, className? = NUBD)
  // 4. [closure] constructor = Instance Field Init + constructor code
  // 5. Create class object
  // 5. [closure + call] Initialize Static members

  const computedPropMapping = allocateComputedPropSpaces(cx, node);
  const nameInitClosure = createNameInitClosure(cx, node, computedPropMapping);
  cx.getCurrentBB().args.push(new CallSiteSEXP([new EnvReadSEXP(nameInitClosure)], []));
  const constructorLambda = createClassConstructorClosure(cx, node, computedPropMapping);

  return new JSClassSEXP(node.id ? node.id.name : "", new GlobalBindingSEXP("undefined"), constructorLambda);
}

const lowerExprToResolveEnvBindingSEXP = (cx: IRIDIUMV2, from: JS3ContainedExprKey | Expression) => {
  // Generate 3JS code
  const otherProps = cx.js3Builder.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };

  let exprRes: Identifier;

  if (
    isFunctionExpression(from) ||
    isArrowFunctionExpression(from) ||
    isClassExpression(from)
  ) {
    exprRes = lowerToAnonArrayExpr(from, updatedProps);
  } else {
    exprRes = handleExpression(from, updatedProps);
  }

  for (const s of js3SpillHolder) {
    IRIV2_STMT(cx, s);
  }

  return new ResolveEnvBindingSEXP(exprRes.name);
}

const handleConditionalExpression = (cx: IRIDIUMV2, node: JS3ConditionalExpression) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  const resHolder = cx.js3Builder.utils.getNewTemporary("conditionalResult");
  currentBB.args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(resHolder), new EnvReadSEXP("undefined"), "JSLET"));

  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();
  let trueVal = lowerExprToResolveEnvBindingSEXP(cx, node.consequent);
  cx.getCurrentBB().args.push(new EnvWriteSEXP(resHolder, trueVal));
  cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
  cx.popContext();

  // Lower Else code
  const falseContext = cx.declareAndPushLexicalContext();
  let falseVal = lowerExprToResolveEnvBindingSEXP(cx, node.alternate);
  cx.getCurrentBB().args.push(new EnvWriteSEXP(resHolder, falseVal));
  cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
  cx.popContext();

  // Make branch check the last instruction of currentBB
  const ifElseJump = new IfElseJumpSEXP(new EnvReadSEXP(node.test.name), trueContext.BB[0].idx, falseContext.BB[0].idx);
  currentBB.args.push(ifElseJump);

  return new ResolveEnvBindingSEXP(resHolder);
}

const handleAssignmentExpression = (cx: IRIDIUMV2, node: JS3AssignmentExpression) => {
  const left = node.left;
  const right = node.right;

  // case a.
  // ID = RVal
  if (isIdentifier(left)) {
    return new EnvWriteSEXP(left.name, IRIV2_RVAL(cx, right));
  }

  // case b.
  // ID.ID = RVal
  if (isJS3MemberExpression(left)) {
    let init = left;

    let obj: string;
    let prop: string;

    if (isIdentifier(init.object)) {
      obj = init.object.name;
    } else if (isThisExpression(init.object)) {
      obj = "this";
    } else {
      obj = "super";
    }

    if (isIdentifier(init.property)) {
      prop = init.property.name;
    } else {
      prop = "#" + init.property.id.name;
    }

    if (init.computed) {
      return new JSComputedFieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right))
    } else {
      return new FieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right));
    }
  }

  // [ ID, ...ID ] = RVal
  if (isJS3ArrayPattern(left)) {
    const rValTarget = IRIV2_RVAL(cx, right)
    const [lvals, hasRest] = getArrayDestSEXP(left);
    const envWrite = new JSEnvWriteSEXP(lvals, rValTarget);
    if (hasRest) envWrite.flags.push(["JSREST", null]);
    envWrite.flags.push(["JSARRDES", null]);
    return envWrite;
  }

  // { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(left)) {
    const rValTarget = IRIV2_RVAL(cx, right)
    const [lvals, hasRest] = getObjectDestSEXP(left);
    const envWrite = new JSEnvWriteSEXP(lvals, rValTarget);
    if (hasRest) envWrite.flags.push(["JSREST", null]);
    envWrite.flags.push(["JSOBJDES", null])
    return envWrite;
  }
}

const handleFunctionExpression = (cx: IRIDIUMV2, node: JS3FunctionExpression | JS3ObjectMethod | JS3ClassMethod) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBB = funcContext.getCurrentBB();
  const funBBIdx = funBB.idx;

  lowerArgumentInit(cx, node.params);

  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  for (const s of node.body.body) {
    IRIV2_STMT(cx, s);
  }
  cx.popContext();

  return new LambdaSEXP(funBBIdx);
}

const handleNewExpression = (cx: IRIDIUMV2, node: JS3NewExpression) => {
  const args: Array<IridiumSEXP> = [];
  if (isIdentifier(node.callee)) {
    args.push(new ResolveEnvBindingSEXP(node.callee.name));
  } else if (isSuper(node.callee)) {
    args.push(new ResolveEnvBindingSEXP("super"));
  } else if (isV8IntrinsicIdentifier(node.callee)) {
    args.push(new ResolveEnvBindingSEXP(node.callee.name));
  }
  for (const a of node.arguments) {
    if (isIdentifier(a)) {
      args.push(new ResolveEnvBindingSEXP(a.name));
    } else {
      args.push(new JSSpreadSEXP(new ResolveEnvBindingSEXP(a.argument.name)));
    }
  }
  if (isIdentifier(node.callee)) {
    return new CallSiteSEXP(args, [["ConstructorCall", null]]);
  } else if (isSuper(node.callee)) {
    return new CallSiteSEXP(args, [["Super", null], ["ConstructorCall", null]]);
  } else if (isV8IntrinsicIdentifier(node.callee)) {
    return new CallSiteSEXP(args, [["V8Intrinsic", null], ["ConstructorCall", null]]);
  }
  debugConfig.logger.throwIriError("New Call Expression Unreachable Case...");
}

const handleArrowFunctionExpression = (cx: IRIDIUMV2, node: JS3ArrowFunctionExpression) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBB = funcContext.getCurrentBB();
  const funBBIdx = funBB.idx;

  lowerArgumentInit(cx, node.params);

  for (const s of node.body.body) {
    IRIV2_STMT(cx, s);
  }
  cx.popContext();

  return new LambdaSEXP(funBBIdx);
}

const handleCallExpression = (cx: IRIDIUMV2, node: JS3CallExpression) => {
  const args: Array<IridiumSEXP> = [];
  if (isIdentifier(node.callee)) {
    args.push(new ResolveEnvBindingSEXP(node.callee.name));
  } else if (isJS3Import(node.callee)) {
    args.push(new ResolveEnvBindingSEXP("import"));
  } else if (isSuper(node.callee)) {
    args.push(new ResolveEnvBindingSEXP("super"));
  } else if (isV8IntrinsicIdentifier(node.callee)) {
    args.push(new ResolveEnvBindingSEXP(node.callee.name));
  }

  for (const a of node.arguments) {
    if (isIdentifier(a)) {
      args.push(new ResolveEnvBindingSEXP(a.name));
    } else {
      args.push(new JSSpreadSEXP(new ResolveEnvBindingSEXP(a.argument.name)));
    }
  }
  if (isIdentifier(node.callee)) {
    return new CallSiteSEXP(args, []);
  } else if (isJS3Import(node.callee)) {
    return new CallSiteSEXP(args, [["Import", null]]);
  } else if (isSuper(node.callee)) {
    return new CallSiteSEXP(args, [["Super", null]]);
  } else if (isV8IntrinsicIdentifier(node.callee)) {
    return new CallSiteSEXP(args, [["V8Intrinsic", null]]);
  }
  debugConfig.logger.throwIriError("Call Expression Unreachable Case...");
}

const handleContextualCallExpression = (cx: IRIDIUMV2, node: JS3ContextualCallExpression) => {
  const tempHolder = cx.js3Builder.utils.getNewTemporary("ccallCallee");
  const callee = new ResolveEnvBindingSEXP(tempHolder);
  const stmt = new JSEnvWriteSEXP(callee, IRIV2_RVAL(cx, node.callee), "JSLET");
  let contextObj;
  if (isJS3MemberExpression(node.callee)) {
    if (isIdentifier(node.callee.object)) {
      contextObj = node.callee.object.name;
    } else if (isThisExpression(node.callee.object)) {
      debugConfig.logger.throwIriError("this contextual call expressions are not supported yet.");
    } else {
      debugConfig.logger.throwIriError("super contextual call expressions are not supported yet.");
    }
  } else {
    debugConfig.logger.throwIriError("Optional callees in contextual call expressions are not supported yet.");
  }

  cx.getCurrentBB().args.push(stmt);

  const args: Array<IridiumSEXP> = [];
  args.push(new EnvReadSEXP(contextObj));
  if (callee) args.push(new ResolveEnvBindingSEXP(tempHolder));

  for (const a of node.arguments) {
    if (isIdentifier(a)) {
      args.push(new ResolveEnvBindingSEXP(a.name));
    } else if (isSpreadElement(a)) {
      args.push(new JSSpreadSEXP(lowerExprToResolveEnvBindingSEXP(cx, a.argument)));
    } else {
      args.push(lowerExprToResolveEnvBindingSEXP(cx, a));
    }
  }
  return new CallSiteSEXP(args, [["CCall", null]]);
}

const handleArrayExpression = (cx: IRIDIUMV2, init: JS3ArrayExpression) => {
  const args = init.elements.map((e) => {
    if (isIdentifier(e)) {
      return IRIV2_RVAL(cx, e);
    } else {
      debugConfig.logger.throwIriError("IRIV2 TODO: Array Expression Spread");
    }
  });
  return new JSArraySEXP(args);
}

// Identifier | StringLiteral | NumericLiteral | BigIntLiteral -> string
const getObjKeyString = (key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral): string => {
  if (isIdentifier(key)) return key.name
  else return '' + key.value
}

const handleObjectExpression = (cx: IRIDIUMV2, init: JS3ObjectExpression) => {
  const args = init.properties.map((e) => {
    // JS3ObjectMethod | JS3ObjectProperty | JS3SpreadElement
    if (isJS3ObjectMethod(e)) {
      if (e.computed) {
        e.kind
        return new JSComputedObjectMethodSEXP(IRIV2_RVAL(cx, e.key), handleFunctionExpression(cx, e), e.kind);
      } else {
        return new JSObjectMethodSEXP(getObjKeyString(e.key), handleFunctionExpression(cx, e), e.kind);
      }
    } else if (isJS3ObjectProperty(e)) {
      if (e.computed) {
        return new JSComputedObjectPropSEXP(IRIV2_RVAL(cx, e.key), IRIV2_RVAL(cx, e.value));
      } else {
        return new JSObjectPropSEXP(getObjKeyString(e.key), IRIV2_RVAL(cx, e.value));
      }
    } else {
      debugConfig.logger.throwIriError("IRIV2 TODO: Object Expression Spread");
    }
  });
  return new JSObjectSEXP(args);
}