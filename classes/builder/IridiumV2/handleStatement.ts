import debugConfig from "#debugConfig";
import { ArrayPattern, assignmentExpression, AssignmentExpression, AssignmentPattern, identifier, Identifier, isArrayPattern, isAssignmentPattern, isIdentifier, isImportSpecifier, isObjectPattern, isObjectProperty, isRestElement, isVariableDeclaration, ObjectPattern, variableDeclaration, VariableDeclaration, variableDeclarator } from "@babel/types";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks";
import { generateIdentifier, generateJS3AssignmentExpressionfromBaseNode, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Helpers/JS3Constructors";
import { isJS3ArrayPattern, isJS3AssnObjectProperty, isJS3BlockStatement, isJS3BreakStatement, isJS3ContinueStatement, isJS3DebuggerStatement, isJS3DoWhileStatement, isJS3EmptyStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportSpecifier, isJS3ForInStatement, isJS3ForOfStatement, isJS3ForStatement, isJS3FunctionDeclaration, isJS3IfStatement, isJS3ImportDeclaration, isJS3LabeledStatement, isJS3MemberExpression, isJS3ObjectPattern, isJS3PrivateName, isJS3RestElement, isJS3ReturnStatement, isJS3SwitchStatement, isJS3ThrowStatement, isJS3TryStatement, isJS3VariableDeclaration, isJS3WhileStatement, JS3AllowedFunctionArgs, JS3AllowedProgStatement, JS3ArrayPattern, JS3BlockStatement, JS3BlockStatement_body, JS3DoWhileStatement, JS3ForInStatement, JS3ForOfStatement, JS3ForStatement, JS3FunctionDeclaration, JS3IfStatement, JS3MemberExpression, JS3ObjectPattern, JS3RestElement, JS3ReturnStatement, JS3StaticBlock, JS3SwitchCase_test, JS3SwitchStatement, JS3TryStatement, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3WhileStatement } from "../JS3Helpers/JS3Types";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2";
import { BinopSEXP, EnvReadSEXP, EnvWriteSEXP, FieldReadSEXP, FieldWriteSEXP, getConstructorClosureFlag, getRegularClosureFlag, GotoSEXP, IfElseJumpSEXP, IfJumpSEXP, InvokeFinalizerSEXP, IridiumSEXP, JSArraySEXP, JSCatchContextSEXP, JSComputedFieldReadSEXP, JSComputedFieldWriteSEXP, JSCopyDataPropertiesSEXP, JSEnvWriteFlags, JSEnvWriteSEXP, JSForInNextSEXP, JSForInStartSEXP, JSForOfNextSEXP, JSForOfStartSEXP, JSFuncDeclSEXP, JSInitialYieldSEXP, JSIteratorCloseSEXP, JSNUBDSEXP, JSObjectSEXP, JSThisContextSEXP, JSToObjectSEXP, LambdaSEXP, ListSEXP, LocalStaticExportSEXP, ModuleRequestSEXP, NamedReexportSEXP, NullSEXP, NumberSEXP, PopCatchContextSEXP, PushCatchContextSEXP, ResolveBreakTargetSEXP, ResolveContinueTargetSEXP, ResolveEnvBindingSEXP, RetSEXP, ReturnSEXP, StarExportSEXP, StaticImportSEXP, StringSEXP, ThrowSEXP, UnopSEXP } from "./Types";
import { handleArrayPatternAssignmentExpr, handleObjectPatternAssignmentExpr, IRIV2_RVAL, lowerExprToResolveEnvBindingSEXP } from "./handleRVal";

import { handleVariableDeclaration as js3handleVariableDeclaration } from "../JS3Helpers/HandleBlocks";
import { handleAssignmentExpression as js3handleAssignmentExpression } from "../JS3Helpers/HandleExpression";

export const IRIV2_STMT = (cx: IRIDIUMV2, stmt: JS3AllowedProgStatement) => {
  if (isJS3ImportDeclaration(stmt)) {
    const currentContext = cx.getCurrentContext();
    
    // Create/Reuse a Module Request
    const moduleRequestMap = currentContext.moduleRequestMap;
    if (!currentContext.BB[0].isTopLevel()) throw new Error("Expected imports to exist only at the top level");
    if (!moduleRequestMap) throw new Error("Module Request Map not found");

    const source = stmt.source.value;
    let currentModuleRequest: ModuleRequestSEXP | undefined;
    if (moduleRequestMap.has(source)) {
      currentModuleRequest = moduleRequestMap.get(source);
    } else {
      // Create a new module request
      currentModuleRequest = new ModuleRequestSEXP(source, moduleRequestMap.size);
      moduleRequestMap.set(source, currentModuleRequest);
    }

    if (!currentModuleRequest) throw new Error("Expected current module request to be defined");

    // Create an import request
    // 3JS enforces a single specifier per Import Declaration
    const specifiers = stmt.specifiers;
    if (specifiers.length !== 1) throw new Error("Expected only one specifier to exist after 3js conversion");
    const specifier = specifiers[0];

    if (isImportSpecifier(specifier)) {
      const field = isIdentifier(specifier.imported) ? specifier.imported.name : specifier.imported.value;
      const staticImportSEXP = new StaticImportSEXP(specifier.local.name, field, currentModuleRequest.getReqIDX());
      cx.getCurrentBB().args.push(staticImportSEXP);
    } else {
      const staticImportSEXP = new StaticImportSEXP(specifier.local.name, "*", currentModuleRequest.getReqIDX());
      cx.getCurrentBB().args.push(staticImportSEXP);
    }
  } else if (isJS3ExportDefaultDeclaration(stmt)) {
    // I dont think I allowed this statement to exist in the codegen...
    throw new Error("IRIV2: TODO JS3ExportDefaultDeclaration");
  } else if (isJS3ExportNamedDeclaration(stmt)) {
    if (stmt.declaration) {
      throw new Error("Expected js3 to remove all declaration from the export nodes");
    }

    if (stmt.specifiers.length !== 1) throw new Error("Expected one specifier per named export statement after 3js translation");

    const specifier = stmt.specifiers[0];

    if (isJS3ExportSpecifier(specifier)) {
      const local = specifier.local.name;
      const remote = isIdentifier(specifier.exported) ? specifier.exported.name : specifier.exported.value;
      
      cx.getCurrentBB().args.push(new LocalStaticExportSEXP(local, remote));
    } else {
      const currentContext = cx.getCurrentContext();
    
      // Create/Reuse a Module Request
      const moduleRequestMap = currentContext.moduleRequestMap;
      if (!currentContext.BB[0].isTopLevel()) throw new Error("Expected imports to exist only at the top level");
      if (!moduleRequestMap) throw new Error("Module Request Map not found");

      const sourceNode = stmt.source;
      if (!sourceNode) throw new Error("Expected source to be non-null");

      const source = sourceNode.value;
      let currentModuleRequest: ModuleRequestSEXP | undefined;
      if (moduleRequestMap.has(source)) {
        currentModuleRequest = moduleRequestMap.get(source);
      } else {
        // Create a new module request
        currentModuleRequest = new ModuleRequestSEXP(source, moduleRequestMap.size);
        moduleRequestMap.set(source, currentModuleRequest);
      }
      if (!currentModuleRequest) throw new Error("Expected current module request to be defined");
      const binding = specifier.exported.name;
      cx.getCurrentBB().args.push(new NamedReexportSEXP(currentModuleRequest.getReqIDX(), binding))
    }
  } else if (isJS3ExportAllDeclaration(stmt)) {
    const currentContext = cx.getCurrentContext();
    
    // Create/Reuse a Module Request
    const moduleRequestMap = currentContext.moduleRequestMap;
    if (!currentContext.BB[0].isTopLevel()) throw new Error("Expected imports to exist only at the top level");
    if (!moduleRequestMap) throw new Error("Module Request Map not found");

    const source = stmt.source.value;
    let currentModuleRequest: ModuleRequestSEXP | undefined;
    if (moduleRequestMap.has(source)) {
      currentModuleRequest = moduleRequestMap.get(source);
    } else {
      // Create a new module request
      currentModuleRequest = new ModuleRequestSEXP(source, moduleRequestMap.size);
      moduleRequestMap.set(source, currentModuleRequest);
    }
    if (!currentModuleRequest) throw new Error("Expected current module request to be defined");
    cx.getCurrentBB().args.push(new StarExportSEXP(currentModuleRequest.getReqIDX()));
    
  } else if (isJS3DebuggerStatement(stmt)) {
    throw new Error("IRIV2: TODO JS3DebuggerStatement");
  } else if (isJS3ReturnStatement(stmt)) {
    handleReturnStatement(cx, stmt);
  } else if (isJS3ThrowStatement(stmt)) {
    cx.getCurrentBB().args.push(new ThrowSEXP(IRIV2_RVAL(cx, stmt.argument)));
  } else if (isJS3VariableDeclaration(stmt)) {
    handleVariableDeclaration(cx, stmt);
  } else if (isJS3FunctionDeclaration(stmt)) {
    handleFunctionDeclaration(cx, stmt);
  } else if (isJS3IfStatement(stmt)) {
    handleIfStatement(cx, stmt);
  } else if (isJS3TryStatement(stmt)) {
    handleTryStatement(cx, stmt);
  } else if (isJS3EmptyStatement(stmt)) {
    /* Empty */
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

      let loopHeadContext: IridiumBuildContext | null = null;

      const loopConfig: {
        kind: "for-of" | "standard",
        loopHeadIDX: number,
        loopBodyIDX: number,
        loopInitIDX: number,
        label: string | null,
        breakTarget: number,
        continueTarget: number
      } = {
        kind: "standard",
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
    handleWhileStatement(cx, stmt);
  } else if (isJS3SwitchStatement(stmt)) {
    handleSwitchStatement(cx, stmt);
  } else if (isJS3ForOfStatement(stmt)) {
    handleForOfStatement(cx, stmt);
  } else {
    throw new Error(
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

const handleSwitchStatement = (cx: IRIDIUMV2, stmt: JS3SwitchStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard",
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    kind: "standard",
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: null,
    breakTarget: -1,
    continueTarget: -1
  }

  loopConfig.breakTarget = postBB.getIDX();

  const caseToBBIdxMap: Map<JS3SwitchCase_test, number> = new Map();

  // Control Flow Nodes
  const currentBBToSwitchControlBB = new GotoSEXP(-1);

  // 1. Current BB to Switch Control Block
  currentBB.args.push(currentBBToSwitchControlBB);

  // 2. Switch Control Context (Just adding to have a clear scope hierarchy, as such it is redundant)
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = cx.getCurrentBB().getIDX();

  // 2. Switch FlowBB
  cx.declareAndPushLexicalContext();
  for (let c of stmt.cases) {
    const currentContext = cx.getCurrentContext();
    const currentBB = currentContext.getCurrentBB();
    cx.addContinuation(currentContext);
    const postBB = currentContext.getCurrentBB();

    const currentCaseBBIdx = postBB.getIDX();

    // 1. CurrentBB to CaseBB (same scope, this is just a continuation)
    currentBB.args.push(new GotoSEXP(currentCaseBBIdx));

    // 2. Lower code for the case
    for (let s of c.consequent) {
      IRIV2_STMT(cx, s);
    }

    caseToBBIdxMap.set(c.test, currentCaseBBIdx);
  }
  cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP()); // If there is no break anywhere, a break will match to the loop context and find the break context during resolution of break and continue.
  cx.popContext();

  // 2. Add code to the control context
  const intermediateResHolder = cx.js3Builder.utils.getNewTemporary("switchResHolder");
  cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(intermediateResHolder), null, "JSLET", false));
  for (let c of stmt.cases) {
    const testTarget = caseToBBIdxMap.get(c.test);
    if (typeof testTarget !== "number") throw new Error("Test target must be a number");
    if (c.test === null) { // default case
      cx.getCurrentBB().args.push(new GotoSEXP(testTarget));
    } else {
      const testResHolder = lowerExprToResolveEnvBindingSEXP(cx, c.test);
      const eqCheck = new BinopSEXP("===", new EnvReadSEXP(stmt.discriminant.name), new EnvReadSEXP(testResHolder.getBindingName()));
      cx.getCurrentBB().args.push(new EnvWriteSEXP(intermediateResHolder, eqCheck, false, false));
      cx.getCurrentBB().args.push(new IfJumpSEXP(new EnvReadSEXP(intermediateResHolder), testTarget));
    }
  }
  cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP());
  cx.popContext(); // Switch Parent Context

  // Initialize Nodes
  loopHeadContext.loopConfig = loopConfig;
  currentBBToSwitchControlBB.setIDX(loopConfig.loopHeadIDX);
}

const handleIteratedLoops = (cx: IRIDIUMV2, stmt: JS3ForOfStatement | JS3ForInStatement, label: string | null = null) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard",
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    kind: isJS3ForOfStatement(stmt) ? "for-of" : "standard",
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
  const testBBLoopContinueNode = new IfJumpSEXP(null, -1);
  const testBBLoopExitNode = new GotoSEXP(-1);

  // 1. Current BB to LoopHead
  currentBB.args.push(currentBBToLoopInitNode);

  // 2. Loop Init
  cx.declareAndPushLexicalContext();
  loopConfig.loopInitIDX = cx.getCurrentBB().getIDX();

  if (isJS3ForOfStatement(stmt)) {
    // JSForOfStartSEXP(RVal, | -> | <loop-iterator>, <loop-method>, <loop-catchoffset>)
    cx.getCurrentBB().args.push(new JSForOfStartSEXP(stmt.right.name));
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
    // JSForOfNext(...implicit... | -> | <loop-next>, <loop-done>)
    cx.getCurrentBB().args.push(new JSForOfNextSEXP("<loop-done>", "<loop-next>"));
  } else {
    // JSForInNext(<loop-iterator>, | -> | <loop-next>, <loop-done>)
    cx.getCurrentBB().args.push(new JSForInNextSEXP("<loop-iterator>", "<loop-done>", "<loop-next>"));
  }

  testBBLoopContinueNode.setTest(new EnvReadSEXP("<loop-done>"));
  testBBLoopContinueNode.setNot();

  cx.getCurrentBB().args.push(testBBLoopContinueNode);
  if (isJS3ForOfStatement(stmt)) {
    cx.getCurrentBB().args.push(new JSIteratorCloseSEXP());
  }
  cx.getCurrentBB().args.push(testBBLoopExitNode);

  // 4. For-Of Loop Body
  cx.declareAndPushLexicalContext();
  loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX(); // Continue can resume here, iteration variable is set at the top of the loop body...

  const initializer = identifier("<loop-next>");

  if (isVariableDeclaration(stmt.left)) {
    // Ensure only one declarator
    if (stmt.left.declarations.length !== 1) throw new Error("Expected only one declarator on the left side");
    // Ensure no initializer, this is illegal syntax anyway
    if (stmt.left.declarations[0].init) throw new Error("No initializer expected for left side");

    const leftDeclarator = stmt.left.declarations[0];

    // Update Declarator ===> KIND left[Complex] = <loop-next>
    const newDeclarator = variableDeclarator(leftDeclarator.id, initializer);
    const newDeclaration = variableDeclaration(stmt.left.kind, [newDeclarator]);
    handleLoopInitBlock(cx, newDeclaration);
  } else {
    const newAssn = assignmentExpression("=", stmt.left, initializer);
    reduceJSAssignmentExprToIridium(cx, newAssn);
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
    // testBBElseIfNode.setTRUE(loopConfig.breakTarget); // If Done, exit
    // testBBElseIfNode.setFALSE(loopConfig.loopBodyIDX); // Goto body
    testBBLoopContinueNode.setIDX(loopConfig.loopBodyIDX);
    testBBLoopExitNode.setIDX(loopConfig.breakTarget);
  } else {
    throw new Error("[Iterated Loop] Loop head context is null...");
  }

}

const handleForOfStatement = (cx: IRIDIUMV2, stmt: JS3ForOfStatement, label: string | null = null) => {
  handleIteratedLoops(cx, stmt, label);
}

const handleForInStatement = (cx: IRIDIUMV2, stmt: JS3ForInStatement, label: string | null = null) => {
  handleIteratedLoops(cx, stmt, label);
}

const handleForStatement = (cx: IRIDIUMV2, stmt: JS3ForStatement, label: string | null = null) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard",
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    kind: "standard",
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
    throw new Error("[ForStatement] Loop head context is null...");
  }
}

const handleWhileStatement = (cx: IRIDIUMV2, stmt: JS3WhileStatement | JS3DoWhileStatement, label: string | null = null) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard",
    loopHeadIDX: number,
    loopBodyIDX: number,
    loopInitIDX: number,
    label: string | null,
    breakTarget: number,
    continueTarget: number
  } = {
    kind: "standard",
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
    if (isJS3WhileStatement(stmt)) {
      currentBBToLoopHeadNode.setIDX(loopConfig.loopHeadIDX);
    } else {
      currentBBToLoopHeadNode.setIDX(loopConfig.loopBodyIDX);
    }

    testBBElseIfNode.setTRUE(loopConfig.loopBodyIDX);
    testBBElseIfNode.setFALSE(loopConfig.breakTarget);
  } else {
    throw new Error("[WhileStatement] Loop head context is null...");
  }
}

const handleTryStatement = (cx: IRIDIUMV2, stmt: JS3TryStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // const loop head config
  let tryContextObj: IridiumBuildContext;
  let finalizerContextObj: IridiumBuildContext | null = null;
  const tryContext: {
    tryContextIDX: number,
    tryIDX: number,
    udCatchIDX: number,
    imCatchIDX: number,
    finalizerIDX: number
  } = {
    tryContextIDX: -1,
    tryIDX: -1,
    udCatchIDX: -1,
    imCatchIDX: -1,
    finalizerIDX: -1
  };

  // Catch Contexts
  const tryCatchContext = new PushCatchContextSEXP(-1);
  const udCatchContext = new PushCatchContextSEXP(-1);
  const finalizerCatchContext = new PushCatchContextSEXP(-1);

  const gotoCurrentBBToTryContextBB = new GotoSEXP(-1);
  const gotoTryContextBBToTryBB = new GotoSEXP(-1);
  const gotoPostBB = new GotoSEXP(-1);
  const gotoInvokeFinalizer = new InvokeFinalizerSEXP(-1);

  // Current BB to TryContextBB
  currentBB.args.push(gotoCurrentBBToTryContextBB);

  // TryContextBB
  cx.declareAndPushLexicalContext();
  cx.getCurrentBB().setFlag("TryContextBB");
  tryContextObj = cx.getCurrentContext();
  tryContext.tryContextIDX = cx.getCurrentBB().getIDX();

  cx.getCurrentBB().args.push(gotoTryContextBBToTryBB);

  // TryBB
  cx.declareAndPushLexicalContext();
  cx.getCurrentBB().setFlag("TryBB");
  tryContext.tryIDX = cx.getCurrentBB().getIDX();
  cx.getCurrentBB().args.push(tryCatchContext);
  for (let s of stmt.block.body) {
    IRIV2_STMT(cx, s); // A decorator must take care of the return statements...
  }
  cx.getCurrentBB().args.push(new PopCatchContextSEXP());
  if (stmt.finalizer) {
    cx.getCurrentBB().args.push(gotoInvokeFinalizer);
  }
  cx.getCurrentBB().args.push(gotoPostBB);
  cx.popContext(); // TryBB

  if (stmt.handler) {
    // udCatchBB
    cx.declareAndPushLexicalContext();
    cx.getCurrentBB().setFlag("udCatchBB");
    tryContext.udCatchIDX = cx.getCurrentBB().getIDX();
    if (stmt.handler.param) {
      cx.getCurrentBB().args.push(new JSCatchContextSEXP(stmt.handler.param.name));
    }
    cx.getCurrentBB().args.push(udCatchContext);
    for (let s of stmt.handler.body.body) {
      IRIV2_STMT(cx, s)
    }
    cx.getCurrentBB().args.push(new PopCatchContextSEXP());
    if (stmt.finalizer) {
      cx.getCurrentBB().args.push(gotoInvokeFinalizer);
    }
    cx.getCurrentBB().args.push(gotoPostBB);
    cx.popContext(); // udCatchBB
  }

  // imCatchBB
  cx.declareAndPushLexicalContext();
  cx.getCurrentBB().setFlag("imCatchBB");
  tryContext.imCatchIDX = cx.getCurrentBB().getIDX();
  const imArg = cx.js3Builder.utils.getNewTemporary("imCatchArg")
  cx.getCurrentBB().args.push(new JSCatchContextSEXP(imArg));
  if (stmt.finalizer) {
    cx.getCurrentBB().args.push(gotoInvokeFinalizer);
  }
  cx.getCurrentBB().args.push(new ThrowSEXP(new EnvReadSEXP(imArg)));
  cx.popContext(); // imCatchBB

  if (stmt.finalizer) {
    // finalizerBB
    cx.declareAndPushLexicalContext();
    cx.getCurrentBB().setFlag("finalizerBB");
    finalizerContextObj = cx.getCurrentContext();
    tryContext.finalizerIDX = cx.getCurrentBB().getIDX();
    for (let s of stmt.finalizer.body) {
      IRIV2_STMT(cx, s)
    }
    cx.getCurrentBB().args.push(new RetSEXP());
    cx.popContext(); // finalizerBB
  }

  cx.popContext(); // TryContextBB

  // Add context and initialize nodes
  tryContextObj.tryContext = tryContext;

  if (finalizerContextObj) { // Prevent infinite loops when decorating break/continue/return targets inside the finalizer block
    finalizerContextObj.tryContext = {
      tryContextIDX: -1,
      tryIDX: -1,
      udCatchIDX: -1,
      imCatchIDX: -1,
      finalizerIDX: -1
    }
  }

  if (stmt.handler) {
    tryCatchContext.setIDX(tryContext.udCatchIDX);
  } else {
    tryCatchContext.setIDX(tryContext.imCatchIDX);
  }

  if (stmt.handler) {
    udCatchContext.setIDX(tryContext.imCatchIDX);
  }

  if (stmt.finalizer) {
    finalizerCatchContext.setIDX(tryContext.imCatchIDX);
  }

  gotoCurrentBBToTryContextBB.setIDX(tryContext.tryContextIDX);
  gotoTryContextBBToTryBB.setIDX(tryContext.tryIDX);
  gotoPostBB.setIDX(postBB.getIDX());
  gotoInvokeFinalizer.setIDX(tryContext.finalizerIDX);


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
    throw new Error(
      "JS3VariableDeclaration: 'using' and 'await using' not supported in JS3",
    );
    return;
  }

  // Assert that only one specifier exists
  if (stmt.declarations.length !== 1) {
    throw new Error(
      "JS3VariableDeclaration: expecting exactly one declaration in JS3",
    );
    return;
  }

  const declaration = stmt.declarations[0];
  let KIND: JSEnvWriteFlags;

  if (stmt.kind === "let") KIND = "JSLET"
  else if (stmt.kind === "const") KIND = "JSCONST"
  else KIND = "JSVAR"

  // case a.
  // KIND ID = RVal
  if (isIdentifier(declaration.id)) {
    let rValTarget = declaration.init && IRIV2_RVAL(cx, declaration.init);

    if (!rValTarget) {
      if (KIND === "JSLET") {
        rValTarget = new EnvReadSEXP("undefined");
      } else if (KIND === "JSCONST") {
        throw new Error("const decl without Rval is disallowed");
      }
    }

    const envWrite = new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(declaration.id.name), rValTarget ? rValTarget : null, KIND, false);
    cx.getCurrentBB().args.push(envWrite);
    return;
  }

  // case b.
  // KIND [ ID, ...ID ] = RVal
  if (isJS3ArrayPattern(declaration.id)) {
    const rValTarget = declaration.init ? IRIV2_RVAL(cx, declaration.init) : new EnvReadSEXP("undefined");
    
    // Alloca all declarations
    for (let e of declaration.id.elements) {
      if (isIdentifier(e)) {
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(e.name), null, KIND, false));
      } else if (isJS3RestElement(e)) {
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(e.argument.name), null, KIND, false));
      }
    }
    handleArrayPatternAssignmentExpr(cx, declaration.id.elements, rValTarget, true);
    
    return;
  }

  // case c.
  // KIND { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(declaration.id)) {
    const rValTarget = declaration.init ? IRIV2_RVAL(cx, declaration.init) : new EnvReadSEXP("undefined");
    
    // Alloca all declarations
    for (let d of declaration.id.properties) {
      if (isJS3AssnObjectProperty(d)) {
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(d.value.name), null, KIND, false));
      } else {
        cx.getCurrentBB().args.push(new JSEnvWriteSEXP(new ResolveEnvBindingSEXP(d.argument.name), null, KIND, false));
      }
    }
    
    handleObjectPatternAssignmentExpr(cx, declaration.id.properties, rValTarget, true);
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

const reduceJSAssignmentExprToIridium = (cx: IRIDIUMV2, stmt: AssignmentExpression) => {
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

// export const getArrayDestSEXP = (stmt: JS3ArrayPattern): [IridiumSEXP, boolean] => {
//   // Assertion: a rest element must be the last in the destructuring pattern
//   let hasRest = false;
//   let sexps = stmt.elements.map((e) => {
//     if (isIdentifier(e)) {
//       return new ResolveEnvBindingSEXP(e.name);
//     } else {
//       hasRest = true;
//       return new ResolveEnvBindingSEXP(e.argument.name);
//     }
//   });
//   return [new ListSEXP(sexps), hasRest];
// }

// export const getObjectDestSEXP = (stmt: JS3ObjectPattern): [IridiumSEXP, boolean] => {
//   // Assertion: a rest element must be the last in the destructuring pattern
//   let hasRest = false;
//   let sexps = stmt.properties.map((e) => {
//     if (isJS3AssnObjectProperty(e)) {
//       if (isIdentifier(e.key))
//         return new ListSEXP([new StringSEXP(e.key.name), new ResolveEnvBindingSEXP(e.value.name)]);
//     } else {
//       hasRest = true;
//       return new ResolveEnvBindingSEXP(e.argument.name);
//     }
//   });
//   return [new ListSEXP(sexps), hasRest];
// }

const extractBindings = (node: JS3AllowedFunctionArgs, result: Set<string>) => {
  // Identifier | ArrayPattern | ObjectPattern | AssignmentPattern | RestElement
  if (isIdentifier(node)) {
    result.add(node.name);
  } else if (isArrayPattern(node)) {
    for (let r of node.elements) {
      if (isIdentifier(r) || isArrayPattern(r) || isObjectPattern(r) || isAssignmentPattern(r) || isRestElement(r)) {
        extractBindings(r, result);
      } else throw new Error("Todo, array pattern no Identifier case");
    }
  } else if (isObjectPattern(node)) {
    for (let p of node.properties) {
      if (isObjectProperty(p)) {
        if (isIdentifier(p.value) || isArrayPattern(p.value) || isObjectPattern(p.value) || isAssignmentPattern(p.value) || isRestElement(p.value)) {
          extractBindings(p.value, result);
        }
      } else throw new Error("Todo, object pattern unhandled case");
    }
  } else if (isAssignmentPattern(node)) {
    if (isIdentifier(node.left) || isArrayPattern(node.left) || isObjectPattern(node.left) || isAssignmentPattern(node.left) || isRestElement(node.left)) {
      extractBindings(node.left, result);
    } else throw new Error("Todo, assignment pattern unhandled case");
  } else if (isRestElement(node)) {
    if (isIdentifier(node.argument) || isArrayPattern(node.argument) || isObjectPattern(node.argument) || isAssignmentPattern(node.argument) || isRestElement(node.argument)) {
      extractBindings(node.argument, result);
    } else throw new Error("Todo, RestElement unhandled case");
  }
  else throw new Error("Todo, unhandled extract bindings case");
}

export const lowerArgumentInit = (cx: IRIDIUMV2, params: Array<JS3AllowedFunctionArgs>) => {
  // S1: Extract all bindings that are being made
  // S2: Initialize all the bindings to NUBD
  // S3: Replace all arglist with replacement RVals
  // S4: Use assignment logic to replace with LVal = ARG$I

  // S1: Extract all bindings that are being made
  const extractedBindingsSet: Set<string> = new Set();
  for (let p of params) extractBindings(p, extractedBindingsSet);

  // S2: Initialize all the bindings to NUBD
  for (const b of extractedBindingsSet) {
    const bb = new ResolveEnvBindingSEXP(b);
    bb.markASW();
    cx.getCurrentBB().args.push(new JSEnvWriteSEXP(bb, new JSNUBDSEXP(), "JSVAR", false));
  }

  // S3: Replace all arglist with replacement RVals
  const argReplacementMap: Map<JS3AllowedFunctionArgs, string> = new Map();
  const currentContext = cx.getCurrentContext();
  for (const arg of params) {
    let currArg = cx.js3Builder.utils.getNewTemporary("ARG");
    currentContext.args.push(currArg);
    if (isRestElement(arg)) currentContext.hasRestArgs = true;
    argReplacementMap.set(arg, currArg);
  }

  // S3: Use assignment logic
  for (const arg of params) {
    const rVal = argReplacementMap.get(arg);
    if (!rVal) throw new Error("Arg replacement map is supposed to map all the arguments");
    if (isIdentifier(arg) || isArrayPattern(arg) || isObjectPattern(arg) || isAssignmentPattern(arg)) {
      reduceJSAssignmentExprToIridium(cx, assignmentExpression("=", arg, identifier(rVal)));
    } else if (isRestElement(arg)) {
      reduceJSAssignmentExprToIridium(cx, assignmentExpression("=", arg.argument, identifier(rVal)));
    }
  }
  // LVal = replacedRVal
  // assignmentExpression("=", )

  // let i = 0;
  // for (const arg of params) {
  //   //
  //   // 1. LVal Pattern to spill
  //   //

  //   let argIdx = i++;

  //   let toLowerLval:
  //     | Identifier
  //     | ArrayPattern
  //     | ObjectPattern
  //     | AssignmentPattern;
  //   if (
  //     isIdentifier(arg) ||
  //     isArrayPattern(arg) ||
  //     isObjectPattern(arg) ||
  //     isAssignmentPattern(arg)
  //   ) {
  //     toLowerLval = arg;
  //   } else if (
  //     isIdentifier(arg.argument) ||
  //     isArrayPattern(arg.argument) ||
  //     isObjectPattern(arg.argument) ||
  //     isAssignmentPattern(arg.argument)
  //   ) {
  //     argIdx = -1;
  //     toLowerLval = arg.argument;
  //   } else {
  //     toLowerLval = generateIdentifier(arg, "$TODO_IRI_UNDEFINED$");
  //     throw new Error(
  //       `IRIV2 function arg, LVAL is unsupported`,
  //     );
  //   }

  //   let currArg = `ARG${argIdx}`;
  //   cx.getCurrentContext().args.push(currArg);

  //   //
  //   // 2. RVal Identifier in argument list
  //   //
  //   const toLowerRVal = generateIdentifier(
  //     arg,
  //     currArg,
  //   );

  //   //
  //   // 3. Generate code in curr
  //   //
  //   const otherProps = cx.js3Builder.utils;
  //   const js3SpillHolder: JS3BlockStatement_body = [];
  //   const updatedProps = {
  //     ...otherProps,
  //     others: { ...otherProps.others, holder: js3SpillHolder },
  //   };
  //   let first = true;
  //   const generator = (
  //     LVal:
  //       | JS3MemberExpression
  //       | JS3ArrayPattern
  //       | JS3ObjectPattern
  //       | Identifier,
  //     RVal: null | JS3VariableDeclarator_init,
  //   ) => {
  //     if (isJS3MemberExpression(LVal))
  //       throw new Error(
  //         "LVal cannot be JS3MemberExpression in case of variable declarator...",
  //       );
  //     else {
  //       const declarator = generateJS3VariableDeclaratorfromBaseNode(
  //         LVal,
  //         RVal,
  //         null,
  //         arg,
  //       );
  //       // NUBD bindings
  //       let nubdBindings: Array<string> = []
  //       if (isIdentifier(LVal)) {
  //         nubdBindings.push(LVal.name);
  //       } else if (isArrayPattern(LVal)) {
  //         LVal.elements.forEach(e => isIdentifier(e) ? nubdBindings.push(e.name) : nubdBindings.push(e.argument.name));
  //       } else {
  //         LVal.properties.forEach(p => isJS3AssnObjectProperty(p) ? nubdBindings.push(p.value.name) : nubdBindings.push(p.argument.name))
  //       }
  //       nubdBindings.forEach(b => cx.getCurrentContext().nubds.push(b));

  //       return generateJS3VariableDeclarationfromBaseNode(
  //         [declarator],
  //         first ? ((first = false), "var") : "let",
  //         null,
  //         arg,
  //       );
  //     }
  //   };
  //   handleDeclaratorRec(
  //     toLowerLval,
  //     toLowerRVal,
  //     updatedProps,
  //     generator,
  //     false,
  //   );
  //   // this.handleJS3ProgramBody(js3SpillHolder);

  //   for (let stmt of js3SpillHolder) {
  //     IRIV2_STMT(cx, stmt)
  //   }
  // }
}

const handleFunctionDeclaration = (cx: IRIDIUMV2, stmt: JS3FunctionDeclaration) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary");
  const funBBIdx = funcContext.getCurrentBB().idx;
  funcContext.isStrict = funcContext.isStrict || stmt.body.directives.some((val) => val.value.value === "use strict");
  funcContext.isAsync = stmt.async ? stmt.async : false;
  funcContext.isGenerator = stmt.generator ? stmt.generator : false;

  funcContext.kind = getConstructorClosureFlag();

  // Add arguments object to the context
  funcContext.argumentsKind = 2;
  let isSimpleArgs = true;

  stmt.params.forEach(p => {
    if (!isIdentifier(p)) {
      isSimpleArgs = false;
    }
  })

  if (!funcContext.isStrict && isSimpleArgs) { // Not strict and simple arguments => mapped arguments
    funcContext.argumentsKind = 1;
    stmt.params.forEach(p => {
      if (isIdentifier(p)) {
        cx.getCurrentContext().args.push(p.name);
      }
    })
  } else {
    lowerArgumentInit(cx, stmt.params);
  }

  if (funcContext.isGenerator) cx.getCurrentBB().args.push(new JSInitialYieldSEXP());

  cx.getCurrentBB().args.push(new JSThisContextSEXP());

  for (const s of stmt.body.body) {
    IRIV2_STMT(cx, s);
  }

  cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));
  
  cx.popContext();

  cx.getCurrentBB().args.push(
    new JSFuncDeclSEXP(new ResolveEnvBindingSEXP(stmt.id.name), new LambdaSEXP(funBBIdx))
  );

}