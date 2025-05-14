import { isJS3ArrayExpression, isJS3ArrayPattern, isJS3AssignmentExpression, isJS3BinaryExpression, isJS3CallExpression, isJS3ConditionalExpression, isJS3ContextualCallExpression, isJS3Import, isJS3MemberExpression, isJS3ObjectExpression, isJS3ObjectPattern, isJS3PrivateName, JS3ArrayExpression, JS3AssignmentExpression, JS3AssnInit, JS3BlockStatement_body, JS3CallExpression, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3ObjectExpression } from "../JS3Helpers/JS3Types.ts";
import { IRIDIUMV2 } from "./IRIDIUMV2.ts";
import debugConfig from "#debugConfig";
import { BinopSEXP, BooleanSEXP, CallSiteSEXP, EnvReadSEXP, EnvWriteSEXP, FieldReadSEXP, FieldWriteSEXP, GotoSEXP, IfElseJumpSEXP, IridiumSEXP, JSArraySEXP, JSComputedFieldReadSEXP, JSComputedFieldWriteSEXP, JSEnvWriteSEXP, JSSpreadSEXP, NumberSEXP, ResolveEnvBindingSEXP, StringSEXP } from "./Types.ts";
import { Expression, Identifier, isArrowFunctionExpression, isClassExpression, isFunctionExpression, isIdentifier, isOptionalMemberExpression, isSpreadElement, isSuper, isThisExpression, isV8IntrinsicIdentifier } from "@babel/types";
import { handleExpression, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression.ts";
import { getArrayDestSEXP, getObjectDestSEXP, IRIV2_STMT } from "./handleStatement.ts";
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

  // // This Expression
  // else if (isThisExpression(init)) {
  //   return this.handleThisExpression(init);
  // }

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

  // // JS3FunctionExpression
  // else if (isJS3FunctionExpression(init)) {
  //   return this.handleJS3FunctionExpression(init);
  // }

  // // JS3ArrowFunctionExpression
  // else if (isJS3ArrowFunctionExpression(init)) {
  //   return this.handleJS3ArrowFunctionExpression(init);
  // }

  // JS3ArrayExpression
  else if (isJS3ArrayExpression(init)) {
    return handleArrayExpression(cx, init);
  }

  // // JS3NewExpression
  // else if (isJS3NewExpression(init)) {
  //   return this.handleJS3NewExpression(init);
  // }

  // // JS3UnaryExpression
  // else if (isJS3UnaryExpression(init)) {
  //   return this.handleJS3UnaryExpression(init);
  // }

  // // JS3UpdateExpression
  // else if (isJS3UpdateExpression(init)) {
  //   return this.handleJS3UpdateExpression(init);
  // }

  // // JS3ClassExpression
  // else if (isJS3ClassExpression(init)) {
  //   return this.handleJS3ClassExpression(init);
  // }

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
      return new JSComputedFieldWriteSEXP(obj, prop)
    } else {
      return new FieldWriteSEXP(obj, prop);
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

const handleCallExpression = (cx: IRIDIUMV2, node: JS3CallExpression) => {
  const args: Array<IridiumSEXP> = [];
  for (const a of node.arguments) {
    if (isIdentifier(a)) {
      args.push(new ResolveEnvBindingSEXP(a.name));
    } else {
      args.push(new JSSpreadSEXP(new ResolveEnvBindingSEXP(a.argument.name)));
    }
  }
  if (isIdentifier(node.callee)) {
    return new CallSiteSEXP(node.callee.name, args, []);
  } else if (isJS3Import(node.callee)) {
    return new CallSiteSEXP(null, args, [["Import", null]]);
  } else if (isSuper(node.callee)) {
    return new CallSiteSEXP(null, args, [["Super", null]]);
  } else if (isV8IntrinsicIdentifier(node.callee)) {
    return new CallSiteSEXP(null, args, [["V8Intrinsic", null]]);
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

const handleObjectExpression = (cx: IRIDIUMV2, init: JS3ObjectExpression) => {
  debugConfig.logger.throwIriError("IRIV2 TODO: JS3ObjectExpression");

  return null;
  // const args = init.properties.map((e) => {
  //   if (isJS3MemberExpression(e)) {
  //     return IRIV2_RVAL(cx, e);
  //   } else {
  //     debugConfig.logger.throwIriError("IRIV2 TODO: Object Expression Spread");
  //   }
  // });
  // return new JSObjectSEXP(args);
}