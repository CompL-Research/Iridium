import { getIridiumBinop, getIridiumUnop, getLocInfoIfAvailable, untilFirstMatch } from "#utils";
import {
  ArrayPattern,
  assignmentExpression,
  BigIntLiteral,
  Expression,
  identifier,
  Identifier,
  isArrayPattern,
  isArrowFunctionExpression,
  isAssignmentPattern,
  isBigIntLiteral,
  isBooleanLiteral,
  isClassExpression,
  isDecimalLiteral,
  isFunctionExpression,
  isIdentifier,
  isMemberExpression,
  isNullLiteral,
  isNumericLiteral,
  isObjectPattern,
  isOptionalMemberExpression,
  isRestElement,
  isSpreadElement,
  isStringLiteral,
  isSuper,
  isThisExpression,
  isV8IntrinsicIdentifier,
  memberExpression,
  Node,
  NumericLiteral,
  PatternLike,
  SpreadElement,
  stringLiteral,
  StringLiteral,
  thisExpression
} from "@babel/types";
import {
  handleExpression,
  handleSpreadElement,
  lowerToAnonArrayExpr,
} from "../JS3Helpers/HandleExpression";
import {
  generateJS3ArrayExpressionfromBaseNode,
  generateJS3AssignmentExpressionfromBaseNode,
  generateJS3BinaryExpressionfromBaseNode,
  generateJS3SpreadElement,
  generateJS3SpreadElementfromBaseNode
} from "../JS3Helpers/JS3Constructors";
import {
  isJS3AnonMemberExpression,
  isJS3ArrayExpression,
  isJS3ArrayPattern,
  isJS3ArrowFunctionExpression,
  isJS3AssignmentExpression,
  isJS3AssnObjectProperty,
  isJS3AwaitExpression,
  isJS3BinaryExpression,
  isJS3CallExpression,
  isJS3ClassExpression,
  isJS3ClassMethod,
  isJS3ClassPrivateMethod,
  isJS3ClassPrivateProperty,
  isJS3ClassProperty,
  isJS3ConditionalExpression,
  isJS3ContextualCallExpression,
  isJS3DefaultExportMemberExpression,
  isJS3FunctionExpression,
  isJS3Import,
  isJS3JSXCallExpression,
  isJS3MemberExpression,
  isJS3MetaProperty,
  isJS3NewExpression,
  isJS3ObjectExpression,
  isJS3ObjectMethod,
  isJS3ObjectPattern,
  isJS3ObjectProperty,
  isJS3PrivateName,
  isJS3RegExpLiteral,
  isJS3RestElement,
  isJS3SpreadElement,
  isJS3StaticBlock,
  isJS3TemplateLiteral,
  isJS3UnaryExpression,
  isJS3UpdateExpression,
  isJS3YieldExpression,
  JS3ArrayExpression,
  JS3ArrayPattern_elements,
  JS3ArrayTerminals,
  JS3ArrowFunctionExpression,
  JS3AssignmentExpression,
  JS3AssnInit,
  JS3AwaitExpression,
  JS3BlockStatement_body,
  JS3CallExpression,
  JS3ClassExpression,
  JS3ClassMethod,
  JS3ClassPrivateMethod,
  JS3ClassPrivateProperty,
  JS3ClassProperty,
  JS3ConditionalExpression,
  JS3ContainedExprKey,
  JS3ContextualCallExpression,
  JS3FunctionExpression,
  JS3JSXCallExpression,
  JS3NewExpression,
  JS3ObjectExpression,
  JS3ObjectMethod,
  JS3ObjectMethod_key,
  JS3ObjectPattern_properties,
  JS3RestElement,
  JS3SpreadElement,
  JS3UnaryExpression,
  JS3UpdateExpression,
  JS3YieldExpression
} from "../JS3Helpers/JS3Types";
import {
  createLambda,
  funArgLength,
  handleBlockStatement,
  IRIV2_STMT,
  lowerArgumentInit,
  reduceJSAssignmentExprToIridium,
  reduceMemberExpressionIntoJS3MemberExpression,
} from "./handleStatement";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2";

import {
  ApplySEXP,
  AwaitSEXP,
  BinopSEXP,
  BooleanSEXP,
  CallSiteSEXP,
  EnvReadSEXP,
  EnvWriteSEXP,
  FieldReadSEXP,
  FieldWriteSEXP,
  getConstructorClosureFlag,
  getDerivedConstructorClosureFlag,
  getDerivedMethodClosureFlag,
  getPrivateDerivedMethodClosureFlag,
  getPrivateMethodClosureFlag,
  getPropInitDerivedNoPrivateClosureFlag,
  getPropInitDerivedPrivateClosureFlag,
  getPropInitNoPrivateClosureFlag,
  getPropInitPrivateClosureFlag,
  getRegularClosureFlag,
  getStaticPropInitClosureFlag,
  getStaticPropInitDerivedClosureFlag,
  GlobalBindingSEXP,
  GotoSEXP,
  IDOPSEXP,
  IfElseJumpSEXP,
  IridiumSEXP,
  isLambdaSEXP,
  JSADDBRANDSEXP,
  JSAppendSEXP,
  JSArraySEXP,
  JSBitIntSEXP,
  JSCheckConstructorSEXP,
  JSClassSEXP,
  JSComputedFieldReadSEXP,
  JSComputedFieldWriteSEXP,
  JSCopyDataPropertiesSEXP,
  JSDefineObjMethodSEXP,
  JSDefineObjPropSEXP,
  JSExplicitBindingDeclarationNSEXP,
  JSExplicitBindingDeclarationSEXP,
  JSForOfIteratorCloseSEXP,
  JSForOfNextSEXP,
  JSForOfStartSEXP,
  JSIDOPSEXP,
  JSImplicitBindingDeclarationSEXP,
  JSImplicitBindingDeclarationTypes,
  JSInitialYieldSEXP,
  JSNUBDSEXP,
  JSObjectSEXP,
  JSPrivateFieldReadSEXP,
  JSPrivateFieldWriteSEXP,
  JSPrivateSEXP,
  JSSpreadSEXP,
  JSSuperFieldReadSEXP,
  JSSuperFieldWriteSEXP,
  JSTemplateSEXP,
  JSToObjectSEXP,
  LambdaSEXP,
  ListSEXP,
  NullSEXP,
  NumberSEXP,
  RegExpSEXP,
  ResolveContinueTargetSEXP,
  ResolveEnvBindingSEXP,
  ResolvePrivateEnvBindingSEXP,
  ReturnAsyncSEXP,
  ReturnSEXP,
  StackPopSEXP,
  StackRejectSEXP,
  StackRetainSEXP,
  StringSEXP,
  UNOPDelMemberExprSEXP,
  UNOPDelVarSEXP,
  YieldSEXP
} from "./Types/index";

// Handle RValues | AMPPrivateSEXP
export const IRIV2_RVAL = (cx: IRIDIUMV2, init: JS3AssnInit): IridiumSEXP => {
  //
  // AMP
  //
  if (isIdentifier(init)) {
    return new EnvReadSEXP(init.name, getLocInfoIfAvailable(init));
  } else if (isJS3MemberExpression(init)) {
    // Object:   Identifier | ThisExpression | Super;
    // Property: Identifier | JS3PrivateName;

    // PrivateProp Case
    if (isJS3PrivateName(init.property)) {
      let obj: string;
      let prop: string = init.property.id.name;

      if (isIdentifier(init.object)) {
        obj = init.object.name;
      } else if (isThisExpression(init.object)) {
        obj = "this";
      } else throw new Error("Private member expression, impossible case, super obj");
      return new JSPrivateFieldReadSEXP(obj, prop, getLocInfoIfAvailable(init));
    }

    // Identifier case
    if (!init.computed) {
      // ID.ID
      // THIS.ID
      // SUPER.ID
      if (isIdentifier(init.object)) return new FieldReadSEXP(init.object.name, init.property.name, getLocInfoIfAvailable(init));
      else if (isThisExpression(init.object)) return new FieldReadSEXP("this", init.property.name, getLocInfoIfAvailable(init));
      else if (init.object.extra?.SuperCallCTX) return new JSComputedFieldReadSEXP("<super_obj>", new StringSEXP(init.property.name), getLocInfoIfAvailable(init));
      else return new JSSuperFieldReadSEXP(new StringSEXP(init.property.name));
    } else {
      // ID[ID]
      // THIS[ID]
      // SUPER[ID]
      if (isIdentifier(init.object)) return new JSComputedFieldReadSEXP(init.object.name, init.property.name, getLocInfoIfAvailable(init));
      else if (isThisExpression(init.object)) return new JSComputedFieldReadSEXP("this", init.property.name, getLocInfoIfAvailable(init));
      else if (init.object.extra?.SuperCallCTX) return new JSComputedFieldReadSEXP("<super_obj>", new EnvReadSEXP(init.property.name, getLocInfoIfAvailable()), getLocInfoIfAvailable(init));
      else return new JSSuperFieldReadSEXP(new EnvReadSEXP(init.property.name, getLocInfoIfAvailable()));
    }
  }

  //
  // RValues
  //
  // Handle Literals
  if (init.type === "DecimalLiteral") {
    throw new Error("IRIV2 TODO: Decimal Literal");
  } else if (init.type === "BigIntLiteral") {
    return new JSBitIntSEXP(init.value);
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
    if (init.meta.name === "import") {
      return new EnvReadSEXP("<module_meta>", getLocInfoIfAvailable());
    }
    else {
      return new EnvReadSEXP("new.target", getLocInfoIfAvailable());
    }
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
    return new EnvReadSEXP("this", getLocInfoIfAvailable());
  }

  // JS3CallExpression
  else if (isJS3CallExpression(init) || isJS3JSXCallExpression(init)) {
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
      left = new ResolvePrivateEnvBindingSEXP(init.left.id.name, false);
      // throw new Error("Handle binop with private names");
      return getIridiumBinop("pin", IRIV2_RVAL(cx, init.right), left);
    } else {
      left = IRIV2_RVAL(cx, init.left);
      return getIridiumBinop(init.operator, left, IRIV2_RVAL(cx, init.right));
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
    if (init.object.elements.length !== 1)
      throw new Error("Expected JS3AnonMemberExpression length to be 1");
    return IRIV2_RVAL(cx, init.object.elements[0]);
  }

  // JS3DefaultExportMemberExpression
  else if (isJS3DefaultExportMemberExpression(init)) {
    return new EnvReadSEXP("undefined", getLocInfoIfAvailable());
    console.error("Iridium conversion still not specified (default export expression), codegen is invalid but analysis results may be used");
    // return this.handleJS3DefaultExportMemberExpression(init);
  }

  throw new Error( // @ts-ignore
    `IRIDIUM: Unhandled RVAL ${init.type}, ${init.js3type ? init.js3type : undefined}`,
  );
};

export const handleArrayPatternAssignmentExpr = (
  cx: IRIDIUMV2,
  elements: Array<null | PatternLike>,
  rValTarget: IridiumSEXP,
  safeWrite: boolean = false,
) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // const loop head config for decorators
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
  }

  // 1. Control Flow Nodes
  const entryIntoLoop = new GotoSEXP(-1);
  const exitFromLoop = new GotoSEXP(-1);

  // Enter loop from start BB
  currentBB.args.push(entryIntoLoop);

  // Start === Loop Context ===
  cx.declareAndPushLexicalContext();

  cx.getCurrentContext().loopConfig = loopConfig;

  // Set BB Targets
  entryIntoLoop.setIDX(cx.getCurrentBB().getIDX());
  exitFromLoop.setIDX(postBB.getIDX());

  let for$of$loop$next = cx.js3Builder.utils.getNewTemporary("next");
  let for$of$loop$done = cx.js3Builder.utils.getNewTemporary("done");

  // RetainedOnStack[<loop-iterator>, <loop-method>, <loop-catchoffset>] = JSForOfStartSEXP(RVal)
  cx.getCurrentBB().args.push(
    new StackRetainSEXP(new JSForOfStartSEXP(rValTarget), 3),
  );
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(for$of$loop$next, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(for$of$loop$done, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  for (let e of elements) {

    const stepIterator = () => {
      // Get next element from the iterator
      cx.getCurrentBB().args.push(
        new StackRetainSEXP(new JSForOfNextSEXP(), 2),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(for$of$loop$done, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(for$of$loop$next, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );
    };

    // Identifier | MemberExpression | RestElement | AssignmentPattern | ArrayPattern | ObjectPattern | VoidPattern | TSAsExpression | TSSatisfiesExpression | TSTypeAssertion | TSNonNullExpression;
    if (isIdentifier(e) || isAssignmentPattern(e) || isArrayPattern(e) || isObjectPattern(e)) {
      stepIterator();
      reduceJSAssignmentExprToIridium(cx, assignmentExpression("=", e, identifier(for$of$loop$next)));
      continue;
    } else if (isMemberExpression(e)) {
      const mExpr = reduceMemberExpressionIntoJS3MemberExpression(cx, e);
      stepIterator();
      reduceJSAssignmentExprToIridium(cx, assignmentExpression("=", mExpr, identifier(for$of$loop$next)));
      continue;
    } else if (e === null) {
      stepIterator();
      continue;
    }

    const spreadTillEnd = () => {
      // tempres = []
      // i = 0
      // cx: {
      //  next, done...
      //  if (done) break;
      //  tempres[i] = next;
      //  i = i + 1;
      //  continue
      // }

      // tempres = []
      // i = 0
      let tempres = cx.js3Builder.utils.getNewTemporary("tempres");
      let tempit = cx.js3Builder.utils.getNewTemporary("it");
      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationSEXP(
          new ResolveEnvBindingSEXP(tempres, getLocInfoIfAvailable()),
          new JSArraySEXP([]),
          "JSLET",
          false,
          getLocInfoIfAvailable()
        ),
      );
      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationSEXP(
          new ResolveEnvBindingSEXP(tempit, getLocInfoIfAvailable()),
          new NumberSEXP(0),
          "JSLET",
          false,
          getLocInfoIfAvailable()
        ),
      );
      const currentContext = cx.getCurrentContext();
      const currentBB = currentContext.getCurrentBB();
      cx.addContinuation(currentContext);
      const postBB = currentContext.getCurrentBB();

      let loopHeadContext: IridiumBuildContext = cx.getCurrentContext();

      const loopConfig: {
        kind: "for-of" | "standard";
        loopHeadIDX: number;
        loopBodyIDX: number;
        loopInitIDX: number;
        label: string | null;
        breakTarget: number;
        continueTarget: number;
      } = {
        kind: "for-of",
        loopHeadIDX: -1,
        loopBodyIDX: -1,
        loopInitIDX: -1,
        label: null,
        breakTarget: -1,
        continueTarget: -1,
      };

      loopConfig.breakTarget = postBB.getIDX();

      const currToLoop = new GotoSEXP(-1);
      const loopToPost = new IfElseJumpSEXP(new EnvReadSEXP(for$of$loop$done, getLocInfoIfAvailable()), -1, -1);

      // 1. CurrBB to LoopBB
      currentBB.args.push(currToLoop);

      // 2. Loop
      cx.declareAndPushLexicalContext(); // Loop Context
      loopHeadContext = cx.getCurrentContext();
      loopConfig.loopHeadIDX = loopConfig.continueTarget = cx
        .getCurrentBB()
        .getIDX();
      cx.getCurrentBB().args.push(
        new StackRetainSEXP(new JSForOfNextSEXP(), 2),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(for$of$loop$done, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(for$of$loop$next, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );

      cx.getCurrentBB().args.push(loopToPost);
      cx.addContinuation(cx.getCurrentContext());
      let loopTestContinuation = cx.getCurrentBB().getIDX();
      cx.getCurrentBB().args.push(
        new StackRejectSEXP(
          new JSComputedFieldWriteSEXP(
            tempres,
            tempit,
            new EnvReadSEXP(for$of$loop$next, getLocInfoIfAvailable()),
            getLocInfoIfAvailable(e),
          ),
          1
        )
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          tempit,
          getIridiumBinop("+", new EnvReadSEXP(tempit, getLocInfoIfAvailable()), new NumberSEXP(1)),
          false,
          false,
          getLocInfoIfAvailable()
        ),
      );
      cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP());
      cx.popContext(); // Loop Context

      loopHeadContext.loopConfig = loopConfig;

      currToLoop.setIDX(loopConfig.loopHeadIDX);
      loopToPost.setTRUE(loopConfig.breakTarget);
      loopToPost.setFALSE(loopTestContinuation);

      return identifier(tempres);
    };

    if (isRestElement(e)) {
      if (isIdentifier(e.argument) || isArrayPattern(e.argument) || isObjectPattern(e.argument)) {
        reduceJSAssignmentExprToIridium(cx, assignmentExpression("=", e.argument, spreadTillEnd()));
        continue;
      } else if (isMemberExpression(e.argument)) {
        const mExpr = reduceMemberExpressionIntoJS3MemberExpression(cx, e.argument);
        reduceJSAssignmentExprToIridium(cx, assignmentExpression("=", mExpr, spreadTillEnd()));
        continue;
      } else throw new Error("// unhandled rest array destructuring pattern");
    } else throw new Error(`TODO// unhandled array destructuring pattern: \n${JSON.stringify(e)}`);
  }

  cx.getCurrentBB().args.push(
    new StackRejectSEXP(new JSForOfIteratorCloseSEXP(), 0),
  );

  // Exit from current loop
  cx.getCurrentBB().args.push(exitFromLoop);

  // Close === loop context ===
  cx.popContext();

};

export const handleObjectPatternAssignmentExpr = (
  cx: IRIDIUMV2,
  properties: JS3ObjectPattern_properties,
  rValTarget: IridiumSEXP,
  safeWrite: boolean = false,
) => {
  let hasRest = false;
  let restElement: JS3RestElement | undefined = undefined;
  properties.forEach((e) => {
    if (isJS3RestElement(e)) {
      hasRest = true;
      restElement = e;
    }
  });

  let toObjRes = cx.js3Builder.utils.getNewTemporary("toObjRes");
  // 1. toObjRes = VSysCall[JSToObjectSEXP](rValTarget)
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(toObjRes, getLocInfoIfAvailable()),
      new JSToObjectSEXP(rValTarget),
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  let exc_obj = undefined;
  // 2. [*] exc_obj = {}
  //    for (f of fields)
  //      exc_obj[f] = null;
  if (hasRest) {
    exc_obj = cx.js3Builder.utils.getNewTemporary("exc_obj");
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(exc_obj, getLocInfoIfAvailable()),
        new JSObjectSEXP(),
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );
  }

  // 3. f1 = orig_rval.f1
  for (let d of properties) {
    if (isJS3AssnObjectProperty(d)) {
      const bindingName = d.value.name;

      let rVal: IridiumSEXP;

      if (d.computed) {
        if (isIdentifier(d.key)) {
          rVal = new JSComputedFieldReadSEXP(toObjRes, d.key.name, getLocInfoIfAvailable(d));
          if (hasRest) {

            cx.getCurrentBB().args.push(
              new StackRejectSEXP(
                new JSComputedFieldWriteSEXP(
                  // @ts-expect-error
                  exc_obj,
                  d.key.name,
                  new NullSEXP(),
                  getLocInfoIfAvailable(d)
                ),
                1
              )
            );
          }
        } else if (isJS3PrivateName(d.key)) {
          throw new Error("JS3 Private Name unhandled in destructuring");
        } else {
          let fieldSEXP = IRIV2_RVAL(cx, d.key);
          rVal = new JSComputedFieldReadSEXP(toObjRes, fieldSEXP, getLocInfoIfAvailable(d));
          if (hasRest) {

            cx.getCurrentBB().args.push(
              new StackRejectSEXP(
                new JSComputedFieldWriteSEXP(
                  // @ts-expect-error
                  exc_obj,
                  fieldSEXP,
                  new NullSEXP(),
                  getLocInfoIfAvailable(d)
                ),
                1
              )
            );
          }
        }
      } else {
        if (isIdentifier(d.key)) {
          rVal = new FieldReadSEXP(toObjRes, d.key.name, getLocInfoIfAvailable(d.key));
          if (hasRest) {

            cx.getCurrentBB().args.push(
              new StackRejectSEXP(
                new FieldWriteSEXP(
                  // @ts-expect-error
                  exc_obj,
                  d.key.name,
                  new NullSEXP(),
                  getLocInfoIfAvailable(d)
                ),
                1
              )
            );
          }
        } else if (isJS3PrivateName(d.key)) {
          throw new Error("JS3 Private Name unhandled in destructuring");
        } else {
          rVal = new FieldReadSEXP(toObjRes, "" + d.key.value, getLocInfoIfAvailable(d.key));
          if (hasRest) {
            cx.getCurrentBB().args.push(
              new StackRejectSEXP(
                new FieldWriteSEXP(
                  // @ts-expect-error
                  exc_obj,
                  "" + d.key.value,
                  new NullSEXP(),
                  getLocInfoIfAvailable(d)
                ),
                1
              )
            );
          }
        }
      }

      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(bindingName, rVal, safeWrite, false, getLocInfoIfAvailable()),
      );
    }
  }
  if (hasRest) {
    // 4. [*] fin_obj = {}
    let fin_obj = cx.js3Builder.utils.getNewTemporary("fin_obj");
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(fin_obj, getLocInfoIfAvailable()),
        new JSObjectSEXP(),
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );

    if (!exc_obj) throw new Error("exc_obj is undefined");
    if (!restElement) throw new Error("restElement is undefined");
    if (!isJS3RestElement(restElement))
      throw new Error("restElement is not JS3RestElement");

    cx.getCurrentBB().args.push(
      new StackRetainSEXP(
        new JSCopyDataPropertiesSEXP(exc_obj, toObjRes, fin_obj),
        1,
        2,
      ),
    );

    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        // @ts-expect-error
        restElement.argument.name,
        new StackPopSEXP(),
        safeWrite,
        false,
        // @ts-expect-error
        getLocInfoIfAvailable(restElement.argument)
      ),
    );
  }
};

const handleUnaryExpression = (
  cx: IRIDIUMV2,
  node: JS3UnaryExpression,
): IridiumSEXP => {
  if (node.operator === "delete") {
    if (isJS3MemberExpression(node.argument)) {
      const receiver = node.argument.object;
      const property = node.argument.property;

      const acceptable =
        (isIdentifier(receiver) && isIdentifier(property))
        || (isThisExpression(receiver) && isIdentifier(property));

      if (!acceptable)
        throw new Error(
          `Invalid operand combination for 'handleUnaryExpression'`,
        );

      return getIridiumUnop(
        node.operator,
        new UNOPDelMemberExprSEXP(
          IRIV2_RVAL(cx, receiver),
          node.argument.computed
            ? IRIV2_RVAL(cx, property)
            : new StringSEXP(property.name),
        ),
      );
    } else if (isIdentifier(node.argument)) {
      return getIridiumUnop(
        node.operator,
        new UNOPDelVarSEXP(node.argument.name),
      );
    }

    throw new Error("TODO: unary delete operator");
  } else {
    if (isIdentifier(node.argument)) {
      if (node.operator === "void") return new EnvReadSEXP("undefined", getLocInfoIfAvailable());
      const argument = IRIV2_RVAL(cx, node.argument);
      return getIridiumUnop(node.operator, argument);
    } else
      throw new Error(
        "JS3UnaryExpression: Expected Identifier for non delete operators",
      );
  }
};

const handleYieldExpression = (
  cx: IRIDIUMV2,
  node: JS3YieldExpression,
): IridiumSEXP => {

  if (node.delegate) throw new Error("//TODO handle Yield * (delegated yield)");
  let yieldDoneIndicator =
    cx.js3Builder.utils.getNewTemporary("yieldDoneIndicator");
  let yieldReturnResultHolder = cx.js3Builder.utils.getNewTemporary(
    "yieldReturnResultHolder",
  );

  // Is async context?
  const isAsyncContext = (curr: IridiumBuildContext) => {
    if (curr.BB[0].isClosureBoundary()) return curr.isAsync;
    // recurse
    const parentContext = IridiumBuildContext.CONTEXT_MAP.get(curr.parent);
    if (!parentContext) throw new Error("YIELD: Iridium build context not found");
    return isAsyncContext(parentContext);
  }

  let isAsync = isAsyncContext(cx.getCurrentContext());

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();

  if (isAsync) {
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        yieldReturnResultHolder,
        new AwaitSEXP(yieldReturnResultHolder),
        true,
        false,
        getLocInfoIfAvailable()
      )
    );
  }
  cx.getCurrentBB().args.push(
    new ReturnAsyncSEXP(new EnvReadSEXP(yieldReturnResultHolder, getLocInfoIfAvailable())),
  );
  cx.popContext();

  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(yieldDoneIndicator, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(yieldReturnResultHolder, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  // [STACK (VAL)] AWAIT ARG
  // <yieldDoneIndicator, yieldReturnResultHolder> = YIELD [POP_CTX]
  cx.getCurrentBB().args.push(
    new YieldSEXP(
      isAsync ? new AwaitSEXP(node.argument ? node.argument.name : "undefined") : new EnvReadSEXP(node.argument ? node.argument.name : "undefined", getLocInfoIfAvailable()),
      yieldDoneIndicator,
      yieldReturnResultHolder,
    ),
  );

  // Make branch check the last instruction of currentBB
  const ifJump = new IfElseJumpSEXP(
    new EnvReadSEXP(yieldDoneIndicator, getLocInfoIfAvailable()),
    trueContext.BB[0].idx,
    -1
  );
  cx.getCurrentBB().args.push(ifJump);

  cx.addContinuation(cx.getCurrentContext());
  ifJump.setFALSE(cx.getCurrentBB().getIDX());

  return new EnvReadSEXP(yieldReturnResultHolder, getLocInfoIfAvailable());
};

const handleAwaitExpression = (
  cx: IRIDIUMV2,
  node: JS3AwaitExpression,
): IridiumSEXP => {
  return new AwaitSEXP(node.argument.name);
};

const handleComputedProps = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
): Map<
  | JS3ClassProperty
  | JS3ClassMethod
  | JS3ClassPrivateProperty
  | JS3ClassPrivateMethod,
  string
> => {
  // Allocate locations to store computed prop results
  const computedPropMapping: Map<
    | JS3ClassProperty
    | JS3ClassMethod
    | JS3ClassPrivateProperty
    | JS3ClassPrivateMethod,
    string
  > = new Map();
  const computedProps = node.body.body
    .filter(
      (classItem) =>
        isJS3ClassProperty(classItem) || isJS3ClassMethod(classItem),
    )
    .filter((classItem) => classItem.computed);

  computedProps.forEach((classItem) => {
    let targetID = cx.js3Builder.utils.getNewTemporary(undefined);
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(targetID, getLocInfoIfAvailable()),
        null,
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );
    computedPropMapping.set(classItem, targetID);
  });

  const privateProps = node.body.body.filter(
    (classItem) =>
      isJS3ClassPrivateProperty(classItem) ||
      isJS3ClassPrivateMethod(classItem),
  );
  privateProps.forEach((classItem) => {
    let targetID = cx.js3Builder.utils.getNewTemporary(undefined);
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(targetID, getLocInfoIfAvailable()),
        new JSPrivateSEXP(classItem.key.id.name),
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );
    computedPropMapping.set(classItem, targetID);
  });

  const oldContext = cx.getCurrentContext();
  const newContext = cx.declareAndPushLexicalContext("Lexical");

  // Add Gotos from oldContext's last BB to currentBB.
  oldContext.getCurrentBB().args.push(new GotoSEXP(newContext.BB[0].idx));
  cx.addContinuation(oldContext);

  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP("this", getLocInfoIfAvailable()),
      new EnvReadSEXP("undefined", getLocInfoIfAvailable()),
      "JSCONST",
      false,
      getLocInfoIfAvailable()
    ),
  );
  if (isIdentifier(node.id))
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(node.id.name, getLocInfoIfAvailable(node.id)),
        new JSNUBDSEXP(),
        "JSCONST",
        false,
        getLocInfoIfAvailable(node.id)
      ),
    );

  computedProps.forEach((classItem) => {
    if (!computedPropMapping.has(classItem))
      throw new Error(
        "Expected computed props to have a location already allocated...",
      );
    const computedPropLoc = computedPropMapping.get(classItem);
    if (!computedPropLoc) throw new Error("computedPropLoc is undefined");
    const keyLoweredTo = lowerExprToResolveEnvBindingSEXP(cx, classItem.key);
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        computedPropLoc,
        new EnvReadSEXP(keyLoweredTo.getBindingName(), getLocInfoIfAvailable(classItem)),
        false,
        false,
        getLocInfoIfAvailable()
      ),
    );
  });

  // After generating the code, add a goto from the last lowered block to the oldContexts continuation
  cx.getCurrentBB().args.push(new GotoSEXP(oldContext.getCurrentBB().idx));
  cx.popContext();
  return computedPropMapping;
};

export type PrivateMapping = Map<string, [string, "PROP" | "METHOD"]>;

const getPrivateMapping = (
  computedPropMapping: Map<
    | JS3ClassProperty
    | JS3ClassMethod
    | JS3ClassPrivateProperty
    | JS3ClassPrivateMethod,
    string
  >,
): PrivateMapping | null => {
  const privateMapping: PrivateMapping = new Map();
  for (let [item, target] of computedPropMapping) {
    if (isJS3ClassPrivateProperty(item)) {
      privateMapping.set(item.key.id.name, [target, "PROP"]);
    } else if (isJS3ClassPrivateMethod(item)) {
      privateMapping.set(item.key.id.name, [target, "METHOD"]);
    }
  }
  // In case of no private mappings, return null...
  if (privateMapping.size === 0) return null;
  return privateMapping;
};

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
};

const getMethodKindFlag = (kind: string): string => {
  if (kind === "method") return "METHOD";
  else if (kind === "get") return "GET";
  else if (kind === "set") return "SET";
  throw new Error("Didnt expect constructors to be lowered this way");
};

const lowerNonStaticClassMethods = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
  privateMapping: null | PrivateMapping,
  computedPropMapping: Map<
    | JS3ClassProperty
    | JS3ClassMethod
    | JS3ClassPrivateProperty
    | JS3ClassPrivateMethod,
    string
  >,
) => {
  const nonStaticClassMethods = node.body.body
    .filter(
      (classItem) =>
        isJS3ClassMethod(classItem) || isJS3ClassPrivateMethod(classItem),
    )
    .filter((classItem) => !classItem.static);
  const lambdas: Array<IridiumSEXP> = [];
  const hasSuper = node.superClass ? true : false;

  nonStaticClassMethods
    .filter((n) => isJS3ClassMethod(n))
    .filter((n) => n.kind !== "constructor")
    .forEach((methodNode) => {
      const lambda: Array<IridiumSEXP> = [];
      if (methodNode.computed) {
        if (!computedPropMapping.has(methodNode))
          throw new Error(
            "Expected computed name to have been mapped already...",
          );
        let compProp = computedPropMapping.get(methodNode);
        if (!compProp) throw new Error("compProp is undefined");
        lambda.push(new EnvReadSEXP(compProp, getLocInfoIfAvailable()));
      } else {
        lambda.push(new StringSEXP(getFieldKeyString(methodNode.key)));
      }
      lambda.push(
        handleFunctionExpression(
          cx,
          methodNode,
          privateMapping,
          hasSuper,
          false,
        ),
      );
      lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
      const lambdaNode = new ListSEXP(lambda);
      lambdas.push(lambdaNode);
    });

  nonStaticClassMethods
    .filter((n) => isJS3ClassPrivateMethod(n))
    .forEach((methodNode) => {
      if (!computedPropMapping.has(methodNode))
        throw new Error("Alloca location for private method is missing");
      let allocaLocation = computedPropMapping.get(methodNode);
      if (!allocaLocation) throw new Error("allocaLocation is undefined");

      if (methodNode.kind === "get" || methodNode.kind === "set") throw new Error("setter and getters for private fields not supported yet");

      const funBodyLambda = handleFunctionExpression(
        cx,
        methodNode,
        privateMapping,
        hasSuper,
        true,
      );
      // Initialize the private method alloca location with the
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(allocaLocation, funBodyLambda, true, false, getLocInfoIfAvailable()),
      );

      const lambda: Array<IridiumSEXP> = [];
      lambda.push(new JSPrivateSEXP(methodNode.key.id.name));
      lambda.push(new EnvReadSEXP(allocaLocation, getLocInfoIfAvailable()));
      lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
      const lambdaNode = new ListSEXP(lambda);
      lambdas.push(lambdaNode);
    });

  const lambdaList = new ListSEXP(lambdas);
  return lambdaList;
};

const lowerStaticClassMethods = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
  privateMapping: null | PrivateMapping,
  computedPropMapping: Map<
    | JS3ClassProperty
    | JS3ClassMethod
    | JS3ClassPrivateProperty
    | JS3ClassPrivateMethod,
    string
  >,
) => {
  const staticClassMethods = node.body.body
    .filter(
      (classItem) =>
        isJS3ClassMethod(classItem) || isJS3ClassPrivateMethod(classItem),
    )
    .filter((classItem) => classItem.static);
  const lambdas: Array<IridiumSEXP> = [];
  const hasSuper = node.superClass ? true : false;

  staticClassMethods
    .filter((n) => isJS3ClassMethod(n))
    .forEach((methodNode) => {
      const lambda: Array<IridiumSEXP> = [];
      if (methodNode.computed) {
        if (!computedPropMapping.has(methodNode))
          throw new Error(
            "Expected computed name to have been mapped already...",
          );
        let compProp = computedPropMapping.get(methodNode);
        if (!compProp) throw new Error("compProp is undefined");
        lambda.push(new EnvReadSEXP(compProp, getLocInfoIfAvailable()));
      } else {
        lambda.push(new StringSEXP(getFieldKeyString(methodNode.key)));
      }
      lambda.push(
        handleFunctionExpression(
          cx,
          methodNode,
          privateMapping,
          hasSuper,
          false,
        ),
      );
      lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
      const lambdaNode = new ListSEXP(lambda);
      lambdas.push(lambdaNode);
    });

  staticClassMethods
    .filter((n) => isJS3ClassPrivateMethod(n))
    .forEach((methodNode) => {
      if (!computedPropMapping.has(methodNode))
        throw new Error("Alloca location for private method is missing");
      let allocaLocation = computedPropMapping.get(methodNode);
      if (!allocaLocation) throw new Error("allocaLocation is undefined");

      if (methodNode.kind === "get" || methodNode.kind === "set") throw new Error("setter and getters for private fields not supported yet");

      const funBodyLambda = handleFunctionExpression(
        cx,
        methodNode,
        privateMapping,
        hasSuper,
        true,
      );
      // Initialize the private method alloca location with the
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(allocaLocation, funBodyLambda, true, false, getLocInfoIfAvailable()),
      );

      const lambda: Array<IridiumSEXP> = [];
      lambda.push(new JSPrivateSEXP(methodNode.key.id.name));
      lambda.push(new EnvReadSEXP(allocaLocation, getLocInfoIfAvailable()));
      lambda.push(new StringSEXP(getMethodKindFlag(methodNode.kind)));
      const lambdaNode = new ListSEXP(lambda);
      lambdas.push(lambdaNode);
    });

  const lambdaList = new ListSEXP(lambdas);
  return lambdaList;
};

// This method lowers code for initialization of non-static fields
const createClassNonStaticPropInitClosure = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
  computedPropMapping: Map<
    | JS3ClassProperty
    | JS3ClassMethod
    | JS3ClassPrivateProperty
    | JS3ClassPrivateMethod,
    string
  >,
  privateMapping: null | PrivateMapping,
  hasSuper: boolean,
  addBrand: boolean,
) => {
  const location = cx.js3Builder.utils.getNewTemporary("PropInitClosure");
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.privateMapping = privateMapping;
  const funBBIdx = funcContext.getCurrentBB().idx;

  // Class constructors are strict and use an unmapped arguments object
  funcContext.isStrict = true;
  funcContext.argumentsKind = 2;

  funcContext.isAsync = false;
  funcContext.isGenerator = false;

  // add this
  cx.getCurrentBB().args.push(
    new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9),
  );

  if (addBrand || hasSuper) {
    // add <home_object>
    cx.getCurrentBB().args.push(
      new JSImplicitBindingDeclarationSEXP("<home_object>", "JSCONST", 4),
    );
  }

  if (hasSuper) {
    // add <super_obj>
    cx.getCurrentBB().args.push(
      new JSImplicitBindingDeclarationSEXP(
        "<super_obj>",
        "JSCONST",
        8,
        new ListSEXP([new ResolveEnvBindingSEXP("<home_object>", getLocInfoIfAvailable())]),
      ),
    );
  }

  // Set closure context
  if (hasSuper) {
    funcContext.kind = addBrand
      ? getPropInitDerivedPrivateClosureFlag()
      : getPropInitDerivedNoPrivateClosureFlag();
  } else {
    funcContext.kind = addBrand
      ? getPropInitPrivateClosureFlag()
      : getPropInitNoPrivateClosureFlag();
  }

  for (let classItem of node.body.body) {
    if (isJS3ClassProperty(classItem) && !classItem.static) {
      let memberExpr;
      if (classItem.computed) {
        if (!computedPropMapping.has(classItem))
          throw new Error(
            "Expected computed prop mapping to be resolved for all fields",
          );
        // this[computedFieldLoc] = RVal
        let compProp = computedPropMapping.get(classItem);
        if (!compProp) throw new Error("compProp is undefined");
        memberExpr = memberExpression(
          thisExpression(),
          identifier(compProp),
          true,
        );
      } else {
        // this.field = RVal
        let lookupField: string = getFieldKeyString(classItem.key);
        memberExpr = memberExpression(
          thisExpression(),
          identifier(lookupField),
          false,
        );
      }
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      lowerExprToResolveEnvBindingSEXP(
        cx,
        assignmentExpression(
          "=",
          memberExpr,
          classItem.value ? classItem.value : identifier("undefined"),
        ),
      );
    } else if (isJS3ClassPrivateProperty(classItem) && !classItem.static) {
      // this.#field = RVal
      if (!computedPropMapping.has(classItem))
        throw new Error(
          "Expected computed prop mapping to be resolved for all fields",
        );
      let compProp = computedPropMapping.get(classItem);
      if (!compProp) throw new Error("compProp is undefined");
      let lookupPrivateKeyHolder = new EnvReadSEXP(compProp, getLocInfoIfAvailable());
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      let loweredValue: IridiumSEXP = new EnvReadSEXP(
        classItem.value
          ? lowerExprToResolveEnvBindingSEXP(
            cx,
            classItem.value,
          ).getBindingName()
          : "undefined",
        getLocInfoIfAvailable()
      );
      cx.getCurrentBB().args.push(
        new StackRejectSEXP(
          new JSPrivateFieldWriteSEXP(
            "this",
            lookupPrivateKeyHolder,
            loweredValue,
            true,
            getLocInfoIfAvailable(classItem)
          ),
          1,
        ),
      );
    }
  }

  if (addBrand) {
    // add_brand this <home_object>
    cx.getCurrentBB().args.push(
      new StackRejectSEXP(
        new JSADDBRANDSEXP(
          new EnvReadSEXP("this", getLocInfoIfAvailable()),
          new EnvReadSEXP("<home_object>", getLocInfoIfAvailable()),
        ),
        0,
      ),
    );
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined", getLocInfoIfAvailable())));

  cx.popContext();
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(location, getLocInfoIfAvailable()),
      new LambdaSEXP(funBBIdx),
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  return location;
};

// This method lowers code for initialization of non-static fields
const createClassStaticPropInitClosure = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
  computedPropMapping: Map<
    | JS3ClassProperty
    | JS3ClassMethod
    | JS3ClassPrivateProperty
    | JS3ClassPrivateMethod,
    string
  >,
  privateMapping: null | PrivateMapping,
  hasSuper: boolean,
) => {
  const location = cx.js3Builder.utils.getNewTemporary("StaticPropInitClosure");
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  funcContext.privateMapping = privateMapping;
  const funBBIdx = funcContext.getCurrentBB().idx;

  // Class constructors are strict and use an unmapped arguments object
  funcContext.isStrict = true;
  funcContext.argumentsKind = 2;

  funcContext.isAsync = false;
  funcContext.isGenerator = false;

  // add this context
  cx.getCurrentBB().args.push(
    new JSImplicitBindingDeclarationSEXP("this", "JSCONST", 9),
  );

  if (hasSuper) {
    // add <home_object>
    cx.getCurrentBB().args.push(
      new JSImplicitBindingDeclarationSEXP("<home_object>", "JSCONST", 4),
    );
    // add <super_obj>
    cx.getCurrentBB().args.push(
      new JSImplicitBindingDeclarationSEXP(
        "<super_obj>",
        "JSCONST",
        8,
        new ListSEXP([new ResolveEnvBindingSEXP("<home_object>", getLocInfoIfAvailable())]),
      ),
    );
  }

  // Set closure context
  if (hasSuper) {
    funcContext.kind = getStaticPropInitClosureFlag();
  } else {
    funcContext.kind = getStaticPropInitDerivedClosureFlag();
  }

  // Set classname to "this" if it exists
  if (node.id) {
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(node.id.name, getLocInfoIfAvailable(node.id)),
        new EnvReadSEXP("this", getLocInfoIfAvailable()),
        "JSCONST",
        false,
        getLocInfoIfAvailable(node.id)
      ),
    );
  }

  for (let classItem of node.body.body) {
    if (isJS3ClassProperty(classItem) && classItem.static) {
      let memberExpr;
      if (classItem.computed) {
        if (!computedPropMapping.has(classItem))
          throw new Error(
            "Expected computed prop mapping to be resolved for all fields",
          );
        // this[computedFieldLoc] = RVal
        let compProp = computedPropMapping.get(classItem);
        if (!compProp) throw new Error("compProp is undefined");
        memberExpr = memberExpression(
          thisExpression(),
          identifier(compProp),
          true,
        );
      } else {
        // this.field = RVal
        let lookupField: string = getFieldKeyString(classItem.key);
        memberExpr = memberExpression(
          thisExpression(),
          identifier(lookupField),
          false,
        );
      }
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      lowerExprToResolveEnvBindingSEXP(
        cx,
        assignmentExpression(
          "=",
          memberExpr,
          classItem.value ? classItem.value : identifier("undefined"),
        ),
      );
    } else if (isJS3ClassPrivateProperty(classItem) && classItem.static) {
      // this.#field = RVal
      if (!computedPropMapping.has(classItem))
        throw new Error(
          "Expected computed prop mapping to be resolved for all fields",
        );
      let compProp = computedPropMapping.get(classItem);
      if (!compProp) throw new Error("compProp is undefined");
      let lookupPrivateKeyHolder = new EnvReadSEXP(compProp, getLocInfoIfAvailable());
      // if (!classItem.value) throw new Error("TODO: Class props with no defualt value");
      let loweredValue: IridiumSEXP = new EnvReadSEXP(
        classItem.value
          ? lowerExprToResolveEnvBindingSEXP(
            cx,
            classItem.value,
          ).getBindingName()
          : "undefined",
        getLocInfoIfAvailable()
      );
      cx.getCurrentBB().args.push(
        new StackRejectSEXP(
          new JSPrivateFieldWriteSEXP(
            "this",
            lookupPrivateKeyHolder,
            loweredValue,
            true,
            getLocInfoIfAvailable(classItem)
          ),
          1,
        ),
      );
    } else if (isJS3StaticBlock(classItem)) {
      // { /** code **/ }
      handleBlockStatement(cx, classItem);
    }
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined", getLocInfoIfAvailable())));

  cx.popContext();
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(location, getLocInfoIfAvailable()),
      new LambdaSEXP(funBBIdx),
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  return location;
};

const createClassConstructorClosure = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
  superClass: EnvReadSEXP | undefined,
  propInitClos: string,
): LambdaSEXP => {

  let constructor: undefined | Array<JS3ClassMethod> | JS3ClassMethod =
    node.body.body
      .filter((item) => isJS3ClassMethod(item))
      .filter((item) => item.kind === "constructor");

  constructor = constructor.length > 0 ? constructor[0] : undefined;

  const constructorBody = constructor ? constructor.body.body : [];

  const isSimpleArgs = constructor ? constructor.params.every(p => isIdentifier(p)) : true;

  // Class methods are always strict mode
  const isStrict = true;

  const isAsync = constructor ? constructor.async : false;
  const isGenerator = constructor ? constructor.generator : false;

  let kind = superClass ? getDerivedConstructorClosureFlag() : getConstructorClosureFlag();

  const params = constructor ? constructor.params : []

  const ecmaArgs = funArgLength(params); // 15.1.5 Static Semantics: ExpectedArgumentCount

  const implicitBindings: Array<{ name: string, type: JSImplicitBindingDeclarationTypes, value: number, initializer?: ListSEXP }> = [
    { name: "arguments", type: "JSVAR", value: isStrict ? 0 : isSimpleArgs ? 1 : 0 },
    { name: "new.target", type: "JSVAR", value: 3 },
    { name: "<home_object>", type: "JSVAR", value: 4 },
    {
      name: "<super_obj>",
      type: "JSCONST",
      value: 8,
      initializer: new ListSEXP([new ResolveEnvBindingSEXP("<home_object>", getLocInfoIfAvailable())]),
    },
  ];

  // Add <super_ctr> to the scope in case this is a derived class constructor
  // This will allow us to call super
  if (superClass) {
    // this = NUBD
    // This is a special case where we use thisinit
    implicitBindings.push({ name: "this", type: "JSCONST", value: 10 });
    implicitBindings.push({ name: "this.active_func", type: "JSCONST", value: 2 });
    implicitBindings.push(
      {
        name: "<super_ctr>",
        type: "JSCONST",
        value: 7,
        initializer: new ListSEXP([new ResolveEnvBindingSEXP("this.active_func", getLocInfoIfAvailable())]),
      },
    );
  } else {
    // add "this" to the closure scope
    implicitBindings.push({ name: "this", type: "JSCONST", value: 9 });
  }

  const closureScopeCallback = () => {
    // We initialize the binding which stores a reference to the property init closure
    // it has to be <class_fields_init> so that eval can find it in QJS
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationNSEXP(
        new ResolveEnvBindingSEXP("<class_fields_init>", getLocInfoIfAvailable()),
        new EnvReadSEXP(propInitClos, getLocInfoIfAvailable()),
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );
  };

  const bodyScopeCallback = () => {
    //  -- No heritage
    //    -- CheckCTR (verifies if the function was invoked using new)
    //    -- call propInitClosure
    //       -- [!USER_DEF_CTR] NONE
    //       -- [USER_DEF_CTR] LOWER CTR BODY INTO SCOPE
    //    -- return "undefined"
    // 
    //  -- With heritage
    //    -- CheckCTR (verifies if the function was invoked using new)
    //    -- [!USER_DEF_CTR]
    //      -- <TMP> = super() // This <TMP> must exist, the decorator expects this format when inserting thisinit.
    //    -- [USER_DEF_CTR]
    //      -- LOWER CTR BODY INTO SCOPE
    //    -- return "this"

    // NOTE: Decorator pass will later decorate <TMP> = super() with this initialization followed by field/prop initialization closure call.
    //      -- this = <TMP>
    //      -- propInitClosure (this is why we store propInitClos in the Iridium Build context)

    // Ensure the constructor was called using new
    cx.getCurrentBB().args.push(
      new StackRejectSEXP(new JSCheckConstructorSEXP(), 0),
    );

    if (!superClass) {
      // call propInitClosure
      cx.getCurrentBB().args.push(
        new StackRejectSEXP(
          generateIridiumCall(
            cx,
            new EnvReadSEXP(propInitClos, getLocInfoIfAvailable()),
            new EnvReadSEXP("this", getLocInfoIfAvailable()),
            [],
            "CONTEXTUAL"
          ),
          1
        )
      );

      for (let item of constructorBody) IRIV2_STMT(cx, item);

      cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined", getLocInfoIfAvailable())));
    } else {
      if (!constructor) {
        // Call constructor and initialize "this"
        // const args: Array<IridiumSEXP> = [];
        // args.push(new EnvReadSEXP("<super_ctr>", getLocInfoIfAvailable()));
        // args.push(new EnvReadSEXP("new.target", getLocInfoIfAvailable()));
        // const superCall = new CallSiteSEXP(args, "Super");
        cx.getCurrentBB().args.push(
          new JSExplicitBindingDeclarationSEXP(
            new ResolveEnvBindingSEXP(cx.js3Builder.utils.getNewTemporary("superResHolder"), getLocInfoIfAvailable()),
            generateIridiumCall(cx, new EnvReadSEXP("<super_ctr>", getLocInfoIfAvailable()), new EnvReadSEXP("new.target", getLocInfoIfAvailable()), [generateJS3SpreadElementfromBaseNode(identifier("arguments"), node)], "SUPER"),
            "JSLET",
            false,
            getLocInfoIfAvailable()
          ),
        );
      } else for (let item of constructorBody) IRIV2_STMT(cx, item);

      cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("this", getLocInfoIfAvailable())));
    }
  };

  const funcContextCallback = (funcContext: IridiumBuildContext) => {
    funcContext.propInitClos = propInitClos;
  };

  const lambdaIDX = createLambda(
    cx,
    isSimpleArgs,
    isStrict,
    isAsync,
    isGenerator,
    kind,
    ecmaArgs,
    params,
    [],
    implicitBindings,
    node.id ? node.id.name : "<CONSTRUCTOR>",
    null,
    funcContextCallback,
    closureScopeCallback,
    bodyScopeCallback
  );

  return new LambdaSEXP(lambdaIDX, node.id ? node.id.name : "");
};

const handleUpdateExpression = (
  cx: IRIDIUMV2,
  node: JS3UpdateExpression,
): IridiumSEXP => {
  if (isIdentifier(node.argument)) {

    // return new IDOPSEXP(
    //   new EnvReadSEXP(node.argument.name),
    //   node.prefix,
    //   node.operator === "++"
    // );

    if (node.prefix) {
      // n = n [+|-] 1
      // ret n
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          node.argument.name,
          getIridiumBinop(
            node.operator === "++" ? "+" : "-",
            new EnvReadSEXP(node.argument.name, getLocInfoIfAvailable(node.argument)),
            new NumberSEXP(1),
          ),
          false,
          false,
          getLocInfoIfAvailable(node.argument)
        ),
      );
      return new EnvReadSEXP(node.argument.name, getLocInfoIfAvailable(node.argument));
    } else {
      // tmp = n;
      // n = n [+|-] 1;
      // ret tmp

      let tmp = cx.js3Builder.utils.getNewTemporary(undefined);

      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationSEXP(
          new ResolveEnvBindingSEXP(tmp, getLocInfoIfAvailable()),
          new EnvReadSEXP(node.argument.name, getLocInfoIfAvailable(node.argument)),
          "JSLET",
          false,
          getLocInfoIfAvailable()
        ),
      );

      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          node.argument.name,
          getIridiumBinop(
            node.operator === "++" ? "+" : "-",
            new EnvReadSEXP(node.argument.name, getLocInfoIfAvailable(node.argument)),
            new NumberSEXP(1),
          ),
          false,
          false,
          getLocInfoIfAvailable(node.argument)
        ),
      );

      return new EnvReadSEXP(tmp, getLocInfoIfAvailable());
    }
  } else {

    // JS3MemberExpression
    //  object = Identifier | ThisExpression | Super
    //  property = Identifier | JS3PrivateName
    //  computed = true | false

    // a.x++ || --this.a || a[x]++ || --this[a]
    if ((isIdentifier(node.argument.object) || isThisExpression(node.argument.object)) && isIdentifier(node.argument.property)) {
      if (!node.argument.computed) {
        return new IDOPSEXP(new FieldReadSEXP(isThisExpression(node.argument.object) ? "this" : node.argument.object.name, node.argument.property.name, isThisExpression(node.argument.object) ? getLocInfoIfAvailable() : getLocInfoIfAvailable(node.argument)), node.prefix, node.operator === "++");
      }
      else {
        return new JSIDOPSEXP(new JSComputedFieldReadSEXP(isThisExpression(node.argument.object) ? "this" : node.argument.object.name, node.argument.property.name, isThisExpression(node.argument.object) ? getLocInfoIfAvailable() : getLocInfoIfAvailable(node.argument)), node.prefix, node.operator === "++");
      }
    }

    // Fallback to generalized emission for other cases...

    // tmp = n[x]
    // n[x] = tmp [+|-] 1
    // prefix ? tmp = tmp [+|-] 1
    // ret tmp

    let tmp = cx.js3Builder.utils.getNewTemporary(undefined);
    let num1 = cx.js3Builder.utils.getNewTemporary(undefined);

    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP( // tmp = n[x]
        new ResolveEnvBindingSEXP(tmp, getLocInfoIfAvailable()),
        IRIV2_RVAL(cx, node.argument),
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );

    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP( // num1 = 1
        new ResolveEnvBindingSEXP(num1, getLocInfoIfAvailable()),
        new NumberSEXP(1),
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );

    cx.getCurrentBB().args.push(
      // n[x] = tmp [+|-] num1
      new StackRejectSEXP(
        IRIV2_RVAL(
          cx,
          generateJS3AssignmentExpressionfromBaseNode(
            "=",
            node.argument,
            generateJS3BinaryExpressionfromBaseNode(
              identifier(tmp),
              identifier(num1),
              node.operator === "++" ? "+" : "-",
              node,
            ),
            node,
          ),
        ),
        1,
      ),
    );

    if (node.prefix) {
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP( // tmp = tmp [+|-] 1
          tmp,
          new BinopSEXP(
            node.operator === "++" ? "+" : "-",
            new EnvReadSEXP(tmp, getLocInfoIfAvailable()),
            new NumberSEXP(1),
          ),
          false,
          false,
          getLocInfoIfAvailable()
        ),
      );
    }

    return new EnvReadSEXP(tmp, getLocInfoIfAvailable());
  }
};

const handleClassExpression = (
  cx: IRIDIUMV2,
  node: JS3ClassExpression,
): IridiumSEXP => {
  const name = node.id ? node.id.name : "";

  const finalClassRes = cx.js3Builder.utils.getNewTemporary("ClassRes");

  let oldContext: IridiumBuildContext | undefined = undefined, newContext: IridiumBuildContext | undefined = undefined;

  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(finalClassRes, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );


  if (name !== "") {
    // If this is a named class, create a special evaluation scope where the class name is resolvable

    oldContext = cx.getCurrentContext();
    newContext = cx.declareAndPushLexicalContext();

    oldContext.getCurrentBB().args.push(new GotoSEXP(newContext.BB[0].idx))

    cx.addContinuation(oldContext);

    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationNSEXP(
        new ResolveEnvBindingSEXP(name, getLocInfoIfAvailable()),
        new JSNUBDSEXP(),
        "JSCONST",
        false,
        getLocInfoIfAvailable()
      ),
    );

  }

  let superClass: EnvReadSEXP | undefined = undefined;
  if (node.superClass) {
    if (isIdentifier(node.superClass)) {
      superClass = new EnvReadSEXP(
        node.superClass.name,
        getLocInfoIfAvailable(node.superClass)
      );
    }
    else {
      // 
      // Heritage evaluation should take place in a special scope where the classname eventually points to the name of the class if it exists
      // 
      // if (name === "") {
        superClass = new EnvReadSEXP(
          lowerExprToResolveEnvBindingSEXP(cx, node.superClass).getBindingName(),
          getLocInfoIfAvailable()
        );
      // }
      // else {
      //   throw new Error("Heritage computation special block not supported yet!");
      // }

    }
  };
  const hasSuper = node.superClass ? true : false;

  const heritage = node.superClass
    ? superClass
    : new EnvReadSEXP("undefined", getLocInfoIfAvailable());
  const addBrand = node.body.body.some(
    (n) => isJS3ClassPrivateMethod(n) && !n.static,
  );
  const addStaticBrand = node.body.body.some(
    (n) => isJS3ClassPrivateMethod(n) && n.static,
  );

  const computedPropMapping = handleComputedProps(cx, node);
  const privateMapping: PrivateMapping | null =
    getPrivateMapping(computedPropMapping);
  const classPropInitClosure = createClassNonStaticPropInitClosure(
    cx,
    node,
    computedPropMapping,
    privateMapping,
    hasSuper,
    addBrand,
  );
  const constructorLambda = createClassConstructorClosure(
    cx,
    node,
    superClass,
    classPropInitClosure,
  );
  const methodList = lowerNonStaticClassMethods(
    cx,
    node,
    privateMapping,
    computedPropMapping,
  );
  const staticMethodList = lowerStaticClassMethods(
    cx,
    node,
    privateMapping,
    computedPropMapping,
  );
  const classStaticPropInitClosure = createClassStaticPropInitClosure(
    cx,
    node,
    computedPropMapping,
    privateMapping,
    hasSuper,
  );

  const classObj = new JSClassSEXP(
    hasSuper,
    name,
    heritage ? heritage : new EnvReadSEXP("undefined", getLocInfoIfAvailable()),
    constructorLambda,
    new EnvReadSEXP(classPropInitClosure, getLocInfoIfAvailable()),
    methodList,
    staticMethodList,
    addBrand,
    addStaticBrand,
    new EnvReadSEXP(classStaticPropInitClosure, getLocInfoIfAvailable()),
  );

  if (name !== "") {
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        name,
        classObj,
        true,
        false,
        getLocInfoIfAvailable()
      ),
    );

    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        finalClassRes,
        new EnvReadSEXP(name, getLocInfoIfAvailable()),
        true,
        false,
        getLocInfoIfAvailable()
      ),
    );

    if (!oldContext) throw new Error("Impossible check, TS cant resolve this yet...");

    cx.getCurrentBB().args.push(new GotoSEXP(oldContext.getCurrentBB().idx));
    cx.popContext();
    return new EnvReadSEXP(finalClassRes, getLocInfoIfAvailable());
  }

  return classObj;
};

export const lowerSpreadToJS3Spread = (
  cx: IRIDIUMV2,
  from: SpreadElement,
) => {
  // Generate 3JS code
  const otherProps = cx.js3Builder.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };

  let res: JS3SpreadElement = handleSpreadElement(from, updatedProps);

  for (const s of js3SpillHolder) {
    IRIV2_STMT(cx, s);
  }

  return res;
};

export const lowerExprToResolveEnvBindingSEXP = (
  cx: IRIDIUMV2,
  from: JS3ContainedExprKey | Expression,
) => {
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

  return new ResolveEnvBindingSEXP(exprRes.name, getLocInfoIfAvailable(exprRes));
};

const handleConditionalExpression = (
  cx: IRIDIUMV2,
  node: JS3ConditionalExpression,
) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  const resHolder = cx.js3Builder.utils.getNewTemporary("conditionalResult");
  currentBB.args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(resHolder, getLocInfoIfAvailable()),
      new EnvReadSEXP("undefined", getLocInfoIfAvailable()),
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();
  let trueVal = lowerExprToResolveEnvBindingSEXP(cx, node.consequent);
  cx.getCurrentBB().args.push(
    new EnvWriteSEXP(resHolder, new EnvReadSEXP(trueVal.getName(), getLocInfoIfAvailable()), false, false, getLocInfoIfAvailable()),
  );
  cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
  cx.popContext();

  // Lower Else code
  const falseContext = cx.declareAndPushLexicalContext();
  let falseVal = lowerExprToResolveEnvBindingSEXP(cx, node.alternate);
  cx.getCurrentBB().args.push(
    new EnvWriteSEXP(resHolder, new EnvReadSEXP(falseVal.getName(), getLocInfoIfAvailable()), false, false, getLocInfoIfAvailable()),
  );
  cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
  cx.popContext();

  // Make branch check the last instruction of currentBB
  const ifElseJump = new IfElseJumpSEXP(
    new EnvReadSEXP(node.test.name, getLocInfoIfAvailable(node.test)),
    trueContext.BB[0].idx,
    falseContext.BB[0].idx,
  );
  currentBB.args.push(ifElseJump);

  return new EnvReadSEXP(resHolder, getLocInfoIfAvailable());
};

const handleAssignmentExpression = (
  cx: IRIDIUMV2,
  node: JS3AssignmentExpression,
) => {
  const left = node.left;
  const right = node.right;

  // case a.
  // ID = RVal
  if (isIdentifier(left)) {
    const rv = IRIV2_RVAL(cx, right);

    // Propagate name property
    if (isLambdaSEXP(rv)) {
      rv.setSETNAME(true);
      rv.setNAME(left.name);
    }
    return new EnvWriteSEXP(left.name, rv, false, false, getLocInfoIfAvailable(left));
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
        return new JSSuperFieldWriteSEXP(
          init.property.name,
          IRIV2_RVAL(cx, right),
        );
      } else
        throw new Error(
          "Expected super write to be an identifier, private are not allowed!!",
        );
    }

    if (isIdentifier(init.property)) {
      let prop: string = init.property.name;
      if (init.computed) {
        return new JSComputedFieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right), getLocInfoIfAvailable(init));
      } else {
        return new FieldWriteSEXP(obj, prop, IRIV2_RVAL(cx, right), getLocInfoIfAvailable(init.property));
      }
    } else {
      let prop: string = init.property.id.name;
      return new JSPrivateFieldWriteSEXP(
        obj,
        prop,
        IRIV2_RVAL(cx, right),
        false,
        getLocInfoIfAvailable(left)
      );
    }
  }

  // [ ID, ...ID ] = RVal
  if (isArrayPattern(left)) {
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
};

const handleFunctionExpression = (
  cx: IRIDIUMV2,
  node:
    | JS3FunctionExpression
    | JS3ObjectMethod
    | JS3ClassMethod
    | JS3ClassPrivateMethod,
  privateMapping: PrivateMapping | null = null,
  hasSuper: boolean = false,
  isPrivateMethod: boolean = false,
) => {
  const isSimpleArgs = node.params.every(p => isIdentifier(p));

  let isStrict;
  if (isJS3ClassMethod(node) || isJS3ClassPrivateMethod(node)) isStrict = true;
  else isStrict = cx.getCurrentContext().isStrict || node.body.directives.some((val) => val.value.value === "use strict");

  const isAsync = node.async ? node.async : false;
  const isGenerator = node.generator ? node.generator : false;

  let kind;
  if (isPrivateMethod && hasSuper) {
    kind = getPrivateDerivedMethodClosureFlag();
  } else if (isPrivateMethod) {
    kind = getPrivateMethodClosureFlag();
  } else if (hasSuper) {
    kind = getDerivedMethodClosureFlag();
  } else {
    kind = getConstructorClosureFlag();
  }

  const ecmaArgs = funArgLength(node.params); // 15.1.5 Static Semantics: ExpectedArgumentCount

  const implicitBindings: Array<{ name: string, type: JSImplicitBindingDeclarationTypes, value: number, initializer?: ListSEXP }> = [
    { name: "arguments", type: "JSVAR", value: isStrict ? 0 : isSimpleArgs ? 1 : 0 },
    { name: "this", type: "JSLET", value: 9 },
    { name: "new.target", type: "JSVAR", value: 3 },
    { name: "<home_object>", type: "JSVAR", value: 4 },
    {
      name: "<super_obj>",
      type: "JSCONST",
      value: 8,
      initializer: new ListSEXP([new ResolveEnvBindingSEXP("<home_object>", getLocInfoIfAvailable())]),
    },
  ];

  let name = "";
  let isComputedName = false;
  let toSetName = false;

  // Propagate lambda name
  if (isJS3FunctionExpression(node) && node.id) {
    name = node.id.name;
    isComputedName = false;
    toSetName = false;
  } else if (isJS3ObjectMethod(node)) {
    name = getObjKeyString(node.key);
    isComputedName = node.computed;
    toSetName = node.computed ? true : false;
  } else if (isJS3ClassMethod(node)) {
    // Set name
    if (isIdentifier(node.key)) name = node.key.name;
    else if (isDecimalLiteral(node.key) || isBigIntLiteral(node.key) || isStringLiteral(node.key) || isNumericLiteral(node.key) || isBooleanLiteral(node.key)) name = "" + node.key.value;
    else if (isNullLiteral(node.key)) name = "null";
    else name = "TODO//JS3ClassMethod::name";
    isComputedName = node.computed;
    toSetName = node.computed ? true : false;
  }

  const funBBIdx = createLambda(
    cx,
    isSimpleArgs,
    isStrict,
    isAsync,
    isGenerator,
    kind,
    ecmaArgs,
    node.params,
    node.body.body,
    implicitBindings,
    name,
    privateMapping
  );

  const lambda = new LambdaSEXP(funBBIdx);
  lambda.setNAME(name);
  lambda.setCNAME(isComputedName);
  lambda.setSETNAME(toSetName);

  return lambda;
};

const generateDynamicCallArgList = (cx: IRIDIUMV2, argList: Array<Identifier | JS3SpreadElement>): string => {
  // let temp$id, insertionIdx$id;
  let temp$id = cx.js3Builder.utils.getNewTemporary("temp");
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(temp$id, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  let insertionIdx$id = cx.js3Builder.utils.getNewTemporary("insertionIdx");
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(insertionIdx$id, getLocInfoIfAvailable()),
      null,
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  // temp$id = [all'E'suntilNow]
  let allEs = untilFirstMatch(argList, (e) => isJS3SpreadElement(e));

  cx.getCurrentBB().args.push(
    new EnvWriteSEXP(
      temp$id,
      handleArrayExpression(
        cx,
        generateJS3ArrayExpressionfromBaseNode(allEs, identifier("IridiumCode")),
      ),
      true,
      false,
      getLocInfoIfAvailable()
    ),
  );

  // let insertionIdx$id = staticOffset
  cx.getCurrentBB().args.push(
    new EnvWriteSEXP(
      insertionIdx$id,
      new NumberSEXP(allEs.length),
      true,
      false,
      getLocInfoIfAvailable()
    ),
  );

  if (!isJS3SpreadElement(argList[allEs.length]))
    throw new Error(`Expected atleast one JS3SpreadElement when lowering dynamic call arg list, use simple routine otherwise! this is inefficient!!`);

  for (let i = allEs.length; i < argList.length; i++) {
    let currEle = argList[i];

    if (isJS3SpreadElement(currEle)) {
      let sElem: JS3SpreadElement = currEle;

      // [tmp, insertionIdx] <- append (tmp, insertionIdx, spreadVal)
      cx.getCurrentBB().args.push(
        new StackRetainSEXP(
          new JSAppendSEXP(
            new EnvReadSEXP(temp$id, getLocInfoIfAvailable()), // push
            new EnvReadSEXP(insertionIdx$id, getLocInfoIfAvailable()), // push
            new EnvReadSEXP(sElem.argument.name, getLocInfoIfAvailable()), // push
          ),
          2,
          0,
        ),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(insertionIdx$id, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(temp$id, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );
    } else {
      let rVal = new EnvReadSEXP(currEle.name, getLocInfoIfAvailable());

      // tmp[insertionIdx] = rVal
      cx.getCurrentBB().args.push(
        new StackRejectSEXP(
          new JSComputedFieldWriteSEXP(
            temp$id,
            insertionIdx$id,
            rVal,
            getLocInfoIfAvailable()
          ),
          1
        )
      );
      // insertionIdx++
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          insertionIdx$id,
          getIridiumBinop(
            "+",
            new EnvReadSEXP(insertionIdx$id, getLocInfoIfAvailable()),
            new NumberSEXP(1),
          ),
          true,
          false,
          getLocInfoIfAvailable()
        ),
      );
    }
  }

  return temp$id;
}

const generateIridiumCall = (cx: IRIDIUMV2, callee: IridiumSEXP, calleeContext: IridiumSEXP, rawCallArguments: Array<JS3ContainedExprKey | JS3SpreadElement | SpreadElement>, kind: "NORMAL" | "CONSTRUCTOR" | "CONTEXTUAL" | "SUPER") => {
  let callArguments: Array<Identifier | JS3SpreadElement> = [];

  // Process lower, it might have been delayed by 3JS
  callArguments = rawCallArguments.map(e => {
    if (isIdentifier(e) || isJS3SpreadElement(e)) return e
    else if (isSpreadElement(e)) return lowerSpreadToJS3Spread(cx, e);
    else return identifier(lowerExprToResolveEnvBindingSEXP(cx, e).getName());
  });

  const isSimpleArgList: boolean = callArguments.find(e => !isIdentifier(e)) === undefined;

  if (isSimpleArgList) {
    // Regular call semantics

    const args: Array<IridiumSEXP> = [];
    if (kind == "CONTEXTUAL" || kind == "SUPER") {
      args.push(calleeContext);
    }
    args.push(callee);

    for (const a of callArguments) {
      if (isIdentifier(a)) {
        args.push(new EnvReadSEXP(a.name, getLocInfoIfAvailable(a)));
      } else throw new Error("TODO // SimpleArgList cannot have spread");
    }

    if (kind === "CONTEXTUAL") {
      return new CallSiteSEXP(args, "CCall");
    } else if (kind === "CONSTRUCTOR") {
      return new CallSiteSEXP(args, "ConstructorCall");
    } else if (kind === "SUPER") {
      return new CallSiteSEXP(args, "Super");
    } else {
      return new CallSiteSEXP(args);
    }
  } else {
    // Apply semantics for arguments
    const argListHolder = generateDynamicCallArgList(cx, callArguments);

    if (kind === "NORMAL" || kind === "CONTEXTUAL") {
      return new ApplySEXP(
        callee, // Callee
        calleeContext,  // CTX, ignored
        new EnvReadSEXP(argListHolder, getLocInfoIfAvailable()), // arglist
        false
      );
    } else {
      let res = new ApplySEXP(
        callee, // Callee
        calleeContext,  // CTX, ignored
        new EnvReadSEXP(argListHolder, getLocInfoIfAvailable()), // arglist
        true // constructor call
      );
      if (kind === "SUPER") res.setSuper();
      return res;
    }
  }
}

const handleNewExpression = (cx: IRIDIUMV2, node: JS3NewExpression) => {
  let callee: IridiumSEXP;
  if (isIdentifier(node.callee)) {
    callee = new EnvReadSEXP(node.callee.name, getLocInfoIfAvailable(node.callee));
  } else throw new Error("TODO // NewExpression with Super | V8IntrinsicIdentifier not supported yet");

  let calleeContext: IridiumSEXP = new NullSEXP();
  return generateIridiumCall(cx, callee, calleeContext, node.arguments, "CONSTRUCTOR");
};

const handleArrowFunctionExpression = (
  cx: IRIDIUMV2,
  node: JS3ArrowFunctionExpression,
) => {
  const isSimpleArgs = node.params.every(p => isIdentifier(p));
  const isStrict = cx.getCurrentContext().isStrict || node.body.directives.some((val) => val.value.value === "use strict");
  const isAsync = node.async ? node.async : false;
  const isGenerator = node.generator ? node.generator : false;
  const kind = getRegularClosureFlag();
  const ecmaArgs = funArgLength(node.params); // 15.1.5 Static Semantics: ExpectedArgumentCount
  // There are no implicit bindings in an arrow function
  const implicitBindings: Array<{ name: string, type: JSImplicitBindingDeclarationTypes, value: number, initializer?: ListSEXP }> = [];

  const funBBIdx = createLambda(
    cx,
    isSimpleArgs,
    isStrict,
    isAsync,
    isGenerator,
    kind,
    ecmaArgs,
    node.params,
    node.body.body,
    implicitBindings
  );

  return new LambdaSEXP(funBBIdx);
};

const handleCallExpression = (cx: IRIDIUMV2, node: JS3CallExpression | JS3JSXCallExpression) => {
  if (isIdentifier(node.callee)) {
    let callee = new EnvReadSEXP(node.callee.name, getLocInfoIfAvailable(node.callee));
    let calleeContext = new NullSEXP();
    return generateIridiumCall(cx, callee, calleeContext, node.arguments, "NORMAL");
  } else if (isSuper(node.callee)) {
    let callee = new EnvReadSEXP("<super_ctr>", getLocInfoIfAvailable(node.callee));
    let calleeContext = new EnvReadSEXP("new.target", getLocInfoIfAvailable(node.callee));
    return generateIridiumCall(cx, callee, calleeContext, node.arguments, "SUPER");
  } else throw new Error("TODO // CallExpression with JS3Import | Super | V8IntrinsicIdentifier");
};

const handleContextualCallExpression = (
  cx: IRIDIUMV2,
  node: JS3ContextualCallExpression,
) => {

  if (isOptionalMemberExpression(node.callee)) throw new Error("TODO // ContextualCall with OptionalMemberExpression");

  // Callee
  const tempHolder = cx.js3Builder.utils.getNewTemporary("ccallCallee");
  {
    if (!node.callee.object.extra) node.callee.object.extra = {};
    node.callee.object.extra = { SuperCallCTX: true };
    const stmt = new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(tempHolder, getLocInfoIfAvailable()),
      IRIV2_RVAL(cx, node.callee),
      "JSLET",
      false,
      getLocInfoIfAvailable()
    );
    cx.getCurrentBB().args.push(stmt);
  }
  const callee = new EnvReadSEXP(tempHolder, getLocInfoIfAvailable());

  // CalleeContext
  let calleeContext: IridiumSEXP;
  if (isIdentifier(node.callee.object)) {
    calleeContext = new EnvReadSEXP(node.callee.object.name, getLocInfoIfAvailable());
  } else {
    calleeContext = new EnvReadSEXP("this", getLocInfoIfAvailable());
  }
  return generateIridiumCall(cx, callee, calleeContext, node.arguments, "CONTEXTUAL");
};

const handleArrayExpression = (cx: IRIDIUMV2, init: JS3ArrayExpression) => {
  let isSimpleArray = !init.elements.some((e) => isJS3SpreadElement(e));

  if (isSimpleArray) {
    const args = init.elements.map((e) => {

      if (
        isIdentifier(e) ||
        isStringLiteral(e) ||
        isNumericLiteral(e) ||
        isNullLiteral(e) ||
        isBooleanLiteral(e) ||
        isThisExpression(e) ||
        isBigIntLiteral(e) ||
        isDecimalLiteral(e)
      ) {
        return IRIV2_RVAL(cx, e);
      } else if (isSpreadElement(e)) {
        throw new Error("Simple arrays are not expected to have spreads");
      } else {
        return new EnvReadSEXP("undefined", getLocInfoIfAvailable());
      }
    });
    return new JSArraySEXP(args);
  } else {
    // let temp$id, insertionIdx$id;
    let temp$id = cx.js3Builder.utils.getNewTemporary("temp");
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(temp$id, getLocInfoIfAvailable()),
        null,
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );

    let insertionIdx$id = cx.js3Builder.utils.getNewTemporary("insertionIdx");
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP(insertionIdx$id, getLocInfoIfAvailable()),
        null,
        "JSLET",
        false,
        getLocInfoIfAvailable()
      ),
    );

    // temp$id = [all'E'suntilNow]
    let allEs = untilFirstMatch(init.elements, (e) => isJS3SpreadElement(e));
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        temp$id,
        handleArrayExpression(
          cx,
          generateJS3ArrayExpressionfromBaseNode(allEs, init),
        ),
        true,
        false,
        getLocInfoIfAvailable()
      ),
    );

    // let insertionIdx$id = staticOffset
    cx.getCurrentBB().args.push(
      new EnvWriteSEXP(
        insertionIdx$id,
        new NumberSEXP(allEs.length),
        true,
        false,
        getLocInfoIfAvailable()
      ),
    );

    if (!isJS3SpreadElement(init.elements[allEs.length]))
      throw new Error("Expected JS3SpreadElement");

    for (let i = allEs.length; i < init.elements.length; i++) {
      let currEle = init.elements[i];

      if (isJS3SpreadElement(currEle)) {
        // [insertionIdx, tmp] <- append (tmp, insertionIdx, spreadVal)
        cx.getCurrentBB().args.push(
          new StackRetainSEXP(
            new JSAppendSEXP(
              new EnvReadSEXP(temp$id, getLocInfoIfAvailable()), // push
              new EnvReadSEXP(insertionIdx$id, getLocInfoIfAvailable()), // push
              new EnvReadSEXP(currEle.argument.name, getLocInfoIfAvailable()), // push
            ),
            2,
            0,
          ),
        );
        cx.getCurrentBB().args.push(
          new EnvWriteSEXP(insertionIdx$id, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
        );
        cx.getCurrentBB().args.push(
          new EnvWriteSEXP(temp$id, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
        );
      } else if (isJS3ArrayTerminals(currEle)) {
        // tmp[insertionIdx] = E
        cx.getCurrentBB().args.push(
          new StackRejectSEXP(
            new JSComputedFieldWriteSEXP(
              temp$id,
              insertionIdx$id,
              IRIV2_RVAL(cx, currEle),
              // new EnvReadSEXP(currEle.name, getLocInfoIfAvailable()),
              getLocInfoIfAvailable(init)
            ),
            1
          )
        );
        // insertionIdx++
        cx.getCurrentBB().args.push(
          new EnvWriteSEXP(
            insertionIdx$id,
            getIridiumBinop(
              "+",
              new EnvReadSEXP(insertionIdx$id, getLocInfoIfAvailable()),
              new NumberSEXP(1),
            ),
            true,
            false,
            getLocInfoIfAvailable()
          ),
        );
      } else {
        throw new Error("IRI: Unhandled case Array Expression");
      }
    }

    return new EnvReadSEXP(temp$id, getLocInfoIfAvailable());
    // S1: tmp = [all'E'suntilNow]
    // S2: let insertionIdx = staticOffset
    // S3: [insertionIdx, tmp] <- append (tmp, insertionIdx, spreadVal)
    // S4: For All'E's, tmp[insertionIdx++] = E
    // S5: Goto
  }
};

// Identifier | StringLiteral | NumericLiteral | BigIntLiteral -> string
const getObjKeyString = (
  key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral,
): string => {
  return isIdentifier(key) ? key.name : "" + key.value;
};

const handleObjectExpression = (cx: IRIDIUMV2, init: JS3ObjectExpression) => {
  let obj$id = cx.js3Builder.utils.getNewTemporary("newObj");
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(obj$id, getLocInfoIfAvailable()),
      new JSObjectSEXP(),
      "JSLET",
      false,
      getLocInfoIfAvailable()
    ),
  );

  for (let prop of init.properties) {
    if (isJS3ObjectMethod(prop)) {
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          obj$id,
          new JSDefineObjMethodSEXP(
            new EnvReadSEXP(obj$id, getLocInfoIfAvailable()),
            prop.computed
              ? IRIV2_RVAL(cx, prop.key)
              : new StringSEXP(getObjKeyString(prop.key)),
            handleFunctionExpression(cx, prop, null, true),
            prop.kind,
          ),
          false,
          false,
          getLocInfoIfAvailable()
        ),
      );
    } else if (isJS3ObjectProperty(prop)) {
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          obj$id,
          new JSDefineObjPropSEXP(
            new EnvReadSEXP(obj$id, getLocInfoIfAvailable()),
            prop.computed
              ? IRIV2_RVAL(cx, prop.key)
              : new StringSEXP(getObjKeyString(prop.key)),
            IRIV2_RVAL(cx, prop.value),
          ),
          false,
          false,
          getLocInfoIfAvailable()
        ),
      );
    } else {
      // JSCopyDataProperties(exc_obj, from, to, | -> | e)
      cx.getCurrentBB().args.push(
        new StackRetainSEXP(
          new JSCopyDataPropertiesSEXP(
            new NullSEXP(),
            prop.argument.name,
            obj$id,
          ),
          1,
          2,
        ),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(obj$id, new StackPopSEXP(), false, false, getLocInfoIfAvailable()),
      );
    }
  }

  return new EnvReadSEXP(obj$id, getLocInfoIfAvailable());
};
function isJS3ArrayTerminals(node: JS3ArrayTerminals | null) {
  return (isIdentifier(node)) || isStringLiteral(node) || isNumericLiteral(node) || isNullLiteral(node) || isBooleanLiteral(node) || isThisExpression(node) || isBigIntLiteral(node) || isDecimalLiteral(node);
}

