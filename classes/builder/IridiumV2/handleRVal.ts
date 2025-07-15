import { assignmentExpression, BigIntLiteral, Expression, identifier, Identifier, isArrowFunctionExpression, isBigIntLiteral, isBooleanLiteral, isClassExpression, isDecimalLiteral, isFunctionExpression, isIdentifier, isNullLiteral, isNumericLiteral, isSpreadElement, isStringLiteral, isSuper, isThisExpression, isV8IntrinsicIdentifier, memberExpression, NumericLiteral, StringLiteral, thisExpression } from "@babel/types";
import { handleExpression, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression";
import { isJS3AnonMemberExpression, isJS3ArrayExpression, isJS3ArrayPattern, isJS3ArrowFunctionExpression, isJS3AssignmentExpression, isJS3AwaitExpression, isJS3BinaryExpression, isJS3CallExpression, isJS3ClassExpression, isJS3ClassMethod, isJS3ClassPrivateMethod, isJS3ClassPrivateProperty, isJS3ClassProperty, isJS3ConditionalExpression, isJS3ContextualCallExpression, isJS3FunctionExpression, isJS3Import, isJS3MemberExpression, isJS3NewExpression, isJS3ObjectExpression, isJS3ObjectMethod, isJS3ObjectPattern, isJS3ObjectProperty, isJS3PrivateName, isJS3RegExpLiteral, isJS3StaticBlock, isJS3TemplateLiteral, isJS3UnaryExpression, isJS3UpdateExpression, isJS3VariableDeclaration, isJS3YieldExpression, JS3ArrayExpression, JS3ArrowFunctionExpression, JS3AssignmentExpression, JS3AssnInit, JS3AwaitExpression, JS3BlockStatement_body, JS3CallExpression, JS3ClassExpression, JS3ClassMethod, JS3ClassPrivateMethod, JS3ClassPrivateProperty, JS3ClassProperty, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3FunctionExpression, JS3NewExpression, JS3ObjectExpression, JS3ObjectMethod, JS3UnaryExpression, JS3YieldExpression } from "../JS3Helpers/JS3Types";
import { handleBlockStatement, IRIV2_STMT, lowerArgumentInit } from "./handleStatement";
import { IRIDIUMV2 } from "./IRIDIUMV2";
import { AwaitSEXP, BinopSEXP, BitIntSEXP, BooleanSEXP, CallSiteSEXP, EnvReadSEXP, EnvWriteSEXP, FieldReadSEXP, FieldWriteSEXP, getConstructorClosureFlag, getDerivedConstructorClosureFlag, getDerivedMethodClosureFlag, getPrivateDerivedMethodClosureFlag, getPrivateMethodClosureFlag, getPropInitDerivedNoPrivateClosureFlag, getPropInitDerivedPrivateClosureFlag, getPropInitNoPrivateClosureFlag, getPropInitPrivateClosureFlag, getRegularClosureFlag, getStaticPropInitClosureFlag, getStaticPropInitDerivedClosureFlag, GlobalBindingSEXP, GotoSEXP, IfElseJumpSEXP, IridiumSEXP, JSADDBRANDSEXP, JSArraySEXP, JSCheckConstructorSEXP, JSClassMethodDefineSEXP, JSClassSEXP, JSComputedFieldReadSEXP, JSComputedFieldWriteSEXP, JSComputedObjectMethodSEXP, JSComputedObjectPropSEXP, JSEnvWriteSEXP, JSHomeObjContextSEXP, JSInitialYieldSEXP, JSNUBDSEXP, JSObjectMethodSEXP, JSObjectPropSEXP, JSObjectSEXP, JSPrivateFieldReadSEXP, JSPrivateFieldWriteSEXP, JSSpreadSEXP, JSSuperContextSEXP, JSSuperFieldReadSEXP, JSSuperFieldWriteSEXP, JSSuperObjContextSEXP, JSTemplateSEXP, JSThisContextAltSEXP, JSThisContextSEXP, LambdaSEXP, ListSEXP, NullSEXP, NumberSEXP, PrivateSEXP, RegExpSEXP, ResolveEnvBindingSEXP, ResolvePrivateEnvBindingSEXP, ReturnSEXP, StringSEXP, UnopSEXP, YieldSEXP } from "./Types";

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

  // // JS3Meta Property
  // else if (isJS3MetaProperty(init)) {
  //   return this.handleJS3MetaProperty(init);
  // }

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

const handleUnaryExpression = (cx: IRIDIUMV2, node: JS3UnaryExpression): IridiumSEXP => {
  if (node.operator === "delete") {
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
  return new YieldSEXP(node.argument ? node.argument.name : "undefined");
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
    throw new Error("Handle ARR Dest Pattern");
    // const rValTarget = IRIV2_RVAL(cx, right)
    // const [lvals, hasRest] = getArrayDestSEXP(left);
    // const envWrite = new JSEnvWriteSEXP(lvals, rValTarget, undefined, false);
    // if (hasRest) envWrite.flags.push(["JSREST", null]);
    // envWrite.flags.push(["JSARRDES", null]);
    // return envWrite;
  }

  // { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(left)) {
    throw new Error("Handle OBJ Dest Pattern");
    // const rValTarget = IRIV2_RVAL(cx, right)
    // const [lvals, hasRest] = getObjectDestSEXP(left);
    // const envWrite = new JSEnvWriteSEXP(lvals, rValTarget, undefined, false);
    // if (hasRest) envWrite.flags.push(["JSREST", null]);
    // envWrite.flags.push(["JSOBJDES", null])
    // return envWrite;
  }

  throw new Error("Unhandled Assignment Expression");
}

const handleFunctionExpression = (cx: IRIDIUMV2, node: JS3FunctionExpression | JS3ObjectMethod | JS3ClassMethod | JS3ClassPrivateMethod, privateMapping: Map<string, string> | null = null, hasSuper: boolean = false, isPrivateMethod: boolean = false) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.privateMapping = privateMapping;
  const funBB = funcContext.getCurrentBB();
  const funBBIdx = funBB.idx;

  funcContext.isStrict = funcContext.isStrict || node.body.directives.some((val) => val.value.value === "use strict");
  funcContext.isAsync = node.async ? node.async : false;
  funcContext.isGenerator = node.generator ? node.generator : false;

  lowerArgumentInit(cx, node.params);
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

  lowerArgumentInit(cx, node.params);
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
  const args = init.elements.map((e) => {
    if (isIdentifier(e)) {
      return IRIV2_RVAL(cx, e);
    } else {
      throw new Error("IRIV2 TODO: Array Expression Spread");
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
      throw new Error("IRIV2 TODO: Object Expression Spread");
    }
  });
  return new JSObjectSEXP(args);
}