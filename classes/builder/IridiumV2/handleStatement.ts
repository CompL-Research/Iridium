import debugConfig from "#debugConfig";
import { ArrayPattern, AssignmentPattern, Identifier, isArrayPattern, isAssignmentPattern, isIdentifier, isObjectPattern, isVariableDeclaration, ObjectPattern, VariableDeclaration } from "@babel/types";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks.ts";
import { generateIdentifier, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Helpers/JS3Constructors.ts";
import { isJS3ArrayPattern, isJS3AssnObjectProperty, isJS3BlockStatement, isJS3BreakStatement, isJS3ContinueStatement, isJS3DebuggerStatement, isJS3DoWhileStatement, isJS3EmptyStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ForInStatement, isJS3ForOfStatement, isJS3ForStatement, isJS3FunctionDeclaration, isJS3IfStatement, isJS3ImportDeclaration, isJS3LabeledStatement, isJS3LoopDeclaration, isJS3MemberExpression, isJS3ObjectPattern, isJS3RestElement, isJS3ReturnStatement, isJS3SwitchStatement, isJS3ThrowStatement, isJS3TryStatement, isJS3VariableDeclaration, isJS3WhileStatement, JS3AllowedFunctionArgs, JS3AllowedProgStatement, JS3ArrayPattern, JS3BlockStatement, JS3BlockStatement_body, JS3ForStatement, JS3FunctionDeclaration, JS3IfStatement, JS3LoopDeclaration, JS3LoopDeclarator, JS3MemberExpression, JS3ObjectPattern, JS3ReturnStatement, JS3StaticBlock, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3WhileStatement } from "../JS3Helpers/JS3Types.ts";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2.ts";
import { EnvReadSEXP, getRegularClosureFlag, GotoSEXP, IfElseJumpSEXP, IridiumSEXP, isBBSEXP, JSEnvWriteFlags, JSEnvWriteSEXP, JSFuncDeclSEXP, JSThisContextSEXP, LambdaSEXP, ListSEXP, ResolveBreakTargetSEXP, ResolveContinueTargetSEXP, ResolveEnvBindingSEXP, ReturnSEXP, StringSEXP } from "./Types.ts";
import { IRIV2_RVAL, lowerExprToResolveEnvBindingSEXP } from "./handleRVal.ts";

import { handleVariableDeclaration as js3handleVariableDeclaration } from "../JS3Helpers/HandleBlocks.ts";

export const IRIV2_STMT = (cx: IRIDIUMV2, stmt: JS3AllowedProgStatement) => {
  if (isJS3ImportDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ImportDeclaration");
  } else if (isJS3ExportDefaultDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ExportDefaultDeclaration");
  } else if (isJS3ExportNamedDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ExportNamedDeclaration");
  } else if (isJS3ExportAllDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ExportAllDeclaration");
  } else if (isJS3DebuggerStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3DebuggerStatement");
  } else if (isJS3ReturnStatement(stmt)) {
    handleReturnStatement(cx, stmt);
  } else if (isJS3ThrowStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ThrowStatement");
  } else if (isJS3VariableDeclaration(stmt)) {
    handleVariableDeclaration(cx, stmt);
  } else if (isJS3FunctionDeclaration(stmt)) {
    handleFunctionDeclaration(cx, stmt);
  } else if (isJS3IfStatement(stmt)) {
    handleIfStatement(cx, stmt);
  } else if (isJS3TryStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3TryStatement");
  } else if (isJS3EmptyStatement(stmt)) {
    // debugConfig.logger.throwIriError("IRIV2: TODO JS3EmptyStatement");
  } else if (isJS3WhileStatement(stmt)) {
    handleWhileStatement(cx, stmt);
  } else if (isJS3BreakStatement(stmt)) {
    const label = stmt.label ? stmt.label.name : null;
    cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP(label));
  } else if (isJS3ContinueStatement(stmt)) {
    const label = stmt.label ? stmt.label.name : null;
    cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP(label));
  } else if (isJS3BlockStatement(stmt)) {
    handleBlockStatement(cx, stmt);
  } else if (isJS3ForInStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ForInStatement");
  } else if (isJS3LabeledStatement(stmt)) {
    if (isJS3WhileStatement(stmt.body)) {
      handleWhileStatement(cx, stmt.body, stmt.label.name);
    } else {
      debugConfig.logger.throwIriError("IRIV2: TODO JS3LabeledStatement");  
    }
  } else if (isJS3ForStatement(stmt)) {
    handleForStatement(cx, stmt);
  } else if (isJS3DoWhileStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3DoWhileStatement");
  } else if (isJS3SwitchStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3SwitchStatement");
  } else if (isJS3ForOfStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ForOfStatement");
  } else {
    debugConfig.logger.throwIriError(
      `IRIV2: Unhandled Statement ${stmt.type}, ${stmt.js3type}`,
    );
  }
};

export const handleBlockStatement = (cx: IRIDIUMV2, stmt: JS3BlockStatement | JS3StaticBlock): IridiumBuildContext => {
  const oldContext = cx.getCurrentContext();
  const newContext = cx.declareAndPushLexicalContext();

  // Add Gotos from oldContext's last BB to currentBB.
  oldContext.getCurrentBB().args.push(new GotoSEXP(newContext.BB[0].idx))
  cx.addContinuation(oldContext);

  for (const s of stmt.body) {
    IRIV2_STMT(cx, s);
  }

  // After generating the code, add a goto from the last lowered block to the oldContexts continuation
  cx.getCurrentBB().args.push(new GotoSEXP(oldContext.getCurrentBB().idx));
  cx.popContext();

  return newContext;
}

const handleReturnStatement = (cx: IRIDIUMV2, stmt: JS3ReturnStatement) => {
  let arg: IridiumSEXP;
  if (stmt.argument) arg = IRIV2_RVAL(cx, stmt.argument);
  else arg = new EnvReadSEXP("undefined");
  cx.getCurrentBB().args.push(new ReturnSEXP(arg));
}

const handleForStatement = (cx: IRIDIUMV2, stmt: JS3ForStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  const gotoStartToInit = new GotoSEXP(-1);
  const gotoInitToTest = new GotoSEXP(-1);
  const gotoTestToPostLoop = new IfElseJumpSEXP(null, -1, -1);
  const gotoPostLoopToTest = new GotoSEXP(-1);

  // CurrBBToTest
  currentBB.args.push(gotoStartToInit);

  // Lower Init Code
  cx.declareAndPushLexicalContext();
  gotoStartToInit.setIDX(cx.getCurrentBB().getIDX());
  if (isVariableDeclaration(stmt.init)) {
    handleLoopInitBlock(cx, stmt.init);
  } else {
    lowerExprToResolveEnvBindingSEXP(cx, stmt.init);
  }
  cx.getCurrentBB().args.push(gotoInitToTest);
  

  // Lower Test code
  cx.declareAndPushLexicalContext();
  gotoInitToTest.setIDX(cx.getCurrentBB().getIDX());
  gotoPostLoopToTest.setIDX(cx.getCurrentBB().getIDX())

  const testResult = lowerExprToResolveEnvBindingSEXP(cx, stmt.test);
  gotoTestToPostLoop.setTest(new EnvReadSEXP(testResult.getBindingName()));
  gotoTestToPostLoop.setFALSE(postBB.getIDX());

  cx.getCurrentBB().args.push(gotoTestToPostLoop);
  cx.popContext();

  // Loop Body
  cx.declareAndPushLexicalContext();
  gotoTestToPostLoop.setTRUE(cx.getCurrentBB().getIDX());
  handleBlockStatement(cx, stmt.body);

  cx.getCurrentBB().args.push(gotoPostLoopToTest);
  cx.popContext();

  cx.popContext();
}

const handleWhileStatement = (cx: IRIDIUMV2, stmt: JS3WhileStatement, label: string = null) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext = null;

  // const loop head config
  const loopConfig: {
    loopHeadIDX: number,
    loopBodyIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    label: label ? label : null,
    breakTarget: -1,
    continueTarget: -1
  }

  loopConfig.breakTarget = postBB.getIDX();

  // Control Flow Nodes
  const currentBBToLoopHeadNode = new GotoSEXP(-1);
  const testBBElseIfNode = new IfElseJumpSEXP(null, -1, -1);

  // 1. Current BB to LoopHead
  currentBB.args.push(currentBBToLoopHeadNode);

  // 2. While Loop Test
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = loopConfig.continueTarget = cx.getCurrentBB().getIDX(); // In a while loop continue returns to test block
  const testResult = lowerExprToResolveEnvBindingSEXP(cx, stmt.test);
  testBBElseIfNode.setTest(new EnvReadSEXP(testResult.getBindingName()));
  cx.getCurrentBB().args.push(testBBElseIfNode);
  
  // 3. While Body
  cx.declareAndPushLexicalContext();
  loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX();
  handleBlockStatement(cx, stmt.body);
  cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP(label));
  
  cx.popContext(); // While Body
  cx.popContext(); // While Loop Test
  
  // Initialize Nodes
  if (loopHeadContext) {
    loopHeadContext.loopConfig = loopConfig;
    currentBBToLoopHeadNode.setIDX(loopConfig.loopHeadIDX);
    testBBElseIfNode.setTRUE(loopConfig.loopBodyIDX);
    testBBElseIfNode.setFALSE(loopConfig.breakTarget);
  } else {
    debugConfig.logger.throwIriError("[WhileStatement] Loop head context is null...");
  }
}

const handleIfStatement = (cx: IRIDIUMV2, stmt: JS3IfStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();
  for (const s of stmt.consequent.body) {
    IRIV2_STMT(cx, s);
  }
  cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
  cx.popContext();

  // Lower Else code
  let falseContext = undefined;
  if (stmt.alternate) {
    falseContext = cx.declareAndPushLexicalContext();
    for (const s of stmt.alternate.body) {
      IRIV2_STMT(cx, s);
    }
    cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
    cx.popContext();
  }
  // Make branch check the last instruction of currentBB
  const ifElseJump = new IfElseJumpSEXP(new EnvReadSEXP(stmt.test.name), trueContext.BB[0].idx, falseContext ? falseContext.BB[0].idx : postBB.idx)
  currentBB.args.push(ifElseJump);
}

const handleVariableDeclaration = (cx: IRIDIUMV2, stmt: JS3VariableDeclaration) => {
  // Assert that only one specifier exists
  if (stmt.kind === "using" || stmt.kind === "await using") {
    debugConfig.logger.throwIriError(
      "JS3VariableDeclaration: 'using' and 'await using' not supported in JS3",
    );
    return;
  }

  // Assert that only one specifier exists
  if (stmt.declarations.length !== 1) {
    debugConfig.logger.throwIriError(
      "JS3VariableDeclaration: expecting exactly one declaration in JS3",
    );
    return;
  }

  const declaration = stmt.declarations[0];
  let KIND: JSEnvWriteFlags;

  if (stmt.kind === "let") KIND = "JSLET"
  else if (stmt.kind === "const") KIND = "JSCONST"
  else if (stmt.kind === "var") KIND = "JSVAR"

  // case a.
  // KIND ID = RVal
  if (isIdentifier(declaration.id)) {
    let rValTarget = declaration.init && IRIV2_RVAL(cx, declaration.init);

    if (!rValTarget) {
      if (KIND === "JSLET") {
        rValTarget = new EnvReadSEXP("undefined");
      } else if (KIND === "JSCONST") {
        debugConfig.logger.throwIriError("const decl without Rval is disallowed");
      }
    }

    const envWrite = new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(declaration.id.name), rValTarget, KIND, false);
    cx.getCurrentBB().args.push(envWrite);
    return;
  }

  // case b.
  // KIND [ ID, ...ID ] = RVal
  if (isJS3ArrayPattern(declaration.id)) {
    const rValTarget = declaration.init && IRIV2_RVAL(cx, declaration.init)
    const [lvals, hasRest] = getArrayDestSEXP(declaration.id);
    const envWrite = new JSEnvWriteSEXP(lvals, rValTarget, KIND, false);
    if (hasRest) envWrite.flags.push(["JSREST", null]);
    envWrite.flags.push(["JSARRDES", null])
    cx.getCurrentBB().args.push(envWrite);
    return;
  }

  // case c.
  // KIND { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(declaration.id)) {
    const rValTarget = declaration.init && IRIV2_RVAL(cx, declaration.init)
    const [lvals, hasRest] = getObjectDestSEXP(declaration.id);
    const envWrite = new JSEnvWriteSEXP(lvals, rValTarget, KIND, false);
    if (hasRest) envWrite.flags.push(["JSREST", null]);
    envWrite.flags.push(["JSOBJDES", null])
    cx.getCurrentBB().args.push(envWrite);
    return;
  }

  debugConfig.logger.throwIriError("IRIV2: JS3VariableDeclaration UNHANDLED");
  return;
}

const handleLoopInitBlock = (cx: IRIDIUMV2, stmt: VariableDeclaration) => {
  const otherProps = cx.js3Builder.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };
  const res = js3handleVariableDeclaration(stmt, updatedProps);
  for (let stmt of res) {
    IRIV2_STMT(cx, stmt)
  }
}

export const getArrayDestSEXP = (stmt: JS3ArrayPattern): [IridiumSEXP, boolean] => {
  // Assertion: a rest element must be the last in the destructuring pattern
  let hasRest = false;
  let sexps = stmt.elements.map((e) => {
    if (isIdentifier(e)) {
      return new ResolveEnvBindingSEXP(e.name);
    } else if (isJS3RestElement(e)) {
      hasRest = true;
      return new ResolveEnvBindingSEXP(e.argument.name);
    }
  });
  return [new ListSEXP(sexps), hasRest];
}

export const getObjectDestSEXP = (stmt: JS3ObjectPattern): [IridiumSEXP, boolean] => {
  // Assertion: a rest element must be the last in the destructuring pattern
  let hasRest = false;
  let sexps = stmt.properties.map((e) => {
    if (isJS3AssnObjectProperty(e)) {
      if (isIdentifier(e.key))
        return new ListSEXP([new StringSEXP(e.key.name), new ResolveEnvBindingSEXP(e.value.name)]);
    } else if (isJS3RestElement(e)) {
      hasRest = true;
      return new ResolveEnvBindingSEXP(e.argument.name);
    }
  });
  return [new ListSEXP(sexps), hasRest];
}

export const lowerArgumentInit = (cx: IRIDIUMV2, params: Array<JS3AllowedFunctionArgs>) => {
  let i = 0;
  for (const arg of params) {
    //
    // 1. LVal Pattern to spill
    //

    let argIdx = i++;

    let toLowerLval:
      | Identifier
      | ArrayPattern
      | ObjectPattern
      | AssignmentPattern;
    if (
      isIdentifier(arg) ||
      isArrayPattern(arg) ||
      isObjectPattern(arg) ||
      isAssignmentPattern(arg)
    ) {
      toLowerLval = arg;
    } else if (
      isIdentifier(arg.argument) ||
      isArrayPattern(arg.argument) ||
      isObjectPattern(arg.argument) ||
      isAssignmentPattern(arg.argument)
    ) {
      argIdx = -1;
      toLowerLval = arg.argument;
    } else {
      toLowerLval = generateIdentifier(arg, "$TODO_IRI_UNDEFINED$");
      debugConfig.logger.throwIriError(
        `IRIV2 function arg, LVAL is unsupported`,
      );
    }

    let currArg = `ARG${argIdx}`;

    cx.getCurrentContext().args.push(currArg);

    //
    // 2. RVal Identifier in argument list
    //
    const toLowerRVal = generateIdentifier(
      arg,
      currArg,
    );

    //
    // 3. Generate code in curr
    //
    const otherProps = cx.js3Builder.utils;
    const js3SpillHolder: JS3BlockStatement_body = [];
    const updatedProps = {
      ...otherProps,
      others: { ...otherProps.others, holder: js3SpillHolder },
    };
    let first = true;
    const generator = (
      LVal:
        | JS3MemberExpression
        | JS3ArrayPattern
        | JS3ObjectPattern
        | Identifier,
      RVal: null | JS3VariableDeclarator_init,
    ) => {
      if (isJS3MemberExpression(LVal))
        debugConfig.logger.log(
          "LVal cannot be JS3MemberExpression in case of variable declarator...",
        );
      else {
        const declarator = generateJS3VariableDeclaratorfromBaseNode(
          LVal,
          RVal,
          null,
          arg,
        );
        // NUBD bindings
        let nubdBindings: Array<string> = []
        if (isIdentifier(LVal)) {
          nubdBindings.push(LVal.name);
        } else if (isArrayPattern(LVal)) {
          LVal.elements.forEach(e => isIdentifier(e) ? nubdBindings.push(e.name) : nubdBindings.push(e.argument.name));
        } else {
          LVal.properties.forEach(p => isJS3AssnObjectProperty(p) ? nubdBindings.push(p.value.name) : nubdBindings.push(p.argument.name))
        }
        nubdBindings.forEach(b => cx.getCurrentContext().nubds.push(b));

        return generateJS3VariableDeclarationfromBaseNode(
          [declarator],
          first ? ((first = false), "var") : "let",
          null,
          arg,
        );
      }
    };
    handleDeclaratorRec(
      toLowerLval,
      toLowerRVal,
      updatedProps,
      generator,
      false,
    );
    // this.handleJS3ProgramBody(js3SpillHolder);

    for (let stmt of js3SpillHolder) {
      IRIV2_STMT(cx, stmt)
    }
  }
}

const handleFunctionDeclaration = (cx: IRIDIUMV2, stmt: JS3FunctionDeclaration) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBBIdx = funcContext.getCurrentBB().idx;
  funcContext.kind = getRegularClosureFlag();

  lowerArgumentInit(cx, stmt.params);

  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  for (const s of stmt.body.body) {
    IRIV2_STMT(cx, s);
  }
  cx.popContext();

  cx.getCurrentBB().args.push(
    new JSFuncDeclSEXP(new ResolveEnvBindingSEXP(stmt.id.name), new LambdaSEXP(funBBIdx))
  );

}