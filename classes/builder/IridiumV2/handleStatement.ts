import {
  ArrayPattern,
  assignmentExpression,
  AssignmentExpression,
  AssignmentPattern,
  identifier,
  Identifier,
  isArrayPattern,
  isAssignmentPattern,
  isIdentifier,
  isImportSpecifier,
  isObjectPattern,
  isObjectProperty,
  isRestElement,
  isVariableDeclaration,
  isVoidPattern,
  MemberExpression,
  ObjectPattern,
  RestElement,
  variableDeclaration,
  VariableDeclaration,
  variableDeclarator,
} from "@babel/types";
import {
  isJS3ArrayPattern,
  isJS3AssnObjectProperty,
  isJS3BlockStatement,
  isJS3BreakStatement,
  isJS3ContinueStatement,
  isJS3DebuggerStatement,
  isJS3DoWhileStatement,
  isJS3EmptyStatement,
  isJS3ExportAllDeclaration,
  isJS3ExportDefaultDeclaration,
  isJS3ExportNamedDeclaration,
  isJS3ExportSpecifier,
  isJS3ForInStatement,
  isJS3ForOfStatement,
  isJS3ForStatement,
  isJS3FunctionDeclaration,
  isJS3IfStatement,
  isJS3ImportDeclaration,
  isJS3LabeledStatement,
  isJS3ObjectPattern,
  isJS3RestElement,
  isJS3ReturnStatement,
  isJS3SwitchStatement,
  isJS3TDZCheck,
  isJS3ThrowStatement,
  isJS3TryStatement,
  isJS3VariableDeclaration,
  isJS3WhileStatement,
  JS3AllowedBlockStatement,
  JS3AllowedFunctionArgs,
  JS3AllowedProgStatement,
  JS3ArrayPattern_elements,
  JS3BlockStatement,
  JS3BlockStatement_body,
  JS3DoWhileStatement,
  JS3ForInStatement,
  JS3ForOfStatement,
  JS3ForStatement,
  JS3FunctionDeclaration,
  JS3IfStatement,
  JS3ReturnStatement,
  JS3StaticBlock,
  JS3SwitchCase,
  JS3SwitchStatement,
  JS3TryStatement,
  JS3VariableDeclaration,
  JS3WhileStatement,
} from "../JS3Helpers/JS3Types";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2";
import {
  handleObjectPatternAssignmentExpr,
  IRIV2_RVAL,
  lowerExprToResolveEnvBindingSEXP,
  PrivateMapping,
} from "./handleRVal";

import { getIridiumBinop } from "#utils";
import { handleVariableDeclaration as js3handleVariableDeclaration } from "../JS3Helpers/HandleBlocks";
import {
  handleMemberExpression,
  handleAssignmentExpression as js3handleAssignmentExpression,
} from "../JS3Helpers/HandleExpression";
import {
  BBSEXPFlags,
  CF_FUNCTION,
  CompoundAssnSEXP,
  EnvReadSEXP,
  EnvWriteSEXP,
  GotoSEXP,
  IfElseJumpSEXP,
  InvokeFinalizerSEXP,
  isLambdaSEXP,
  JSArraySEXP,
  JSCatchContextSEXP,
  JSComputedFieldWriteSEXP,
  JSEnvWriteTypes,
  JSExplicitBindingDeclarationNSEXP,
  JSExplicitBindingDeclarationSEXP,
  JSExplicitBindingDeclarationXSEXP,
  JSForInNextSEXP,
  JSForInStartSEXP,
  JSForOfIteratorCloseSEXP,
  JSForOfNextSEXP,
  JSForOfStartSEXP,
  JSFuncDeclSEXP,
  JSImplicitBindingDeclarationSEXP,
  JSImplicitBindingDeclarationTypes,
  JSInitialYieldSEXP,
  JSNUBDSEXP,
  LambdaSEXP,
  ListSEXP,
  LocalStaticExportSEXP,
  LoopInitPreludeEndSEXP,
  ModuleRequestSEXP,
  NamedReexportSEXP,
  NullSEXP,
  NumberSEXP,
  PopCatchContextSEXP,
  PushCatchContextSEXP,
  ResolveBreakTargetSEXP,
  ResolveContinueTargetSEXP,
  ResolveEnvBindingSEXP,
  RetSEXP,
  ReturnSEXP,
  SiblingSpecialWriteSEXP,
  StarExportSEXP,
  StaticImportSEXP,
  TDZReadSEXP,
  ThrowSEXP,
  UnresolvedReturnSEXP,
} from "./Types/index";
import { newTemp } from "../Shared";

export const IRIV2_STMT = (cx: IRIDIUMV2, stmt: JS3AllowedProgStatement) => {
  if (isJS3TDZCheck(stmt)) {
    cx.getCurrentBB().args.push(
      new TDZReadSEXP(stmt.expression.name)
    );
  } else if (isJS3ImportDeclaration(stmt)) {
    const currentContext = cx.getCurrentContext();

    // Create/Reuse a Module Request
    const moduleRequestMap = currentContext.moduleRequestMap;
    if (!currentContext.BB[0].isTopLevel())
      throw new Error("Expected imports to exist only at the top level");
    if (!moduleRequestMap) throw new Error("Module Request Map not found");

    const source = stmt.source.value;
    let currentModuleRequest: ModuleRequestSEXP | undefined;
    if (moduleRequestMap.has(source)) {
      currentModuleRequest = moduleRequestMap.get(source);
    } else {
      // Create a new module request
      currentModuleRequest = new ModuleRequestSEXP(
        source,
        moduleRequestMap.size,
      );
      moduleRequestMap.set(source, currentModuleRequest);
    }

    if (!currentModuleRequest)
      throw new Error("Expected current module request to be defined");

    // Create an import request
    // 3JS enforces a single specifier per Import Declaration
    const specifiers = stmt.specifiers;
    if (specifiers.length == 0) {
      const staticImportSEXP = new StaticImportSEXP(
        newTemp("throwaway"),
        "default",
        currentModuleRequest.getReqIDX(),
      );
      cx.getCurrentBB().args.push(staticImportSEXP);
    } else {
      const specifier = specifiers[0];

      if (isImportSpecifier(specifier)) {
        const field = isIdentifier(specifier.imported)
          ? specifier.imported.name
          : specifier.imported.value;
        const staticImportSEXP = new StaticImportSEXP(
          specifier.local.name,
          field,
          currentModuleRequest.getReqIDX(),
        );
        cx.getCurrentBB().args.push(staticImportSEXP);
      } else {
        const staticImportSEXP = new StaticImportSEXP(
          specifier.local.name,
          "*",
          currentModuleRequest.getReqIDX(),
          true,
        );
        cx.getCurrentBB().args.push(staticImportSEXP);
      }
    }
    // if (specifiers.length !== 1)
    //   throw new Error("Expected only one specifier to exist after 3js conversion");
  } else if (isJS3ExportDefaultDeclaration(stmt)) {
    // I dont think I allowed this statement to exist in the codegen...
    throw new Error("IRIV2: TODO JS3ExportDefaultDeclaration");
  } else if (isJS3ExportNamedDeclaration(stmt)) {
    if (stmt.declaration) {
      throw new Error(
        "Expected js3 to remove all declaration from the export nodes",
      );
    }

    if (stmt.specifiers.length !== 1)
      throw new Error(
        "Expected one specifier per named export statement after 3js translation",
      );

    const specifier = stmt.specifiers[0];

    if (isJS3ExportSpecifier(specifier)) {
      const local = specifier.local.name;
      const remote = isIdentifier(specifier.exported)
        ? specifier.exported.name
        : specifier.exported.value;

      const sourceNode = stmt.source;


      if (!sourceNode) {
        cx.getCurrentBB().args.push(new LocalStaticExportSEXP(local, remote));
      } else {
        const currentContext = cx.getCurrentContext();

        // Create/Reuse a Module Request
        const moduleRequestMap = currentContext.moduleRequestMap;
        if (!currentContext.BB[0].isTopLevel())
          throw new Error("Expected imports to exist only at the top level");
        if (!moduleRequestMap) throw new Error("Module Request Map not found");

        const source = sourceNode.value;
        let currentModuleRequest: ModuleRequestSEXP | undefined;
        if (moduleRequestMap.has(source)) {
          currentModuleRequest = moduleRequestMap.get(source);
        } else {
          // Create a new module request
          currentModuleRequest = new ModuleRequestSEXP(
            source,
            moduleRequestMap.size,
          );
          moduleRequestMap.set(source, currentModuleRequest);
        }
        if (!currentModuleRequest)
          throw new Error("Expected current module request to be defined");
        cx.getCurrentBB().args.push(
          new NamedReexportSEXP(currentModuleRequest.getReqIDX(), "*", remote),
        );
      }

    } else {
      const currentContext = cx.getCurrentContext();

      // Create/Reuse a Module Request
      const moduleRequestMap = currentContext.moduleRequestMap;
      if (!currentContext.BB[0].isTopLevel())
        throw new Error("Expected imports to exist only at the top level");
      if (!moduleRequestMap) throw new Error("Module Request Map not found");

      const sourceNode = stmt.source;
      if (!sourceNode) throw new Error("Expected source to be non-null");

      const source = sourceNode.value;
      let currentModuleRequest: ModuleRequestSEXP | undefined;
      if (moduleRequestMap.has(source)) {
        currentModuleRequest = moduleRequestMap.get(source);
      } else {
        // Create a new module request
        currentModuleRequest = new ModuleRequestSEXP(
          source,
          moduleRequestMap.size,
        );
        moduleRequestMap.set(source, currentModuleRequest);
      }
      if (!currentModuleRequest)
        throw new Error("Expected current module request to be defined");
      const binding = specifier.exported.name;
      cx.getCurrentBB().args.push(
        new NamedReexportSEXP(currentModuleRequest.getReqIDX(), "*", binding),
      );
    }
  } else if (isJS3ExportAllDeclaration(stmt)) {
    const currentContext = cx.getCurrentContext();

    // Create/Reuse a Module Request
    const moduleRequestMap = currentContext.moduleRequestMap;
    if (!currentContext.BB[0].isTopLevel())
      throw new Error("Expected imports to exist only at the top level");
    if (!moduleRequestMap) throw new Error("Module Request Map not found");

    const source = stmt.source.value;
    let currentModuleRequest: ModuleRequestSEXP | undefined;
    if (moduleRequestMap.has(source)) {
      currentModuleRequest = moduleRequestMap.get(source);
    } else {
      // Create a new module request
      currentModuleRequest = new ModuleRequestSEXP(
        source,
        moduleRequestMap.size,
      );
      moduleRequestMap.set(source, currentModuleRequest);
    }
    if (!currentModuleRequest)
      throw new Error("Expected current module request to be defined");
    cx.getCurrentBB().args.push(
      new StarExportSEXP(currentModuleRequest.getReqIDX()),
    );
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
    if (isJS3WhileStatement(stmt.body) || isJS3DoWhileStatement(stmt.body)) {
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
        kind: "for-of" | "standard";
        loopHeadIDX: number;
        loopBodyIDX: number;
        loopInitIDX: number;
        label: string | null;
        breakTarget: number;
        continueTarget: number;
      } = {
        kind: "standard",
        loopHeadIDX: -1,
        loopBodyIDX: -1,
        loopInitIDX: -1,
        label: stmt.label.name,
        breakTarget: postBB.getIDX(),
        continueTarget: -1,
      };

      loopConfig.breakTarget = postBB.getIDX();

      const currentBBToLabeledBlockScopeNode = new GotoSEXP(-1);

      // 1. CurrentBB -> labeledBB
      currentBB.args.push(currentBBToLabeledBlockScopeNode);

      // 2. labeledBB
      cx.declareAndPushLexicalContext();
      loopHeadContext = cx.getCurrentContext();
      loopConfig.loopHeadIDX = cx.getCurrentBB().getIDX();
      IRIV2_STMT(cx, stmt.body);
      cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP(loopConfig.label)); // resolution pass will resolve into GOTO(postBB.IDX)
      cx.popContext(); // labeledBB

      // Initialize Node(s)
      loopHeadContext.loopConfig = loopConfig;
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
    throw new Error(`IRIV2: Unhandled Statement ${stmt.type}, ${stmt.js3type}`);
  }
};

type IRILoopBodyCTX = {
  label: string | null;
};

export const handleBlockStatement = (
  cx: IRIDIUMV2,
  stmt: JS3BlockStatement | JS3StaticBlock,
  loopBodyCTX: IRILoopBodyCTX | null = null,
  blockFlag: BBSEXPFlags = "Lexical",
): IridiumBuildContext => {
  const oldContext = cx.getCurrentContext();
  const newContext = cx.declareAndPushLexicalContext(blockFlag);

  // Add Gotos from oldContext's last BB to currentBB.
  oldContext.getCurrentBB().args.push(new GotoSEXP(newContext.BB[0].idx));

  if (!loopBodyCTX) {
    // Such an implicit jump should not be allowed in a loop body context, it will result in an empty BB
    cx.addContinuation(oldContext);
  }

  for (const s of stmt.body) {
    IRIV2_STMT(cx, s);
  }

  if (loopBodyCTX) {
    cx.getCurrentBB().args.push(
      new ResolveContinueTargetSEXP(loopBodyCTX.label),
    );
  } else {
    // After generating the code, add a goto from the last lowered block to the oldContexts continuation
    cx.getCurrentBB().args.push(new GotoSEXP(oldContext.getCurrentBB().idx));
  }

  cx.popContext();

  return newContext;
};

const handleReturnStatement = (cx: IRIDIUMV2, stmt: JS3ReturnStatement) => {
  if (stmt.argument) {
    cx.getCurrentBB().args.push(new ReturnSEXP(IRIV2_RVAL(cx, stmt.argument)));
  } else {
    // cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));
    cx.getCurrentBB().args.push(new UnresolvedReturnSEXP());
  }
};

const handleSwitchStatement = (cx: IRIDIUMV2, stmt: JS3SwitchStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard";
    loopHeadIDX: number;
    loopBodyIDX: number;
    loopInitIDX: number;
    label: string | null;
    breakTarget: number;
    continueTarget: number;
  } = {
    kind: "standard",
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: null,
    breakTarget: -1,
    continueTarget: -1,
  };

  loopConfig.breakTarget = postBB.getIDX();

  // const caseToBBIdxMap: Map<JS3SwitchCase_test, number> = new Map();

  const caseGotoMap: Map<JS3SwitchCase, GotoSEXP | IfElseJumpSEXP> = new Map();

  // Control Flow Nodes
  const currentBBToSwitchControlBB = new GotoSEXP(-1);

  // 1. Enter Switch BB from Current BB
  currentBB.args.push(currentBBToSwitchControlBB);

  // 2. Switch Control Context (Just adding to have a clear scope hierarchy, as such it is redundant)
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = cx.getCurrentBB().getIDX();

  // Add control header
  const intermediateResHolder = newTemp("switchResHolder");
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(intermediateResHolder),
      null,
      "JSLET",
      false,
    ),
  );
  let defaultCase: null | JS3SwitchCase = null;
  for (let c of stmt.cases) {
    if (c.test === null) {
      // default case, exhaust all case matches before checking for default case...
      defaultCase = c;
    } else {
      const testResHolder = lowerExprToResolveEnvBindingSEXP(cx, c.test);
      const eqCheck = getIridiumBinop(
        "===",
        new EnvReadSEXP(stmt.discriminant.name),
        new EnvReadSEXP(testResHolder.getBindingName()),
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(intermediateResHolder, eqCheck, false, false),
      );
      let t = new IfElseJumpSEXP(
        new EnvReadSEXP(intermediateResHolder),
        -1,
        -1,
      );
      caseGotoMap.set(c, t);
      cx.getCurrentBB().args.push(t);
      cx.addContinuation(cx.getCurrentContext());
      t.setFALSE(cx.getCurrentBB().getIDX());
    }
  }
  if (defaultCase) {
    let gg = new GotoSEXP(-1);
    caseGotoMap.set(defaultCase, gg);
    cx.getCurrentBB().args.push(gg);
  }
  cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP());

  // 2. Switch FlowBB
  for (let c of stmt.cases) {
    const currentContext = cx.getCurrentContext();
    const currentBB = currentContext.getCurrentBB();
    cx.addContinuation(currentContext);
    const postBB = currentContext.getCurrentBB();

    const currentCaseBBIdx = postBB.getIDX();

    let gotoTarget = caseGotoMap.get(c);
    if (gotoTarget === undefined)
      throw new Error("switch case target not set!");

    if (gotoTarget instanceof GotoSEXP) gotoTarget.setIDX(currentCaseBBIdx);
    else gotoTarget.setTRUE(currentCaseBBIdx);

    // 1. CurrentBB to CaseBB (same scope, this is just a continuation)
    currentBB.args.push(new GotoSEXP(currentCaseBBIdx));

    // 2. Lower code for the case
    for (let s of c.consequent) {
      IRIV2_STMT(cx, s);
    }
  }
  cx.getCurrentBB().args.push(new ResolveBreakTargetSEXP()); // If there is no break anywhere, a break will match to the loop context and find the break context during resolution of break and continue.
  cx.popContext(); // Switch Parent Context

  // Initialize Nodes
  loopHeadContext.loopConfig = loopConfig;
  currentBBToSwitchControlBB.setIDX(loopConfig.loopHeadIDX);
};

const handleIteratedLoops = (
  cx: IRIDIUMV2,
  stmt: JS3ForOfStatement | JS3ForInStatement,
  label: string | null = null,
) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard";
    loopHeadIDX: number;
    loopBodyIDX: number;
    loopInitIDX: number;
    label: string | null;
    breakTarget: number;
    continueTarget: number;
  } = {
    kind: isJS3ForOfStatement(stmt) ? "for-of" : "standard",
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: label ? label : null,
    breakTarget: -1,
    continueTarget: -1,
  };

  loopConfig.breakTarget = postBB.getIDX();

  // Control Flow Nodes
  const currentBBToLoopInitNode = new GotoSEXP(-1);
  const loopInitToLoopTestNode = new GotoSEXP(-1);
  const testBBLoopContinueNode = new IfElseJumpSEXP(null, -1, -1);
  const testBBLoopExitNode = new GotoSEXP(-1);

  // 1. Current BB to LoopHead
  currentBB.args.push(currentBBToLoopInitNode);

  // 2. Loop Init
  cx.declareAndPushLexicalContext();
  loopConfig.loopInitIDX = cx.getCurrentBB().getIDX();

  // Declare all created bindings in the init scope (if any)
  const extractedBindingsSet: Set<string> = new Set();

  if (isVariableDeclaration(stmt.left)) {
    if (stmt.left.declarations.length != 1) throw new Error("Expected exactly one declaration in iterated loop");
    const d = stmt.left.declarations[0];
    const id = d.id;
    if (isVoidPattern(id)) throw new Error("Void Pattern in iterated loop decl");
    if (isIdentifier(id) || isArrayPattern(id) || isObjectPattern(id) || isAssignmentPattern(id) || isRestElement(id)) {
      extractBindings(id, extractedBindingsSet);
    } else throw new Error("Unsupported pattern in iterated loop decl");

    for (let b of extractedBindingsSet) {
      // export type JSEnvWriteTypes = "JSLET" | "JSCONST" | "JSVAR";
      let kind: JSEnvWriteTypes;
      if (stmt.left.kind === "let") kind = "JSLET";
      else if (stmt.left.kind === "const") kind = "JSCONST";
      else if (stmt.left.kind === "var") kind = "JSVAR";
      else throw new Error("iterated loop, binding kind unknown");
      cx.getCurrentBB().args.push(new JSExplicitBindingDeclarationNSEXP(new ResolveEnvBindingSEXP(b), new JSNUBDSEXP(), kind, false));
    }
  }

  const iterRVAL = lowerExprToResolveEnvBindingSEXP(cx, stmt.right);
  const iterRVALName = iterRVAL.getBindingName();

  if (isJS3ForOfStatement(stmt)) {
    // [<loop-iterator>, <loop-method>, <loop-catchoffset>] = JSForOfStartSEXP(RVal)
    if (stmt.await) {
      cx.getCurrentBB().args.push(
        new JSForOfStartSEXP(iterRVALName, true)
      );
    } else {
      cx.getCurrentBB().args.push(
        new JSForOfStartSEXP(iterRVALName)
      );
    }
  } else {
    // <loop-iterator> = JSForInStartSEXP(RVal)
    cx.getCurrentBB().args.push(
      new JSExplicitBindingDeclarationSEXP(
        new ResolveEnvBindingSEXP("<loop-iterator>"),
        new JSForInStartSEXP(iterRVALName),
        "JSLET",
        false,
      ),
    );
  }
  cx.getCurrentBB().args.push(loopInitToLoopTestNode);

  // 3. Loop Test
  // cx.addContinuation(cx.getCurrentContext());
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = loopConfig.continueTarget = cx
    .getCurrentBB()
    .getIDX();

  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP("<loop-next>"),
      null,
      "JSLET",
      false,
    ),
  );
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP("<loop-done>"),
      null,
      "JSLET",
      false,
    ),
  );

  if (isJS3ForOfStatement(stmt)) {
    // [<loop-next>, <loop-done>] = JSForOfNextSEXP(RVal)
    cx.getCurrentBB().args.push(
      new CompoundAssnSEXP(
        new JSForOfNextSEXP(new EnvReadSEXP(iterRVALName), stmt.await),
        [
          new EnvWriteSEXP("<loop-done>", new NullSEXP(), false, false),
          new EnvWriteSEXP("<loop-next>", new NullSEXP(), false, false),
        ]
      )
    );

  } else {
    cx.getCurrentBB().args.push(
      new CompoundAssnSEXP(
        new JSForInNextSEXP("<loop-iterator>"),
        [
          new EnvWriteSEXP("<loop-done>", new NullSEXP(), false, false),
          new EnvWriteSEXP("<loop-next>", new NullSEXP(), false, false),
        ]
      )
    );

  }

  testBBLoopContinueNode.setTest(new EnvReadSEXP("<loop-done>"));
  testBBLoopContinueNode.setNOT();

  cx.getCurrentBB().args.push(testBBLoopContinueNode);
  cx.addContinuation(cx.getCurrentContext());
  let testBBLoopContinueNodeContinuation = cx.getCurrentBB().getIDX();

  if (isJS3ForOfStatement(stmt)) {
    cx.getCurrentBB().args.push(
      new JSForOfIteratorCloseSEXP()
    );
  }
  cx.getCurrentBB().args.push(testBBLoopExitNode);

  // 4. For-Of Loop Body
  cx.addContinuation(cx.getCurrentContext());
  loopConfig.loopBodyIDX = cx.getCurrentBB().getIDX(); // Continue can resume here, iteration variable is set at the top of the loop body...

  const initializer = identifier("<loop-next>");

  if (isVariableDeclaration(stmt.left)) {
    // Ensure only one declarator
    if (stmt.left.declarations.length !== 1)
      throw new Error("Expected only one declarator on the left side");
    // Ensure no initializer, this is illegal syntax anyway
    if (stmt.left.declarations[0].init)
      throw new Error("No initializer expected for left side");

    const leftDeclarator = stmt.left.declarations[0];

    // Update Declarator ===> KIND left[Complex] = <loop-next>
    const newDeclarator = variableDeclarator(leftDeclarator.id, initializer);
    const newDeclaration = variableDeclaration(stmt.left.kind, [newDeclarator]);
    handleLoopInitBlock(cx, newDeclaration);

    // // Close TDZ
    // for (let b of extractedBindingsSet) {
    //   cx.getCurrentBB().args.push(new EnvWriteSEXP(b, new EnvReadSEXP("undefined"), true, false));
    // }

    // if (isVoidPattern(leftDeclarator.id)) throw new Error("Void Pattern in assn ukn");
    // const newAssn = assignmentExpression("=", leftDeclarator.id, initializer);
    // reduceJSAssignmentExprToIridium(cx, newAssn);
  } else {
    const newAssn = assignmentExpression("=", stmt.left, initializer);
    reduceJSAssignmentExprToIridium(cx, newAssn);
  }

  handleBlockStatement(cx, stmt.body, { label: label });
  // cx.popContext(); // Loop Body
  cx.popContext(); // Loop Test
  cx.popContext(); // Loop Init

  // Initialize Nodes
  if (loopHeadContext) {
    loopHeadContext.loopConfig = loopConfig;
    currentBBToLoopInitNode.setIDX(loopConfig.loopInitIDX);
    loopInitToLoopTestNode.setIDX(loopConfig.loopHeadIDX);
    // testBBElseIfNode.setTRUE(loopConfig.breakTarget); // If Done, exit
    // testBBElseIfNode.setFALSE(loopConfig.loopBodyIDX); // Goto body
    testBBLoopContinueNode.setTRUE(loopConfig.loopBodyIDX);
    testBBLoopContinueNode.setFALSE(testBBLoopContinueNodeContinuation);
    testBBLoopExitNode.setIDX(loopConfig.breakTarget);
  } else {
    throw new Error("[Iterated Loop] Loop head context is null...");
  }
};

const handleForOfStatement = (
  cx: IRIDIUMV2,
  stmt: JS3ForOfStatement,
  label: string | null = null,
) => {
  handleIteratedLoops(cx, stmt, label);
};

const handleForInStatement = (
  cx: IRIDIUMV2,
  stmt: JS3ForInStatement,
  label: string | null = null,
) => {
  handleIteratedLoops(cx, stmt, label);
};

const handleForStatement = (
  cx: IRIDIUMV2,
  stmt: JS3ForStatement,
  label: string | null = null,
) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard";
    loopHeadIDX: number;
    loopBodyIDX: number;
    loopInitIDX: number;
    label: string | null;
    breakTarget: number;
    continueTarget: number;
  } = {
    kind: "standard",
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: label ? label : null,
    breakTarget: -1,
    continueTarget: -1,
  };

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
  // let extractedBindingsSet: Set<string> = new Set();
  // let declKind: JSEnvWriteTypes = "JSLET";
  if (stmt.init) {
    if (isVariableDeclaration(stmt.init)) {
      // if (stmt.init.kind == "let") declKind = "JSLET";
      // else if (stmt.init.kind == "const") declKind = "JSCONST";
      // else if (stmt.init.kind == "var") declKind = "JSVAR";
      // else throw new Error("Unsupported kind in loop decl");
      // for (let decl of stmt.init.declarations) {
      //   const id = decl.id;
      //   if (isVoidPattern(id)) throw new Error("Void Pattern in iterated loop decl");
      //   if (isIdentifier(id) || isArrayPattern(id) || isObjectPattern(id) || isAssignmentPattern(id) || isRestElement(id)) {
      //     extractBindings(id, extractedBindingsSet);
      //   } else throw new Error("Unsupported pattern in loop decl");
      // }
      handleLoopInitBlock(cx, stmt.init);
    } else {
      lowerExprToResolveEnvBindingSEXP(cx, stmt.init);
    }
    cx.getCurrentBB().args.push(new LoopInitPreludeEndSEXP());
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

  // 4. For Body
  loopConfig.loopBodyIDX = handleBlockStatement(cx, stmt.body, {
    label: label,
  }).BB[0].getIDX();

  // 5. For Update Iterator
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
};

const handleWhileStatement = (
  cx: IRIDIUMV2,
  stmt: JS3WhileStatement | JS3DoWhileStatement,
  label: string | null = null,
) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  let loopHeadContext: IridiumBuildContext | null = null;

  // const loop head config
  const loopConfig: {
    kind: "for-of" | "standard";
    loopHeadIDX: number;
    loopBodyIDX: number;
    loopInitIDX: number;
    label: string | null;
    breakTarget: number;
    continueTarget: number;
  } = {
    kind: "standard",
    loopHeadIDX: -1,
    loopBodyIDX: -1,
    loopInitIDX: -1,
    label: label ? label : null,
    breakTarget: -1,
    continueTarget: -1,
  };

  loopConfig.breakTarget = postBB.getIDX();

  // Control Flow Nodes
  const currentBBToLoopHeadNode = new GotoSEXP(-1);
  const testBBElseIfNode = new IfElseJumpSEXP(null, -1, -1);

  // 1. Current BB to LoopHead
  currentBB.args.push(currentBBToLoopHeadNode);

  // 2. While Loop Test
  cx.declareAndPushLexicalContext();
  loopHeadContext = cx.getCurrentContext();
  loopConfig.loopHeadIDX = loopConfig.continueTarget = cx
    .getCurrentBB()
    .getIDX(); // In a while loop continue returns to test block
  const testResult = lowerExprToResolveEnvBindingSEXP(cx, stmt.test);
  testBBElseIfNode.setTest(new EnvReadSEXP(testResult.getBindingName()));
  cx.getCurrentBB().args.push(testBBElseIfNode);

  // 3. While Body
  loopConfig.loopBodyIDX = handleBlockStatement(cx, stmt.body, {
    label: label,
  }).BB[0].getIDX();

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
};

const handleTryStatement = (cx: IRIDIUMV2, stmt: JS3TryStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // const loop head config
  let tryContextObj: IridiumBuildContext;
  // let finalizerContextObj: IridiumBuildContext | null = null;
  const tryContext: {
    tryContextIDX: number;
    tryIDX: number;
    udCatchIDX: number;
    imCatchIDX: number;
    finalizerIDX: number;
    tryScopeIDX: number;
    udCatchScopeIDX: number;
    finalizerRetIDX: number;
  } = {
    tryContextIDX: -1,
    tryIDX: -1,
    udCatchIDX: -1,
    imCatchIDX: -1,
    finalizerIDX: -1,
    tryScopeIDX: -1,
    udCatchScopeIDX: -1,
    finalizerRetIDX: -1
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
  // cx.getCurrentBB().setFlag("TryContextBB");
  tryContextObj = cx.getCurrentContext();
  tryContext.tryContextIDX = cx.getCurrentBB().getIDX();

  cx.getCurrentBB().args.push(gotoTryContextBBToTryBB);

  // TryBB
  cx.declareAndPushLexicalContext();
  // cx.getCurrentBB().setFlag("TryBB");
  tryContext.tryIDX = cx.getCurrentBB().getIDX();
  tryContext.tryScopeIDX = cx.getCurrentBB().getScopeIDX();
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
    // cx.getCurrentBB().setFlag("udCatchBB");
    tryContext.udCatchIDX = cx.getCurrentBB().getIDX();
    tryContext.udCatchScopeIDX = cx.getCurrentBB().getScopeIDX();
    if (stmt.handler.param) {
      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationSEXP(
          new ResolveEnvBindingSEXP(stmt.handler.param.name),
          new JSCatchContextSEXP(),
          "JSLET",
          false,
        ),
      );
    } else {
      cx.getCurrentBB().args.push(
        new JSCatchContextSEXP()
      );
    }
    cx.getCurrentBB().args.push(udCatchContext);
    for (let s of stmt.handler.body.body) {
      IRIV2_STMT(cx, s);
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
  // cx.getCurrentBB().setFlag("imCatchBB");
  tryContext.imCatchIDX = cx.getCurrentBB().getIDX();
  const imArg = newTemp("imCatchArg");
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(imArg),
      new JSCatchContextSEXP(),
      "JSLET",
      false,
    ),
  );
  if (stmt.finalizer) {
    cx.getCurrentBB().args.push(gotoInvokeFinalizer);
  }
  cx.getCurrentBB().args.push(new ThrowSEXP(new EnvReadSEXP(imArg)));
  cx.popContext(); // imCatchBB

  if (stmt.finalizer) {
    // finalizerBB
    cx.declareAndPushLexicalContext();
    // cx.getCurrentBB().setFlag("finalizerBB");
    // finalizerContextObj = cx.getCurrentContext();
    tryContext.finalizerIDX = cx.getCurrentBB().getIDX();
    for (let s of stmt.finalizer.body) {
      IRIV2_STMT(cx, s);
    }
    cx.getCurrentBB().args.push(new RetSEXP());
    tryContext.finalizerRetIDX = cx.getCurrentBB().getIDX();
    cx.popContext(); // finalizerBB
  }

  cx.popContext(); // TryContextBB

  // Add context and initialize nodes
  tryContextObj.tryContext = tryContext;

  // if (finalizerContextObj) { // Prevent infinite loops when decorating break/continue/return targets inside the finalizer block
  //   finalizerContextObj.tryContext = {
  //     tryContextIDX: -1,
  //     tryIDX: -1,
  //     udCatchIDX: -1,
  //     imCatchIDX: -1,
  //     finalizerIDX: -1
  //   }
  // }

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
};

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
  let falseContext: undefined | IridiumBuildContext = undefined;
  if (stmt.alternate) {
    falseContext = cx.declareAndPushLexicalContext();
    for (const s of stmt.alternate.body) {
      IRIV2_STMT(cx, s);
    }
    cx.getCurrentBB().args.push(new GotoSEXP(postBB.idx));
    cx.popContext();
  }
  // Make branch check the last instruction of currentBB
  const ifElseJump = new IfElseJumpSEXP(
    new EnvReadSEXP(stmt.test.name),
    trueContext.BB[0].idx,
    falseContext ? falseContext.BB[0].idx : postBB.idx,
  );
  currentBB.args.push(ifElseJump);
};

export const handleArrayPatternAssignmentDecl = (
  cx: IRIDIUMV2,
  elements: JS3ArrayPattern_elements,
  rValTarget: EnvReadSEXP,
  safeWrite: boolean = false,
) => {
  let for$of$loop$next = newTemp("next");
  let for$of$loop$done = newTemp("done");

  // RetainedOnStack[<loop-iterator>, <loop-method>, <loop-catchoffset>] = JSForOfStartSEXP(RVal)
  cx.getCurrentBB().args.push(
    new JSForOfStartSEXP(rValTarget)
  );
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(for$of$loop$next),
      null,
      "JSLET",
      false,
    ),
  );
  cx.getCurrentBB().args.push(
    new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(for$of$loop$done),
      null,
      "JSLET",
      false,
    ),
  );

  for (let e of elements) {
    if (isIdentifier(e)) {
      cx.getCurrentBB().args.push(
        new CompoundAssnSEXP(
          new JSForOfNextSEXP(rValTarget),
          [
            new EnvWriteSEXP(for$of$loop$done, new NullSEXP(), false, false),
            new EnvWriteSEXP(for$of$loop$next, new NullSEXP(), false, false),
          ]
        )
      );

      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          e.name,
          new EnvReadSEXP(for$of$loop$next),
          safeWrite,
          false,
        ),
      );
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
      let tempres = newTemp("tempres");
      let tempit = newTemp("it");
      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationSEXP(
          new ResolveEnvBindingSEXP(tempres),
          new JSArraySEXP([]),
          "JSLET",
          false,
        ),
      );
      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationSEXP(
          new ResolveEnvBindingSEXP(tempit),
          new NumberSEXP(0),
          "JSLET",
          false,
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
      const loopToPost = new IfElseJumpSEXP(
        new EnvReadSEXP(for$of$loop$done),
        -1,
        -1,
      );

      // 1. CurrBB to LoopBB
      currentBB.args.push(currToLoop);

      // 2. Loop
      cx.declareAndPushLexicalContext(); // Loop Context
      loopHeadContext = cx.getCurrentContext();
      loopConfig.loopHeadIDX = loopConfig.continueTarget = cx
        .getCurrentBB()
        .getIDX();

      cx.getCurrentBB().args.push(
        new CompoundAssnSEXP(
          new JSForOfNextSEXP(rValTarget),
          [
            new EnvWriteSEXP(for$of$loop$done, new NullSEXP(), false, false),
            new EnvWriteSEXP(for$of$loop$next, new NullSEXP(), false, false),
          ]
        )
      );

      cx.getCurrentBB().args.push(loopToPost);
      cx.addContinuation(cx.getCurrentContext());
      let loopTestContinuation = cx.getCurrentBB().getIDX();
      cx.getCurrentBB().args.push(
        new JSComputedFieldWriteSEXP(
          tempres,
          tempit,
          new EnvReadSEXP(for$of$loop$next),
        )
      );
      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          tempit,
          getIridiumBinop("+", new EnvReadSEXP(tempit), new NumberSEXP(1)),
          false,
          false,
        ),
      );
      cx.getCurrentBB().args.push(new ResolveContinueTargetSEXP());
      cx.popContext(); // Loop Context

      loopHeadContext.loopConfig = loopConfig;

      currToLoop.setIDX(loopConfig.loopHeadIDX);
      loopToPost.setTRUE(loopConfig.breakTarget);
      loopToPost.setFALSE(loopTestContinuation);

      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(
          e.argument.name,
          new EnvReadSEXP(tempres),
          safeWrite,
          false,
        ),
      );
    }
  }
  cx.getCurrentBB().args.push(
    new JSForOfIteratorCloseSEXP()
  );
};

const handleVariableDeclaration = (
  cx: IRIDIUMV2,
  stmt: JS3VariableDeclaration,
) => {
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
  let KIND: JSEnvWriteTypes;

  if (stmt.kind === "let") KIND = "JSLET";
  else if (stmt.kind === "const") KIND = "JSCONST";
  else KIND = "JSVAR";

  // case a.
  // KIND ID = RVal
  if (isIdentifier(declaration.id)) {
    let rValTarget = declaration.init && IRIV2_RVAL(cx, declaration.init);

    // Propagate name property
    if (rValTarget && isLambdaSEXP(rValTarget)) {
      rValTarget.setSETNAME(true);
      rValTarget.setNAME(declaration.id.name);
    }

    if (!rValTarget) {
      if (KIND === "JSLET") {
        rValTarget = new EnvReadSEXP("undefined");
      } else if (KIND === "JSCONST") {
        throw new Error("const decl without Rval is disallowed");
      }
    }

    const envWrite = new JSExplicitBindingDeclarationSEXP(
      new ResolveEnvBindingSEXP(declaration.id.name),
      rValTarget ? rValTarget : null,
      KIND,
      false,
    );
    cx.getCurrentBB().args.push(envWrite);
    return;
  }

  // case b.
  // KIND [ ID, ...ID ] = RVal
  if (isJS3ArrayPattern(declaration.id)) {
    const rValTarget = declaration.init
      ? IRIV2_RVAL(cx, declaration.init)
      : new EnvReadSEXP("undefined");

    // Alloca all declarations
    for (let e of declaration.id.elements) {
      if (isIdentifier(e)) {
        cx.getCurrentBB().args.push(
          new JSExplicitBindingDeclarationSEXP(
            new ResolveEnvBindingSEXP(e.name),
            null,
            KIND,
            false,
          ),
        );
      } else if (isJS3RestElement(e)) {
        cx.getCurrentBB().args.push(
          new JSExplicitBindingDeclarationSEXP(
            new ResolveEnvBindingSEXP(e.argument.name),
            null,
            KIND,
            false,
          ),
        );
      }
    }

    let rValSimp = newTemp("rValSimp");
    cx.getCurrentBB().args.push(new JSExplicitBindingDeclarationNSEXP(new ResolveEnvBindingSEXP(rValSimp), rValTarget, "JSLET", false));

    handleArrayPatternAssignmentDecl(
      cx,
      declaration.id.elements,
      new EnvReadSEXP(rValSimp),
      true,
    );

    return;
  }

  // case c.
  // KIND { TRIV_KEY: ID, ...ID } = RVal
  if (isJS3ObjectPattern(declaration.id)) {
    const rValTarget = declaration.init
      ? IRIV2_RVAL(cx, declaration.init)
      : new EnvReadSEXP("undefined");

    // Alloca all declarations
    for (let d of declaration.id.properties) {
      if (isJS3AssnObjectProperty(d)) {
        cx.getCurrentBB().args.push(
          new JSExplicitBindingDeclarationSEXP(
            new ResolveEnvBindingSEXP(d.value.name),
            null,
            KIND,
            false,
          ),
        );
      } else {
        cx.getCurrentBB().args.push(
          new JSExplicitBindingDeclarationSEXP(
            new ResolveEnvBindingSEXP(d.argument.name),
            null,
            KIND,
            false,
          ),
        );
      }
    }

    handleObjectPatternAssignmentExpr(
      cx,
      declaration.id.properties,
      rValTarget,
      true,
    );
  }

  return;
};

const handleLoopInitBlock = (cx: IRIDIUMV2, stmt: VariableDeclaration) => {
  const otherProps = cx.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };
  const res = js3handleVariableDeclaration(stmt, updatedProps);
  for (let stmt of res) {
    IRIV2_STMT(cx, stmt);
  }
};

export const reduceMemberExpressionIntoJS3MemberExpression = (
  cx: IRIDIUMV2,
  stmt: MemberExpression,
) => {
  const otherProps = cx.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };
  const res = handleMemberExpression(stmt, updatedProps);
  for (let stmt of js3SpillHolder) {
    IRIV2_STMT(cx, stmt);
  }
  return res;
};

export const reduceJSAssignmentExprToIridium = (
  cx: IRIDIUMV2,
  stmt: AssignmentExpression,
) => {
  const otherProps = cx.utils;
  const js3SpillHolder: JS3BlockStatement_body = [];
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: js3SpillHolder },
  };
  js3handleAssignmentExpression(stmt, updatedProps);
  for (let stmt of js3SpillHolder) {
    IRIV2_STMT(cx, stmt);
  }
};

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
      if (
        isIdentifier(r) ||
        isArrayPattern(r) ||
        isObjectPattern(r) ||
        isAssignmentPattern(r) ||
        isRestElement(r)
      ) {
        extractBindings(r, result);
      } else if (r === null) {
        continue;
      } else throw new Error("Todo, array pattern no Identifier case");
    }
  } else if (isObjectPattern(node)) {
    for (let p of node.properties) {
      if (isObjectProperty(p)) {
        if (
          isIdentifier(p.value) ||
          isArrayPattern(p.value) ||
          isObjectPattern(p.value) ||
          isAssignmentPattern(p.value) ||
          isRestElement(p.value)
        ) {
          extractBindings(p.value, result);
        }
      } else if (isRestElement(p)) {
        if (
          isIdentifier(p.argument) ||
          isArrayPattern(p.argument) ||
          isObjectPattern(p.argument) ||
          isAssignmentPattern(p.argument) ||
          isRestElement(p.argument)
        ) {
          extractBindings(p.argument, result);
        }
      } else throw new Error("Todo, object pattern unhandled case");
    }
  } else if (isAssignmentPattern(node)) {
    if (
      isIdentifier(node.left) ||
      isArrayPattern(node.left) ||
      isObjectPattern(node.left) ||
      isAssignmentPattern(node.left) ||
      isRestElement(node.left)
    ) {
      extractBindings(node.left, result);
    } else throw new Error("Todo, assignment pattern unhandled case");
  } else if (isRestElement(node)) {
    if (
      isIdentifier(node.argument) ||
      isArrayPattern(node.argument) ||
      isObjectPattern(node.argument) ||
      isAssignmentPattern(node.argument) ||
      isRestElement(node.argument)
    ) {
      extractBindings(node.argument, result);
    } else throw new Error("Todo, RestElement unhandled case");
  } else throw new Error("Todo, unhandled extract bindings case");
};

export const funArgLength = (
  params: Array<
    Identifier | ArrayPattern | ObjectPattern | AssignmentPattern | RestElement
  >,
): number => {
  let count = 0;
  for (const param of params) {
    // Stop at first AssignmentPattern or RestElement
    if (isAssignmentPattern(param) || isRestElement(param)) {
      break;
    }
    // Valid parameter: Identifier, ObjectPattern, ArrayPattern
    count++;
  }
  return count;
};

// export type JS3AllowedFunctionArgs = Identifier | ArrayPattern | ObjectPattern | AssignmentPattern | RestElement;
export const lowerArgumentInit = (
  cx: IRIDIUMV2,
  implicitBindings: Array<{
    name: string;
    type: JSImplicitBindingDeclarationTypes;
    value: number;
    initializer?: ListSEXP;
  }>,
  params: Array<JS3AllowedFunctionArgs>,
  abstractResolutions: Array<SiblingSpecialWriteSEXP> = [],
  extractedBindingsSet: Set<string> = new Set(),
) => {
  const closureTopLevelContext = cx.getCurrentContext();

  // let hasArguments = implicitBindings.find((e) => e.name === "arguments")
  //   ? true
  //   : false;
  let addVarDeclScope = implicitBindings.find((e) => e.name === "var")
    ? true
    : false;

  const currToArgInit = new GotoSEXP(-1);
  const argInitToPost = new GotoSEXP(-1);

  // Goto argInitBB
  cx.getCurrentBB().args.push(currToArgInit);

  // Create continuation
  cx.addContinuation(cx.getCurrentContext());
  let postBBIdx = cx.getCurrentBB().getIDX();

  {
    // Arguments

    const argInitConntext = cx.declareAndPushLexicalContext("VARBoundary"); // VARBoundary Start -- Arguments
    let argInitBBIdx = cx.getCurrentBB().getIDX();
    argInitConntext.isArgInitContext = true;

    // S1: Extract all bindings that are being made
    // S2: Declare all argument as let bindings in the argument init scope
    // S3: Replace all arglist with replacement RVals
    // S4: Use assignment logic to replace with LVal = ARG$I

    // S1: Extract all bindings that are being made
    // const extractedBindingsSet: Set<string> = new Set();
    for (let p of params) extractBindings(p, extractedBindingsSet);

    // if (hasArguments && !extractedBindingsSet.has("arguments")) {
    //   cx.getCurrentBB().args.push(
    //     new JSExplicitBindingDeclarationSEXP(
    //       new ResolveEnvBindingSEXP("arguments"),
    //       null,
    //       "JSLET",
    //       false,
    //     ),
    //   );
    // }

    if (addVarDeclScope) {
      cx.getCurrentBB().args.push(
        new JSImplicitBindingDeclarationSEXP("<var>", "JSVAR", 5),
      );
    }

    // S2: Declare all argument as let bindings in the argument init scope
    for (const b of extractedBindingsSet) {
      const bindingUnresolved = new ResolveEnvBindingSEXP(b);
      bindingUnresolved.markASW();
      cx.getCurrentBB().args.push(
        new JSExplicitBindingDeclarationXSEXP(
          bindingUnresolved,
          null,
          "JSLET",
          false,
        ),
      );

      cx.getCurrentBB().args.push(
        new EnvWriteSEXP(b, new JSNUBDSEXP(), true, false),
      );
    }

    // S3: Replace all arglist with replacement RVals
    const argReplacementMap: Map<JS3AllowedFunctionArgs, string> = new Map();

    for (const arg of params) {
      let currArg = newTemp("ARG");
      closureTopLevelContext.args.push(currArg);
      if (isRestElement(arg)) closureTopLevelContext.hasRestArgs = true;
      argReplacementMap.set(arg, currArg);
    }

    // S3: Use assignment logic
    let oldVal = cx.utils.iridiumArgContext;
    cx.utils.iridiumArgContext = true;
    for (const arg of params) {
      // let ebSet: Set<string> = new Set();
      // extractBindings(arg, ebSet);

      // for (let b of ebSet) {
      //   cx.getCurrentBB().args.push(
      //     new EnvWriteSEXP(b, new EnvReadSEXP("undefined"), true, false)
      //   );
      // }

      const rVal = argReplacementMap.get(arg);
      if (!rVal)
        throw new Error(
          "Arg replacement map is supposed to map all the arguments",
        );
      if (
        isIdentifier(arg) ||
        isArrayPattern(arg) ||
        isObjectPattern(arg) ||
        isAssignmentPattern(arg)
      ) {
        reduceJSAssignmentExprToIridium(
          cx,
          assignmentExpression("=", arg, identifier(rVal)),
        );
      } else if (isRestElement(arg)) {
        reduceJSAssignmentExprToIridium(
          cx,
          assignmentExpression("=", arg.argument, identifier(rVal)),
        );
      }
    }
    cx.utils.iridiumArgContext = oldVal;

    // Sibling scope forwarding
    // Sibling[a] = CurrScope[a]
    for (const b of extractedBindingsSet) {
      // lval: string, rval: IridiumSEXP, safe: boolean, thisInit: boolean, mapInf: string, scopeIDX: number
      const siblingSpecialWrite = new SiblingSpecialWriteSEXP(
        b,
        new EnvReadSEXP(b),
        true,
        false,
        -1,
      );

      cx.getCurrentBB().args.push(siblingSpecialWrite);

      abstractResolutions.push(siblingSpecialWrite);
    }

    cx.getCurrentBB().args.push(argInitToPost);
    cx.popContext(); // VARBoundary End -- Arguments

    // Init Gotos
    currToArgInit.setIDX(argInitBBIdx);
    argInitToPost.setIDX(postBBIdx);
  }
};

export const createLambda = (
  cx: IRIDIUMV2,
  isSimpleArgs: boolean,
  isStrict: boolean,
  isAsync: boolean,
  isGenerator: boolean,
  kind: number,
  ecmaArgs: number,
  params: Array<JS3AllowedFunctionArgs>,
  body: Array<JS3AllowedBlockStatement>,
  implicitBindings: Array<{
    name: string;
    type: JSImplicitBindingDeclarationTypes;
    value: number;
    initializer?: ListSEXP;
  }>,
  name: string = "",
  sourceLine: number = -1,
  privateMapping: PrivateMapping | null = null,
  funcContextCallback: (arg0: IridiumBuildContext) => void = () => {},
  closureScopeCallback: () => void = () => {},
  bodyScopeCallback: () => void = () => {},
) => {
  // Lower Function code
  const funcContext = cx.declareAndPushLexicalContext("ClosureBoundary"); // ClosureBoundary
  const funBBIdx = funcContext.getCurrentBB().idx;
  funcContext.isStrict = isStrict;
  funcContext.isAsync = isAsync;
  funcContext.isGenerator = isGenerator;
  funcContext.kind = kind;
  funcContext.ecmaArgs = ecmaArgs;
  funcContext.privateMapping = privateMapping;
  funcContext.name = name;
  funcContext.sourceLine = sourceLine;


  implicitBindings.forEach((binding) => {

    let res = binding.initializer
      ? new JSImplicitBindingDeclarationSEXP(
        binding.name,
        binding.type,
        binding.value,
        binding.initializer,
      )
      : new JSImplicitBindingDeclarationSEXP(
        binding.name,
        binding.type,
        binding.value,
      );

    cx.getCurrentBB().args.push(
      res
    );
  });

  // Callback called when emitting code to top level closure scope
  closureScopeCallback();

  const abstractResolutions: Array<SiblingSpecialWriteSEXP> = [];
  const extractedBindingsSet: Set<string> = new Set();
  {
    // Arguments
    if (!isSimpleArgs) {
      lowerArgumentInit(
        cx,
        implicitBindings,
        params,
        abstractResolutions,
        extractedBindingsSet,
      );
    } else {
      params.forEach((p) => {
        if (isIdentifier(p)) {
          cx.getCurrentContext().args.push(p.name);
        }
      });
    }
  }

  {
    // Body
    if (!isSimpleArgs) {
      let argInitToBody = new GotoSEXP(-1);
      cx.getCurrentBB().args.push(argInitToBody);

      // VARBoundary Start -- Body
      cx.declareAndPushLexicalContext("VARBoundary");
      argInitToBody.setIDX(cx.getCurrentBB().getIDX());
      const bodyScopeIDX = cx.getCurrentBB().getScopeIDX();

      // Set lookup target to sibling writes
      abstractResolutions.forEach((ar) => ar.setScopeIDX(bodyScopeIDX));

      // Declare the arguments in the body, using VAR semantics

      extractedBindingsSet.forEach((bb) => {
        cx.getCurrentBB().args.push(
          new JSExplicitBindingDeclarationNSEXP(
            new ResolveEnvBindingSEXP(bb),
            null,
            "JSVAR",
            false,
          ),
        );
      });
    }

    if (funcContext.isGenerator)
      cx.getCurrentBB().args.push(new JSInitialYieldSEXP());

    // Callback called when emitting code to top level closure scope
    bodyScopeCallback();

    for (const s of body) {
      IRIV2_STMT(cx, s);
    }

    cx.getCurrentBB().args.push(new ReturnSEXP(new EnvReadSEXP("undefined")));

    if (!isSimpleArgs) {
      // VARBoundary End -- Body
      cx.popContext();
    }
  }

  // Call at the very end, to allow overrides and avoid confusion
  funcContextCallback(funcContext);

  cx.popContext(); // ClosureBoundary

  return funBBIdx;
};

const handleFunctionDeclaration = (
  cx: IRIDIUMV2,
  stmt: JS3FunctionDeclaration,
) => {
  const isSimpleArgs = stmt.params.every((p) => isIdentifier(p));
  const isStrict =
    cx.getCurrentContext().isStrict ||
    stmt.body.directives.some((val) => val.value.value === "use strict");
  const isAsync = stmt.async ? stmt.async : false;
  const isGenerator = stmt.generator ? stmt.generator : false;
  const kind = CF_FUNCTION;
  const ecmaArgs = funArgLength(stmt.params); // 15.1.5 Static Semantics: ExpectedArgumentCount

  const implicitBindings: Array<{
    name: string;
    type: JSImplicitBindingDeclarationTypes;
    value: number;
    initializer?: ListSEXP;
  }> = [
    {
      name: "arguments",
      type: "JSVAR",
      value: isStrict ? 0 : isSimpleArgs ? 1 : 0,
    },
    { name: "this", type: "JSLET", value: 9 },
    { name: "new.target", type: "JSVAR", value: 3 },
    { name: "<home_object>", type: "JSVAR", value: 4 },
    { name: "<var>", type: "JSVAR", value: 5 },
    {
      name: "<super_obj>",
      type: "JSCONST",
      value: 8,
      initializer: new ListSEXP([new ResolveEnvBindingSEXP("<home_object>")]),
    },
  ];

  const funBBIdx = createLambda(
    cx,
    isSimpleArgs,
    isStrict,
    isAsync,
    isGenerator,
    kind,
    ecmaArgs,
    stmt.params,
    stmt.body.body,
    implicitBindings,
    stmt.id.name,
    stmt.loc?.start.line,
  );

  const lambda = new LambdaSEXP(funBBIdx, stmt.id.name);

  // FUNC = LAMBDA
  cx.getCurrentBB().args.push(
    new JSFuncDeclSEXP(new ResolveEnvBindingSEXP(stmt.id.name), lambda),
  );
};
