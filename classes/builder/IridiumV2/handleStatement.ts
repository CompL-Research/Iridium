import debugConfig from "#debugConfig";
import { ArrayPattern, assignmentExpression, AssignmentExpression, AssignmentPattern, identifier, Identifier, isArrayPattern, isAssignmentPattern, isIdentifier, isObjectPattern, isVariableDeclaration, ObjectPattern, variableDeclaration, VariableDeclaration, variableDeclarator } from "@babel/types";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks.ts";
import { generateIdentifier, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Helpers/JS3Constructors.ts";
import { isJS3ArrayPattern, isJS3AssnObjectProperty, isJS3BlockStatement, isJS3BreakStatement, isJS3ContinueStatement, isJS3DebuggerStatement, isJS3DoWhileStatement, isJS3EmptyStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ForInStatement, isJS3ForOfStatement, isJS3ForStatement, isJS3FunctionDeclaration, isJS3IfStatement, isJS3ImportDeclaration, isJS3LabeledStatement, isJS3MemberExpression, isJS3ObjectPattern, isJS3PrivateName, isJS3RestElement, isJS3ReturnStatement, isJS3SwitchStatement, isJS3ThrowStatement, isJS3TryStatement, isJS3VariableDeclaration, isJS3WhileStatement, JS3AllowedFunctionArgs, JS3AllowedProgStatement, JS3ArrayPattern, JS3BlockStatement, JS3BlockStatement_body, JS3ForInStatement, JS3ForOfStatement, JS3ForStatement, JS3FunctionDeclaration, JS3IfStatement, JS3MemberExpression, JS3ObjectPattern, JS3RestElement, JS3ReturnStatement, JS3StaticBlock, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3WhileStatement } from "../JS3Helpers/JS3Types.ts";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2.ts";
import { BinopSEXP, EnvReadSEXP, EnvWriteSEXP, FieldReadSEXP, FieldWriteSEXP, getRegularClosureFlag, GotoSEXP, IfElseJumpSEXP, IfJumpSEXP, IridiumSEXP, JSArraySEXP, JSComputedFieldReadSEXP, JSComputedFieldWriteSEXP, JSCopyDataPropertiesSEXP, JSEnvWriteFlags, JSEnvWriteSEXP, JSForInNextSEXP, JSForInStartSEXP, JSForOfNextSEXP, JSForOfStartSEXP, JSFuncDeclSEXP, JSObjectSEXP, JSThisContextSEXP, JSToObjectSEXP, LambdaSEXP, ListSEXP, NullSEXP, NumberSEXP, ResolveBreakTargetSEXP, ResolveContinueTargetSEXP, ResolveEnvBindingSEXP, ReturnSEXP, StringSEXP } from "./Types.ts";
import { IRIV2_RVAL, lowerExprToResolveEnvBindingSEXP } from "./handleRVal.ts";

import { handleVariableDeclaration as js3handleVariableDeclaration } from "../JS3Helpers/HandleBlocks.ts";
import { handleAssignmentExpression as js3handleAssignmentExpression } from "../JS3Helpers/HandleExpression.ts";

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
    handleForInStatement(cx, stmt);
  } else if (isJS3LabeledStatement(stmt)) {
    if (isJS3WhileStatement(stmt.body)) {
      handleWhileStatement(cx, stmt.body, stmt.label.name);
    } else if (isJS3ForStatement(stmt.body)) {
      handleForStatement(cx, stmt.body, stmt.label.name);
    } else if (isJS3ForInStatement(stmt.body)) {
      handleForInStatement(cx, stmt.body, stmt.label.name);
    } else if (isJS3ForOfStatement(stmt.body)) {
      handleForOfStatement(cx, stmt.body, stmt.label.name);
    } else {
      const currentContext = cx.getCurrentContext();
      const currentBB = currentContext.getCurrentBB();
      cx.addContinuation(currentContext);
      const postBB = currentContext.getCurrentBB();

      let loopHeadContext: IridiumBuildContext = null;

      const loopConfig: {
        loopHeadIDX: number,
        loopBodyIDX: number,
        loopInitIDX: number,
        label: string | null,
        breakTarget: number,
        continueTarget: number
      } = {
        loopHeadIDX: -1,
        loopBodyIDX: -1,
        loopInitIDX: -1,
        label: stmt.label.name,
        breakTarget: postBB.getIDX(),
        continueTarget: -1
      };

      loopConfig.breakTarget = postBB.getIDX();

      const currentBBToLabeledBlockScopeNode = new GotoSEXP(-1);

      // 1. CurrentBB -> labeledBB
      currentBB.args.push(currentBBToLabeledBlockScopeNode);

      // 2. labeledBB
      cx.declareAndPushLexicalContext()
      loopHeadContext = cx.getCurrentContext();
      loopConfig.loopHeadIDX = cx.getCurrentBB().getIDX();
      IRIV2_STMT(cx, stmt.body);
      cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP(loopConfig.label)); // resolution pass will resolve into GOTO(postBB.IDX)
      cx.popContext(); // labeledBB

      // Initialize Node(s)
      loopHeadContext.loopConfig = loopConfig
      currentBBToLabeledBlockScopeNode.setIDX(loopConfig.loopHeadIDX);
    }
  } else if (isJS3ForStatement(stmt)) {
    handleForStatement(cx, stmt);
  } else if (isJS3DoWhileStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3DoWhileStatement");
  } else if (isJS3SwitchStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3SwitchStatement");
  } else if (isJS3ForOfStatement(stmt)) {
    handleForOfStatement(cx, stmt);
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

const handleIteratedLoops = (cx: IRIDIUMV2, stmt: JS3ForOfStatement | JS3ForInStatement, label: string = null) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext = null;

  // const loop head config
  const loopConfig: {
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: label ? label : null,
    breakTarget: -1,
    continueTarget: -1
  }

  loopConfig.breakTarget = postBB.getIDX();

  // Control Flow Nodes
  const currentBBToLoopInitNode = new GotoSEXP(-1);
  const loopInitToLoopTestNode = new GotoSEXP(-1);
  const testBBElseIfNode = new IfElseJumpSEXP(null, -1, -1);

  // 1. Current BB to LoopHead
  currentBB.args.push(currentBBToLoopInitNode);

  // 2. Loop Init
  cx.declareAndPushLexicalContext();
  loopConfig.loopInitIDX = cx.getCurrentBB().getIDX();

  if (isJS3ForOfStatement(stmt)) {
    // JSForOfStartSEXP(RVal, | -> | <loop-iterator>, <loop-method>, <loop-catchoffset>)
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<loop-iterator>"), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<loop-method>"), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<loop-catchoffset>"), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSForOfStartSEXP(stmt.right.name, "<loop-catchoffset>", "<loop-method>", "<loop-iterator>"));
  } else {
    // JSForInStartSEXP(RVal, | -> | <loop-iterator>)
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<loop-iterator>"), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSForInStartSEXP(stmt.right.name, "<loop-iterator>"));
  }
  cx.getCurrentBB().args.push(loopInitToLoopTestNode);

  // 3. Loop Test
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = loopConfig.continueTarget = cx.getCurrentBB().getIDX();

  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<loop-next>"), null, "JSLET", false));
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<loop-done>"), null, "JSLET", false));
  if (isJS3ForOfStatement(stmt)) {
    // JSForOfNext(<loop-iterator>, <loop-method>, <loop-catchoffset>, | -> | <loop-next>, <loop-done>)
    cx.getCurrentBB().args.push(new JSForOfNextSEXP("<loop-iterator>", "<loop-method>", "<loop-catchoffset>", "<loop-done>", "<loop-next>"));
  } else {
    // JSForInNext(<loop-iterator>, | -> | <loop-next>, <loop-done>)
    cx.getCurrentBB().args.push(new JSForInNextSEXP("<loop-iterator>", "<loop-done>", "<loop-next>"));
  }

  testBBElseIfNode.setTest(new EnvReadSEXP("<loop-done>"));
  
  cx.getCurrentBB().args.push(testBBElseIfNode);

  // 4. For-Of Loop Body
  cx.declareAndPushLexicalContext();
  loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX(); // Continue can resume here, iteration variable is set at the top of the loop body...

  const initializer = identifier("<loop-next>");

  if (isVariableDeclaration(stmt.left)) {
    // Ensure only one declarator
    if (stmt.left.declarations.length !== 1) debugConfig.logger.throwIriError("Expected only one declarator on the left side");
    // Ensure no initializer, this is illegal syntax anyway
    if (stmt.left.declarations[0].init) debugConfig.logger.throwIriError("No initializer expected for left side");

    const leftDeclarator = stmt.left.declarations[0];

    // Update Declarator ===> KIND left[Complex] = <loop-next>
    const newDeclarator = variableDeclarator(leftDeclarator.id, initializer);
    const newDeclaration = variableDeclaration(stmt.left.kind, [newDeclarator]);
    handleLoopInitBlock(cx, newDeclaration);
  } else {
    const newAssn = assignmentExpression("=", stmt.left, initializer);
    handleLoopAssnInitBlock(cx, newAssn);
  }

  handleBlockStatement(cx, stmt.body);
  cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP(label));
  cx.popContext(); // Loop Body

  cx.popContext(); // Loop Test

  cx.popContext(); // Loop Init

  // Initialize Nodes
  if (loopHeadContext) {
    loopHeadContext.loopConfig = loopConfig;
    currentBBToLoopInitNode.setIDX(loopConfig.loopInitIDX);
    loopInitToLoopTestNode.setIDX(loopConfig.loopHeadIDX);
    testBBElseIfNode.setTRUE(loopConfig.breakTarget); // If Done, exit
    testBBElseIfNode.setFALSE(loopConfig.loopBodyIDX); // Goto body
  } else {
    debugConfig.logger.throwIriError("[Iterated Loop] Loop head context is null...");
  }

}

const handleForOfStatement = (cx: IRIDIUMV2, stmt: JS3ForOfStatement, label: string = null) => {
  handleIteratedLoops(cx, stmt, label);
  // const currentContext = cx.getCurrentContext();
  // const currentBB = currentContext.getCurrentBB();
  // cx.addContinuation(currentContext);
  // const postBB = currentContext.getCurrentBB();

  // let loopHeadContext: IridiumBuildContext = null;

  // // const loop head config
  // const loopConfig: {
  //   loopHeadIDX: number,
  //   loopBodyIDX: number,
  //   loopInitIDX: number,
  //   label: string | null,
  //   breakTarget: number,
  //   continueTarget: number
  // } = {
  //   loopHeadIDX: -1,
  //   loopBodyIDX: -1,
  //   loopInitIDX: -1,
  //   label: label ? label : null,
  //   breakTarget: -1,
  //   continueTarget: -1
  // }

  // loopConfig.breakTarget = postBB.getIDX();

  // // Control Flow Nodes
  // const currentBBToLoopInitNode = new GotoSEXP(-1);
  // const loopInitToLoopTestNode = new GotoSEXP(-1);
  // const testBBElseIfNode = new IfElseJumpSEXP(null, -1, -1);

  // // 1. Current BB to LoopHead
  // currentBB.args.push(currentBBToLoopInitNode);

  // // 2. For-In Loop Init
  // cx.declareAndPushLexicalContext();
  // loopConfig.loopInitIDX = cx.getCurrentBB().getIDX();

  // // <for-of-loop-iterator> = NUBD
  // // <for-of-loop-method> = NUBD
  // // <for-of-loop-catchoffset> = NUBD
  // // JSForOfStartSEXP(<for-of-loop-iterator>, <for-of-loop-method>, <for-of-loop-catchoffset>)

  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-of-loop-iterator>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-of-loop-method>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-of-loop-catchoffset>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSForOfStartSEXP(stmt.right.name, "<for-of-loop-catchoffset>", "<for-of-loop-method>", "<for-of-loop-iterator>"));
  // cx.getCurrentBB().args.push(loopInitToLoopTestNode);

  // // 3. For-Of Loop Test
  // cx.declareAndPushLexicalContext();
  // loopHeadContext = cx.getCurrentContext();
  // loopConfig.loopHeadIDX = loopConfig.continueTarget = cx.getCurrentBB().getIDX();

  // // let <for-of-loop-next> = NUBD
  // // let <for-of-loop-done> = NUBD
  // // JSForInNext(<for-of-loop-iterator>, <for-of-loop-method>, <for-of-loop-catchoffset>, <for-of-loop-next>, <for-of-loop-done>)

  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-of-loop-next>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-of-loop-done>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSForOfNextSEXP("<for-of-loop-iterator>", "<for-of-loop-method>", "<for-of-loop-catchoffset>", "<for-of-loop-done>", "<for-of-loop-next>"));

  // testBBElseIfNode.setTest(new EnvReadSEXP("<for-of-loop-done>"));
  // cx.getCurrentBB().args.push(testBBElseIfNode);

  // // 4. For-Of Loop Body
  // cx.declareAndPushLexicalContext();
  // loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX(); // Continue can resume here, iteration variable is set at the top of the loop body...

  // if (isVariableDeclaration(stmt.left)) {
  //   // Ensure only one declarator
  //   if (stmt.left.declarations.length !== 1) debugConfig.logger.throwIriError("Expected only one declarator on the left side of For-Of Loop");

  //   // Ensure no initializer, this is illegal syntax anyway
  //   if (stmt.left.declarations[0].init) debugConfig.logger.throwIriError("No initializer expected for left side of For-Of Loop");

  //   const leftDeclarator = stmt.left.declarations[0];
  //   const initializer = identifier("<for-of-loop-next>")

  //   // Update Declarator ===> KIND left[Complex] = <for-of-loop-next>
  //   const newDeclarator = variableDeclarator(leftDeclarator.id, initializer);
  //   const newDeclaration = variableDeclaration(stmt.left.kind, [newDeclarator]);
  //   handleLoopInitBlock(cx, newDeclaration);
  // } else {
  //   debugConfig.logger.throwIriError("For-Of Loop body assignment not handled yet");
  // }

  // handleBlockStatement(cx, stmt.body);
  // cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP(label));
  // cx.popContext(); // For-Of Loop Body

  // cx.popContext(); // For-Of Loop Test

  // cx.popContext(); // For-Of Loop Init

  // // Initialize Nodes
  // if (loopHeadContext) {
  //   loopHeadContext.loopConfig = loopConfig;
  //   currentBBToLoopInitNode.setIDX(loopConfig.loopInitIDX);
  //   loopInitToLoopTestNode.setIDX(loopConfig.loopHeadIDX);
  //   testBBElseIfNode.setTRUE(loopConfig.breakTarget); // If Done, exit
  //   testBBElseIfNode.setFALSE(loopConfig.loopBodyIDX); // Goto body
  // } else {
  //   debugConfig.logger.throwIriError("[ForOfStatement] Loop head context is null...");
  // }
}

const handleForInStatement = (cx: IRIDIUMV2, stmt: JS3ForInStatement, label: string = null) => {
  handleIteratedLoops(cx, stmt, label);
  // const currentContext = cx.getCurrentContext();
  // const currentBB = currentContext.getCurrentBB();
  // cx.addContinuation(currentContext);
  // const postBB = currentContext.getCurrentBB();

  // let loopHeadContext: IridiumBuildContext = null;

  // // const loop head config
  // const loopConfig: {
  //   loopHeadIDX: number,
  //   loopBodyIDX: number,
  //   loopInitIDX: number,
  //   label: string | null,
  //   breakTarget: number,
  //   continueTarget: number
  // } = {
  //   loopHeadIDX: -1,
  //   loopBodyIDX: -1,
  //   loopInitIDX: -1,
  //   label: label ? label : null,
  //   breakTarget: -1,
  //   continueTarget: -1
  // }

  // loopConfig.breakTarget = postBB.getIDX();

  // // Control Flow Nodes
  // const currentBBToLoopInitNode = new GotoSEXP(-1);
  // const loopInitToLoopTestNode = new GotoSEXP(-1);
  // const testBBElseIfNode = new IfElseJumpSEXP(null, -1, -1);

  // // 1. Current BB to LoopHead
  // currentBB.args.push(currentBBToLoopInitNode);

  // // 2. For-In Loop Init
  // cx.declareAndPushLexicalContext();
  // loopConfig.loopInitIDX = cx.getCurrentBB().getIDX();

  // // let iterator$holder = JSToForInIterator(rval)
  // const iterator$holder = cx.js3Builder.utils.getNewTemporary("iterator");
  // const iteratorDeclaration = new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(iterator$holder), new JSToForInIteratorSEXP(new EnvReadSEXP(stmt.right.name)), "JSLET", false);
  // cx.getCurrentBB().args.push(iteratorDeclaration);

  // cx.getCurrentBB().args.push(loopInitToLoopTestNode);

  // // 3. For-In Loop Test
  // cx.declareAndPushLexicalContext();
  // loopHeadContext = cx.getCurrentContext();
  // loopConfig.loopHeadIDX = loopConfig.continueTarget = cx.getCurrentBB().getIDX();

  // // let <for-in-loop-next> = NUBD
  // // let <for-in-loop-done> = NUBD
  // // JSForInNext(iterator$holder, <for-in-loop-next>, <for-in-loop-done>)

  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-in-loop-next>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP("<for-in-loop-done>"), null, "JSLET", false));
  // cx.getCurrentBB().args.push(new JSForInNextSEXP(iterator$holder, "<for-in-loop-done>", "<for-in-loop-next>"));

  // testBBElseIfNode.setTest(new EnvReadSEXP("<for-in-loop-done>"));
  // cx.getCurrentBB().args.push(testBBElseIfNode);

  // // 4. For-In Loop Body
  // cx.declareAndPushLexicalContext();
  // loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX(); // Continue can resume here, iteration variable is set at the top of the loop body...

  // if (isVariableDeclaration(stmt.left)) {
  //   // Ensure only one declarator
  //   if (stmt.left.declarations.length !== 1) debugConfig.logger.throwIriError("Expected only one declarator on the left side of For-In Loop");

  //   // Ensure no initializer, this is illegal syntax anyway
  //   if (stmt.left.declarations[0].init) debugConfig.logger.throwIriError("No initializer expected for left side of For-In Loop");

  //   const leftDeclarator = stmt.left.declarations[0];
  //   const initializer = identifier("<for-in-loop-next>")

  //   // Update Declarator ===> KIND left[Complex] = <for-in-loop-next>
  //   const newDeclarator = variableDeclarator(leftDeclarator.id, initializer);
  //   const newDeclaration = variableDeclaration(stmt.left.kind, [newDeclarator]);
  //   handleLoopInitBlock(cx, newDeclaration);
  // } else {
  //   debugConfig.logger.throwIriError("For-In Loop body assignment not handled yet");
  // }

  // handleBlockStatement(cx, stmt.body);
  // cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP(label));
  // cx.popContext(); // For-In Loop Body

  // cx.popContext(); // For-In Loop Test

  // cx.popContext(); // For-In Loop Init

  // // Initialize Nodes
  // if (loopHeadContext) {
  //   loopHeadContext.loopConfig = loopConfig;
  //   currentBBToLoopInitNode.setIDX(loopConfig.loopInitIDX);
  //   loopInitToLoopTestNode.setIDX(loopConfig.loopHeadIDX);
  //   testBBElseIfNode.setTRUE(loopConfig.breakTarget); // If Done, exit
  //   testBBElseIfNode.setFALSE(loopConfig.loopBodyIDX); // Goto body
  // } else {
  //   debugConfig.logger.throwIriError("[ForInStatement] Loop head context is null...");
  // }
}

const handleForStatement = (cx: IRIDIUMV2, stmt: JS3ForStatement, label: string = null) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext = null;

  // const loop head config
  const loopConfig: {
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: label ? label : null,
    breakTarget: -1,
    continueTarget: -1
  }

  loopConfig.breakTarget = postBB.getIDX();

  // Control Flow Nodes
  const currentBBToLoopInitNode = new GotoSEXP(-1);
  const loopInitToLoopTestNode = new GotoSEXP(-1);
  const testBBElseIfNode = new IfElseJumpSEXP(null, -1, -1);
  const testBBUCTrueNode = new GotoSEXP(-1);
  const updateBBToHeadNode = new GotoSEXP(-1);

  // 1. Current BB to LoopHead
  currentBB.args.push(currentBBToLoopInitNode);

  // 2. For Loop Init 
  cx.declareAndPushLexicalContext();
  loopConfig.loopInitIDX = cx.getCurrentBB().getIDX();
  if (stmt.init) {
    if (isVariableDeclaration(stmt.init)) {
      handleLoopInitBlock(cx, stmt.init);
    } else {
      lowerExprToResolveEnvBindingSEXP(cx, stmt.init);
    }
  }
  cx.getCurrentBB().args.push(loopInitToLoopTestNode);

  // 3. For Loop Test
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = cx.getCurrentBB().getIDX();

  if (stmt.test) {
    const testResult = lowerExprToResolveEnvBindingSEXP(cx, stmt.test);
    testBBElseIfNode.setTest(new EnvReadSEXP(testResult.getBindingName()));
    cx.getCurrentBB().args.push(testBBElseIfNode);
  } else {
    cx.getCurrentBB().args.push(testBBUCTrueNode);
  }

  // 4. While Body
  cx.declareAndPushLexicalContext();
  loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX();
  handleBlockStatement(cx, stmt.body);
  cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP(label));
  cx.popContext(); // While Body

  // 5. Update Body
  cx.declareAndPushLexicalContext();
  loopConfig.continueTarget = cx.getCurrentBB().getIDX();
  if (stmt.update) {
    lowerExprToResolveEnvBindingSEXP(cx, stmt.update);
  }
  cx.getCurrentBB().args.push(updateBBToHeadNode);
  cx.popContext(); // Update Body

  cx.popContext(); // For Loop Test
  cx.popContext(); // For Loop Init

  // Initialize Nodes
  if (loopHeadContext) {
    loopHeadContext.loopConfig = loopConfig;
    currentBBToLoopInitNode.setIDX(loopConfig.loopInitIDX);
    loopInitToLoopTestNode.setIDX(loopConfig.loopHeadIDX);
    testBBElseIfNode.setTRUE(loopConfig.loopBodyIDX);
    testBBElseIfNode.setFALSE(loopConfig.breakTarget);
    testBBUCTrueNode.setIDX(loopConfig.loopBodyIDX);
    updateBBToHeadNode.setIDX(loopConfig.loopHeadIDX);
  } else {
    debugConfig.logger.throwIriError("[ForStatement] Loop head context is null...");
  }
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
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
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
    const rValTarget = declaration.init ? IRIV2_RVAL(cx, declaration.init) : new EnvReadSEXP("undefined");

    let for$of$loop$iterator = cx.js3Builder.utils.getNewTemporary("iterator");
    let for$of$loop$method = cx.js3Builder.utils.getNewTemporary("method");
    let for$of$loop$catch = cx.js3Builder.utils.getNewTemporary("catch");
    let for$of$loop$next = cx.js3Builder.utils.getNewTemporary("next");
    let for$of$loop$done = cx.js3Builder.utils.getNewTemporary("done");

    // Alloca
    for (let e of declaration.id.elements) {
      if (isIdentifier(e)) {
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(e.name), null, KIND, false));
      } else if (isJS3RestElement(e)) {
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(e.argument.name), null, KIND, false));
      }
    }

    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$iterator), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$method), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$catch), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSForOfStartSEXP(rValTarget, for$of$loop$catch, for$of$loop$method, for$of$loop$iterator));

    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$next), null, "JSLET", false));
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(for$of$loop$done), null, "JSLET", false));


    for (let e of declaration.id.elements) {
      if (isIdentifier(e)) {
        cx.getCurrentBB().args.push(new JSForOfNextSEXP(for$of$loop$iterator, for$of$loop$method, for$of$loop$catch, for$of$loop$done, for$of$loop$next));
        cx.getCurrentBB().args.push(new EnvWriteSEXP(e.name, new EnvReadSEXP(for$of$loop$next), false, false));
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
          loopHeadIDX: number,
          loopBodyIDX: number,
          loopInitIDX: number,
          label: string | null,
          breakTarget: number,
          continueTarget: number
        } = {
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
        cx.getCurrentBB().args.push(new JSForOfNextSEXP(for$of$loop$iterator, for$of$loop$method, for$of$loop$catch, for$of$loop$done, for$of$loop$next));
        cx.getCurrentBB().args.push(loopToPost);
        cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP(tempres, tempit, new EnvReadSEXP(for$of$loop$next)));
        cx.getCurrentBB().args.push(new EnvWriteSEXP(tempit, new BinopSEXP("+", new EnvReadSEXP(tempit), new NumberSEXP(1)), false, false));
        cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP());
        cx.popContext(); // Loop Context

        loopHeadContext.loopConfig = loopConfig;
        
        currToLoop.setIDX(loopConfig.loopHeadIDX);
        loopToPost.setIDX(loopConfig.breakTarget);

        cx.getCurrentBB().args.push(new EnvWriteSEXP(e.argument.name, new EnvReadSEXP(tempres), false, false));
      }
    }
    return;
  }

  // case c.
  // KIND { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(declaration.id)) {
    let hasRest = false;
    let restElement: JS3RestElement;
    declaration.id.properties.forEach((e) => {
      if (isJS3RestElement(e)) {
        hasRest = true;
        restElement = e;
      }
    });
    
    const rValTarget = declaration.init ? IRIV2_RVAL(cx, declaration.init) : new EnvReadSEXP("undefined");
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
      cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(exc_obj), new JSObjectSEXP([]), "JSLET", false));
    }

    // 3. f1 = orig_rval.f1
    for (let d of declaration.id.properties) {
      if (isJS3AssnObjectProperty(d)) {
        const bindingName = d.value.name;

        let rVal: IridiumSEXP;
        
        if (d.computed) {
          if (isIdentifier(d.key)) {
            rVal = new JSComputedFieldReadSEXP(toObjRes, d.key.name);
            if (hasRest) {
              cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP(exc_obj, d.key.name, new NullSEXP()));
            }
          } else if (isJS3PrivateName(d.key)) {
            debugConfig.logger.throwIriError("JS3 Private Name unhandled in destructuring");
          } else {
            let fieldSEXP = IRIV2_RVAL(cx, d.key)
            rVal = new JSComputedFieldReadSEXP(toObjRes, fieldSEXP);
            if (hasRest) {
              cx.getCurrentBB().args.push(new JSComputedFieldWriteSEXP(exc_obj, fieldSEXP, new NullSEXP()));
            }
          }
        } else {
          if (isIdentifier(d.key)) {
            rVal = new FieldReadSEXP(toObjRes, d.key.name);
            if (hasRest) {
              cx.getCurrentBB().args.push(new FieldWriteSEXP(exc_obj, d.key.name, new NullSEXP()));
            }
          } else if (isJS3PrivateName(d.key)) {
            debugConfig.logger.throwIriError("JS3 Private Name unhandled in destructuring");
          } else {
            rVal = new FieldReadSEXP(toObjRes, '' + d.key.value);
            if (hasRest) {
              cx.getCurrentBB().args.push(new FieldWriteSEXP(exc_obj, '' + d.key.value, new NullSEXP()));
            }
          }
        }

        let KIND : "JSLET" | "JSCONST" | "JSVAR";
        if (stmt.kind === "let") {
          KIND = "JSLET";
        } else if (stmt.kind === "const") {
          KIND = "JSCONST";
        } else {
          KIND = "JSVAR";
        }
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(bindingName), rVal, KIND, false));
      }
    }

    

    if (hasRest) {
      // Declare env binding for the rest element holder
      cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(restElement.argument.name), null, KIND, false));

      // 4. [*] fin_obj = {}
      let fin_obj = cx.js3Builder.utils.getNewTemporary("fin_obj");
      cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(fin_obj), new JSObjectSEXP([]), "JSLET", false));
      
      // 5. [*] JSCopyDataProperties(exc_obj, orig_rval, fin_obj, | -> | e)
      cx.getCurrentBB().args.push(new JSCopyDataPropertiesSEXP(exc_obj, toObjRes, fin_obj, restElement.argument.name));
    }

  }

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

const handleLoopAssnInitBlock = (cx: IRIDIUMV2, stmt: AssignmentExpression) => {
  const otherProps = cx.js3Builder.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };
  js3handleAssignmentExpression(stmt, updatedProps);
  for (let stmt of js3SpillHolder) {
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