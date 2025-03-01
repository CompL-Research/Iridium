import debugConfig from "#debugConfig";
import _generate from "@babel/generator";
import {
  ArrayPattern,
  AssignmentPattern,
  callExpression,
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
  isImportSpecifier,
  isNullLiteral,
  isNumericLiteral,
  isObjectPattern,
  isObjectProperty,
  isOptionalCallExpression,
  isOptionalMemberExpression,
  isPrivateName,
  isSpreadElement,
  isStringLiteral,
  isSuper,
  isThisExpression,
  isV8IntrinsicIdentifier,
  memberExpression,
  Node,
  ObjectPattern,
  OptionalCallExpression,
  optionalCallExpression,
  OptionalMemberExpression,
  optionalMemberExpression,
  ThisExpression,
} from "@babel/types";
import path from "node:path";

import JS3Builder from "../JS3Builder.ts";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks.ts";
import {
  handleExpression,
  lowerToAnonArrayExpr,
} from "../JS3Helpers/HandleExpression.ts";
import {
  generateDummyJS3VariableDeclaration,
  generateIdentifier,
  generateJS3AssignmentExpressionfromBaseNode,
  generateJS3RestElementfromBaseNode,
  generateJS3SpreadElement,
  generateJS3VariableDeclarationfromBaseNode,
  generateJS3VariableDeclaratorfromBaseNode,
} from "../JS3Helpers/JS3Constructors.ts";
import {
  isJS3AnonMemberExpression,
  isJS3ArrayExpression,
  isJS3ArrayPattern,
  isJS3ArrowFunctionExpression,
  isJS3AssignmentExpression,
  isJS3AwaitExpression,
  isJS3BinaryExpression,
  isJS3BlockStatement,
  isJS3BreakStatement,
  isJS3CallExpression,
  isJS3ClassExpression,
  isJS3ClassMethod,
  isJS3ClassPrivateMethod,
  isJS3ClassPrivateProperty,
  isJS3ClassProperty,
  isJS3ConditionalExpression,
  isJS3ContainedExprKey,
  isJS3ContextualCallExpression,
  isJS3ContinueStatement,
  isJS3DebuggerStatement,
  isJS3DefaultExportMemberExpression,
  isJS3DoWhileStatement,
  isJS3EmptyStatement,
  isJS3ExportAllDeclaration,
  isJS3ExportDefaultDeclaration,
  isJS3ExportNamedDeclaration,
  isJS3ExportNamespaceSpecifier,
  isJS3ExportSpecifier,
  isJS3ForInStatement,
  isJS3ForOfStatement,
  isJS3ForStatement,
  isJS3FunctionDeclaration,
  isJS3FunctionExpression,
  isJS3IfStatement,
  isJS3Import,
  isJS3ImportDeclaration,
  isJS3JSXCallExpression,
  isJS3LabeledStatement,
  isJS3LoopDeclaration,
  isJS3MemberExpression,
  isJS3MetaProperty,
  isJS3NewExpression,
  isJS3ObjectExpression,
  isJS3ObjectMethod,
  isJS3ObjectPattern,
  isJS3ObjectProperty,
  isJS3RegExpLiteral,
  isJS3ReturnStatement,
  isJS3SpreadElement,
  isJS3StaticBlock,
  isJS3SwitchStatement,
  isJS3TaggedTemplateExpression,
  isJS3TemplateLiteral,
  isJS3ThrowStatement,
  isJS3TryStatement,
  isJS3UnaryExpression,
  isJS3UpdateExpression,
  isJS3VariableDeclaration,
  isJS3WhileStatement,
  isJS3YieldExpression,
  JS3AllowedFunctionArgs,
  JS3AllowedProgStatement,
  JS3AnonMemberExpression,
  JS3ArrayExpression,
  JS3ArrayPattern,
  JS3ArrowFunctionExpression,
  JS3AssignmentExpression,
  JS3AssnInit,
  JS3AwaitExpression,
  JS3BinaryExpression,
  JS3BlockStatement,
  JS3BlockStatement_body,
  JS3BreakStatement,
  JS3CallExpression,
  JS3ClassExpression,
  JS3ClassMethod,
  JS3ClassProperty,
  JS3ClassProperty_value,
  JS3ConditionalExpression,
  JS3ContainedExprKey,
  JS3ContextualCallExpression,
  JS3ContinueStatement,
  JS3DebuggerStatement,
  JS3DefaultExportMemberExpression,
  JS3DoWhileStatement,
  JS3ExportAllDeclaration,
  JS3ExportDefaultDeclaration,
  JS3ExportNamedDeclaration,
  JS3ForInStatement,
  JS3ForOfStatement,
  JS3ForStatement,
  JS3FunctionDeclaration,
  JS3FunctionExpression,
  JS3IfStatement,
  JS3ImportDeclaration,
  JS3JSXCallExpression,
  JS3LabeledStatement,
  JS3MemberExpression,
  JS3MetaProperty,
  JS3NewExpression,
  JS3ObjectExpression,
  JS3ObjectPattern,
  JS3Program,
  JS3RegExpLiteral,
  JS3ReturnStatement,
  JS3StaticBlock,
  JS3SwitchStatement,
  JS3TaggedTemplateExpression,
  JS3TemplateLiteral,
  JS3ThrowStatement,
  JS3TryStatement,
  JS3UnaryExpression,
  JS3UpdateExpression,
  JS3VariableDeclaration,
  JS3VariableDeclarator_init,
  JS3WhileStatement,
  JS3YieldExpression,
} from "../JS3Helpers/JS3Types.ts";
import {
  IV_Identifier,
  IV_MemberExpressionPA,
  IV_PrivateName,
  IV_SuperLookupPA,
  IV_ThisLookupPA,
} from "./ALL_AMP/ALL_AMP.ts";
import { IS_Break, IS_LBreak } from "./ALL_IS/IS_Break.ts";
import { IS_ClassStaticPropInit } from "./ALL_IS/IS_ClassStaticPropInit.ts";
import { IS_Continue, IS_LContinue } from "./ALL_IS/IS_Continue.ts";
import {
  IS_Debugger,
  IS_Return,
  IS_Throw,
} from "./ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS_FunDecl } from "./ALL_IS/IS_FunDecl.ts";
import {
  IS_AExport,
  IS_AImport,
  IS_BExport,
  IS_BImport,
  IS_CExport,
  IS_CImport,
  IS_DExport,
  IS_EExport,
} from "./ALL_IS/IS_Imports_Exports.ts";
import {
  IS1_AssignmentStmt,
  IS_ArrPatVarDecl,
  IS_ClassNameInitStmt,
  IS_ObjPatVarDecl,
  IS_SimpleVarDecl,
  IS_ThisInitStmt,
  IS_VAR_DECL_KIND,
} from "./ALL_IS/IS_VarDecl.ts";
import {
  ISP_ArgSpread,
  ISP_ClassMethod,
  ISP_ClassProperty,
  ISP_ClassProperty_key,
  ISP_ObjectMethod,
  ISP_ObjectMethod_key,
  ISP_ObjectProperty,
  ISP_RestElement,
  ISP_StaticClassProperty,
  ISP_Super,
  ISP_V8Intrinsic,
} from "./ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "./ALL_RVal/ALL_RVal.ts";
import { IV_ArrayExpression } from "./ALL_RVal/IV_ArrayExpression.ts";
import { IV_ArrowFunctionExpression } from "./ALL_RVal/IV_ArrowFunctionExpression.ts";
import {
  IV_ArrPatAssn,
  IV_MemberAssn,
  IV_ObjPatAssn,
  IV_SimpleAssn,
  IV_SuperAssn,
  IV_ThisAssn,
} from "./ALL_RVal/IV_Assignment.ts";
import {
  IV_ABINOP,
  IV_BBINOP,
  IV_CBINOP,
  IV_DBINOP,
  IV_EBINOP,
  IV_FBINOP,
  OPA,
  OPB,
  OPC,
  OPD,
  OPE,
  OPF,
} from "./ALL_RVal/IV_Binop.ts";
import {
  IV_Call,
  IV_ImportCall,
  IV_SuperCall,
  IV_V8IntrinsicCall,
} from "./ALL_RVal/IV_Call.ts";
import {
  IV_ClassExpression,
  IV_ClassExpression_properties,
} from "./ALL_RVal/IV_ClassExpression.ts";
import { IV_ConditionalExpression } from "./ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FunctionExpression } from "./ALL_RVal/IV_FunctionExpression.ts";
import {
  IV_BigIntLiteral,
  IV_BooleanLiteral,
  IV_DecimalLiteral,
  IV_NullLiteral,
  IV_NumericLiteral,
  IV_StringLiteral,
} from "./ALL_RVal/IV_Literals.ts";
import {
  IV_HasLoopNext,
  IV_InIterator,
  IV_LoopNext,
  IV_OfIterator,
} from "./ALL_RVal/IV_LoopIterators.ts";
import { IV_ModuleMeta, IV_NewTarget } from "./ALL_RVal/IV_META.ts";
import { IV_NewExpression } from "./ALL_RVal/IV_NewExpression.ts";
import { IV_NUBD, IV_STHIS } from "./ALL_RVal/IV_NonLang.ts";
import { IV_ObjectExpression } from "./ALL_RVal/IV_ObjectExpression.ts";
import { IV_Regexp } from "./ALL_RVal/IV_Regexp.ts";
import {
  IV_TaggedTemplateCall,
  IV_TemplateLiteral,
} from "./ALL_RVal/IV_Templates.ts";
import { IV_This } from "./ALL_RVal/IV_This.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "./ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "./ALL_RVal/IV_UpdateExpression.ts";
import { IV_AWAIT, IV_YIELD } from "./ALL_RVal/IV_YIELD_AWAIT.ts";
import {
  BB,
  BlockBB,
  BranchTerminal,
  CatchBB,
  ClassInitBB,
  ClassPropInitBB,
  ClassStaticBB,
  FunctionArgInitBB,
  FunctionBB,
  FunctionReturn,
  LoopHeadBB,
  LoopInit,
  ModuleBB,
  ScriptBB,
  SwitchBodyBB,
  TryBB,
} from "./BB.ts";
import { Environment, GlobalEnvironment } from "./I_GENERAL/I_Environment.ts";

import { IV_FJSX, IV_JSX, IV_PJSX } from "./ALL_RVal/IV_JSX.ts";
import { I_Container } from "./I_GENERAL/I_Container.ts";
import {
  handleResolvedSources,
  resolveSources,
  successorPTAClosure,
} from "./PTAUtil.ts";
import { addThisInitToFunctionBoundaries } from "./Passes/AddThisInitToFunctionBoundaries.ts";
import { cleanupBBs } from "./Passes/BBCleanup.ts";
import { hoistDeclarations } from "./Passes/DeclarationHoisting.ts";
import { initializeEnvDefs } from "./Passes/EnvInit.ts";
import { matchContinueAndBreak } from "./Passes/MatchContinueAndBreak.ts";
import { normalizeReturns } from "./Passes/NormalizeReturns.ts";
import { PTA_IN_RES, PTA_OUT_RES, startPTA } from "./Passes/PTA.ts";
import { IRIDIUM_FG } from "./Passes/PTA/IRIDIUM_FG.ts";
import {
  DummyObject,
  ECall,
  GlobalNode,
  ImportNode,
  LiteralNode,
  ReactRenderRoot,
  StackNode,
  UnknownResultObj,
} from "./Passes/PTA/nodes.ts";
import { PTAGraph } from "./Passes/PTA/PTAGraph.ts";

// const genersate = _generate.default;
export const RESOLUTION_CACHE: Map<string, I_Container> = new Map();
export default class IRIDIUM_MODULE {
  js3builder: JS3Builder;
  node: JS3Program;
  fgContext: Array<IRIDIUM_FG> = [];
  static SEARCH_THRESHOLD: number = 10;
  static ECALL_LIMIT: number = 5;
  static GLOBAL_CONTEXT: Array<string> = [];
  fg: IRIDIUM_FG = undefined;
  projectBasePath: string;

  constructor(js3builder: JS3Builder, projectBasePath: string) {
    this.node = js3builder.generatedAST.program;
    this.js3builder = js3builder;
    this.projectBasePath = projectBasePath;
  }

  // FlowGraph Context
  getCurrentFGContext(): IRIDIUM_FG {
    return this.fgContext[this.fgContext.length - 1];
  }
  pushFGContext(bb: IRIDIUM_FG) {
    this.fgContext.push(bb);
  }
  popFGContext(): IRIDIUM_FG {
    return this.fgContext.pop();
  }

  // Build FlowGraph
  build(level: number = 0) {
    IRIDIUM_MODULE.GLOBAL_CONTEXT.push(
      this.js3builder.projectFile.absoluteFilePath,
    );
    const GLOBAL_ENV = new GlobalEnvironment(undefined);
    const MAIN_ENV = new Environment(GLOBAL_ENV);

    let bb: BB;

    if (this.node.sourceType === "module")
      bb = new ModuleBB(MAIN_ENV, this.node);
    else bb = new ScriptBB(MAIN_ENV, this.node);

    this.pushFGContext(new IRIDIUM_FG(bb));
    this.handleJS3ProgramBody(this.node.body);
    const res = this.popFGContext();
    if (this.fgContext.length !== 0)
      debugConfig.logger.throwIriError(
        "Expected FGContext to be empty after Iridium generation!!",
      );

    hoistDeclarations(res);
    addThisInitToFunctionBoundaries(res);
    matchContinueAndBreak(res);
    normalizeReturns(res);
    initializeEnvDefs(res);
    cleanupBBs(res);

    this.fg = res;

    const updateResolvedNode = (iNode: ImportNode, container: I_Container) => {
      const existingIN = PTA_IN_RES.get("" + this.fg.rootBB.idx);
      const resNode = new ImportNode(
        iNode.source,
        iNode.id,
        iNode.FROM,
        iNode.isStatic,
      );
      resNode.importContext = iNode.importContext;
      resNode.addContainer(container);
      existingIN.addPTANode(resNode);
    };

    // Start PTA
    let eCallResolved = 0;
    do {
      debugConfig.logger.log(
        `[startPTA]: { file: ${this.js3builder.projectFile.absoluteFilePath}, eCallResolved: ${eCallResolved} }`,
      );
      startPTA(res);
      if (debugConfig.cli.savePTAGraph) {
        const filename = path.basename(
          this.js3builder.projectFile.uname,
          this.js3builder.projectFile.extension,
        );
        const PTAPATH = debugConfig.cli.outputsPath + "/PTA";
        PTA_OUT_RES.get(res.sinks()[0]).saveDotToFile(
          `${PTAPATH}/${filename}_ECALL_LEVEL_${eCallResolved}`,
        );
      }
      const outPTA = PTA_OUT_RES.get(res.sinks()[0]);
      const resolvedSources = outPTA
        .nodes()
        .map((n) => outPTA.getPTANode(n))
        .filter((n) => n instanceof ECall)
        .map((n) => n.iNode);
      if (resolvedSources.length === 0) {
        debugConfig.logger.log(
          `Completing Module PTA Summary, no more ECall Nodes`,
        );
        break;
      } else {
        debugConfig.logger.log(
          `[startPTA]: found ${resolvedSources.length} ECall Nodes`,
        );
        handleResolvedSources(resolvedSources, updateResolvedNode, level);
      }
      eCallResolved++;
    } while (eCallResolved < IRIDIUM_MODULE.ECALL_LIMIT);

    if (level === 0) {
      if (debugConfig.cli.savePTAGraph) {
        const filename = path.basename(
          this.js3builder.projectFile.uname,
          this.js3builder.projectFile.extension,
        );
        const PTAPATH = debugConfig.cli.outputsPath + "/PTA";
        PTA_OUT_RES.get(res.sinks()[0]).saveDotToFile(
          `${PTAPATH}/${filename}_BEFORE_EXPANSION_OUT`,
        );
      }

      // After initial PTA analysis of a module, we will expand the
      // search until 'SEARCH_THRESHOLD', i.e. at each step find the
      // reachable expandable nodes, resolve them if we can and re-run
      // the PTA analysis.
      for (let i = 0; i < IRIDIUM_MODULE.SEARCH_THRESHOLD; i++) {
        debugConfig.logger.log(`Expanding Search Space ${i}`);

        const currPTA = PTA_OUT_RES.get(res.sinks()[0]);

        // Rootset is the set of nodes where we want to start our analysis,
        // reachability from the rootSet decides what sources we expand
        const rootSet = currPTA
          .nodes()
          .map((n) => currPTA.getPTANode(n))
          .filter((n) => n instanceof ReactRenderRoot);
        const resolvedSources: Set<ImportNode> = resolveSources(
          rootSet,
          currPTA,
        );

        if (resolvedSources.size === 0) {
          debugConfig.logger.log(
            `Concluding Search Space Early ${i}/${IRIDIUM_MODULE.SEARCH_THRESHOLD}`,
          );
          break;
        }

        handleResolvedSources(resolvedSources, updateResolvedNode, level);

        if (debugConfig.cli.savePTAGraph) {
          const filename = path.basename(
            this.js3builder.projectFile.uname,
            this.js3builder.projectFile.extension,
          );
          const PTAPATH = debugConfig.cli.outputsPath + "/PTA";
          PTA_IN_RES.get(res.sinks()[0]).saveDotToFile(
            `${PTAPATH}/${filename}_EXPANSION_LEVEL_${i}_IN`,
          );
        }

        startPTA(res);

        if (debugConfig.cli.savePTAGraph) {
          const filename = path.basename(
            this.js3builder.projectFile.uname,
            this.js3builder.projectFile.extension,
          );
          const PTAPATH = debugConfig.cli.outputsPath + "/PTA";
          PTA_OUT_RES.get(res.sinks()[0]).saveDotToFile(
            `${PTAPATH}/${filename}_EXPANSION_LEVEL_${i}_OUT`,
          );
        }
      }

      // Save final filtered graph
      const finalPTARes = new PTAGraph();
      finalPTARes.union(PTA_OUT_RES.get(res.sinks()[0]));
      const existingNodes = finalPTARes.nodes();
      const rootSet = finalPTARes
        .nodes()
        .map((n) => finalPTARes.getPTANode(n))
        .filter((n) => n instanceof ReactRenderRoot);
      const nodesToRetain: Set<string> = new Set();
      for (const r of rootSet) {
        successorPTAClosure(finalPTARes, r.id, nodesToRetain);
      }
      // const predNodesToRetain: Set<string> = new Set();
      // for (const r of nodesToRetain) {
      //   predecessorPTAClosure(finalPTARes, r).forEach((n) =>
      //     predNodesToRetain.add(n),
      //   );
      // }
      // predNodesToRetain.forEach((n) => nodesToRetain.add(n));
      for (const n of existingNodes) {
        if (
          !nodesToRetain.has(n) ||
          finalPTARes.getPTANode(n) instanceof ImportNode ||
          finalPTARes.getPTANode(n) instanceof StackNode ||
          finalPTARes.getPTANode(n) instanceof DummyObject ||
          finalPTARes.getPTANode(n) instanceof GlobalNode ||
          finalPTARes.getPTANode(n) instanceof LiteralNode ||
          finalPTARes.getPTANode(n) instanceof UnknownResultObj
        ) {
          finalPTARes.removePTANode(finalPTARes.getPTANode(n));
        }
      }
      const filename = path.basename(
        this.js3builder.projectFile.uname,
        this.js3builder.projectFile.extension,
      );
      finalPTARes.saveDotToFile(
        `${debugConfig.cli.outputsPath}/${filename}_REACT_PTA`,
      );
    }

    // // Re-run PTA after composition
    // startPTA(res);

    // if (debugConfig.cli.savePTAGraph) {
    //   const filename = path.basename(
    //     this.js3builder.projectFile.uname,
    //     this.js3builder.projectFile.extension,
    //   );
    //   const PTAPATH = debugConfig.cli.outputsPath + "/PTA";
    //   // Iterate over all the nodes of this file
    //   const nodes = res.nodes();
    //   for (const n of nodes) {
    //     const inRes = PTA_IN_RES.get(n);
    //     const outRes = PTA_OUT_RES.get(n);
    //     inRes.saveDotToFile(`${PTAPATH}/${filename}_composed_${n}_IN`);
    //     outRes.saveDotToFile(`${PTAPATH}/${filename}_composed${n}_OUT`);
    //   }
    // }
    IRIDIUM_MODULE.GLOBAL_CONTEXT.pop();
  }

  // // Set/Get current BB
  // setCurrentBB(bb: BB) { this.currentBB = bb; }
  // getCurrentBB() { return this.currentBB; }

  // Handle Statements
  handleJS3AllowedProgStatement(stmt: JS3AllowedProgStatement) {
    if (isJS3ImportDeclaration(stmt)) this.handleJS3ImportDeclaration(stmt);
    else if (isJS3ExportDefaultDeclaration(stmt))
      this.handleJS3ExportDefaultDeclaration(stmt);
    else if (isJS3ExportNamedDeclaration(stmt))
      this.handleJS3ExportNamedDeclaration(stmt);
    else if (isJS3ExportAllDeclaration(stmt))
      this.handleJS3ExportAllDeclaration(stmt);
    else if (isJS3DebuggerStatement(stmt))
      this.handleJS3DebuggerStatement(stmt);
    else if (isJS3ReturnStatement(stmt)) this.handleJS3ReturnStatement(stmt);
    else if (isJS3ThrowStatement(stmt)) this.handleJS3ThrowStatement(stmt);
    else if (isJS3VariableDeclaration(stmt))
      this.handleJS3VariableDeclaration(stmt);
    else if (isJS3FunctionDeclaration(stmt))
      this.handleJS3FunctionDeclaration(stmt);
    else if (isJS3IfStatement(stmt)) this.handleJS3IfStatement(stmt);
    else if (isJS3TryStatement(stmt)) this.handleJS3TryStatement(stmt);
    else if (isJS3EmptyStatement(stmt)) {
      /* NADA */
    } else if (isJS3WhileStatement(stmt)) this.handleJS3WhileStatement(stmt);
    else if (isJS3BreakStatement(stmt)) this.handleJS3BreakStatement(stmt);
    else if (isJS3ContinueStatement(stmt))
      this.handleJS3ContinueStatement(stmt);
    else if (isJS3BlockStatement(stmt)) this.handleJS3BlockStatement(stmt);
    else if (isJS3ForInStatement(stmt)) this.handleJS3ForInOfStatement(stmt);
    else if (isJS3LabeledStatement(stmt)) this.handleJS3LabeledStatement(stmt);
    else if (isJS3ForStatement(stmt)) this.handleJS3ForStatement(stmt);
    else if (isJS3DoWhileStatement(stmt)) this.handleJS3DoWhileStatement(stmt);
    else if (isJS3SwitchStatement(stmt)) this.handleJS3SwitchStatement(stmt);
    else if (isJS3ForOfStatement(stmt)) this.handleJS3ForInOfStatement(stmt);
    else
      debugConfig.logger.throwIriError(
        `IRIDIUM: Unhandled Statement ${stmt.type}, ${stmt.js3type}`,
      );
  }

  // Handle RValues | AMP
  handleJS3AssnInit(init: JS3AssnInit): IV_ASSIGNABLE {
    //
    // AMP
    //
    if (init.type === "Identifier") {
      return new IV_Identifier(init, init.name);
    } else if (isJS3MemberExpression(init)) {
      return this.handleJS3MemberExpression(init);
    }

    //
    // RValues
    //
    // Handle Literals
    else if (init.type === "DecimalLiteral") {
      return new IV_DecimalLiteral(init, init.value);
    } else if (init.type === "BigIntLiteral") {
      return new IV_BigIntLiteral(init, init.value);
    } else if (init.type === "StringLiteral") {
      return new IV_StringLiteral(init, init.value);
    } else if (init.type === "NumericLiteral") {
      return new IV_NumericLiteral(init, init.value);
    } else if (init.type === "NullLiteral") {
      return new IV_NullLiteral(init);
    } else if (init.type === "BooleanLiteral") {
      return new IV_BooleanLiteral(init, init.value);
    }

    // JS3RegExp Literal
    else if (isJS3RegExpLiteral(init)) {
      return this.handleJS3RegExpLiteral(init);
    }

    // JS3Template Literal
    else if (isJS3TemplateLiteral(init)) {
      return this.handleJS3TemplateLiteral(init);
    }

    // JS3TaggedTemplateExpression
    else if (isJS3TaggedTemplateExpression(init)) {
      return this.handleJS3TaggedTemplateExpression(init);
    }

    // JS3Meta Property
    else if (isJS3MetaProperty(init)) {
      return this.handleJS3MetaProperty(init);
    }

    // JS3YieldExpression / JS3AwaitExpression
    else if (isJS3YieldExpression(init)) {
      return this.handleJS3YieldExpression(init);
    } else if (isJS3AwaitExpression(init)) {
      return this.handleJS3AwaitExpression(init);
    }

    // This Expression
    else if (isThisExpression(init)) {
      return this.handleThisExpression(init);
    }

    // JS3CallExpression
    else if (isJS3CallExpression(init)) {
      return this.handleJS3CallExpression(init);
    }

    // JS3CallExpression
    else if (isJS3JSXCallExpression(init)) {
      return this.handleJS3JSXCallExpression(init);
    }

    // JS3ContextualCallExpression
    else if (isJS3ContextualCallExpression(init)) {
      return this.handleJS3ContextualCallExpression(init);
    }

    // JS3BinaryExpression
    else if (isJS3BinaryExpression(init)) {
      return this.handleJS3BinaryExpression(init);
    }

    // JS3AssignmentExpression
    else if (isJS3AssignmentExpression(init)) {
      return this.handleJS3AssignmentExpression(init);
    }

    // JS3ConditionalExpression
    else if (isJS3ConditionalExpression(init)) {
      return this.handleJS3ConditionalExpression(init);
    }

    // JS3ObjectExpression
    else if (isJS3ObjectExpression(init)) {
      return this.handleJS3ObjectExpression(init);
    }

    // JS3FunctionExpression
    else if (isJS3FunctionExpression(init)) {
      return this.handleJS3FunctionExpression(init);
    }

    // JS3ArrowFunctionExpression
    else if (isJS3ArrowFunctionExpression(init)) {
      return this.handleJS3ArrowFunctionExpression(init);
    }

    // JS3ArrayExpression
    else if (isJS3ArrayExpression(init)) {
      return this.handleJS3ArrayExpression(init);
    }

    // JS3NewExpression
    else if (isJS3NewExpression(init)) {
      return this.handleJS3NewExpression(init);
    }

    // JS3UnaryExpression
    else if (isJS3UnaryExpression(init)) {
      return this.handleJS3UnaryExpression(init);
    }

    // JS3UpdateExpression
    else if (isJS3UpdateExpression(init)) {
      return this.handleJS3UpdateExpression(init);
    }

    // JS3ClassExpression
    else if (isJS3ClassExpression(init)) {
      return this.handleJS3ClassExpression(init);
    }

    //
    // Handlers
    //

    // OptionalMemberExpression | OptionalCallExpression
    else if (
      isOptionalMemberExpression(init) ||
      isOptionalCallExpression(init)
    ) {
      return this.handleOptionalChainExpression(init);
    }

    // JS3AnonMemberExpression
    else if (isJS3AnonMemberExpression(init)) {
      return this.handleJS3AnonMemberExpression(init);
    }

    // JS3DefaultExportMemberExpression
    else if (isJS3DefaultExportMemberExpression(init)) {
      return this.handleJS3DefaultExportMemberExpression(init);
    } else {
      debugConfig.logger.throwIriError(
        `IRIDIUM: Unhandled Statement ${init.type}, ${init.js3type ? init.js3type : undefined}`,
      );
      return new IV_StringLiteral(undefined, `😞💔(${init.type})`);
    }
  }

  // Handle Program Body
  handleJS3ProgramBody(body: Array<JS3AllowedProgStatement>) {
    for (const _st of body) {
      this.handleJS3AllowedProgStatement(_st);
    }
  }

  //
  // *********************** Lowering JS3Expressions into Iridium BB ***********************
  //
  lowerExprToBB(
    from: JS3ContainedExprKey,
    block: BB,
    resID: IV_Identifier | undefined = undefined,
  ) {
    // Generate 3JS code
    const otherProps = this.js3builder.utils;
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

    const fgContext = this.getCurrentFGContext();

    fgContext.setCurrentBB(block);
    this.handleJS3ProgramBody(js3SpillHolder);

    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");

    // resID = ...exprRes
    if (resID)
      fgContext
        .getCurrentBB()
        .statements.push(
          new IS_SimpleVarDecl(
            undefined,
            "let",
            resID,
            new IV_Identifier(exprRes, exprRes.name),
          ),
        );

    return exprRes;
  }

  //
  // *********************** Functions Related Lowering ***********************
  //
  handleFunctionParams(
    params: Array<JS3AllowedFunctionArgs>,
    functionBody: FunctionBB,
  ): [Array<IV_Identifier | ISP_RestElement>, FunctionArgInitBB, IRIDIUM_FG] {
    const fgContext = this.getCurrentFGContext();

    const fin_args: Array<IV_Identifier | ISP_RestElement> = [];

    // Fixup env
    const argInitEnv = new Environment(functionBody.env.parent);
    functionBody.env.parent.children.delete(functionBody.env);
    functionBody.env.parent = argInitEnv;
    argInitEnv.children.add(functionBody.env);

    const argInitBlock = new FunctionArgInitBB(argInitEnv, params);
    fgContext.declareBBNode(argInitBlock);

    //
    // Draw Edges
    //
    fgContext.rootBB = argInitBlock;
    fgContext.setBBEdge(argInitBlock.idx, functionBody.idx);

    // Lower Args in the argInitBlock
    fgContext.setCurrentBB(argInitBlock);
    let i = 0;
    for (const arg of params) {
      //
      // 1. LVal Pattern to spill
      //

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
        toLowerLval = arg.argument;
      } else {
        toLowerLval = generateIdentifier(arg, "$TODO_IRI_UNDEFINED$");
        debugConfig.logger.throwIriError(
          `Iridium function arg, LVAL is unsupported: ${_generate(arg).code}`,
        );
      }

      //
      // 2. RVal Identifier in argument list
      //
      const toLowerRVal: Identifier = generateIdentifier(
        arg,
        this.js3builder.utils.getNewTemporary(`farg${i++}`),
      );

      //
      // 3. Generate code in curr
      //
      const otherProps = this.js3builder.utils;
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
      this.handleJS3ProgramBody(js3SpillHolder);

      //
      // Populate args array
      //
      if (
        isIdentifier(arg) ||
        isArrayPattern(arg) ||
        isObjectPattern(arg) ||
        isAssignmentPattern(arg)
      ) {
        fin_args.push(new IV_Identifier(toLowerRVal, toLowerRVal.name));
      } else if (
        isIdentifier(arg.argument) ||
        isArrayPattern(arg.argument) ||
        isObjectPattern(arg.argument) ||
        isAssignmentPattern(arg.argument)
      ) {
        fin_args.push(
          new ISP_RestElement(
            generateJS3RestElementfromBaseNode(
              toLowerRVal,
              null,
              null,
              null,
              arg,
            ),
            new IV_Identifier(toLowerRVal, toLowerRVal.name),
          ),
        );
      } else {
        toLowerLval = generateIdentifier(arg, "$TODO_IRI_UNDEFINED$");
        debugConfig.logger.throwIriError(
          `Iridium function arg, LVAL is unsupported: ${_generate(arg).code}`,
        );
      }
    }

    // Ensure the last block points to the function body
    const succ = fgContext.successors("" + fgContext.getCurrentBB().idx);
    if (!succ || succ.length !== 1 || "" + functionBody.idx !== succ[0]) {
      debugConfig.logger.throwIriError(
        `Iridium function arg, control must flow to body after argument initialization`,
      );
    }

    return [fin_args, argInitBlock, this.popFGContext()];
  }

  handleFunctionBody(node: JS3BlockStatement) {
    const fgContext = this.getCurrentFGContext();

    const funBBEnv = new Environment(fgContext.getCurrentBB().env);

    // Initialize Return Block
    const retId = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary(undefined),
    );
    const retStmt = new IS_SimpleVarDecl(
      undefined,
      "let",
      retId,
      new IV_Identifier(undefined, "undefined"),
    );
    const retBB = new FunctionReturn(funBBEnv, retId);

    // Initialize Function Body Block
    const funBB = new FunctionBB(funBBEnv, node, retBB); // STUB Env, gets

    // Add Return Statement to Return Block
    funBB.statements.push(retStmt);

    // Push Lowering Context
    const FUN_BODY_FG = new IRIDIUM_FG(funBB);
    this.pushFGContext(FUN_BODY_FG);

    // Declare and create edge from function body to return BB
    FUN_BODY_FG.declareBBNode(retBB);
    FUN_BODY_FG.setBBEdge(funBB.idx, retBB.idx);

    // Lower Function Body
    for (const s of node.body) {
      this.handleJS3AllowedProgStatement(s);
    }
    return funBB;
  }

  //
  // ***********************        AMP          ***********************
  //
  handleJS3MemberExpression(node: JS3MemberExpression) {
    let prop: IV_Identifier | IV_PrivateName;
    if (isIdentifier(node.property))
      prop = new IV_Identifier(node.property, node.property.name);
    else
      prop = new IV_PrivateName(
        node.property,
        new IV_Identifier(node.property.id, node.property.id.name),
      );

    if (isIdentifier(node.object)) {
      return new IV_MemberExpressionPA(
        node,
        new IV_Identifier(node.object, node.object.name),
        prop,
        node.computed,
      );
    } else if (isThisExpression(node.object)) {
      return new IV_ThisLookupPA(node, prop, node.computed);
    } else {
      return new IV_SuperLookupPA(node, prop, node.computed);
    }
  }

  //
  // ***********************       RVALUES        ***********************
  //

  handleJS3DefaultExportMemberExpression(
    node: JS3DefaultExportMemberExpression,
  ) {
    const objProp = node.object.properties[0];
    if (node.object.properties.length === 1 && isObjectProperty(objProp)) {
      const val = objProp.value;
      if (
        isJS3FunctionExpression(val) ||
        isJS3ClassExpression(val) ||
        isJS3ArrowFunctionExpression(val)
      ) {
        const res = this.handleJS3AssnInit(val);
        if (
          res instanceof IV_FunctionExpression ||
          res instanceof IV_ClassExpression
        )
          res.name = new IV_Identifier(undefined, "default");
        return res;
      } else {
        debugConfig.logger.throwIriError("Invalid value type");
      }
    } else {
      debugConfig.logger.throwIriError("Expecting a objProp");
    }
    return null;
  }

  // *********************** Iridium_ClassExpression ***********************
  handleJS3ClassExpression(
    node: JS3ClassExpression,
    dropName: boolean = false,
  ) {
    //
    // Classes in JS are complicated because of the following features:
    // 1. The shape is not known statically, may contain computed properties
    // 2. Initialization takes place in a specific scope, lets call it classinitscope
    // 3. Initialization order is not necessarily the declaration order, static props and blocks are evaluated later after update to the classinitscope
    //
    // JS class initialization order:
    //  1. Heritage Resolution : If the class extends another class, we resolve this object first.
    //  2. Name Resolution     : Names for all fields and methods are resolved if they are 'computed' properties.
    //  3. Object Creation     : Object for the class is created.
    //  4. Static Value resolution : Values for static fields and static blocks are computed and added to the class object.
    //
    // Lowering Scheme
    // // 1. Create a Temporary Holder for the class object
    // let classExprValHolder;
    //
    // // 2. Initialize a class initialization scope
    // InitClassInitScope [className? = "ClassName"]:
    //
    // 	// 3. Initialize 'this' to 'undefined' and ClassName to NUBD (if this is a statically named class)
    //	set(THIS, undefined)
    //	set(ClassName, NUBD)
    //
    //	// 4. Heritage Resolution
    //	let IRI_HERITAGE = ...HeritageExpression
    //
    //	// 5. Name Resolution
    //	For each computed field/method name, resolve names
    //
    //	// 6. Generate Object
    //	let finInitClassRes = classExprValHolder = ...IRIClassExpression
    //
    //	// 7. Set 'this' to 'finInitClassRes' and ClassName to 'finInitClassRes' (if this is a statically named class)
    //	set(THIS, finInitClassRes)
    //	set(ClassName, finInitClassRes)
    //
    //	// 8. Initialize Static Properties
    //	For each static prop/block, compute the effect and set the value of finInitClassRes if applicable (applicable only to static props)
    //
    //	// 9. Resume BB Flow

    // let classExprValHolder;
    const fgContext = this.getCurrentFGContext();

    //
    // BB and lexical env creation
    //
    const currBB = fgContext.getCurrentBB();
    const classInitLexicalEnv = new Environment(currBB.env);
    const classInitBB = new ClassInitBB(
      classInitLexicalEnv,
      node,
      node.id ? new IV_Identifier(node.id, node.id.name) : undefined,
    );
    fgContext.declareBBNode(classInitBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    //
    // Draw Edges
    //
    fgContext.setBBEdge(currBB.idx, classInitBB.idx);
    fgContext.setBBEdge(classInitBB.idx, postBB.idx);

    //
    // Add classExprResHolder to currBB
    //
    const classExprValHolder = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("classExprRes"),
    );
    classExprValHolder.isValue = true;
    const initClassExprValToNUBD = new IS_SimpleVarDecl(
      undefined,
      "let",
      classExprValHolder,
      new IV_NUBD(undefined),
    );
    currBB.statements.push(initClassExprValToNUBD);

    // Set context to classInitBB

    fgContext.setCurrentBB(classInitBB);

    //
    // Inside the ClassInit Block, initialize the THIS pointer and the classname binding (if it exists)
    //
    //   <ClassInitThis> THIS = undefined <- most unhinged thing I've seen...
    const thisInitToUndef = new IS_ThisInitStmt(node);
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.getCurrentBB().statements.push(thisInitToUndef);

    let cName: IV_Identifier | undefined;
    if (isIdentifier(node.id)) {
      //   <ClassInitName> cName = NUBD
      cName = new IV_Identifier(node.id, node.id.name);
      const cNameInitToNUBD = new IS_ClassNameInitStmt(node, cName);
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.getCurrentBB().statements.push(cNameInitToNUBD);
    }

    // Heritage resolution
    let IRI_heritage: undefined | IV_Identifier = undefined;
    if (node.superClass) {
      IRI_heritage = new IV_Identifier(
        undefined,
        this.js3builder.utils.getNewTemporary("heritageResult"),
      );
      IRI_heritage.isValue = true;
      this.lowerExprToBB(node.superClass, classInitBB, IRI_heritage);
    }

    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");

    // Name Resolution
    const IV_ComputedNameMap: Map<
      JS3ClassProperty | JS3ClassMethod,
      ISP_ClassProperty_key
    > = new Map();
    for (const bodyElem of node.body.body) {
      if (isJS3ClassProperty(bodyElem) || isJS3ClassMethod(bodyElem)) {
        if (bodyElem.computed) {
          const valResID = new IV_Identifier(
            undefined,
            this.js3builder.utils.getNewTemporary("computedName"),
          );
          valResID.isValue = true;
          this.lowerExprToBB(bodyElem.key, fgContext.getCurrentBB(), valResID);
          if (this.getCurrentFGContext() !== fgContext)
            debugConfig.logger.throwIriError(
              "FG Context not expected to change",
            );
          IV_ComputedNameMap.set(bodyElem, valResID);
        } else {
          if (
            isIdentifier(bodyElem.key) ||
            isDecimalLiteral(bodyElem.key) ||
            isBigIntLiteral(bodyElem.key) ||
            isStringLiteral(bodyElem.key) ||
            isNumericLiteral(bodyElem.key) ||
            isNullLiteral(bodyElem.key) ||
            isBooleanLiteral(bodyElem.key)
          ) {
            let IRI_key: ISP_ClassProperty_key;
            if (isIdentifier(bodyElem.key))
              IRI_key = new IV_Identifier(bodyElem.key, bodyElem.key.name);
            else if (isDecimalLiteral(bodyElem.key))
              IRI_key = new IV_DecimalLiteral(bodyElem.key, bodyElem.key.value);
            else if (isBigIntLiteral(bodyElem.key))
              IRI_key = new IV_BigIntLiteral(bodyElem.key, bodyElem.key.value);
            else if (isStringLiteral(bodyElem.key))
              IRI_key = new IV_StringLiteral(bodyElem.key, bodyElem.key.value);
            else if (isNumericLiteral(bodyElem.key))
              IRI_key = new IV_NumericLiteral(bodyElem.key, bodyElem.key.value);
            else if (isNullLiteral(bodyElem.key))
              IRI_key = new IV_NullLiteral(bodyElem.key);
            else if (isBooleanLiteral(bodyElem.key))
              IRI_key = new IV_BooleanLiteral(bodyElem.key, bodyElem.key.value);
            else
              debugConfig.logger.throwIriError(
                "Unhandled Class Prop/method key name type",
              );
            IV_ComputedNameMap.set(bodyElem, IRI_key);
          } else {
            debugConfig.logger.throwIriError(
              "Unexpected key type for class property/method name",
              [bodyElem.key],
            );
          }
        }
      }
    }

    const classProperties: IV_ClassExpression_properties = [];
    const staticPropSpill: Array<
      [ISP_ClassProperty_key, JS3ClassProperty_value, boolean] | JS3StaticBlock
    > = [];

    for (const bodyElem of node.body.body) {
      if (isJS3ClassProperty(bodyElem) || isJS3ClassPrivateProperty(bodyElem)) {
        let key: ISP_ClassProperty_key;
        let computed: boolean;

        if (isJS3ClassPrivateProperty(bodyElem)) {
          key = new IV_PrivateName(
            bodyElem.key,
            new IV_Identifier(bodyElem.key.id, bodyElem.key.id.name),
          );
          computed = false;
        } else {
          if (!IV_ComputedNameMap.has(bodyElem))
            debugConfig.logger.throwIriError(
              "expected resolved name but not found when generating code for class expression props",
            );
          key = IV_ComputedNameMap.get(bodyElem);
          computed = bodyElem.computed;
        }

        if (bodyElem.static) {
          // Static Property
          classProperties.push(
            new ISP_StaticClassProperty(
              bodyElem,
              key,
              new IV_Identifier(undefined, "undefined"),
              computed,
            ),
          );
          staticPropSpill.push([key, bodyElem.value, computed]);
        } else {
          // Non-static Property

          // Env for static block init
          const propInitEnv = new Environment(classInitLexicalEnv);

          const valResID = new IV_Identifier(
            undefined,
            this.js3builder.utils.getNewTemporary(undefined),
          );
          valResID.isValue = true;
          const propComputationBlock = new ClassPropInitBB(
            propInitEnv,
            bodyElem.value,
          );
          const PROP_INIT_FG = new IRIDIUM_FG(propComputationBlock);

          this.pushFGContext(PROP_INIT_FG);
          this.lowerExprToBB(bodyElem.value, propComputationBlock, valResID);
          this.popFGContext();

          if (this.getCurrentFGContext() !== fgContext)
            debugConfig.logger.throwIriError(
              "FG Context not expected to change",
            );

          propComputationBlock.env.declareBinding(
            IV_STHIS.lookupName(),
            undefined,
            propComputationBlock,
            "var",
          );

          classProperties.push(
            new ISP_ClassProperty(bodyElem, key, PROP_INIT_FG, computed),
          );
        }
      } else if (
        isJS3ClassMethod(bodyElem) ||
        isJS3ClassPrivateMethod(bodyElem)
      ) {
        const kind = bodyElem.kind;
        const [params, , fCon] = this.handleFunctionParams(
          bodyElem.params,
          this.handleFunctionBody(bodyElem.body),
        );
        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");
        const generator = bodyElem.generator;
        const async = bodyElem.async;

        let key: ISP_ClassProperty_key;
        let computed: boolean;

        if (isJS3ClassPrivateMethod(bodyElem)) {
          key = new IV_PrivateName(
            bodyElem.key,
            new IV_Identifier(bodyElem.key.id, bodyElem.key.id.name),
          );
          computed = false;
        } else {
          if (!IV_ComputedNameMap.has(bodyElem))
            debugConfig.logger.throwIriError(
              "expected resolved name but not found when generating code for class expression method",
            );
          key = IV_ComputedNameMap.get(bodyElem);
          computed = bodyElem.computed;
        }

        classProperties.push(
          new ISP_ClassMethod(
            bodyElem,
            kind,
            key,
            params,
            fCon,
            computed,
            generator,
            async,
            bodyElem.static,
          ),
        );
      } else {
        // JS3StaticBlock
        staticPropSpill.push(bodyElem);
      }
    }

    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");

    // let finInitClassRes = classExprValHolder = <ClassExpression> ...
    const iriClassExpr = new IV_ClassExpression(
      node,
      cName,
      IRI_heritage,
      classProperties,
      dropName,
    );
    const iriAssn = new IV_SimpleAssn(
      undefined,
      classExprValHolder,
      iriClassExpr,
    );
    const finInitClassRes = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary(undefined),
    );
    fgContext
      .getCurrentBB()
      .statements.push(
        new IS_SimpleVarDecl(undefined, "let", finInitClassRes, iriAssn),
      );

    // <reassign> THIS = finInitClassRes
    const thisReassign = new IS1_AssignmentStmt(
      iriClassExpr,
      new IV_Identifier(undefined, IV_This.lookupName()),
      finInitClassRes,
    );
    fgContext.getCurrentBB().statements.push(thisReassign);

    // <reassign> cName = finInitClassRes
    if (isIdentifier(node.id)) {
      const classNameReassign = new IS1_AssignmentStmt(
        iriClassExpr,
        cName,
        finInitClassRes,
      );
      fgContext.getCurrentBB().statements.push(classNameReassign);
    }

    for (const toSpill of staticPropSpill) {
      if (isJS3StaticBlock(toSpill)) {
        const currBB = fgContext.getCurrentBB();
        const staticBlockBody = new ClassStaticBB(
          new Environment(classInitLexicalEnv),
          toSpill,
        );
        fgContext.declareBBNode(staticBlockBody);
        const postBB = fgContext.declareBBNode(currBB.create());
        if (currBB.branchTerminal)
          debugConfig.logger.throwIriError(
            "Forwarding successors while branch terminal is already set",
          );
        fgContext.forwardSuccessorsBB(currBB, postBB);

        // Draw Edges
        fgContext.setBBEdge(currBB.idx, staticBlockBody.idx);
        fgContext.setBBEdge(staticBlockBody.idx, postBB.idx);

        fgContext.setCurrentBB(staticBlockBody);
        for (const s of toSpill.body) {
          this.handleJS3AllowedProgStatement(s);
        }

        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");
        fgContext.setCurrentBB(postBB);
      } else {
        const classProp = toSpill[0];
        const propVal = toSpill[1];
        const computed = toSpill[2];

        const currBB = fgContext.getCurrentBB();
        const propComputationBlock = new BlockBB(classInitLexicalEnv);
        fgContext.declareBBNode(propComputationBlock);
        const postBB = fgContext.declareBBNode(currBB.create());
        if (currBB.branchTerminal)
          debugConfig.logger.throwIriError(
            "Forwarding successors while branch terminal is already set",
          );
        fgContext.forwardSuccessorsBB(currBB, postBB);

        // Draw Edges
        fgContext.setBBEdge(currBB.idx, propComputationBlock.idx);
        fgContext.setBBEdge(propComputationBlock.idx, postBB.idx);

        const valResID = new IV_Identifier(
          undefined,
          this.js3builder.utils.getNewTemporary(undefined),
        );
        valResID.isValue = true;

        this.lowerExprToBB(propVal, propComputationBlock, valResID);

        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");
        fgContext
          .getCurrentBB()
          .statements.push(
            new IS_ClassStaticPropInit(
              node,
              finInitClassRes,
              classProp,
              valResID,
              computed,
            ),
          );

        fgContext.setCurrentBB(postBB);
      }
    }

    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);

    return classExprValHolder;
  }

  // *********************** Iridium_UpdateExpression ***********************

  handleJS3UpdateExpression(node: JS3UpdateExpression) {
    let argument:
      | IV_Identifier
      | IV_MemberExpressionPA
      | IV_ThisLookupPA
      | IV_SuperLookupPA;
    if (isIdentifier(node.argument))
      argument = new IV_Identifier(node.argument, node.argument.name);
    else argument = this.handleJS3MemberExpression(node.argument);
    return new IV_UpdateExpression(node, argument, node.operator, node.prefix);
  }

  // *********************** Iridium_Unop ***********************

  handleJS3UnaryExpression(node: JS3UnaryExpression) {
    if (node.operator === "delete") {
      const resId: Identifier = this.lowerExprToBB(
        node.argument,
        this.getCurrentFGContext().getCurrentBB(),
      );
      const resID = new IV_Identifier(resId, resId.name);
      resID.isValue = true;
      return new IV_DUNOP(node, resID);
    } else {
      if (!isIdentifier(node.argument)) {
        debugConfig.logger.throwIriError(
          "JS3UnaryExpression: Expected Identifier for non delete operators",
        );
        return new IV_StringLiteral(undefined, "!!!INVALID!!");
      }
      const argument = new IV_Identifier(node.argument, node.argument.name);
      if (
        node.operator === "!" ||
        node.operator === "+" ||
        node.operator === "-" ||
        node.operator === "~"
      ) {
        return new IV_AUNOP(node, argument, node.operator);
      } else if (node.operator === "void") {
        return new IV_BUNOP(node, argument);
      } else if (node.operator === "typeof") {
        return new IV_CUNOP(node, argument);
      } else {
        debugConfig.logger.throwIriError(
          "JS3UnaryExpression: unsupported operator",
        );
        return new IV_StringLiteral(undefined, "!!!INVALID!!");
      }
    }
  }

  // *********************** Iridium_NewExpression ***********************

  handleJS3NewExpression(node: JS3NewExpression) {
    let callee: IV_Identifier | ISP_Super | ISP_V8Intrinsic;

    if (isIdentifier(node.callee))
      callee = new IV_Identifier(node.callee, node.callee.name);
    else if (isSuper(node.callee)) callee = new ISP_Super(node.callee);
    else if (isV8IntrinsicIdentifier(node.callee))
      callee = new ISP_V8Intrinsic(
        node.callee,
        new IV_Identifier(undefined, node.callee.name),
      );

    const args: Array<IV_Identifier | ISP_ArgSpread> = [];

    for (const a of node.arguments) {
      if (isIdentifier(a)) {
        args.push(new IV_Identifier(a, a.name));
      } else {
        args.push(
          new ISP_ArgSpread(a, new IV_Identifier(a.argument, a.argument.name)),
        );
      }
    }

    return new IV_NewExpression(node, callee, args);
  }

  // *********************** Iridium_ArrayExpression ***********************

  handleJS3ArrayExpression(node: JS3ArrayExpression) {
    const elements: Array<null | IV_Identifier | ISP_ArgSpread> = [];

    for (const e of node.elements) {
      if (e === null) {
        elements.push(null);
      } else if (isIdentifier(e)) {
        elements.push(new IV_Identifier(e, e.name));
      } else if (isJS3SpreadElement(e)) {
        elements.push(
          new ISP_ArgSpread(e, new IV_Identifier(e.argument, e.argument.name)),
        );
      }
    }

    return new IV_ArrayExpression(node, elements);
  }

  // *********************** Iridium_AnonMemberExpression ***********************

  handleJS3AnonMemberExpression(node: JS3AnonMemberExpression) {
    const element = node.object.elements[0];
    const fgContext = this.getCurrentFGContext();

    if (isJS3FunctionExpression(element)) {
      const [params, , fCon] = this.handleFunctionParams(
        element.params,
        this.handleFunctionBody(element.body),
      );
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      return new IV_FunctionExpression(
        element,
        params,
        fCon,
        undefined,
        element.generator,
        element.async,
        true,
      );
    } else if (isJS3ArrowFunctionExpression(element)) {
      const [params, , fCon] = this.handleFunctionParams(
        element.params,
        this.handleFunctionBody(element.body),
      );
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      return new IV_ArrowFunctionExpression(
        element,
        params,
        fCon,
        undefined,
        element.generator,
        element.async,
        true,
      );
    } else if (isJS3ClassExpression(element)) {
      const classExpr = this.handleJS3ClassExpression(element, true);
      return classExpr;
    } else {
      debugConfig.logger.throwIriError(
        "JS3AnonMemberExpression unhandled case",
      );
    }
  }

  // *********************** Iridium_FunctionExpressions ***********************

  handleJS3FunctionExpression(node: JS3FunctionExpression) {
    const fgContext = this.getCurrentFGContext();
    const [params, , fCon] = this.handleFunctionParams(
      node.params,
      this.handleFunctionBody(node.body),
    );
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    let name: IV_Identifier | undefined = undefined;
    if (isIdentifier(node.id)) name = new IV_Identifier(node.id, node.id.name);
    return new IV_FunctionExpression(
      node,
      params,
      fCon,
      name,
      node.generator,
      node.async,
    );
  }

  handleJS3ArrowFunctionExpression(node: JS3ArrowFunctionExpression) {
    const fgContext = this.getCurrentFGContext();
    const [params, , fCon] = this.handleFunctionParams(
      node.params,
      this.handleFunctionBody(node.body),
    );
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    return new IV_ArrowFunctionExpression(
      node,
      params,
      fCon,
      undefined,
      node.generator,
      node.async,
    );
  }

  // *********************** Iridium_ObjectExpression ***********************

  handleJS3ObjectExpression(node: JS3ObjectExpression) {
    const fgContext = this.getCurrentFGContext();

    const properties: Array<
      ISP_ObjectMethod | ISP_ObjectProperty | ISP_ArgSpread
    > = [];

    node.properties.forEach((p) => {
      if (isJS3ObjectMethod(p)) {
        const orig_key = p.key;
        let fin_key: ISP_ObjectMethod_key;
        if (isIdentifier(orig_key)) {
          fin_key = new IV_Identifier(orig_key, orig_key.name);
        } else if (isStringLiteral(orig_key)) {
          fin_key = new IV_StringLiteral(orig_key, orig_key.value);
        } else if (isNumericLiteral(orig_key)) {
          fin_key = new IV_NumericLiteral(orig_key, orig_key.value);
        } else if (isBigIntLiteral(orig_key)) {
          fin_key = new IV_BigIntLiteral(orig_key, orig_key.value);
        }

        const kind = p.kind;
        const key = fin_key;
        const [params, , fCon] = this.handleFunctionParams(
          p.params,
          this.handleFunctionBody(p.body),
        );
        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");

        const computed = p.computed;
        const generator = p.generator;
        const async = p.async;

        properties.push(
          new ISP_ObjectMethod(
            p,
            kind,
            key,
            params,
            fCon,
            computed,
            generator,
            async,
          ),
        );
      } else if (isJS3ObjectProperty(p)) {
        properties.push(ISP_ObjectProperty.from(p));
      } else if (isJS3SpreadElement(p)) {
        properties.push(new ISP_ArgSpread(p, IV_Identifier.from(p.argument)));
      }
    });

    return new IV_ObjectExpression(node, properties);
  }

  // *********************** Iridium_ConditionalExpression ***********************

  handleJS3ConditionalExpression(node: JS3ConditionalExpression) {
    const test = IV_Identifier.from(node.test);
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const trueBB = new BlockBB(currBB.env, node.consequent);
    fgContext.declareBBNode(trueBB);
    const falseBB = new BlockBB(currBB.env, node.alternate);
    fgContext.declareBBNode(falseBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, trueBB.idx, "T");
    fgContext.setBBEdge(currBB.idx, falseBB.idx, "F");
    fgContext.setBBEdge(trueBB.idx, postBB.idx);
    fgContext.setBBEdge(falseBB.idx, postBB.idx);

    currBB.branchTerminal = new BranchTerminal(node, test, trueBB, falseBB);

    // Lower true and false branches
    fgContext.setCurrentBB(trueBB);
    const trueRes: Identifier = this.lowerExprToBB(node.consequent, trueBB);
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(falseBB);
    const falseRes: Identifier = this.lowerExprToBB(node.alternate, falseBB);

    // Set PostBB
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);

    // Return IV_ConditionalExpression
    return new IV_ConditionalExpression(
      node,
      test,
      IV_Identifier.from(trueRes, true),
      IV_Identifier.from(falseRes, true),
    );
  }

  // *********************** Iridium_OptionalChaining ***********************

  handleOptionalChainExpression(
    parentNode: OptionalMemberExpression | OptionalCallExpression,
    existingState:
      | {
          resID: IV_Identifier;
          fallthruBlock: BB;
          postBB: BB;
          callExprContext: boolean;
        }
      | undefined = undefined,
  ) {
    const fgContext = this.getCurrentFGContext();

    //
    // 1. Identify Terminal
    //
    const isOptionalNode = (n: Node) =>
      isOptionalCallExpression(n) || isOptionalMemberExpression(n);
    const getObjectToSpill = (
      n: OptionalCallExpression | OptionalMemberExpression,
    ) => (isOptionalCallExpression(n) ? n.callee : n.object);
    // Genesis Node: A node whose "left"(obj/callee) Node is a non-optional node.
    //    * This serves as the base test for shortcircuiting.
    //    * This is expected to always be a optional=true node as chaining starts here.
    const getGenesisNode = (n: Node) => {
      if (isOptionalMemberExpression(n)) {
        if (isOptionalNode(n.object)) return getGenesisNode(n.object);
        else return n;
      } else if (isOptionalCallExpression(n)) {
        if (isOptionalNode(n.callee)) return getGenesisNode(n.callee);
        else return n;
      } else {
        debugConfig.logger.throwIriError("Genesis Node not found", [n]);
      }
    };

    const genesisNode = getGenesisNode(parentNode);
    // Assert that genesisNode's optional field is always true
    if (!genesisNode.optional) {
      console.log("Node:", _generate(parentNode).code);
      console.log("Genesis Node:", _generate(genesisNode).code);
      debugConfig.logger.throwIriError(
        "Optional field of the genesis node is always expected to be true!",
      );
    }
    const objectToSpill: Expression | undefined = getObjectToSpill(genesisNode);

    //
    // 2. Spill the genesis object part in the current scope
    //
    let genesisTestBB: BB;

    // Base Case, initialize existing state for recursive calls
    if (!existingState) {
      const currBB = fgContext.getCurrentBB();
      const postBB = fgContext.declareBBNode(currBB.create());
      if (currBB.branchTerminal)
        debugConfig.logger.throwIriError(
          "Forwarding successors while branch terminal is already set",
        );
      const fallthruBlock = new BlockBB(currBB.env, parentNode);
      fgContext.declareBBNode(fallthruBlock);
      genesisTestBB = new BlockBB(currBB.env, genesisNode);
      fgContext.declareBBNode(genesisTestBB);
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Set Edges
      fgContext.setBBEdge(currBB.idx, genesisTestBB.idx);
      fgContext.setBBEdge(fallthruBlock.idx, postBB.idx);

      // Declare chainResHolder in the starting BB
      const resID = new IV_Identifier(
        undefined,
        this.js3builder.utils.getNewTemporary("chainRes"),
      );
      resID.isChainedValue = true;
      // Create a declaration in the parent BB for resID
      currBB.statements.push(
        new IS_SimpleVarDecl(undefined, "let", resID, null),
      );

      // Shortcircuit, set resID = undefined
      const fallthrough_assn = new IS_SimpleVarDecl(
        undefined,
        "let",
        new IV_Identifier(
          undefined,
          this.js3builder.utils.getNewTemporary(undefined),
        ),
        new IV_SimpleAssn(
          undefined,
          resID,
          new IV_Identifier(undefined, "undefined"),
        ),
      );
      fallthruBlock.statements.push(fallthrough_assn);

      // Initialize State
      existingState = { resID, fallthruBlock, postBB, callExprContext: false };
    } else {
      genesisTestBB = fgContext.getCurrentBB();
    }

    const genesisTestTerminalBB = genesisTestBB.create();
    fgContext.declareBBNode(genesisTestTerminalBB);

    const chainBB = new BlockBB(existingState.postBB.env, parentNode);
    fgContext.declareBBNode(chainBB);

    //    genesisTestBB --> genesisTestTerminalBB --TEST--> chainBB --GOTO--> postBB (contextual)
    //                                                |---> fallthruBlock (contextual)
    fgContext.setBBEdge(genesisTestBB.idx, genesisTestTerminalBB.idx);
    fgContext.setBBEdge(genesisTestTerminalBB.idx, chainBB.idx, "T");
    fgContext.setBBEdge(
      genesisTestTerminalBB.idx,
      existingState.fallthruBlock.idx,
      "F",
    );
    fgContext.setBBEdge(chainBB.idx, existingState.postBB.idx);

    // Set terminal
    const genesisTestRes = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("testRes"),
    );
    genesisTestTerminalBB.branchTerminal = new BranchTerminal(
      parentNode,
      genesisTestRes,
      chainBB,
      existingState.fallthruBlock,
    );

    // Lower Genesis Test
    fgContext.setCurrentBB(genesisTestBB);
    this.lowerExprToBB(objectToSpill, genesisTestBB, genesisTestRes);

    if (existingState.callExprContext) {
      const first = genesisTestBB.statements[0];
      if (
        first instanceof IS_SimpleVarDecl &&
        first.RVal instanceof IV_Call &&
        first.RVal.callee instanceof IV_Identifier
      ) {
        first.RVal.staticThis = true;
        first.RVal.callee.isValue = true;
      } else {
        debugConfig.logger.throwIriError(
          "Expected first statement of spilled node to be a IV_Call",
        );
      }
    }

    existingState.callExprContext = isOptionalCallExpression(genesisNode);

    // Handle Chain condition
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(chainBB);

    //
    // 3. Patch node and check for chain termination
    //

    const setLeft = (n: Node, r: Identifier) => {
      if (isOptionalCallExpression(n)) n.callee = r;
      else if (isOptionalMemberExpression(n)) n.object = r;
      else
        debugConfig.logger.throwIriError(
          "Unexpected replace called on non optional node!",
        );
    };

    const patchRecursively = (n: Node) => {
      if (isOptionalMemberExpression(n)) {
        return memberExpression(
          patchRecursively(n.object),
          n.property,
          n.computed,
          null,
        );
      } else if (isOptionalCallExpression(n)) {
        return callExpression(patchRecursively(n.callee), n.arguments);
      } else {
        return n;
      }
    };
    const findAndPatch = (n: Node, toFind: Node, toReplaceWith: Identifier) => {
      if (n === toFind) {
        // 1. "left" of toFind is set to "toReplaceWith"
        setLeft(n, toReplaceWith);

        // 2. convert "toFind" node to non-optional node
        const res = patchRecursively(n);

        return { genesis: true, value: res };
      }

      if (isOptionalMemberExpression(n)) {
        const res = findAndPatch(n.object, toFind, toReplaceWith);
        // If I am optional = false, and genesis = true, get rid of optionalness
        if (n.optional === false && res.genesis === true) {
          return {
            genesis: true,
            value: memberExpression(res.value, n.property, n.computed, null),
          };
        } else {
          return {
            genesis: false,
            value: optionalMemberExpression(
              res.value,
              n.property,
              n.computed,
              n.optional,
            ),
          };
        }
      } else if (isOptionalCallExpression(n)) {
        const res = findAndPatch(n.callee, toFind, toReplaceWith);

        // If I am optional = false, and genesis = true, get rid of optionalness
        if (n.optional === false && res.genesis === true) {
          return {
            genesis: true,
            value: callExpression(res.value, n.arguments),
          };
        } else {
          return {
            genesis: false,
            value: optionalCallExpression(res.value, n.arguments, n.optional),
          };
        }
      } else {
        debugConfig.logger.throwIriError(
          'findAndPatch, reached chain-end without reaching "toFind"',
        );
      }
    };

    let { value: patchedNode } = findAndPatch(
      parentNode,
      genesisNode,
      identifier(genesisTestRes.name),
    );

    //
    // 5. Check if we have reached chain termination
    //

    const containsOptionalNodeCheck = (node: Node) => {
      if (isOptionalMemberExpression(node)) {
        if (node.optional === true) return true;
        else return containsOptionalNodeCheck(node.object);
      } else if (isOptionalCallExpression(node)) {
        if (node.optional === true) return true;
        else return containsOptionalNodeCheck(node.callee);
      } else {
        return false;
      }
    };

    const containsOptionalNode = containsOptionalNodeCheck(patchedNode);

    if (!containsOptionalNode) {
      // Chain termination, all optional = true node were eliminated...

      // Get rid of all optional nodes
      patchedNode = patchRecursively(patchedNode);

      // Handle Chain termination.
      // resID = ...terminal_expr
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(chainBB);
      const resHolderID: Identifier = this.lowerExprToBB(patchedNode, chainBB);

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext
        .getCurrentBB()
        .statements.push(
          new IS_SimpleVarDecl(
            undefined,
            "let",
            new IV_Identifier(
              undefined,
              this.js3builder.utils.getNewTemporary(undefined),
            ),
            new IV_SimpleAssn(
              undefined,
              existingState.resID,
              IV_Identifier.from(resHolderID),
            ),
          ),
        );

      // Retain context in base cases like : a = x.a?.()
      if (existingState.callExprContext) {
        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");
        const first = fgContext.getCurrentBB().statements[0];
        if (
          first instanceof IS_SimpleVarDecl &&
          first.RVal instanceof IV_Call &&
          first.RVal.callee instanceof IV_Identifier
        ) {
          first.RVal.staticThis = true;
          first.RVal.callee.isValue = true;
        } else {
          debugConfig.logger.throwIriError(
            "Expected first statement of spilled node to be a IV_Call",
          );
        }
      }

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(existingState.postBB);
      return existingState.resID;
    } else {
      // Recursive case
      return this.handleOptionalChainExpression(patchedNode, existingState);
    }
  }

  // *********************** Iridium_AssignmentExpression ***********************
  handleJS3AssignmentExpression(node: JS3AssignmentExpression) {
    const left = node.left;

    // case a.
    // ID = RVal
    if (isIdentifier(left)) {
      const LVal = new IV_Identifier(left, left.name);
      const RVal = this.handleJS3AssnInit(node.right);
      return new IV_SimpleAssn(node, LVal, RVal);
    }

    // case b.
    // ID.ID = RVal
    if (isJS3MemberExpression(left)) {
      const LValRes = this.handleJS3MemberExpression(left);
      const RVal = this.handleJS3AssnInit(node.right);

      if (LValRes instanceof IV_MemberExpressionPA) {
        return new IV_MemberAssn(node, LValRes, RVal);
      } else if (LValRes instanceof IV_ThisLookupPA) {
        return new IV_ThisAssn(node, LValRes, RVal);
      } else {
        return new IV_SuperAssn(node, LValRes, RVal);
      }
    }

    // case c.
    // [ ID, ...ID ] = RVal
    if (isJS3ArrayPattern(left)) {
      const LVal = left;
      const RVal = this.handleJS3AssnInit(node.right);
      return new IV_ArrPatAssn(node, LVal, RVal);
    }

    // case d.
    // { TRIV_KEY: ID, ...ID } = RVal
    if (isJS3ObjectPattern(left)) {
      const LVal = left;
      const RVal = this.handleJS3AssnInit(node.right);
      return new IV_ObjPatAssn(node, LVal, RVal);
    }

    debugConfig.logger.throwIriError("JS3AssignmentExpression: UNHANDLED");
    return;
  }

  // *********************** Iridium_BinaryExpression ***********************

  handleJS3BinaryExpression(node: JS3BinaryExpression) {
    const OPAs = ["+", "-", "/", "%", "*", "**"];
    const OPBs = ["&", "|", ">>", ">>>", "<<", "^"];
    const OPCs = ["==", "===", "!=", "!=="];
    const OPDs = ["in"];
    const OPEs = ["instanceof"];
    const OPFs = [">", "<", ">=", "<="];

    if (OPAs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_ABINOP(
          node,
          new IV_Identifier(node.left, node.left.name),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPA,
        );
      } else
        debugConfig.logger.throwIriError(
          `Iridium: BINOP OPA expects left and right to be Identifiers`,
        );
    }

    if (OPBs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_BBINOP(
          node,
          new IV_Identifier(node.left, node.left.name),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPB,
        );
      } else
        debugConfig.logger.throwIriError(
          `Iridium: BINOP OPB expects left and right to be Identifiers`,
        );
    }

    if (OPCs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_CBINOP(
          node,
          new IV_Identifier(node.left, node.left.name),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPC,
        );
      } else
        debugConfig.logger.throwIriError(
          `Iridium: BINOP OPC expects left and right to be Identifiers`,
        );
    }

    if (OPDs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_DBINOP(
          node,
          new IV_Identifier(node.left, node.left.name),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPD,
        );
      } else if (isPrivateName(node.left) && isIdentifier(node.right)) {
        return new IV_DBINOP(
          node,
          new IV_PrivateName(
            node.left,
            new IV_Identifier(node.left.id, node.left.id.name),
          ),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPD,
        );
      } else
        debugConfig.logger.throwIriError(
          `Iridium: BINOP OPD expects left=(Identifier | JS3PrivateName) and right=(Identifier)`,
        );
    }

    if (OPEs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_EBINOP(
          node,
          new IV_Identifier(node.left, node.left.name),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPE,
        );
      } else
        debugConfig.logger.throwIriError(
          `Iridium: BINOP OPE expects left and right to be Identifiers`,
        );
    }

    if (OPFs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_FBINOP(
          node,
          new IV_Identifier(node.left, node.left.name),
          new IV_Identifier(node.right, node.right.name),
          node.operator as OPF,
        );
      } else
        debugConfig.logger.throwIriError(
          `Iridium: BINOP OPF expects left and right to be Identifiers`,
        );
    }

    debugConfig.logger.throwIriError("JS3BinaryExpression: UNHANDLED");
    return;
  }

  // *********************** Iridium_Call ***********************

  handleJS3JSXCallExpression(node: JS3JSXCallExpression) {
    if (
      node.callee.name === "###JSX###" &&
      isIdentifier(node.arguments[0]) &&
      node.arguments[0].name === "###JSXFRAG###"
    ) {
      const args = node.arguments;

      const children: Array<IV_Identifier> = [];
      for (let i = 0; i < args.length; i++) {
        const curr = args[i];
        if (i === 0 || i === 1) {
          continue;
        } else {
          if (isIdentifier(curr)) children.push(IV_Identifier.from(curr));
          else
            debugConfig.logger.throwIriError(
              "JS3JSX: Expected children to be Identifiers",
            );
        }
      }

      return new IV_FJSX(node, children);

      // // Fragment Case
      // let args = node.arguments

      // let children : Array<IV_Identifier> = new Array()
      // for (let i = 0; i < args.length; i++) {
      //   let curr = args[i]
      //   if (isIdentifier(curr)) children.push(IV_Identifier.from(curr))
      //   else debugConfig.logger.throwIriError("JS3JSX: Expected children to be Identifiers")
      // }

      // return new IV_FJSX(node, children)
    } else if (node.callee.name === "###JSX###") {
      const args = node.arguments;

      let tag: IV_Identifier | IV_StringLiteral;
      let props: IV_Identifier;
      const children: Array<IV_Identifier> = [];
      for (let i = 0; i < args.length; i++) {
        const curr = args[i];
        if (i === 0) {
          if (isIdentifier(curr)) tag = IV_Identifier.from(curr);
          else tag = new IV_StringLiteral(curr, curr.value);
        } else if (i === 1) {
          if (isIdentifier(curr)) props = IV_Identifier.from(curr);
          else
            debugConfig.logger.throwIriError(
              "JS3JSX: Expected props to be an Identifier",
            );
        } else {
          if (isIdentifier(curr)) children.push(IV_Identifier.from(curr));
          else
            debugConfig.logger.throwIriError(
              "JS3JSX: Expected children to be Identifiers",
            );
        }
      }

      if (tag instanceof IV_Identifier)
        return new IV_JSX(node, tag, props, children);
      else return new IV_PJSX(node, tag, props, children);
    }
  }

  handleJS3CallExpression(node: JS3CallExpression) {
    const args: Array<IV_Identifier | ISP_ArgSpread> = [];

    for (const a of node.arguments) {
      if (isIdentifier(a)) {
        args.push(new IV_Identifier(a, a.name));
      } else {
        args.push(
          new ISP_ArgSpread(a, new IV_Identifier(a.argument, a.argument.name)),
        );
      }
    }

    if (isJS3Import(node.callee)) {
      return new IV_ImportCall(node, args);
    } else if (isSuper(node.callee)) {
      return new IV_SuperCall(node, args);
    } else if (isV8IntrinsicIdentifier(node.callee)) {
      return new IV_V8IntrinsicCall(node, node.callee, args);
    } else {
      const callee = new IV_Identifier(node.callee, node.callee.name);
      return new IV_Call(node, false, callee, args);
    }
  }

  handleJS3ContextualCallExpression(node: JS3ContextualCallExpression) {
    const LVal = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("ccallCallee"),
    );
    LVal.isValue = true;
    const RVal = this.handleJS3AssnInit(node.callee);
    const stmt = new IS_SimpleVarDecl(undefined, "let", LVal, RVal);

    const fgContext = this.getCurrentFGContext();
    const currBB = fgContext.getCurrentBB();
    currBB.statements.push(stmt);

    const args: Array<IV_Identifier | ISP_ArgSpread> = [];

    for (const a of node.arguments) {
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");

      const currBB = fgContext.getCurrentBB();
      const argSpillBB = fgContext.declareBBNode(currBB.create());
      const postBB = fgContext.declareBBNode(currBB.create());
      if (currBB.branchTerminal)
        debugConfig.logger.throwIriError(
          "Forwarding successors while branch terminal is already set",
        );
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, argSpillBB.idx);
      fgContext.setBBEdge(argSpillBB.idx, postBB.idx);

      let toSpill: JS3ContainedExprKey;
      if (isSpreadElement(a)) {
        toSpill = a.argument;
      } else {
        toSpill = a;
      }

      fgContext.setCurrentBB(argSpillBB);
      const resholderID: Identifier = this.lowerExprToBB(toSpill, argSpillBB);
      const resHolder: IV_Identifier = IV_Identifier.from(resholderID);
      resHolder.isValue = true;

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);

      if (isSpreadElement(a)) {
        args.push(
          new ISP_ArgSpread(
            generateJS3SpreadElement(resholderID, a),
            resHolder,
          ),
        );
      } else {
        args.push(resHolder);
      }
    }
    return new IV_Call(node, true, LVal, args);
  }

  // *********************** Iridium_This ***********************

  handleThisExpression(node: ThisExpression) {
    return new IV_This(node);
  }

  // *********************** Iridium_YIELD_AWAIT ***********************

  handleJS3YieldExpression(node: JS3YieldExpression) {
    if (node.argument) {
      return new IV_YIELD(
        node,
        new IV_Identifier(node.argument, node.argument.name),
      );
    } else {
      return new IV_YIELD(node);
    }
  }

  handleJS3AwaitExpression(node: JS3AwaitExpression) {
    return new IV_AWAIT(
      node,
      new IV_Identifier(node.argument, node.argument.name),
    );
  }

  // *********************** Iridium_MetaProperty ***********************

  handleJS3MetaProperty(node: JS3MetaProperty) {
    if (node.meta.name === "import") {
      return new IV_ModuleMeta(node);
    } else {
      return new IV_NewTarget(node);
    }
  }

  // *********************** Iridium_TemplateLiteral ***********************

  handleJS3TemplateLiteral(node: JS3TemplateLiteral) {
    return IV_TemplateLiteral.from(node);
  }

  handleJS3TaggedTemplateExpression(node: JS3TaggedTemplateExpression) {
    if (isIdentifier(node.tag)) {
      return new IV_TaggedTemplateCall(
        node,
        new IV_Identifier(node.tag, node.tag.name),
        this.handleJS3TemplateLiteral(node.quasi),
      );
    } else {
      return new IV_TaggedTemplateCall(
        node,
        this.handleJS3MemberExpression(node.tag),
        this.handleJS3TemplateLiteral(node.quasi),
      );
    }
  }

  // *********************** Iridium_Regexp ***********************

  handleJS3RegExpLiteral(init: JS3RegExpLiteral) {
    return new IV_Regexp(init, init.pattern, init.flags);
  }

  // *********************** STATEMENTS ***********************

  // *********************** Iridium_SwitchStatement ***********************
  handleJS3SwitchStatement(stmt: JS3SwitchStatement) {
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const switchBodyBB = new SwitchBodyBB(new Environment(currBB.env), stmt);
    fgContext.declareBBNode(switchBodyBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, switchBodyBB.idx);
    fgContext.setBBEdge(switchBodyBB.idx, postBB.idx);

    // Set Break Context
    switchBodyBB.setBreakTarget(postBB);

    const switchStmtTest: Identifier = stmt.discriminant;
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(switchBodyBB);
    for (const c of stmt.cases) {
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");

      // Declare nodes and forward successors
      const currBB = fgContext.getCurrentBB();
      const caseTestBB = new BlockBB(currBB.env, c);
      fgContext.declareBBNode(caseTestBB);
      const caseTestTerminalBB = caseTestBB.create();
      fgContext.declareBBNode(caseTestTerminalBB);
      const caseBody = new BlockBB(currBB.env, c);
      fgContext.declareBBNode(caseBody);
      const postBB = fgContext.declareBBNode(currBB.create());
      if (currBB.branchTerminal)
        debugConfig.logger.throwIriError(
          "Forwarding successors while branch terminal is already set",
        );
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, caseTestBB.idx);
      fgContext.setBBEdge(caseTestBB.idx, caseTestTerminalBB.idx);
      fgContext.setBBEdge(caseTestTerminalBB.idx, caseBody.idx, "T");
      fgContext.setBBEdge(caseTestTerminalBB.idx, postBB.idx, "F");
      fgContext.setBBEdge(caseBody.idx, postBB.idx);

      const testResult = new IV_Identifier(
        undefined,
        this.js3builder.utils.getNewTemporary("testResult"),
      );
      caseTestTerminalBB.branchTerminal = new BranchTerminal(
        c,
        testResult,
        caseBody,
        postBB,
      );

      // Lower Body
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(caseBody);
      this.handleJS3ProgramBody(c.consequent);

      // Lower Test?
      if (c.test) {
        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");
        fgContext.setCurrentBB(caseTestBB);
        const caseID: Identifier = this.lowerExprToBB(c.test, caseTestBB);
        const comparison = new IV_CBINOP(
          undefined,
          IV_Identifier.from(switchStmtTest),
          IV_Identifier.from(caseID),
          "===",
        );
        const finDecl = new IS_SimpleVarDecl(
          undefined,
          "let",
          testResult,
          comparison,
        );
        if (this.getCurrentFGContext() !== fgContext)
          debugConfig.logger.throwIriError("FG Context not expected to change");
        fgContext.getCurrentBB().statements.push(finDecl);
      } else {
        const finDecl = new IS_SimpleVarDecl(
          undefined,
          "let",
          testResult,
          new IV_BooleanLiteral(undefined, true),
        );
        caseTestBB.statements.push(finDecl);
      }

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);
    }

    // Restore postBB context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_DoWhileStatement ***********************
  handleJS3DoWhileStatement(
    stmt: JS3DoWhileStatement,
    label: Identifier | undefined = undefined,
  ) {
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const testBodyBB = new LoopHeadBB(currBB.env, stmt);
    fgContext.declareBBNode(testBodyBB);
    const testBodyTerminalBB = testBodyBB.create();
    fgContext.declareBBNode(testBodyTerminalBB);
    const loopBodyBB = new BlockBB(new Environment(currBB.env), stmt.body);
    fgContext.declareBBNode(loopBodyBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    const testIV = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("loopTest"),
    );
    testIV.isValue = true;

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, loopBodyBB.idx);
    fgContext.setBBEdge(loopBodyBB.idx, testBodyBB.idx);
    fgContext.setBBEdge(testBodyBB.idx, testBodyTerminalBB.idx);
    fgContext.setBBEdge(testBodyTerminalBB.idx, loopBodyBB.idx, "T");
    fgContext.setBBEdge(testBodyTerminalBB.idx, postBB.idx, "F");

    // Set Loop Head Targets
    testBodyBB.label = label ? IV_Identifier.from(label) : undefined;
    testBodyBB.setContinueTarget(testBodyBB);
    testBodyBB.setBreakTarget(postBB);

    testBodyTerminalBB.label = label ? IV_Identifier.from(label) : undefined;
    testBodyTerminalBB.setContinueTarget(testBodyBB);
    testBodyTerminalBB.setBreakTarget(postBB);

    testBodyTerminalBB.branchTerminal = new BranchTerminal(
      stmt,
      testIV,
      loopBodyBB,
      postBB,
    );

    // Lower Test
    fgContext.setCurrentBB(testBodyBB);
    this.lowerExprToBB(stmt.test, testBodyBB, testIV);

    // Lower body
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(loopBodyBB);
    stmt.body.body.forEach((s) => this.handleJS3AllowedProgStatement(s));

    // Restore postBB context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_ForStatement***********************
  handleJS3ForStatement(
    stmt: JS3ForStatement,
    label: Identifier | undefined = undefined,
  ) {
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const initBB = new LoopInit(new Environment(currBB.env), stmt);
    fgContext.declareBBNode(initBB);
    const testBodyBB = new LoopHeadBB(initBB.env, stmt);
    fgContext.declareBBNode(testBodyBB);
    const testBodyTerminalBB = testBodyBB.create();
    fgContext.declareBBNode(testBodyTerminalBB);
    const updateBB = new BlockBB(initBB.env, stmt.update);
    fgContext.declareBBNode(updateBB);
    const loopBodyBB = new BlockBB(new Environment(initBB.env), stmt.body);
    fgContext.declareBBNode(loopBodyBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    const testIV = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("loopTest"),
    );
    testIV.isValue = true;

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, initBB.idx);
    fgContext.setBBEdge(initBB.idx, testBodyBB.idx);
    fgContext.setBBEdge(testBodyBB.idx, testBodyTerminalBB.idx);
    fgContext.setBBEdge(testBodyTerminalBB.idx, loopBodyBB.idx, "T");
    fgContext.setBBEdge(testBodyTerminalBB.idx, postBB.idx, "F");
    fgContext.setBBEdge(loopBodyBB.idx, updateBB.idx);
    fgContext.setBBEdge(updateBB.idx, testBodyBB.idx);

    // Set Loop Head Targets
    testBodyBB.label = label ? IV_Identifier.from(label) : undefined;
    testBodyBB.setContinueTarget(updateBB);
    testBodyBB.setBreakTarget(postBB);

    testBodyTerminalBB.label = label ? IV_Identifier.from(label) : undefined;
    testBodyTerminalBB.setContinueTarget(updateBB);
    testBodyTerminalBB.setBreakTarget(postBB);

    // Set Test Terminal
    testBodyTerminalBB.branchTerminal = new BranchTerminal(
      stmt,
      testIV,
      loopBodyBB,
      postBB,
    );

    // Lower Init
    if (isJS3LoopDeclaration(stmt.init)) {
      // Simplify Declarations into JS3
      const kind = stmt.init.kind;
      const otherProps = this.js3builder.utils;
      const js3SpillHolder: JS3BlockStatement_body = [];
      const updatedProps = {
        ...otherProps,
        others: { ...otherProps.others, holder: js3SpillHolder },
      };
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
            stmt.init,
          );
          return generateJS3VariableDeclarationfromBaseNode(
            [declarator],
            kind,
            null,
            stmt.init,
          );
        }
      };
      // Lower into individual statements
      for (const d of stmt.init.declarations) {
        handleDeclaratorRec(d.id, d.init, updatedProps, generator, false);
      }
      // lower into Init BB
      fgContext.setCurrentBB(initBB);
      this.handleJS3ProgramBody(js3SpillHolder);
    } else if (isJS3ContainedExprKey(stmt.init)) {
      // lower into Init BB
      fgContext.setCurrentBB(initBB);
      this.lowerExprToBB(stmt.init, initBB);
    }

    // Lower Test
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(testBodyBB);
    if (stmt.test) this.lowerExprToBB(stmt.test, testBodyBB, testIV);
    else {
      testBodyBB.statements.push(
        new IS_SimpleVarDecl(
          undefined,
          "let",
          testIV,
          new IV_BooleanLiteral(undefined, true),
        ),
      );
    }

    // Lower Body
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(loopBodyBB);
    stmt.body.body.forEach((s) => this.handleJS3AllowedProgStatement(s));

    // Lower Update
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(updateBB);
    if (stmt.update) this.lowerExprToBB(stmt.update, updateBB);

    // Restore PostBB context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_ForInOfstatement ***********************
  handleJS3ForInOfStatement(
    stmt: JS3ForInStatement | JS3ForOfStatement,
    label: Identifier | undefined = undefined,
  ) {
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const initBB = new LoopInit(new Environment(currBB.env), stmt);
    fgContext.declareBBNode(initBB);
    const testBB = new LoopHeadBB(initBB.env, stmt);
    fgContext.declareBBNode(testBB);
    const loopBodyBB = new BlockBB(new Environment(testBB.env), stmt.body);
    fgContext.declareBBNode(loopBodyBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    const testIV = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("loopTest"),
    );
    testIV.isValue = true;

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, initBB.idx);
    fgContext.setBBEdge(initBB.idx, testBB.idx);
    fgContext.setBBEdge(testBB.idx, loopBodyBB.idx, "T");
    fgContext.setBBEdge(testBB.idx, postBB.idx, "F");
    fgContext.setBBEdge(loopBodyBB.idx, testBB.idx);

    // Set Loop Head Targets
    testBB.setContinueTarget(testBB);
    testBB.setBreakTarget(postBB);
    testBB.label = label ? IV_Identifier.from(label) : undefined;

    // Initialize Terminal
    testBB.branchTerminal = new BranchTerminal(
      stmt,
      testIV,
      loopBodyBB,
      postBB,
    );

    // Init loop iterator
    // let iteratorIV = <InOp> in RVal | <OfOp> of RVal
    let inop: IV_InIterator | IV_OfIterator;
    if (isJS3ForInStatement(stmt))
      inop = new IV_InIterator(stmt, IV_Identifier.from(stmt.right));
    else inop = new IV_OfIterator(stmt, IV_Identifier.from(stmt.right));
    const iteratorIV = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary(undefined),
    );
    initBB.statements.push(
      new IS_SimpleVarDecl(undefined, "let", iteratorIV, inop),
    );

    // Init Test BB
    // let testIV = <HasLoopNext> hasnext iteratorIV
    const hasLoopNext = new IV_HasLoopNext(stmt, iteratorIV);
    const testStmt = new IS_SimpleVarDecl(
      undefined,
      "let",
      testIV,
      hasLoopNext,
    );
    testBB.statements.push(testStmt);

    // Loop Body BB
    // 1. Get next iterator value
    // let nextResHolder = <LoopNext> next iteratorIV
    const getNext = new IV_LoopNext(stmt, iteratorIV);
    const nextResHolder = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary(undefined),
    );
    const nextResStmt = new IS_SimpleVarDecl(
      undefined,
      "let",
      nextResHolder,
      getNext,
    );
    loopBodyBB.statements.push(nextResStmt);

    // 2. Generate bindings (or) perform assignments
    // for (let a of xx) ===> let a = nextOf(xx)
    // for (a of xx) ===> a = nextOf(xx)
    // for ([a, { b : c }] of xx) ===> [a, t1] = nextOf(xx); { b: c } = t1;
    fgContext.setCurrentBB(loopBodyBB);
    if (isJS3LoopDeclaration(stmt.left)) {
      // Simplify Declarations into JS3
      const kind = stmt.left.kind;
      const otherProps = this.js3builder.utils;
      const js3SpillHolder: JS3BlockStatement_body = [];
      const updatedProps = {
        ...otherProps,
        others: { ...otherProps.others, holder: js3SpillHolder },
      };

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
            stmt.left,
          );
          return generateJS3VariableDeclarationfromBaseNode(
            [declarator],
            kind,
            null,
            stmt.left,
          );
        }
      };

      // Ideally we expect this to be only 1...
      if (stmt.left.declarations.length !== 1)
        debugConfig.logger.throwIriError(
          "For loop test declaration LValue has more than one declaration",
        );

      // Lower into individual statements
      for (const d of stmt.left.declarations) {
        // KIND declarationID = nextOf(xx)
        handleDeclaratorRec(
          d.id,
          identifier(nextResHolder.name),
          updatedProps,
          generator,
          false,
        );
      }

      // lower into BB
      this.handleJS3ProgramBody(js3SpillHolder);
    } else {
      // Simplify Declarations into JS3
      const otherProps = this.js3builder.utils;
      const js3SpillHolder: JS3BlockStatement_body = [];
      const updatedProps = {
        ...otherProps,
        others: { ...otherProps.others, holder: js3SpillHolder },
      };

      const tempGen = this.js3builder.utils.getNewTemporary;

      const generator = (
        LVal:
          | JS3MemberExpression
          | JS3ArrayPattern
          | JS3ObjectPattern
          | Identifier,
        RVal: null | JS3VariableDeclarator_init,
      ) => {
        if (RVal === null || RVal === undefined)
          debugConfig.logger.throwJS3Error(
            "In assignment expression RVal is not expected to be a null | undefined node...",
          );
        const rr = generateJS3AssignmentExpressionfromBaseNode(
          "=",
          LVal,
          RVal,
          stmt.left,
        );
        return generateDummyJS3VariableDeclaration(
          stmt.left,
          generateIdentifier(stmt.left, tempGen("throwaway")),
          rr,
          "let",
          null,
          null,
        );
      };

      // Generate assignments
      const lval = stmt.left;
      const rval = identifier(nextResHolder.name);

      // KIND lvalExpr = nextOf(xx)
      handleDeclaratorRec(lval, rval, updatedProps, generator, true);

      // lower into BB
      this.handleJS3ProgramBody(js3SpillHolder);
    }

    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    stmt.body.body.forEach((s) => this.handleJS3AllowedProgStatement(s));

    // Restore BB Context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_LabeledStatement ***********************
  handleJS3LabeledStatement(stmt: JS3LabeledStatement) {
    // If this label was intended for loopy statement, then handle it separately...
    if (isJS3ForStatement(stmt.body)) {
      return this.handleJS3ForStatement(stmt.body, stmt.label);
    } else if (
      isJS3ForInStatement(stmt.body) ||
      isJS3ForOfStatement(stmt.body)
    ) {
      return this.handleJS3ForInOfStatement(stmt.body, stmt.label);
    } else if (isJS3WhileStatement(stmt.body)) {
      return this.handleJS3WhileStatement(stmt.body, stmt.label);
    } else if (isJS3DoWhileStatement(stmt.body)) {
      return this.handleJS3DoWhileStatement(stmt.body, stmt.label);
    }

    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const blockScopeBB = new BlockBB(new Environment(currBB.env), stmt);
    fgContext.declareBBNode(blockScopeBB);
    blockScopeBB.setLabel(IV_Identifier.from(stmt.label));
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, blockScopeBB.idx);
    fgContext.setBBEdge(blockScopeBB.idx, postBB.idx);

    // Lower Code
    fgContext.setCurrentBB(blockScopeBB);
    this.handleJS3AllowedProgStatement(stmt.body);

    // Restore Context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_BlockStatement ***********************
  handleJS3BlockStatement(stmt: JS3BlockStatement) {
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const blockScopeBB = new BlockBB(new Environment(currBB.env), stmt);
    fgContext.declareBBNode(blockScopeBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, blockScopeBB.idx);
    fgContext.setBBEdge(blockScopeBB.idx, postBB.idx);

    // Lower Code
    fgContext.setCurrentBB(blockScopeBB);
    this.handleJS3ProgramBody(stmt.body);

    // Restore Context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_ContinueStatement ***********************
  handleJS3ContinueStatement(stmt: JS3ContinueStatement) {
    const fgContext = this.getCurrentFGContext();
    const currBB = fgContext.getCurrentBB();
    if (isIdentifier(stmt.label)) {
      const lbreakstmt = new IS_LContinue(stmt, IV_Identifier.from(stmt.label));
      currBB.statements.push(lbreakstmt);
    } else {
      const unlbreakstmt = new IS_Continue(stmt);
      currBB.statements.push(unlbreakstmt);
    }
  }

  // *********************** Iridium_Break_LBreak ***********************
  handleJS3BreakStatement(stmt: JS3BreakStatement) {
    const fgContext = this.getCurrentFGContext();
    const currBB = fgContext.getCurrentBB();
    if (isIdentifier(stmt.label)) {
      const lbreakstmt = new IS_LBreak(stmt, IV_Identifier.from(stmt.label));
      currBB.statements.push(lbreakstmt);
    } else {
      const unlbreakstmt = new IS_Break(stmt);
      currBB.statements.push(unlbreakstmt);
    }
  }

  // *********************** Iridium_WhileStatement ***********************
  handleJS3WhileStatement(
    stmt: JS3WhileStatement,
    label: Identifier | undefined = undefined,
  ) {
    const fgContext = this.getCurrentFGContext();

    // Declare nodes and forward successors
    const currBB = fgContext.getCurrentBB();
    const testBodyBB = new LoopHeadBB(currBB.env, stmt);
    fgContext.declareBBNode(testBodyBB);
    const testBodyTerminalBB = testBodyBB.create();
    fgContext.declareBBNode(testBodyTerminalBB);
    const loopBodyBB = new BlockBB(new Environment(currBB.env), stmt);
    fgContext.declareBBNode(loopBodyBB);
    const postBB = fgContext.declareBBNode(currBB.create());
    if (currBB.branchTerminal)
      debugConfig.logger.throwIriError(
        "Forwarding successors while branch terminal is already set",
      );
    fgContext.forwardSuccessorsBB(currBB, postBB);

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, testBodyBB.idx);
    fgContext.setBBEdge(testBodyBB.idx, testBodyTerminalBB.idx); // This will ensure we never forward successors of a BB whose branch terminal is already set
    fgContext.setBBEdge(testBodyTerminalBB.idx, loopBodyBB.idx, "T");
    fgContext.setBBEdge(testBodyTerminalBB.idx, postBB.idx, "F");
    fgContext.setBBEdge(loopBodyBB.idx, testBodyBB.idx);

    // Set Loop Head Targets
    testBodyBB.label = label ? IV_Identifier.from(label) : undefined;
    testBodyBB.setContinueTarget(testBodyBB);
    testBodyBB.setBreakTarget(postBB);

    testBodyTerminalBB.label = label ? IV_Identifier.from(label) : undefined;
    testBodyTerminalBB.setContinueTarget(testBodyBB);
    testBodyTerminalBB.setBreakTarget(postBB);

    // Set Terminal
    const test: IV_Identifier = new IV_Identifier(
      undefined,
      this.js3builder.utils.getNewTemporary("whileTestRes"),
    );
    test.isValue = true;
    testBodyTerminalBB.branchTerminal = new BranchTerminal(
      stmt,
      test,
      loopBodyBB,
      postBB,
    );

    // Lower While Loop Test
    this.lowerExprToBB(stmt.test, testBodyBB, test);

    // Lower While Loop Body
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(loopBodyBB);
    stmt.body.body.forEach((s) => this.handleJS3AllowedProgStatement(s));

    // Restore postBB Context
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_TryStatement ***********************

  handleJS3TryStatement(stmt: JS3TryStatement) {
    if (stmt.handler && !stmt.finalizer) {
      // Case a.
      //   try { BLOCK } catch(?ID) { HANDLER }

      const fgContext = this.getCurrentFGContext();

      // Declare nodes and forward successors
      const currBB = fgContext.getCurrentBB();
      const tryBlockBB = new TryBB(new Environment(currBB.env), stmt);
      fgContext.declareBBNode(tryBlockBB);
      const catchHandlerBB = new CatchBB(
        new Environment(currBB.env),
        stmt.handler,
        stmt.handler.param
          ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name)
          : undefined,
      );
      fgContext.declareBBNode(catchHandlerBB);
      const postBB = fgContext.declareBBNode(currBB.create());
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, tryBlockBB.idx);
      fgContext.setBBEdge(tryBlockBB.idx, catchHandlerBB.idx, "E");
      fgContext.setBBEdge(tryBlockBB.idx, postBB.idx);
      fgContext.setBBEdge(catchHandlerBB.idx, postBB.idx);

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(tryBlockBB);
      stmt.block.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(catchHandlerBB);
      stmt.handler.body.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);
      return;
    }

    if (!stmt.handler && stmt.finalizer) {
      // Case b.
      //   try { BLOCK } finally { FINALIZER }
      const fgContext = this.getCurrentFGContext();

      // Declare nodes and forward successors
      const currBB = fgContext.getCurrentBB();
      const tryBlockBB = new TryBB(new Environment(currBB.env), stmt);
      fgContext.declareBBNode(tryBlockBB);
      const finalizerHandlerBB = new BlockBB(
        new Environment(currBB.env),
        stmt.finalizer,
      );
      fgContext.declareBBNode(finalizerHandlerBB);
      const postBB = fgContext.declareBBNode(currBB.create());
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, tryBlockBB.idx);
      fgContext.setBBEdge(tryBlockBB.idx, finalizerHandlerBB.idx);
      fgContext.setBBEdge(finalizerHandlerBB.idx, postBB.idx);

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(tryBlockBB);
      stmt.block.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(finalizerHandlerBB);
      stmt.finalizer.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);
      return;
    }

    if (stmt.handler && stmt.finalizer) {
      // Case c.
      //   try { BLOCK } catch { HANDLER } finally { FINALIZER }

      const fgContext = this.getCurrentFGContext();

      // Declare nodes and forward successors
      const currBB = fgContext.getCurrentBB();
      const tryBlockBB = new TryBB(new Environment(currBB.env), stmt);
      fgContext.declareBBNode(tryBlockBB);
      const catchHandlerBB = new CatchBB(
        new Environment(currBB.env),
        stmt.handler,
        stmt.handler.param
          ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name)
          : undefined,
      );
      fgContext.declareBBNode(catchHandlerBB);
      const finalizerHandlerBB = new BlockBB(
        new Environment(currBB.env),
        stmt.finalizer,
      );
      fgContext.declareBBNode(finalizerHandlerBB);
      const postBB = fgContext.declareBBNode(currBB.create());
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, tryBlockBB.idx);
      fgContext.setBBEdge(tryBlockBB.idx, catchHandlerBB.idx, "E");
      fgContext.setBBEdge(tryBlockBB.idx, finalizerHandlerBB.idx);
      fgContext.setBBEdge(catchHandlerBB.idx, finalizerHandlerBB.idx);
      fgContext.setBBEdge(finalizerHandlerBB.idx, postBB.idx);

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(tryBlockBB);
      stmt.block.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(catchHandlerBB);
      stmt.handler.body.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(finalizerHandlerBB);
      stmt.finalizer.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);
      return;
    }

    debugConfig.logger.throwIriError("JS3TryStatement: UNHANDLED");
    return;
  }

  // *********************** Iridium_IfStatement ***********************

  handleJS3IfStatement(stmt: JS3IfStatement) {
    if (!stmt.alternate) {
      // Case a.
      // if (ID) { CONSEQ }
      const fgContext = this.getCurrentFGContext();

      // Declare nodes and forward successors
      const currBB = fgContext.getCurrentBB();
      const trueBB = new BlockBB(new Environment(currBB.env));
      fgContext.declareBBNode(trueBB);
      const postBB = fgContext.declareBBNode(currBB.create());
      if (currBB.branchTerminal)
        debugConfig.logger.throwIriError(
          "Forwarding successors while branch terminal is already set",
        );
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, trueBB.idx, "T");
      fgContext.setBBEdge(currBB.idx, postBB.idx, "F");
      fgContext.setBBEdge(trueBB.idx, postBB.idx);

      // Set Terminals
      currBB.branchTerminal = new BranchTerminal(
        stmt,
        IV_Identifier.from(stmt.test),
        trueBB,
        postBB,
      );

      // Lower Consequent
      fgContext.setCurrentBB(trueBB);
      stmt.consequent.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      // Restore BB Context
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);
    } else {
      // Case a.
      // if (ID) { CONSEQ } else { ALT }
      const fgContext = this.getCurrentFGContext();

      // Declare nodes and forward successors
      const currBB = fgContext.getCurrentBB();
      const trueBB = new BlockBB(new Environment(currBB.env));
      fgContext.declareBBNode(trueBB);
      const falseBB = new BlockBB(new Environment(currBB.env));
      fgContext.declareBBNode(falseBB);
      const postBB = fgContext.declareBBNode(currBB.create());
      if (currBB.branchTerminal)
        debugConfig.logger.throwIriError(
          "Forwarding successors while branch terminal is already set",
        );
      fgContext.forwardSuccessorsBB(currBB, postBB);

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, trueBB.idx, "T");
      fgContext.setBBEdge(currBB.idx, falseBB.idx, "F");
      fgContext.setBBEdge(trueBB.idx, postBB.idx);
      fgContext.setBBEdge(falseBB.idx, postBB.idx);
      //
      // currBB ----> trueBB  --|---> postBB
      //          |-> falseBB --|
      //

      // Set Terminals
      currBB.branchTerminal = new BranchTerminal(
        stmt,
        IV_Identifier.from(stmt.test),
        trueBB,
        falseBB,
      );

      // Lower Consequent
      fgContext.setCurrentBB(trueBB);
      stmt.consequent.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      // Lower Alternate
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(falseBB);
      stmt.alternate.body.forEach((s) => {
        this.handleJS3AllowedProgStatement(s);
      });

      // Restore BB Context
      if (this.getCurrentFGContext() !== fgContext)
        debugConfig.logger.throwIriError("FG Context not expected to change");
      fgContext.setCurrentBB(postBB);
    }
  }

  // *********************** Iridium_FunctionDeclaration ***********************

  handleJS3FunctionDeclaration(stmt: JS3FunctionDeclaration) {
    const fgContext = this.getCurrentFGContext();

    const curr = fgContext.getCurrentBB();
    const [params, , fCon] = this.handleFunctionParams(
      stmt.params,
      this.handleFunctionBody(stmt.body),
    );
    if (this.getCurrentFGContext() !== fgContext)
      debugConfig.logger.throwIriError("FG Context not expected to change");

    fgContext.setCurrentBB(curr);
    curr.statements.push(
      new IS_FunDecl(
        stmt,
        params,
        fCon,
        new IV_Identifier(stmt.id, stmt.id.name),
        stmt.generator,
        stmt.async,
      ),
    );
  }

  // *********************** Iridium_VariableDeclarations ***********************

  handleJS3VariableDeclaration(stmt: JS3VariableDeclaration) {
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
    const KIND: IS_VAR_DECL_KIND = stmt.kind;

    // case a.
    // KIND ID = RVal
    if (isIdentifier(declaration.id)) {
      const LVal = new IV_Identifier(declaration.id, declaration.id.name);
      const RVal = declaration.init
        ? this.handleJS3AssnInit(declaration.init)
        : null;
      this.getCurrentFGContext()
        .getCurrentBB()
        .statements.push(new IS_SimpleVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    // case b.
    // KIND [ ID, ...ID ] = RVal
    if (isJS3ArrayPattern(declaration.id)) {
      const LVal = declaration.id;
      const RVal = declaration.init
        ? this.handleJS3AssnInit(declaration.init)
        : null;
      this.getCurrentFGContext()
        .getCurrentBB()
        .statements.push(new IS_ArrPatVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    // case c.
    // KIND { TRIV_KEY: ID, ...ID } = RVal
    if (isJS3ObjectPattern(declaration.id)) {
      const LVal = declaration.id;
      const RVal = declaration.init
        ? this.handleJS3AssnInit(declaration.init)
        : null;
      this.getCurrentFGContext()
        .getCurrentBB()
        .statements.push(new IS_ObjPatVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    debugConfig.logger.throwIriError("JS3VariableDeclaration: UNHANDLED");
    return;
  }

  // *********************** Iridium_Debugger_Return_Throw ***********************

  handleJS3ThrowStatement(stmt: JS3ThrowStatement) {
    const currBB = this.getCurrentFGContext().getCurrentBB();
    // throw ID
    currBB.statements.push(
      new IS_Throw(stmt, new IV_Identifier(stmt.argument, stmt.argument.name)),
    );
  }

  handleJS3ReturnStatement(stmt: JS3ReturnStatement) {
    const currBB = this.getCurrentFGContext().getCurrentBB();
    // return | return ID
    if (stmt.argument) {
      currBB.statements.push(
        new IS_Return(
          stmt,
          new IV_Identifier(stmt.argument, stmt.argument.name),
        ),
      );
    } else {
      currBB.statements.push(new IS_Return(stmt, null));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleJS3DebuggerStatement(_stmt: JS3DebuggerStatement) {
    const currBB = this.getCurrentFGContext().getCurrentBB();
    // debugger;
    currBB.statements.push(new IS_Debugger());
  }

  // *********************** Iridium_Imports_Exports ***********************

  handleJS3ImportDeclaration(stmt: JS3ImportDeclaration) {
    const currBB = this.getCurrentFGContext().getCurrentBB();

    // case a.
    // import "FROM"
    if (stmt.specifiers.length === 0) {
      currBB.statements.push(
        new IS_AImport(
          stmt,
          new IV_StringLiteral(stmt.source, stmt.source.value),
        ),
      );
      return;
    }

    // Assert that only one specifier exists
    if (stmt.specifiers.length !== 1) {
      debugConfig.logger.throwIriError(
        "JS3ImportDeclaration: Expected a single specifier in JS3",
      );
      return;
    }

    const specifier = stmt.specifiers[0];

    // case b.
    // import { X as Y } from "FROM"
    if (isImportSpecifier(specifier)) {
      let remote: IV_Identifier | IV_StringLiteral;
      if (isIdentifier(specifier.imported)) {
        remote = new IV_Identifier(specifier.imported, specifier.imported.name);
      } else {
        remote = new IV_StringLiteral(
          specifier.imported,
          specifier.imported.value,
        );
      }
      const local = new IV_Identifier(specifier.local, specifier.local.name);
      const FROM = new IV_StringLiteral(stmt.source, stmt.source.value);
      currBB.statements.push(new IS_BImport(stmt, remote, local, FROM));
      return;
    }

    // case c.
    // import * as X from "FROM"
    else {
      const local = new IV_Identifier(specifier.local, specifier.local.name);
      const FROM = new IV_StringLiteral(stmt.source, stmt.source.value);
      currBB.statements.push(new IS_CImport(stmt, local, FROM));
      return;
    }
  }

  handleJS3ExportDefaultDeclaration(stmt: JS3ExportDefaultDeclaration) {
    const currBB = this.getCurrentFGContext().getCurrentBB();
    // export default ID
    currBB.statements.push(
      new IS_AExport(
        stmt,
        new IV_Identifier(stmt.declaration, stmt.declaration.name),
      ),
    );
  }

  handleJS3ExportNamedDeclaration(stmt: JS3ExportNamedDeclaration) {
    const currBB = this.getCurrentFGContext().getCurrentBB();

    // Assert that only one specifier exists
    if (stmt.specifiers.length !== 1) {
      debugConfig.logger.throwIriError(
        "JS3ExportNamedDeclaration: Expected a single specifier in JS3",
      );
      return;
    }

    const specifier = stmt.specifiers[0];

    if (isJS3ExportSpecifier(specifier) && !isStringLiteral(stmt.source)) {
      // case a.
      // export {LOCAL as REMOTE}
      const local = new IV_Identifier(specifier.local, specifier.local.name);
      let remote: IV_Identifier | IV_StringLiteral;
      if (isIdentifier(specifier.exported)) {
        remote = new IV_Identifier(specifier.exported, specifier.exported.name);
      } else {
        remote = new IV_StringLiteral(
          specifier.exported,
          specifier.exported.value,
        );
      }
      currBB.statements.push(new IS_BExport(stmt, local, remote));
      return;
    }

    if (isJS3ExportSpecifier(specifier) && isStringLiteral(stmt.source)) {
      // case b.
      // export {FIELD as REMOTE} from FROM
      const local = new IV_Identifier(specifier.local, specifier.local.name);
      let remote: IV_Identifier | IV_StringLiteral;
      if (isIdentifier(specifier.exported)) {
        remote = new IV_Identifier(specifier.exported, specifier.exported.name);
      } else {
        remote = new IV_StringLiteral(
          specifier.exported,
          specifier.exported.value,
        );
      }
      const FROM = new IV_StringLiteral(stmt.source, stmt.source.value);
      currBB.statements.push(new IS_CExport(stmt, local, remote, FROM));
      return;
    }

    if (
      isJS3ExportNamespaceSpecifier(specifier) &&
      isIdentifier(specifier.exported)
    ) {
      // case c.
      // export * as REMOTE FROM
      const remote = new IV_Identifier(
        specifier.exported,
        specifier.exported.name,
      );
      const FROM = new IV_StringLiteral(stmt.source, stmt.source.value);
      currBB.statements.push(new IS_DExport(stmt, remote, FROM));
      return;
    }

    debugConfig.logger.throwIriError("JS3ExportNamedDeclaration: UNHANDLED");
    return;
  }

  handleJS3ExportAllDeclaration(stmt: JS3ExportAllDeclaration) {
    const currBB = this.getCurrentFGContext().getCurrentBB();
    const FROM = new IV_StringLiteral(stmt.source, stmt.source.value);
    currBB.statements.push(new IS_EExport(stmt, FROM));
  }
}
