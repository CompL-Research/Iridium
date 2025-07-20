import { assignmentExpression, BigIntLiteral, Expression, identifier, Identifier, isArrowFunctionExpression, isBigIntLiteral, isBooleanLiteral, isClassExpression, isDecimalLiteral, isFunctionExpression, isIdentifier, isNullLiteral, isNumericLiteral, isSpreadElement, isStringLiteral, isSuper, isThisExpression, isV8IntrinsicIdentifier, memberExpression, NumericLiteral, StringLiteral, thisExpression } from "@babel/types";
import { handleExpression, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression";
import { isJS3AnonMemberExpression, isJS3ArrayExpression, isJS3ArrayPattern, isJS3ArrowFunctionExpression, isJS3AssignmentExpression, isJS3AssnObjectProperty, isJS3AwaitExpression, isJS3BinaryExpression, isJS3CallExpression, isJS3ClassExpression, isJS3ClassMethod, isJS3ClassPrivateMethod, isJS3ClassPrivateProperty, isJS3ClassProperty, isJS3ConditionalExpression, isJS3ContextualCallExpression, isJS3FunctionExpression, isJS3Import, isJS3MemberExpression, isJS3MetaProperty, isJS3NewExpression, isJS3ObjectExpression, isJS3ObjectMethod, isJS3ObjectPattern, isJS3ObjectProperty, isJS3PrivateName, isJS3RegExpLiteral, isJS3RestElement, isJS3SpreadElement, isJS3StaticBlock, isJS3TemplateLiteral, isJS3UnaryExpression, isJS3UpdateExpression, isJS3VariableDeclaration, isJS3YieldExpression, JS3ArrayExpression, JS3ArrayPattern_elements, JS3ArrowFunctionExpression, JS3AssignmentExpression, JS3AssnInit, JS3AwaitExpression, JS3BlockStatement_body, JS3CallExpression, JS3ClassExpression, JS3ClassMethod, JS3ClassPrivateMethod, JS3ClassPrivateProperty, JS3ClassProperty, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3FunctionExpression, JS3NewExpression, JS3ObjectExpression, JS3ObjectMethod, JS3ObjectPattern_properties, JS3RestElement, JS3UnaryExpression, JS3UpdateExpression, JS3YieldExpression } from "../JS3Helpers/JS3Types";
import { funArgLength, handleBlockStatement, IRIV2_STMT, lowerArgumentInit } from "./handleStatement";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2";
import { AwaitSEXP, BinopSEXP, BitIntSEXP, BooleanSEXP, CallSiteSEXP, EnvReadSEXP, EnvWriteSEXP, FieldReadSEXP, FieldWriteSEXP, getConstructorClosureFlag, getDerivedConstructorClosureFlag, getDerivedMethodClosureFlag, getPrivateDerivedMethodClosureFlag, getPrivateMethodClosureFlag, getPropInitDerivedNoPrivateClosureFlag, getPropInitDerivedPrivateClosureFlag, getPropInitNoPrivateClosureFlag, getPropInitPrivateClosureFlag, getRegularClosureFlag, getStaticPropInitClosureFlag, getStaticPropInitDerivedClosureFlag, GlobalBindingSEXP, GotoSEXP, IfElseJumpSEXP, IfJumpSEXP, IridiumSEXP, JSADDBRANDSEXP, JSAppendSEXP, JSArraySEXP, JSCheckConstructorSEXP, JSClassMethodDefineSEXP, JSClassSEXP, JSComputedFieldReadSEXP, JSComputedFieldWriteSEXP, JSComputedObjectMethodSEXP, JSComputedObjectPropSEXP, JSCopyDataPropertiesSEXP, JSDefineObjMethodSEXP, JSDefineObjPropSEXP, JSEnvWriteSEXP, JSForOfNextSEXP, JSForOfStartSEXP, JSHomeObjContextSEXP, JSInitialYieldSEXP, JSIteratorCloseSEXP, JSNUBDSEXP, JSObjectMethodSEXP, JSObjectPropSEXP, JSObjectSEXP, JSPrivateFieldReadSEXP, JSPrivateFieldWriteSEXP, JSSpreadSEXP, JSSuperContextSEXP, JSSuperFieldReadSEXP, JSSuperFieldWriteSEXP, JSSuperObjContextSEXP, JSTemplateSEXP, JSThisContextAltSEXP, JSThisContextSEXP, JSToObjectSEXP, LambdaSEXP, ListSEXP, NullSEXP, NumberSEXP, PrivateSEXP, RegExpSEXP, ResolveContinueTargetSEXP, ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP, ReturnAsyncSEXP, ReturnSEXP, StringSEXP, UnopSEXP, YieldSEXP } from "./Types";
import { untilFirstMatch } from "#utils";
import { generateJS3ArrayExpressionfromBaseNode } from "../JS3Helpers/JS3Constructors";

// Handle RValues | AMP
export const IRIV2_RVAL = (cx: IRIDIUMV2, init: JS3AssnInit): IridiumSEXP => {


  //
  // AMP
  //
  if (isIdentifier(init)) {
    return new EnvReadSEXP(init.name);
  } else if (isJS3MemberExpression(init)) {
    let obj: string;
    let isSuper: boolean = false;

    if (isIdentifier(init.object)) {
      obj = init.object.name;
    } else if (isThisExpression(init.object)) {
      obj = "this";
    } else {
      if (isIdentifier(init.property)) {
        return new JSSuperFieldReadSEXP(init.property.name);
      } else throw new Error("Expected super lookup to be identifiers, private are not allowed!!");
    }

    if (isIdentifier(init.property)) {
      let prop: string = init.property.name;
      if (init.computed) {
        return new JSComputedFieldReadSEXP(obj, prop)
      } else {
        return new FieldReadSEXP(obj, prop);
      }
    } else {
      let prop: string = init.property.id.name;
      return new JSPrivateFieldReadSEXP(obj, prop)
    }
  }

  //
  // RValues
  //
  // Handle Literals
  if (init.type === "DecimalLiteral") {
    throw new Error("IRIV2 TODO: Decimal Literal");
  } else if (init.type === "BigIntLiteral") {
    return new BitIntSEXP(init.value);
  } else if (init.type === "StringLiteral") {
    return new StringSEXP(init.value);
  } else if (init.type === "NumericLiteral") {
    return new NumberSEXP(init.value);
  } else if (init.type === "NullLiteral") {
    return new NullSEXP();
  } else if (init.type === "BooleanLiteral") {
    return new BooleanSEXP(init.value);
  }

  // JS3RegExp Literal
  else if (isJS3RegExpLiteral(init)) {
    return new RegExpSEXP(init.pattern, init.flags);
  }

  // JS3Template Literal
  else if (isJS3TemplateLiteral(init)) {
    let templateElements: Array<IridiumSEXP> = [];
    let exprs = [...init.expressions];
    exprs.reverse();
    for (let q of init.quasis) {
      let str = q.value.cooked ? q.value.cooked : q.value.raw;
      templateElements.push(new StringSEXP(str));
      if (exprs.length > 0) {
        let popped = exprs.pop();
        if (!popped) throw new Error("popped value is undefined");
        templateElements.push(IRIV2_RVAL(cx, popped));
      }
    }
    return new JSTemplateSEXP(templateElements);
  }

  // // JS3TaggedTemplateExpression
  // else if (isJS3TaggedTemplateExpression(init)) {
  //   return this.handleJS3TaggedTemplateExpression(init);
  // }

  // JS3Meta Property
  else if (isJS3MetaProperty(init)) {
    return new EnvReadSEXP("<module_meta>");
  }

  // JS3YieldExpression 
  else if (isJS3YieldExpression(init)) {
    return handleYieldExpression(cx, init);
  }
  // JS3AwaitExpression
  else if (isJS3AwaitExpression(init)) {
    return handleAwaitExpression(cx, init);
  }

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
      left = new ResolvePrivateEnvBindingSEXP(init.left.id.name);
      // throw new Error("Handle binop with private names");
      return new BinopSEXP("pin", IRIV2_RVAL(cx, init.right), left);
    } else {
      left = IRIV2_RVAL(cx, init.left);
      return new BinopSEXP(init.operator, left, IRIV2_RVAL(cx, init.right));
    }
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

  // JS3UnaryExpression
  else if (isJS3UnaryExpression(init)) {
    return handleUnaryExpression(cx, init);
  }

  // JS3UpdateExpression
  else if (isJS3UpdateExpression(init)) {
    return handleUpdateExpression(cx, init);
  }

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

  // JS3AnonMemberExpression
  else if (isJS3AnonMemberExpression(init)) {
    if (init.object.elements.length !== 1) throw new Error("Expected JS3AnonMemberExpression length to be 1");
    return IRIV2_RVAL(cx, init.object.elements[0]);
  }

  // // JS3DefaultExportMemberExpression
  // else if (isJS3DefaultExportMemberExpression(init)) {
  //   return this.handleJS3DefaultExportMemberExpression(init);
  // }

  throw new Error(// @ts-ignore
    `IRIDIUM: Unhandled RVAL ${init.type}, ${init.js3type ? init.js3type : undefined}`,
  );
}

export const handleArrayPatternAssignmentExpr = (cx: IRIDIUMV2, elements: JS3ArrayPattern_elements, rValTarget: IridiumSEXP, safeWrite: boolean = false) => {
  let for$of$loop$next = cx.js3Builder.utils.getNewTemporary("next");
  let for$of$loop$done = cx.js3Builder.utils.getNewTemporary("done");

  cx.getCurrentBB().args.push(new JSForOfStartSEXP(rValTarget));
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$next), null, "JSLET", false));
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$done), null, "JSLET", false));

  for (let e of elements) {
    if (isIdentifier(e)) {
      cx.getCurrentBB().args.push(new JSForOfNextSEXP(for$of$loop$done, for$of$loop$next));
      cx.getCurrentBB().args.push(new EnvWriteSEXP(e.name, new EnvReadSEXP(for$of$loop$next), safeWrite, false));
    } else if (isJS3RestElement(e)) {
      // tempres = []
      // i = 0
      // cx: {
      //  next, done...
      //  if (done) break;
      //  tempres[i] = next;
      //  i = i + 1;
      //  continue
      // }
      let tempres = cx.js3Builder.utils.getNewTemporary("tempres");
      let tempit = cx.js3Builder.utils.getNewTemporary("it");
      cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(tempres), new JSArraySEXP([]), "JSLET", false));
      cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(tempit), new NumberSEXP(0), "JSLET", false));

      const currentContext = cx.getCurrentContext();
      const currentBB = currentContext.getCurrentBB();
      cx.addContinuation(currentContext);
      const postBB = currentContext.getCurrentBB();

      let loopHeadContext: IridiumBuildContext = cx.getCurrentContext();

      const loopConfig: {
        kind: "for-of" | "standard",
        loopHeadIDX: number,
        loopBodyIDX: number,
        loopInitIDX: number,
        label: string | null,
        breakTarget: number,
        continueTarget: number
      } = {
        kind: "for-of",
        loopHeadIDX: -1,
        loopBodyIDX: -1,
        loopInitIDX: -1,
        label: null,
        breakTarget: -1,
        continueTarget: -1
      };

      loopConfig.breakTarget = postBB.getIDX();

      const currToLoop = new GotoSEXP(-1);
      const loopToPost = new IfJumpSEXP(new EnvReadSEXP(for$of$loop$done), -1);

      // 1. CurrBB to LoopBB
      currentBB.args.push(currToLoop);

      // 2. Loop
      cx.declareAndPushLexicalContext(); // Loop Context
      loopHeadContext = cx.getCurrentContext();
      loopConfig.loopHeadIDX = loopConfig.continueTarget = cx.getCurrentBB().getIDX();
      cx.getCurrentBB().args.push(new JSForOfNextSEXP(for$of$loop$done, for$of$loop$next));
      cx.getCurrentBB().args.push(loopToPost);
      cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP(tempres, tempit, new EnvReadSEXP(for$of$loop$next)));
      cx.getCurrentBB().args.push(new EnvWriteSEXP(tempit, new BinopSEXP("+", new EnvReadSEXP(tempit), new NumberSEXP(1)), false, false));
      cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP());
      cx.popContext(); // Loop Context

      loopHeadContext.loopConfig = loopConfig;

      currToLoop.setIDX(loopConfig.loopHeadIDX);
      loopToPost.setIDX(loopConfig.breakTarget);

      cx.getCurrentBB().args.push(new EnvWriteSEXP(e.argument.name, new EnvReadSEXP(tempres), safeWrite, false));
    }
  }
  cx.getCurrentBB().args.push(new JSIteratorCloseSEXP());
}

export const handleObjectPatternAssignmentExpr = (cx: IRIDIUMV2, properties: JS3ObjectPattern_properties, rValTarget: IridiumSEXP, safeWrite: boolean = false) => {
  let hasRest = false;
  let restElement: JS3RestElement;
  properties.forEach((e) => {
    if (isJS3RestElement(e)) {
      hasRest = true;
      restElement = e;
    }
  });

  let toObjRes = cx.js3Builder.utils.getNewTemporary("toObjRes");
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(toObjRes), null, "JSLET", false));

  // 1. JSToObjectSEXP(rValTarget, toObjRes)
  cx.getCurrentBB().args.push(new JSToObjectSEXP(rValTarget, toObjRes));

  let exc_obj;
  // 2. [*] exc_obj = {}
  //    for (f of fields) 
  //      exc_obj[f] = null;
  if (hasRest) {
    exc_obj = cx.js3Builder.utils.getNewTemporary("exc_obj");
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(exc_obj), new JSObjectSEXP(), "JSLET", false));
  }

  // 3. f1 = orig_rval.f1
  for (let d of properties) {
    if (isJS3AssnObjectProperty(d)) {
      const bindingName = d.value.name;

      let rVal: IridiumSEXP;

      if (d.computed) {
        if (isIdentifier(d.key)) {
          rVal = new JSComputedFieldReadSEXP(toObjRes, d.key.name);
          if (hasRest) {
            // @ts-ignore
            cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP(exc_obj, d.key.name, new NullSEXP()));
          }
        } else if (isJS3PrivateName(d.key)) {
          throw new Error("JS3 Private Name unhandled in destructuring");
        } else {
          let fieldSEXP = IRIV2_RVAL(cx, d.key)
          rVal = new JSComputedFieldReadSEXP(toObjRes, fieldSEXP);
          if (hasRest) {
            // @ts-ignore
            cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP(exc_obj, fieldSEXP, new NullSEXP()));
          }
        }
      } else {
        if (isIdentifier(d.key)) {
          rVal = new FieldReadSEXP(toObjRes, d.key.name);
          if (hasRest) {
            // @ts-ignore
            cx.getCurrentBB().args.push(new FieldWriteSEXP(exc_obj, d.key.name, new NullSEXP()));
          }
        } else if (isJS3PrivateName(d.key)) {
          throw new Error("JS3 Private Name unhandled in destructuring");
        } else {
          rVal = new FieldReadSEXP(toObjRes, '' + d.key.value);
          if (hasRest) {
            // @ts-ignore
            cx.getCurrentBB().args.push(new FieldWriteSEXP(exc_obj, '' + d.key.value, new NullSEXP()));
          }
        }
      }

      cx.getCurrentBB().args.push(new EnvWriteSEXP(bindingName, rVal, safeWrite, false));
    }
  }
  if (hasRest) {
    // 4. [*] fin_obj = {}
    let fin_obj = cx.js3Builder.utils.getNewTemporary("fin_obj");
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(fin_obj), new JSObjectSEXP(), "JSLET", false));

    // @ts-ignore
    // 5. [*] JSCopyDataProperties(exc_obj, orig_rval, fin_obj, | -> | e)
    const propCopy = new JSCopyDataPropertiesSEXP(exc_obj, toObjRes, fin_obj, restElement.argument.name);
    propCopy.setSafe(safeWrite);
    cx.getCurrentBB().args.push(propCopy);
  }
}

const handleUnaryExpression = (cx: IRIDIUMV2, node: JS3UnaryExpression): IridiumSEXP => {
  if (node.operator === "delete") {

    if (isJS3MemberExpression(node.argument)) {
      const elems: Array<IridiumSEXP> = [];

      const receiver = node.argument.object;
      const property = node.argument.property;

      if (!isIdentifier(receiver)) throw new Error("Expected receiver to be an identifier");
      if (!isIdentifier(property)) throw new Error("Expected property to be an identifier");

      elems.push(IRIV2_RVAL(cx, receiver));
      if (node.argument.computed) {
        elems.push(IRIV2_RVAL(cx, property));
      } else {
        elems.push(new StringSEXP(property.name));
      }

      const listSexp = new ListSEXP(elems);
      listSexp.setFlag("UNOP_DEL_MEMBEREXPR");

      return new UnopSEXP(node.operator, listSexp);
    } else if (isIdentifier(node.argument)) {
      const listSexp = new ListSEXP([new StringSEXP(node.argument.name)]);
      listSexp.setFlag("UNOP_DEL_VAR");
      return new UnopSEXP(node.operator, listSexp);
    }

    throw new Error("TODO: unary delete operator")
  } else {
    if (isIdentifier(node.argument)) {
      if (node.operator === "void") return new EnvReadSEXP("undefined");
      const argument = IRIV2_RVAL(cx, node.argument);
      return new UnopSEXP(node.operator, argument);
    } else throw new Error(
      "JS3UnaryExpression: Expected Identifier for non delete operators",
    );

  }
};

const handleYieldExpression = (cx: IRIDIUMV2, node: JS3YieldExpression): IridiumSEXP => {
  let yieldDoneIndicator = cx.js3Builder.utils.getNewTemporary("yieldDoneIndicator");
  let yieldReturnResultHolder = cx.js3Builder.utils.getNewTemporary("yieldReturnResultHolder");

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();
  cx.getCurrentBB().args.push(new ReturnAsyncSEXP(new EnvReadSEXP(yieldReturnResultHolder)));
  cx.popContext();

  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(yieldDoneIndicator), null, "JSLET", false));
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(yieldReturnResultHolder), null, "JSLET", false));

  // <yieldDoneIndicator, yieldReturnResultHolder> = YIELD ARG
  cx.getCurrentBB().args.push(new YieldSEXP(node.argument ? node.argument.name : "undefined", yieldDoneIndicator, yieldReturnResultHolder));

  // Make branch check the last instruction of currentBB
  const ifJump = new IfJumpSEXP(new EnvReadSEXP(yieldDoneIndicator), trueContext.BB[0].idx);
  cx.getCurrentBB().args.push(ifJump);

  return new EnvReadSEXP(yieldReturnResultHolder);
};

const handleAwaitExpression = (cx: IRIDIUMV2, node: JS3AwaitExpression): IridiumSEXP => {
  return new AwaitSEXP(node.argument.name);
};

const handleComputedProps = (cx: IRIDIUMV2, node: JS3ClassExpression): Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string> => {
  // Allocate locations to store computed prop results
  const computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string> = new Map();
  const computedProps = node.body.body.filter(classItem => isJS3ClassProperty(classItem) || isJS3ClassMethod(classItem)).filter(classItem => classItem.computed);

  computedProps.forEach(classItem => {
    let targetID = cx.js3Builder.utils.getNewTemporary(undefined);
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(targetID), null, "JSLET", false));
    computedPropMapping.set(classItem, targetID);
  });

  const privateProps = node.body.body.filter(classItem => isJS3ClassPrivateProperty(classItem) || isJS3ClassPrivateMethod(classItem));
  privateProps.forEach(classItem => {
    let targetID = cx.js3Builder.utils.getNewTemporary(undefined);
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(targetID), new PrivateSEXP(classItem.key.id.name), "JSLET", false));
    computedPropMapping.set(classItem, targetID);
  });

  const oldContext = cx.getCurrentContext();
  const newContext = cx.declareAndPushLexicalContext("Lexical");

  // Add Gotos from oldContext's last BB to currentBB.
  oldContext.getCurrentBB().args.push(new GotoSEXP(newContext.BB[0].idx))
  cx.addContinuation(oldContext);

  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("this"), new GlobalBindingSEXP("undefined"), "JSCONST", false));
  if (isIdentifier(node.id))
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(node.id.name), new JSNUBDSEXP(), "JSCONST", false));

  computedProps.forEach(classItem => {
    if (!computedPropMapping.has(classItem)) throw new Error("Expected computed props to have a location already allocated...");
    const computedPropLoc = computedPropMapping.get(classItem);
    if (!computedPropLoc) throw new Error("computedPropLoc is undefined");
    const keyLoweredTo = lowerExprToResolveEnvBindingSEXP(cx, classItem.key);
    cx.getCurrentBB().args.push(new EnvWriteSEXP(computedPropLoc, new EnvReadSEXP(keyLoweredTo.getBindingName()), false, false));
  })

  // After generating the code, add a goto from the last lowered block to the oldContexts continuation
  cx.getCurrentBB().args.push(new GotoSEXP(oldContext.getCurrentBB().idx));
  cx.popContext();
  return computedPropMapping;
}

const getPrivateMapping = (computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string>): Map<string, string> | null => {
  const privateMapping: Map<string, string> = new Map();
  for (let [item, target] of computedPropMapping) {
    if (isJS3ClassPrivateProperty(item)) {
      privateMapping.set(item.key.id.name, target);
    } else if (isJS3ClassPrivateMethod(item)) {
      privateMapping.set(item.key.id.name, target);
    }
  }
  // In case of no private mappings, return null...
  if (privateMapping.size === 0) return null;
  return privateMapping;
}

const getFieldKeyString = (key: JS3ContainedExprKey): string => {
  let lookupField: string;
  if (isIdentifier(key)) lookupField = key.name;
  else if (isDecimalLiteral(key)) lookupField = "" + key.value;
  else if (isBigIntLiteral(key)) lookupField = "" + key.value;
  else if (isStringLiteral(key)) lookupField = "" + key.value;
  else if (isNumericLiteral(key)) lookupField = "" + key.value;
  else if (isNullLiteral(key)) lookupField = "null";
  else if (isBooleanLiteral(key)) lookupField = "" + key.value;
  else throw new Error("Unhandled static lookup field name");
  return lookupField;
}

const getMethodKindFlag = (kind: string): string => {
  if (kind === "method") return ("METHOD");
  else if (kind === "get") return ("GET");
  else if (kind === "set") return ("SET");
  throw new Error("Didnt expect constructors to be lowered this way");
}

const lowerNonStaticClassMethods = (cx: IRIDIUMV2, node: JS3ClassExpression, privateMapping: null | Map<string, string>, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string>) => {
  const nonStaticClassMethods = node.body.body.filter(classItem => isJS3ClassMethod(classItem) || isJS3ClassPrivateMethod(classItem)).filter(classItem => !classItem.static);
  const lambdas: Array<IridiumSEXP> = [];
  const hasSuper = node.superClass ? true : false;

  nonStaticClassMethods.filter(n => isJS3ClassMethod(n)).forEach(methodNode => {
    const lambda: Array<IridiumSEXP> = [];
    if (methodNode.computed) {
      if (!computedPropMapping.has(methodNode)) throw new Error("Expected computed name to have been mapped already...");
      let compProp = computedPropMapping.get(methodNode);
      if (!compProp) throw new Error("compProp is undefined");
      lambda.push(new EnvReadSEXP(compProp));
    } else {
      lambda.push(new StringSEXP(getFieldKeyString(methodNode.key)));
    }
    lambda.push(handleFunctionExpression(cx, methodNode, privateMapping, hasSuper, false));
    lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
    const lambdaNode = new ListSEXP(lambda);
    lambdas.push(lambdaNode);
  });

  nonStaticClassMethods.filter(n => isJS3ClassPrivateMethod(n)).forEach(methodNode => {
    if (!computedPropMapping.has(methodNode)) throw new Error("Alloca location for private method is missing");
    let allocaLocation = computedPropMapping.get(methodNode);
    if (!allocaLocation) throw new Error("allocaLocation is undefined");

    const funBodyLambda = handleFunctionExpression(cx, methodNode, privateMapping, hasSuper, true);
    // Initialize the private method alloca location with the 
    cx.getCurrentBB().args.push(new EnvWriteSEXP(allocaLocation, funBodyLambda, true, false));

    const lambda: Array<IridiumSEXP> = [];
    lambda.push(new PrivateSEXP(methodNode.key.id.name));
    lambda.push(new EnvReadSEXP(allocaLocation));
    lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
    const lambdaNode = new ListSEXP(lambda);
    lambdas.push(lambdaNode);
  });

  const lambdaList = new ListSEXP(lambdas);
  return lambdaList;
}

const lowerStaticClassMethods = (cx: IRIDIUMV2, node: JS3ClassExpression, privateMapping: null | Map<string, string>, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string>) => {
  const staticClassMethods = node.body.body.filter(classItem => isJS3ClassMethod(classItem) || isJS3ClassPrivateMethod(classItem)).filter(classItem => classItem.static);
  const lambdas: Array<IridiumSEXP> = [];
  const hasSuper = node.superClass ? true : false;

  staticClassMethods.filter(n => isJS3ClassMethod(n)).forEach(methodNode => {
    const lambda: Array<IridiumSEXP> = [];
    if (methodNode.computed) {
      if (!computedPropMapping.has(methodNode)) throw new Error("Expected computed name to have been mapped already...");
      let compProp = computedPropMapping.get(methodNode);
      if (!compProp) throw new Error("compProp is undefined");
      lambda.push(new EnvReadSEXP(compProp));
    } else {
      lambda.push(new StringSEXP(getFieldKeyString(methodNode.key)));
    }
    lambda.push(handleFunctionExpression(cx, methodNode, privateMapping, hasSuper, false));
    lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
    const lambdaNode = new ListSEXP(lambda);
    lambdas.push(lambdaNode);
  });

  staticClassMethods.filter(n => isJS3ClassPrivateMethod(n)).forEach(methodNode => {
    if (!computedPropMapping.has(methodNode)) throw new Error("Alloca location for private method is missing");
    let allocaLocation = computedPropMapping.get(methodNode);
    if (!allocaLocation) throw new Error("allocaLocation is undefined");

    const funBodyLambda = handleFunctionExpression(cx, methodNode, privateMapping, hasSuper, true);
    // Initialize the private method alloca location with the 
    cx.getCurrentBB().args.push(new EnvWriteSEXP(allocaLocation, funBodyLambda, true, false));

    const lambda: Array<IridiumSEXP> = [];
    lambda.push(new PrivateSEXP(methodNode.key.id.name));
    lambda.push(new EnvReadSEXP(allocaLocation));
    lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
    const lambdaNode = new ListSEXP(lambda);
    lambdas.push(lambdaNode);
  });

  const lambdaList = new ListSEXP(lambdas);
  return lambdaList;
}

// This method lowers code for initialization of non-static fields
const createClassNonStaticPropInitClosure = (cx: IRIDIUMV2, node: JS3ClassExpression, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string>, privateMapping: null | Map<string, string>, hasSuper: boolean, addBrand: boolean) => {
  const location = cx.js3Builder.utils.getNewTemporary(undefined);
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.privateMapping = privateMapping;
  const funBBIdx = funcContext.getCurrentBB().idx;

  // Class constructors are strict and use an unmapped arguments object
  funcContext.isStrict = true;
  funcContext.argumentsKind = 2;

  funcContext.isAsync = false;
  funcContext.isGenerator = false;

  // add this context
  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  if (hasSuper) {
    // add <super_obj>
    cx.getCurrentBB().args.push(new JSSuperObjContextSEXP());
  }

  if (addBrand) {
    // add <home_obj>
    cx.getCurrentBB().args.push(new JSHomeObjContextSEXP());
  }

  // Set closure context
  if (hasSuper) {
    funcContext.kind = addBrand ? getPropInitDerivedPrivateClosureFlag() : getPropInitDerivedNoPrivateClosureFlag();
  } else {
    funcContext.kind = addBrand ? getPropInitPrivateClosureFlag() : getPropInitNoPrivateClosureFlag();
  }

  for (let classItem of node.body.body) {
    if (isJS3ClassProperty(classItem) && !classItem.static) {
      let memberExpr;
      if (classItem.computed) {
        if (!computedPropMapping.has(classItem)) throw new Error("Expected computed prop mapping to be resolved for all fields");
        // this[computedFieldLoc] = RVal
        let compProp = computedPropMapping.get(classItem);
        if (!compProp) throw new Error("compProp is undefined");
        memberExpr = memberExpression(thisExpression(), identifier(compProp), true);
      } else {
        // this.field = RVal
        let lookupField: string = getFieldKeyString(classItem.key);
        memberExpr = memberExpression(thisExpression(), identifier(lookupField), false);
      }
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      lowerExprToResolveEnvBindingSEXP(cx, assignmentExpression("=", memberExpr, classItem.value ? classItem.value : identifier("undefined")));
    } else if (isJS3ClassPrivateProperty(classItem) && !classItem.static) {
      // this.#field = RVal
      if (!computedPropMapping.has(classItem)) throw new Error("Expected computed prop mapping to be resolved for all fields");
      let compProp = computedPropMapping.get(classItem);
      if (!compProp) throw new Error("compProp is undefined");
      let lookupPrivateKeyHolder = new EnvReadSEXP(compProp);
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      let loweredValue: IridiumSEXP = new EnvReadSEXP(classItem.value ? lowerExprToResolveEnvBindingSEXP(cx, classItem.value).getBindingName() : "undefined");
      cx.getCurrentBB().args.push(new JSPrivateFieldWriteSEXP("this", lookupPrivateKeyHolder, loweredValue));
    }
  }

  if (addBrand) {
    // add_brand this <home_obj>
    cx.getCurrentBB().args.push(new JSADDBRANDSEXP(new EnvReadSEXP("this"), new EnvReadSEXP("<home_obj>")));
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));

  cx.popContext();
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(location), new LambdaSEXP(funBBIdx), "JSLET", false));

  return location;
}

// This method lowers code for initialization of non-static fields
const createClassStaticPropInitClosure = (cx: IRIDIUMV2, node: JS3ClassExpression, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string>, privateMapping: null | Map<string, string>, hasSuper: boolean) => {
  const location = cx.js3Builder.utils.getNewTemporary(undefined);
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.privateMapping = privateMapping;
  const funBBIdx = funcContext.getCurrentBB().idx;

  // Class constructors are strict and use an unmapped arguments object
  funcContext.isStrict = true;
  funcContext.argumentsKind = 2;

  funcContext.isAsync = false;
  funcContext.isGenerator = false;

  // add this context
  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  if (hasSuper) {
    // add <super_obj>
    cx.getCurrentBB().args.push(new JSSuperObjContextSEXP());
  }

  // Set closure context
  if (hasSuper) {
    funcContext.kind = getStaticPropInitClosureFlag();
  } else {
    funcContext.kind = getStaticPropInitDerivedClosureFlag();
  }

  // Set classname to "this" if it exists
  if (node.id) {
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(node.id.name), new EnvReadSEXP("this"), "JSCONST", false));
  }

  for (let classItem of node.body.body) {
    if (isJS3ClassProperty(classItem) && classItem.static) {
      let memberExpr;
      if (classItem.computed) {
        if (!computedPropMapping.has(classItem)) throw new Error("Expected computed prop mapping to be resolved for all fields");
        // this[computedFieldLoc] = RVal
        let compProp = computedPropMapping.get(classItem);
        if (!compProp) throw new Error("compProp is undefined");
        memberExpr = memberExpression(thisExpression(), identifier(compProp), true);
      } else {
        // this.field = RVal
        let lookupField: string = getFieldKeyString(classItem.key);
        memberExpr = memberExpression(thisExpression(), identifier(lookupField), false);
      }
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      lowerExprToResolveEnvBindingSEXP(cx, assignmentExpression("=", memberExpr, classItem.value ? classItem.value : identifier("undefined")));
    } else if (isJS3ClassPrivateProperty(classItem) && classItem.static) {
      // this.#field = RVal
      if (!computedPropMapping.has(classItem)) throw new Error("Expected computed prop mapping to be resolved for all fields");
      let compProp = computedPropMapping.get(classItem);
      if (!compProp) throw new Error("compProp is undefined");
      let lookupPrivateKeyHolder = new EnvReadSEXP(compProp);
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      let loweredValue: IridiumSEXP = new EnvReadSEXP(classItem.value ? lowerExprToResolveEnvBindingSEXP(cx, classItem.value).getBindingName() : "undefined");
      cx.getCurrentBB().args.push(new JSPrivateFieldWriteSEXP("this", lookupPrivateKeyHolder, loweredValue));
    } else if (isJS3StaticBlock(classItem)) {
      // { /** code **/ }
      handleBlockStatement(cx, classItem);
    }
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));

  cx.popContext();
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(location), new LambdaSEXP(funBBIdx), "JSLET", false));

  return location;
}

const createClassConstructorClosure = (cx: IRIDIUMV2, node: JS3ClassExpression, computedPropMapping: Map<JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod, string>, superClass: EnvReadSEXP | undefined, propInitClos: string): LambdaSEXP => {
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");

  const funBBIdx = funcContext.getCurrentBB().idx;

  // Class constructors are strict and use an unmapped arguments object
  funcContext.isStrict = true;
  funcContext.argumentsKind = 2;

  let constructor: undefined | Array<JS3ClassMethod> | JS3ClassMethod = node.body.body.filter(item => isJS3ClassMethod(item)).filter(item => item.kind === "constructor");
  if (constructor.length === 0) constructor = undefined
  else if (constructor.length === 1) constructor = constructor[0];
  else throw new Error("Expected atmost one constructor");

  // Case 1: No heritage, in this case we initialize the this context and inline prop init
  if (!superClass) {
    // Set constructor flag
    funcContext.kind = getConstructorClosureFlag();

    // add "this" to the closure scope
    cx.getCurrentBB().args.push(new JSThisContextSEXP());

    // Ensure the constructor was called using new
    cx.getCurrentBB().args.push(new JSCheckConstructorSEXP());

    // Call prop init closure
    const args: Array<IridiumSEXP> = [];
    args.push(new EnvReadSEXP("this"));
    args.push(new EnvReadSEXP(propInitClos));
    cx.getCurrentBB().args.push(new CallSiteSEXP(args, [["CCall", null]]));

    // Lower constructor code if it exists
    if (constructor) {
      if (isJS3ClassMethod(constructor)) {
        funcContext.isAsync = constructor.async ? constructor.async : false;
        funcContext.isGenerator = constructor.generator ? constructor.generator : false;

        lowerArgumentInit(cx, constructor.params);

        // 15.1.5 Static Semantics: ExpectedArgumentCount
        funcContext.ecmaArgs = funArgLength(constructor.params);
        
        if (funcContext.isGenerator) cx.getCurrentBB().args.push(new JSInitialYieldSEXP());

        for (let item of constructor.body.body) {
          IRIV2_STMT(cx, item);
        }
      } else throw new Error("Expected constructor to be a method");
    }

    cx.getCurrentBB().args.push(new ReturnSEXP(new GlobalBindingSEXP("undefined")));

  }
  else // Case 2: Has Heritage
  {
    // Set constructor flag
    funcContext.kind = getDerivedConstructorClosureFlag();

    // Add "this = NUBD"
    cx.getCurrentBB().args.push(new JSThisContextAltSEXP());

    // add "<home_obj>", "<super_ctr>", "<new_target>" and "<super_obj>" bindings to the closure scope
    cx.getCurrentBB().args.push(new JSSuperContextSEXP());

    // Ensure the constructor was called using new
    cx.getCurrentBB().args.push(new JSCheckConstructorSEXP());

    if (!constructor) {
      // Call constructor and initialize "this"
      const args: Array<IridiumSEXP> = [];
      args.push(new EnvReadSEXP("<super_ctr>"));
      args.push(new EnvReadSEXP("<new_target>"));
      const superCall = new CallSiteSEXP(args, [["Super", null]]);
      const thisInit = new EnvWriteSEXP("this", superCall, false, true); // <- This is about the only place where we set THISINIT flag to true
      cx.getCurrentBB().args.push(thisInit);

      // Call prop init closure
      const args1: Array<IridiumSEXP> = [];
      args1.push(new EnvReadSEXP("this"));
      args1.push(new EnvReadSEXP(propInitClos));
      cx.getCurrentBB().args.push(new CallSiteSEXP(args1, [["CCall", null]]));
    } else {

      if (isJS3ClassMethod(constructor)) {
        funcContext.isAsync = constructor.async ? constructor.async : false;
        funcContext.isGenerator = constructor.generator ? constructor.generator : false;

        lowerArgumentInit(cx, constructor.params);

        // 15.1.5 Static Semantics: ExpectedArgumentCount
        funcContext.ecmaArgs = funArgLength(constructor.params);
        
        if (funcContext.isGenerator) cx.getCurrentBB().args.push(new JSInitialYieldSEXP());

        for (let item of constructor.body.body) {
          IRIV2_STMT(cx, item);

          // All super calls are followed by prop initialization/reinitialization
          if (isJS3VariableDeclaration(item) && isJS3CallExpression(item.declarations[0].init) && isSuper(item.declarations[0].init.callee)) {
            if (isIdentifier(item.declarations[0].id)) {
              const thisInit = new EnvWriteSEXP("this", new EnvReadSEXP(item.declarations[0].id.name), false, true); // <- This is about the only place where we set THISINIT flag to true
              cx.getCurrentBB().args.push(thisInit);

              // Call prop init closure
              const args1: Array<IridiumSEXP> = [];
              args1.push(new EnvReadSEXP("this"));
              args1.push(new EnvReadSEXP(propInitClos));
              cx.getCurrentBB().args.push(new CallSiteSEXP(args1, [["CCall", null]]));
            } else throw new Error("Expected Super call result to be stored inside an identifier");
          }
        }
      } else throw new Error("Expected constructor to be a method");
    }

    cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("this")));
  }

  cx.popContext();

  return new LambdaSEXP(funBBIdx);
}

const handleUpdateExpression = (cx: IRIDIUMV2, node: JS3UpdateExpression): IridiumSEXP => {
  if (isIdentifier(node.argument)) {
    if (node.prefix) {
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          node.argument.name,
          new BinopSEXP(node.operator === "++" ? "+" : "-", new EnvReadSEXP(node.argument.name), new NumberSEXP(1)),
          false,
          false
        )
      );
      return new EnvReadSEXP(node.argument.name);
    } else {
      let tmp = cx.js3Builder.utils.getNewTemporary(undefined);

      cx.getCurrentBB().args.push(
        new JSEnvWriteSEXP(
          new ResolveEnvBindingSEXP(tmp),
          new EnvReadSEXP(node.argument.name),
          "JSLET",
          false
        )
      );

      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          node.argument.name,
          new BinopSEXP(node.operator === "++" ? "+" : "-", new EnvReadSEXP(node.argument.name), new NumberSEXP(1)),
          false,
          false
        )
      );

      return new EnvReadSEXP(tmp);
    }
  } else {
    throw new Error("Handle Update Member Expr");
  }

}

const handleClassExpression = (cx: IRIDIUMV2, node: JS3ClassExpression): IridiumSEXP => {
  let superClass: EnvReadSEXP | undefined = undefined;
  if (node.superClass) {
    superClass = new EnvReadSEXP(lowerExprToResolveEnvBindingSEXP(cx, node.superClass).getBindingName());
  }
  const hasSuper = node.superClass ? true : false;
  const name = node.id ? node.id.name : "";
  const heritage = node.superClass ? superClass : new GlobalBindingSEXP("undefined");
  const addBrand = node.body.body.some(n => isJS3ClassPrivateMethod(n) && !n.static);
  const addStaticBrand = node.body.body.some(n => isJS3ClassPrivateMethod(n) && n.static);

  const computedPropMapping = handleComputedProps(cx, node);
  const privateMapping = getPrivateMapping(computedPropMapping);
  const classPropInitClosure = createClassNonStaticPropInitClosure(cx, node, computedPropMapping, privateMapping, hasSuper, addBrand);
  const constructorLambda = createClassConstructorClosure(cx, node, computedPropMapping, superClass, classPropInitClosure);
  const methodList = lowerNonStaticClassMethods(cx, node, privateMapping, computedPropMapping);
  const staticMethodList = lowerStaticClassMethods(cx, node, privateMapping, computedPropMapping);
  const classStaticPropInitClosure = createClassStaticPropInitClosure(cx, node, computedPropMapping, privateMapping, hasSuper);

  return new JSClassSEXP(hasSuper, name, heritage ? heritage : new GlobalBindingSEXP("undefined"), constructorLambda, new EnvReadSEXP(classPropInitClosure), methodList, staticMethodList, addBrand, addStaticBrand, new EnvReadSEXP(classStaticPropInitClosure));
}

export const lowerExprToResolveEnvBindingSEXP = (cx: IRIDIUMV2, from: JS3ContainedExprKey | Expression) => {
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
  currentBB.args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(resHolder), new EnvReadSEXP("undefined"), "JSLET", false));

  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();
  let trueVal = lowerExprToResolveEnvBindingSEXP(cx, node.consequent);
  cx.getCurrentBB().args.push(new EnvWriteSEXP(resHolder, trueVal, false, false));
  cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
  cx.popContext();

  // Lower Else code
  const falseContext = cx.declareAndPushLexicalContext();
  let falseVal = lowerExprToResolveEnvBindingSEXP(cx, node.alternate);
  cx.getCurrentBB().args.push(new EnvWriteSEXP(resHolder, falseVal, false, false));
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
    return new EnvWriteSEXP(left.name, IRIV2_RVAL(cx, right), false, false);
  }

  // case b.
  // ID.ID = RVal
  if (isJS3MemberExpression(left)) {
    let init = left;

    let obj: string;
    let prop: string;
    let isSuper: boolean = false;

    if (isIdentifier(init.object)) {
      obj = init.object.name;
    } else if (isThisExpression(init.object)) {
      obj = "this";
    } else {
      if (isIdentifier(init.property)) {
        return new JSSuperFieldWriteSEXP(init.property.name, IRIV2_RVAL(cx, right));
      } else throw new Error("Expected super write to be an identifier, private are not allowed!!");
    }

    if (isIdentifier(init.property)) {
      let prop: string = init.property.name;
      if (init.computed) {
        return new JSComputedFieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right))
      } else {
        return new FieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right));
      }
    } else {
      let prop: string = init.property.id.name;
      return new JSPrivateFieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right));
    }
  }

  // [ ID, ...ID ] = RVal
  if (isJS3ArrayPattern(left)) {
    const rValTarget = IRIV2_RVAL(cx, right);
    handleArrayPatternAssignmentExpr(cx, left.elements, rValTarget);
    return rValTarget;
  }

  // { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(left)) {
    const rValTarget = IRIV2_RVAL(cx, right);
    handleObjectPatternAssignmentExpr(cx, left.properties, rValTarget);
    return rValTarget;
  }

  throw new Error("Unhandled Assignment Expression");
}

const handleFunctionExpression = (cx: IRIDIUMV2, node: JS3FunctionExpression | JS3ObjectMethod | JS3ClassMethod | JS3ClassPrivateMethod, privateMapping: Map<string, string> | null = null, hasSuper: boolean = false, isPrivateMethod: boolean = false) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.privateMapping = privateMapping;
  const funBB = funcContext.getCurrentBB();
  const funBBIdx = funBB.idx;

  if (isJS3ClassMethod(node) || isJS3ClassPrivateMethod(node)) funcContext.isStrict = true;
  funcContext.isStrict = funcContext.isStrict || node.body.directives.some((val) => val.value.value === "use strict");

  funcContext.isAsync = node.async ? node.async : false;
  funcContext.isGenerator = node.generator ? node.generator : false;

  // Add arguments object to the context
  funcContext.argumentsKind = 2;
  let isSimpleArgs = true;

  node.params.forEach(p => {
    if (!isIdentifier(p)) {
      isSimpleArgs = false;
    }
  })

  if (!funcContext.isStrict && isSimpleArgs) { // Not strict and simple arguments => mapped arguments
    funcContext.argumentsKind = 1;
    node.params.forEach(p => {
      if (isIdentifier(p)) {
        cx.getCurrentContext().args.push(p.name);
      }
    })
  } else {
    lowerArgumentInit(cx, node.params);
  }

  // 15.1.5 Static Semantics: ExpectedArgumentCount
  funcContext.ecmaArgs = funArgLength(node.params);

  if (funcContext.isGenerator) cx.getCurrentBB().args.push(new JSInitialYieldSEXP());

  // Arrow functions are handled separately
  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  if (isPrivateMethod && hasSuper) {
    funcContext.kind = getPrivateDerivedMethodClosureFlag();
  } else if (isPrivateMethod) {
    funcContext.kind = getPrivateMethodClosureFlag();
  } else if (hasSuper) {
    funcContext.kind = getDerivedMethodClosureFlag();
  } else {
    funcContext.kind = getConstructorClosureFlag();
  }

  // If the method has access to the super object, we add <super_obj> to its scope using this
  if (hasSuper) {
    cx.getCurrentBB().args.push(new JSSuperObjContextSEXP());
  }

  for (const s of node.body.body) {
    IRIV2_STMT(cx, s);
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));

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
  throw new Error("New Call Expression Unreachable Case...");
}

const handleArrowFunctionExpression = (cx: IRIDIUMV2, node: JS3ArrowFunctionExpression) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBB = funcContext.getCurrentBB();
  const funBBIdx = funBB.idx;

  funcContext.isStrict = funcContext.isStrict || node.body.directives.some((val) => val.value.value === "use strict");
  funcContext.isAsync = node.async ? node.async : false;
  funcContext.isGenerator = node.generator ? node.generator : false;

  funcContext.kind = getRegularClosureFlag();

  // No arguments object
  funcContext.argumentsKind = 0;

  lowerArgumentInit(cx, node.params);
 
  // 15.1.5 Static Semantics: ExpectedArgumentCount
  funcContext.ecmaArgs = funArgLength(node.params);

  if (funcContext.isGenerator) cx.getCurrentBB().args.push(new JSInitialYieldSEXP());

  for (const s of node.body.body) {
    IRIV2_STMT(cx, s);
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));

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
    args.push(new EnvReadSEXP("<super_ctr>"));
    args.push(new EnvReadSEXP("<new_target>"));
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
  throw new Error("Call Expression Unreachable Case...");
}

const handleContextualCallExpression = (cx: IRIDIUMV2, node: JS3ContextualCallExpression) => {
  // Special case for private calls
  if (isJS3MemberExpression(node.callee) && isJS3PrivateName(node.callee.property)) {
    const callee = new ResolvePrivateEnvBindingSEXP(node.callee.property.id.name);
    const args: Array<IridiumSEXP> = [];
    args.push(new EnvReadSEXP("this"));
    args.push(callee);
    for (const a of node.arguments) {
      if (isIdentifier(a)) {
        args.push(new ResolveEnvBindingSEXP(a.name));
      } else if (isSpreadElement(a)) {
        args.push(new JSSpreadSEXP(lowerExprToResolveEnvBindingSEXP(cx, a.argument)));
      } else {
        args.push(lowerExprToResolveEnvBindingSEXP(cx, a));
      }
    }
    return new CallSiteSEXP(args, [["PrivateCall", null]]);
  }

  // Non private call cases
  const tempHolder = cx.js3Builder.utils.getNewTemporary("ccallCallee");
  const callee = new ResolveEnvBindingSEXP(tempHolder);
  const stmt = new JSEnvWriteSEXP(callee, IRIV2_RVAL(cx, node.callee), "JSLET", false);
  let contextObj;
  if (isJS3MemberExpression(node.callee)) {
    if (isIdentifier(node.callee.object)) {
      contextObj = node.callee.object.name;
    } else if (isThisExpression(node.callee.object)) {
      contextObj = "this";
    } else {
      contextObj = "this"; // <- Context object remains this even for super calls...
    }
  } else {
    throw new Error("Optional callees in contextual call expressions are not supported yet.");
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
  let isSimpleArray = !init.elements.some((e) => isJS3SpreadElement(e));

  if (isSimpleArray) {
    const args = init.elements.map((e) => {
      if (isIdentifier(e)) {
        return IRIV2_RVAL(cx, e);
      } else if (isSpreadElement(e)) {
        throw new Error("Simple arrays are not expected to have spreads");
      } else {
        return new EnvReadSEXP("undefined");
      }
    });
    return new JSArraySEXP(args);
  } else {
    // let temp$id, insertionIdx$id;
    let temp$id = cx.js3Builder.utils.getNewTemporary("temp");
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(temp$id), null, "JSLET", false));

    let insertionIdx$id = cx.js3Builder.utils.getNewTemporary("insertionIdx");
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(insertionIdx$id), null, "JSLET", false));

    // temp$id = [all'E'suntilNow]
    let allEs = untilFirstMatch(init.elements, (e) => isJS3SpreadElement(e));
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        temp$id,
        handleArrayExpression(cx, generateJS3ArrayExpressionfromBaseNode(allEs, init)),
        true,
        false
      ));

    // let insertionIdx$id = staticOffset
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        insertionIdx$id,
        new NumberSEXP(allEs.length),
        true,
        false
      ));

    if (!isJS3SpreadElement(init.elements[allEs.length])) throw new Error("Expected JS3SpreadElement");

    for (let i = allEs.length; i < init.elements.length; i++) {
      let currEle = init.elements[i];

      if (isJS3SpreadElement(currEle)) {
        // [insertionIdx, tmp] <- append (tmp, insertionIdx, spreadVal)
        cx.getCurrentBB().args.push(
          new JSAppendSEXP(
            new EnvReadSEXP(temp$id),                // push
            new EnvReadSEXP(insertionIdx$id),        // push
            new EnvReadSEXP(currEle.argument.name),  // push
            insertionIdx$id,                         // pop
            temp$id                                  // pop
          )
        );
      } else if (isIdentifier(currEle)) {
        // tmp[insertionIdx] = E
        cx.getCurrentBB().args.push(
          new JSComputedFieldWriteSEXP(
            temp$id,
            insertionIdx$id,
            new EnvReadSEXP(currEle.name)
          )
        )
        // insertionIdx++
        cx.getCurrentBB().args.push(
          new EnvWriteSEXP(
            insertionIdx$id,
            new BinopSEXP("+", new EnvReadSEXP(insertionIdx$id), new NumberSEXP(1)),
            true,
            false
          )
        )
      } else {
        throw new Error("Iridium ArrayExpression, unhandled case");
      }
    }

    return new EnvReadSEXP(temp$id);
    // S1: tmp = [all'E'suntilNow]
    // S2: let insertionIdx = staticOffset
    // S3: [insertionIdx, tmp] <- append (tmp, insertionIdx, spreadVal)
    // S4: For All'E's, tmp[insertionIdx++] = E
    // S5: Goto 
  }

}

// Identifier | StringLiteral | NumericLiteral | BigIntLiteral -> string
const getObjKeyString = (key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral): string => {
  if (isIdentifier(key)) return key.name
  else return '' + key.value
}

const handleObjectExpression = (cx: IRIDIUMV2, init: JS3ObjectExpression) => {
  let obj$id = cx.js3Builder.utils.getNewTemporary("newObj");
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(obj$id), new JSObjectSEXP(), "JSLET", false));

  for (let prop of init.properties) {
    if (isJS3ObjectMethod(prop)) {
      cx.getCurrentBB().args.push(
        new JSDefineObjMethodSEXP(
          new EnvReadSEXP(obj$id),
          prop.computed ? IRIV2_RVAL(cx, prop.key) : new StringSEXP(getObjKeyString(prop.key)),
          handleFunctionExpression(cx, prop),
          prop.kind,
          obj$id
        )
      );
    } else if (isJS3ObjectProperty(prop)) {
      cx.getCurrentBB().args.push(
        new JSDefineObjPropSEXP(
          new EnvReadSEXP(obj$id),
          prop.computed ? IRIV2_RVAL(cx, prop.key) : new StringSEXP(getObjKeyString(prop.key)),
          IRIV2_RVAL(cx, prop.value),
          obj$id
        )
      );
    } else {
      // JSCopyDataProperties(exc_obj, from, to, | -> | e)
      cx.getCurrentBB().args.push(
        new JSCopyDataPropertiesSEXP(
          new NullSEXP(),
          prop.argument.name,
          obj$id,
          obj$id
        )
      );
    }
  }

  return new EnvReadSEXP(obj$id);

  // let isSimpleObject = !init.properties.some((e) => isJS3SpreadElement(e));
  // if (isSimpleObject) {
  //   const args = init.properties.map((e) => {
  //     // JS3ObjectMethod | JS3ObjectProperty | JS3SpreadElement
  //     if (isJS3ObjectMethod(e)) {
  //       if (e.computed) {
  //         e.kind
  //         return new JSComputedObjectMethodSEXP(IRIV2_RVAL(cx, e.key), handleFunctionExpression(cx, e), e.kind);
  //       } else {
  //         return new JSObjectMethodSEXP(getObjKeyString(e.key), handleFunctionExpression(cx, e), e.kind);
  //       }
  //     } else if (isJS3ObjectProperty(e)) {
  //       if (e.computed) {
  //         return new JSComputedObjectPropSEXP(IRIV2_RVAL(cx, e.key), IRIV2_RVAL(cx, e.value));
  //       } else {
  //         return new JSObjectPropSEXP(getObjKeyString(e.key), IRIV2_RVAL(cx, e.value));
  //       }
  //     } else {
  //       throw new Error("simple objects are not expected to have spread");
  //     }
  //   });
  //   return new JSObjectSEXP(args);
  // } else {
  //   throw new Error("TODO: obj spread");
  //   // S1: obj = {}
  //   // S2: case Meth.  : JSComputedObjectMethodSEXP(obj, [key], func) | JSObjectMethodSEXP(obj, key, func)
  //   //     case Prop.  : JSComputedObjectPropSEXP(obj, [key], val) | JSObjectPropSEXP(obj, key, val)
  //   //     case Spread : JSCopyDataProperties(exc_obj / NULL, source / spread, target / obj, store / obj_ref)
  // }
}