import debugConfig from "#debugConfig";
import _generate from "@babel/generator";
import _traverse from "@babel/traverse";
import { ArrayPattern, AssignmentPattern, callExpression, Expression, identifier, Identifier, isArrayPattern, isArrowFunctionExpression, isAssignmentPattern, isBigIntLiteral, isBooleanLiteral, isClassExpression, isDecimalLiteral, isFunctionExpression, isIdentifier, isImportSpecifier, isNullLiteral, isNumericLiteral, isObjectPattern, isOptionalCallExpression, isOptionalMemberExpression, isPrivateName, isSpreadElement, isStringLiteral, isSuper, isThisExpression, isV8IntrinsicIdentifier, memberExpression, Node, ObjectPattern, OptionalCallExpression, optionalCallExpression, OptionalMemberExpression, optionalMemberExpression, ThisExpression } from "@babel/types";

const traverse = _traverse.default

import JS3Builder from "../JS3Builder.ts";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks.ts";
import { handleExpression, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression.ts";
import { generateDummyJS3VariableDeclaration, generateIdentifier, generateJS3AssignmentExpressionfromBaseNode, generateJS3RestElementfromBaseNode, generateJS3SpreadElement, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Helpers/JS3Constructors.ts";
import { isJS3AnonMemberExpression, isJS3ArrayExpression, isJS3ArrayPattern, isJS3ArrowFunctionExpression, isJS3AssignmentExpression, isJS3AwaitExpression, isJS3BinaryExpression, isJS3BlockStatement, isJS3BreakStatement, isJS3CallExpression, isJS3ClassExpression, isJS3ClassMethod, isJS3ClassPrivateMethod, isJS3ClassPrivateProperty, isJS3ClassProperty, isJS3ConditionalExpression, isJS3ContainedExprKey, isJS3ContextualCallExpression, isJS3ContinueStatement, isJS3DebuggerStatement, isJS3DoWhileStatement, isJS3EmptyStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportNamespaceSpecifier, isJS3ExportSpecifier, isJS3ForInStatement, isJS3ForOfStatement, isJS3ForStatement, isJS3FunctionDeclaration, isJS3FunctionExpression, isJS3IfStatement, isJS3Import, isJS3ImportDeclaration, isJS3LabeledStatement, isJS3LoopDeclaration, isJS3MemberExpression, isJS3MetaProperty, isJS3NewExpression, isJS3ObjectExpression, isJS3ObjectMethod, isJS3ObjectPattern, isJS3ObjectProperty, isJS3RegExpLiteral, isJS3ReturnStatement, isJS3SpreadElement, isJS3StaticBlock, isJS3SwitchStatement, isJS3TaggedTemplateExpression, isJS3TemplateLiteral, isJS3ThrowStatement, isJS3TryStatement, isJS3UnaryExpression, isJS3UpdateExpression, isJS3VariableDeclaration, isJS3WhileStatement, isJS3YieldExpression, JS3AllowedFunctionArgs, JS3AllowedProgStatement, JS3AnonMemberExpression, JS3ArrayExpression, JS3ArrayPattern, JS3ArrowFunctionExpression, JS3AssignmentExpression, JS3AssnInit, JS3AwaitExpression, JS3BinaryExpression, JS3BlockStatement, JS3BlockStatement_body, JS3BreakStatement, JS3CallExpression, JS3ClassExpression, JS3ClassMethod, JS3ClassProperty, JS3ClassProperty_value, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3ContinueStatement, JS3DebuggerStatement, JS3DoWhileStatement, JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3ForInStatement, JS3ForOfStatement, JS3ForStatement, JS3FunctionDeclaration, JS3FunctionExpression, JS3IfStatement, JS3ImportDeclaration, JS3LabeledStatement, JS3MemberExpression, JS3MetaProperty, JS3NewExpression, JS3ObjectExpression, JS3ObjectPattern, JS3Program, JS3RegExpLiteral, JS3ReturnStatement, JS3StaticBlock, JS3SwitchStatement, JS3TaggedTemplateExpression, JS3TemplateLiteral, JS3ThrowStatement, JS3TryStatement, JS3UnaryExpression, JS3UpdateExpression, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3WhileStatement, JS3YieldExpression } from "../JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_PrivateName, IV_SuperLookupPA, IV_ThisLookupPA } from "./ALL_AMP/ALL_AMP.ts";
import { IS_Break, IS_LBreak } from "./ALL_IS/IS_Break.ts";
import { IS_ClassStaticPropInit } from "./ALL_IS/IS_ClassStaticPropInit.ts";
import { IS_Continue, IS_LContinue } from "./ALL_IS/IS_Continue.ts";
import { IS_Debugger, IS_Return, IS_Throw } from "./ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS_FunDecl } from "./ALL_IS/IS_FunDecl.ts";
import { IS_AExport, IS_AImport, IS_BExport, IS_BImport, IS_CExport, IS_CImport, IS_DExport, IS_EExport } from "./ALL_IS/IS_Imports_Exports.ts";
import { IS_ArrPatVarDecl, IS_ClassNameInitStmt, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_ThisInitStmt, IS_VAR_DECL_KIND } from "./ALL_IS/IS_VarDecl.ts";
import { ISP_ArgSpread, ISP_ClassMethod, ISP_ClassProperty, ISP_ClassProperty_key, ISP_ObjectMethod, ISP_ObjectMethod_key, ISP_ObjectProperty, ISP_RestElement, ISP_StaticClassProperty, ISP_Super, ISP_V8Intrinsic } from "./ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "./ALL_RVal/ALL_RVal.ts";
import { IV_ArrayExpression } from "./ALL_RVal/IV_ArrayExpression.ts";
import { IV_ArrowFunctionExpression } from "./ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_ArrPatAssn, IV_MemberAssn, IV_ObjPatAssn, IV_SimpleAssn, IV_SuperAssn, IV_ThisAssn } from "./ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP, OPA, OPB, OPC, OPD, OPE, OPF } from "./ALL_RVal/IV_Binop.ts";
import { IV_Call, IV_ImportCall, IV_SuperCall, IV_V8IntrinsicCall } from "./ALL_RVal/IV_Call.ts";
import { IV_ClassExpression, IV_ClassExpression_properties } from "./ALL_RVal/IV_ClassExpression.ts";
import { IV_ConditionalExpression } from "./ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FunctionExpression } from "./ALL_RVal/IV_FunctionExpression.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "./ALL_RVal/IV_Literals.ts";
import { IV_HasLoopNext, IV_InIterator, IV_LoopNext, IV_OfIterator } from "./ALL_RVal/IV_LoopIterators.ts";
import { IV_ModuleMeta, IV_NewTarget } from "./ALL_RVal/IV_META.ts";
import { IV_NewExpression } from "./ALL_RVal/IV_NewExpression.ts";
import { IV_NUBD } from "./ALL_RVal/IV_NonLang.ts";
import { IV_ObjectExpression } from "./ALL_RVal/IV_ObjectExpression.ts";
import { IV_Regexp } from "./ALL_RVal/IV_Regexp.ts";
import { IV_TaggedTemplateCall, IV_TemplateLiteral } from "./ALL_RVal/IV_Templates.ts";
import { IV_This } from "./ALL_RVal/IV_This.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "./ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "./ALL_RVal/IV_UpdateExpression.ts";
import { IV_AWAIT, IV_YIELD } from "./ALL_RVal/IV_YIELD_AWAIT.ts";
import { BB, BlockBB, BranchTerminal, CatchBB, ClassInitBB, ClassPropInitBB, ClassStaticBB, ForInOfLoopInitBB, ForLoopInitBB, FunctionArgInitBB, FunctionBB, LoopHeadBB, ModuleBB, ScriptBB, SwitchBodyBB, TryBB } from "./BB.ts";
import { Environment } from "./I_GENERAL/I_Scope.ts";

import { Graph } from "#graphlib";
import { printScopedSpace, printSpace } from "#utils";
import { cleanupBBs } from "./Passes/BBCleanup.ts";
import { hoistDeclarations } from "./Passes/DeclarationHoisting.ts";

const generate = _generate.default

export class IRIDIUM_FG extends Graph {
  rootBB: BB
  currentBB: BB

  getName() {
    return `FG_ROOT=BB${this.rootBB.idx}`
  }

  // Get a mapping of envs to BBs in the flowgraph
  getEnvBBMap() : Map<Environment, Set<BB>> {
    let envs: Map<Environment, Set<BB>> = new Map();
    for (let bb of this.nodes()) {
      let bbNode = this.getBBNode(bb)
      if (!envs.has(bbNode.env)) envs.set(bbNode.env, new Set()) 
      envs.get(bbNode.env).add(bbNode)
    }
    return envs
  }

  // Methods to set and get BB's from the flowgraph
  declareBBNode(bb: BB) {
    let bbIdx: string = '' + bb.idx
    this.setNode(bbIdx, bb)
    return bb;
  }

  getBBNode(idx: string | number): BB {
    let bbIdx: string = '' + idx
    return this.node(bbIdx);
  }

  // Add Edges
  setBBEdge(from: string | number, to: string | number, label: string = "") {
    let fromIdx: string = "" + from
    let toIdx: string = "" + to
    this.setEdge(fromIdx, toIdx, label)
  }

  constructor(bb: BB) {
    super({ directed: true })
    this.declareBBNode(bb)
    this.rootBB = bb;
    this.currentBB = bb;
  }

  // Get/Set current BB context
  getCurrentBB() { return this.currentBB; }
  setCurrentBB(bb: BB) { this.currentBB = bb; }

  forwardSuccessorsBB(uBB : BB, vBB : BB) {
    let u = '' + uBB.idx
    let v = '' + vBB.idx
    this.forwardSuccessors(u, v)
  }

  // Utility methods
  forwardSuccessors(u : string, v : string) {
    let graph = this;
    if (!graph.hasNode(u) || !graph.hasNode(v)) {
      debugConfig.logger.throwIriError("Both nodes must exist in the graph to be able to forward the successors")
    }
    // Get all successors of node u 
    const successors = graph.successors(u) as Array<string>;
    // Redirect each successor of u to v
    successors.forEach(successor => {
      if (successor !== v) { // Avoid self-loops to v
        const edgeData = graph.edge(u, successor); // Preserve edge data
        graph.setEdge(v, successor, edgeData);
      }
      graph.removeEdge(u, successor);
    });  
  }

  // Save the IR to a string
  saveIridiumToString(space = 0) {
    let stmts = []
    let nodes = this.nodes()
    let that = this
    
    // @ts-ignore
    nodes.sort((a, b) => that.predecessors(a).length - that.predecessors(b).length)

    for (let bbIdx of nodes) {
      let bb : BB = this.node(bbIdx)
      
      // stmts.push(`${printScopedSpace(space)}`)
      let preds = this.predecessors(bbIdx)
      stmts.push(`${printScopedSpace(space)}🬕 ${bb.printHeader()} [PRED: ${preds ? preds.map(b => `BB${b}`).join(", ") : ""}]`)
      stmts.push(bb.toString(space))
      let succs = this.successors(bbIdx)
      stmts.push(`${printScopedSpace(space)}🬲 [SUCC: ${succs ? succs.map(b => `BB${b}`).join(", ") : ""}]`)

    }
    
    return stmts.join("\n")
  }

  // override the existing implementation for saving DOT
  saveIridiumToDOT(space = 0) {
    let res = []    
    for (let b of this.nodes()) {
      let bb : BB = this.node(b)

      // Declare node and their labels
      res.push(`${printSpace(space)}${bb.toDOT()}`)
    }
    
    // res.push("  graph [nodesep=1.0, ranksep=1.5]; // Adjust separation")
    for (let e of this.edges()) {
      let startNode = e.v
      let endNode = e.w
      let startBB : BB = this.node(startNode)
      let endBB : BB = this.node(endNode)
      res.push(`${printSpace(space)}${startBB.printHeaderDOT()} -> ${endBB.printHeaderDOT()};`);
    }

    return res.join("\n");
  }

  // Generate the env edges between nodes
  saveEnvToDOT(space = 0) {
    let res = []    
    for (let b of this.nodes()) {
      let bb : BB = this.node(b)

      // Declare node and their labels
      res.push(`${printSpace(space)} ${bb.printHeaderDOT()} -> "${bb.env.getName()}" [dir=none, style="dashed"]`)
    }

    return res.join("\n");
  }

}


export default class IRIDIUM {
  js3builder: JS3Builder
  node: JS3Program
  fgContext: Array<IRIDIUM_FG> = new Array()
  
  constructor(js3builder: JS3Builder) {
    this.node = js3builder.generatedAST.program
    this.js3builder = js3builder
  }

  // FlowGraph Context
  getCurrentFGContext() : IRIDIUM_FG { return this.fgContext[this.fgContext.length - 1]; }
  pushFGContext(bb: IRIDIUM_FG) { this.fgContext.push(bb); }
  popFGContext() : IRIDIUM_FG { return this.fgContext.pop(); }

  // Build FlowGraph
  build() {
    let MAIN_ENV = new Environment(undefined)
    let bb: BB;

    if (this.node.sourceType === "module")
      bb = new ModuleBB(MAIN_ENV, this.node)
    else
      bb = new ScriptBB(MAIN_ENV, this.node)
    
    this.pushFGContext(new IRIDIUM_FG(bb))
    this.handleJS3ProgramBody(this.node.body)
    let res = this.popFGContext()
    if (this.fgContext.length !== 0) debugConfig.logger.throwIriError("Expected FGContext to be empty after Iridium generation!!") 

    hoistDeclarations(res)
    cleanupBBs(res)
    return res
  }

  // // Set/Get current BB
  // setCurrentBB(bb: BB) { this.currentBB = bb; }
  // getCurrentBB() { return this.currentBB; }

  // Handle Statements
  handleJS3AllowedProgStatement(stmt: JS3AllowedProgStatement) {
    if (isJS3ImportDeclaration(stmt)) this.handleJS3ImportDeclaration(stmt)
    else if (isJS3ExportDefaultDeclaration(stmt)) this.handleJS3ExportDefaultDeclaration(stmt)
    else if (isJS3ExportNamedDeclaration(stmt)) this.handleJS3ExportNamedDeclaration(stmt)
    else if (isJS3ExportAllDeclaration(stmt)) this.handleJS3ExportAllDeclaration(stmt)
    else if (isJS3DebuggerStatement(stmt)) this.handleJS3DebuggerStatement(stmt)
    else if (isJS3ReturnStatement(stmt)) this.handleJS3ReturnStatement(stmt)
    else if (isJS3ThrowStatement(stmt)) this.handleJS3ThrowStatement(stmt)
    else if (isJS3VariableDeclaration(stmt)) this.handleJS3VariableDeclaration(stmt)
    else if (isJS3FunctionDeclaration(stmt)) this.handleJS3FunctionDeclaration(stmt)
    else if (isJS3IfStatement(stmt)) this.handleJS3IfStatement(stmt)
    else if (isJS3TryStatement(stmt)) this.handleJS3TryStatement(stmt)
    else if (isJS3EmptyStatement(stmt)) {/* NADA */ }
    else if (isJS3WhileStatement(stmt)) this.handleJS3WhileStatement(stmt)
    else if (isJS3BreakStatement(stmt)) this.handleJS3BreakStatement(stmt)
    else if (isJS3ContinueStatement(stmt)) this.handleJS3ContinueStatement(stmt)
    else if (isJS3BlockStatement(stmt)) this.handleJS3BlockStatement(stmt)
    else if (isJS3ForInStatement(stmt)) this.handleJS3ForInOfStatement(stmt)
    else if (isJS3LabeledStatement(stmt)) this.handleJS3LabeledStatement(stmt)
    else if (isJS3ForStatement(stmt)) this.handleJS3ForStatement(stmt)
    else if (isJS3DoWhileStatement(stmt)) this.handleJS3DoWhileStatement(stmt)
    else if (isJS3SwitchStatement(stmt)) this.handleJS3SwitchStatement(stmt)
    else if (isJS3ForOfStatement(stmt)) this.handleJS3ForInOfStatement(stmt)
    else debugConfig.logger.throwIriError(`IRIDIUM: Unhandled Statement ${stmt.type}, ${stmt.js3type}`)
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
      return this.handleJS3MetaProperty(init)
    }

    // JS3YieldExpression / JS3AwaitExpression 
    else if (isJS3YieldExpression(init)) {
      return this.handleJS3YieldExpression(init);
    } else if (isJS3AwaitExpression(init)) {
      return this.handleJS3AwaitExpression(init);
    }

    // This Expression
    else if (isThisExpression(init)) {
      return this.handleThisExpression(init)
    }

    // JS3CallExpression
    else if (isJS3CallExpression(init)) {
      return this.handleJS3CallExpression(init);
    }

    // JS3ContextualCallExpression
    else if (isJS3ContextualCallExpression(init)) {
      return this.handleJS3ContextualCallExpression(init)
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
      return this.handleJS3ObjectExpression(init)
    }

    // JS3FunctionExpression
    else if (isJS3FunctionExpression(init)) {
      return this.handleJS3FunctionExpression(init)
    }

    // JS3ArrowFunctionExpression
    else if (isJS3ArrowFunctionExpression(init)) {
      return this.handleJS3ArrowFunctionExpression(init)
    }

    // JS3ArrayExpression
    else if (isJS3ArrayExpression(init)) {
      return this.handleJS3ArrayExpression(init)
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
      return this.handleJS3ClassExpression(init)
    }

    // 
    // Handlers
    //

    // OptionalMemberExpression | OptionalCallExpression
    else if (isOptionalMemberExpression(init) || isOptionalCallExpression(init)) {
      return this.handleOptionalChainExpression(init)
    }

    // JS3AnonMemberExpression
    else if (isJS3AnonMemberExpression(init)) {
      return this.handleJS3AnonMemberExpression(init)
    }

    else {
      // @ts-ignore
      debugConfig.logger.throwIriError(`IRIDIUM: Unhandled Statement ${init.type}, ${init.js3type ? init.js3type : undefined}`)
      return new IV_StringLiteral(undefined, `😞💔(${init.type})`);
    }
  }

  // Handle Program Body
  handleJS3ProgramBody(body: Array<JS3AllowedProgStatement>) {
    for (let _st of body) {
      this.handleJS3AllowedProgStatement(_st)
    }
  }

  //
  // *********************** Lowering JS3Expressions into Iridium BB ***********************
  //
  lowerExprToBB(from: JS3ContainedExprKey, block: BB, resID: IV_Identifier | undefined = undefined) {
    // Generate 3JS code
    let otherProps = this.js3builder.utils
    let js3SpillHolder: JS3BlockStatement_body = new Array()
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }

    let exprRes: Identifier

    if (isFunctionExpression(from) || isArrowFunctionExpression(from) || isClassExpression(from)) {
      exprRes = lowerToAnonArrayExpr(from, updatedProps)
    } else {
      exprRes = handleExpression(from, updatedProps);
    }

    let fgContext = this.getCurrentFGContext()

    fgContext.setCurrentBB(block)
    this.handleJS3ProgramBody(js3SpillHolder)
    
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")

    // resID = ...exprRes
    if (resID)
      fgContext.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", resID, new IV_Identifier(exprRes, exprRes.name)));

    return exprRes;
  }

  //
  // *********************** Functions Related Lowering ***********************
  //
  handleFunctionParams(params: Array<JS3AllowedFunctionArgs>, functionBody: FunctionBB): [Array<IV_Identifier | ISP_RestElement>, FunctionArgInitBB, IRIDIUM_FG] {
    let fgContext = this.getCurrentFGContext()

    let fin_args: Array<IV_Identifier | ISP_RestElement> = []

    // Fixup env
    let argInitEnv = new Environment(functionBody.env.parent)
    functionBody.env.parent.children.delete(functionBody.env)
    functionBody.env.parent = argInitEnv
    argInitEnv.children.add(functionBody.env)

    let argInitBlock = new FunctionArgInitBB(argInitEnv, params)
    fgContext.declareBBNode(argInitBlock)

    // 
    // Draw Edges
    // 
    fgContext.rootBB = argInitBlock
    fgContext.setBBEdge(argInitBlock.idx, functionBody.idx)
    
    // Lower Args in the argInitBlock
    fgContext.setCurrentBB(argInitBlock)
    let i = 0
    for (let arg of params) {

      // 
      // 1. LVal Pattern to spill
      // 

      let toLowerLval: Identifier | ArrayPattern | ObjectPattern | AssignmentPattern;
      if (isIdentifier(arg) || isArrayPattern(arg) || isObjectPattern(arg) || isAssignmentPattern(arg)) {
        toLowerLval = arg
      } else if (isIdentifier(arg.argument) || isArrayPattern(arg.argument) || isObjectPattern(arg.argument) || isAssignmentPattern(arg.argument)) {
        toLowerLval = arg.argument
      } else {
        toLowerLval = generateIdentifier(arg, "$TODO_IRI_UNDEFINED$");
        debugConfig.logger.throwIriError(`Iridium function arg, LVAL is unsupported: ${generate(arg).code}`)
      }

      // 
      // 2. RVal Identifier in argument list
      // 
      let toLowerRVal: Identifier = generateIdentifier(arg, this.js3builder.utils.getNewTemporary(`farg${i++}`))

      // 
      // 3. Generate code in curr
      // 
      let otherProps = this.js3builder.utils
      let js3SpillHolder: JS3BlockStatement_body = new Array()
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }
      let first = true
      let generator = (LVal: JS3MemberExpression | JS3ArrayPattern | JS3ObjectPattern | Identifier, RVal: null | JS3VariableDeclarator_init) => {
        if (isJS3MemberExpression(LVal)) debugConfig.logger.log("LVal cannot be JS3MemberExpression in case of variable declarator...")
        else {
          let declarator = generateJS3VariableDeclaratorfromBaseNode(LVal, RVal, null, arg)
          return generateJS3VariableDeclarationfromBaseNode([declarator], first ? (first = false, "var") : "let", null, arg)
        }
      }
      handleDeclaratorRec(toLowerLval, toLowerRVal, updatedProps, generator, false);
      this.handleJS3ProgramBody(js3SpillHolder)

      // 
      // Populate args array
      // 
      if (isIdentifier(arg) || isArrayPattern(arg) || isObjectPattern(arg) || isAssignmentPattern(arg)) {
        fin_args.push(new IV_Identifier(toLowerRVal, toLowerRVal.name));
      } else if (isIdentifier(arg.argument) || isArrayPattern(arg.argument) || isObjectPattern(arg.argument) || isAssignmentPattern(arg.argument)) {
        fin_args.push(new ISP_RestElement(generateJS3RestElementfromBaseNode(toLowerRVal, null, null, null, arg), new IV_Identifier(toLowerRVal, toLowerRVal.name)))
      } else {
        toLowerLval = generateIdentifier(arg, "$TODO_IRI_UNDEFINED$");
        debugConfig.logger.throwIriError(`Iridium function arg, LVAL is unsupported: ${generate(arg).code}`)
      }
    }

    // Ensure the last block points to the function body
    let succ = fgContext.successors('' + fgContext.getCurrentBB().idx)
    if (!succ || succ.length !== 1 || (('' + functionBody.idx) !== succ[0])) {
      debugConfig.logger.throwIriError(`Iridium function arg, control must flow to body after argument initialization`)
    }

    return [fin_args, argInitBlock, this.popFGContext()]
  }

  handleFunctionBody(node: JS3BlockStatement) {
    let fgContext = this.getCurrentFGContext()

    let funBB = new FunctionBB(new Environment(fgContext.getCurrentBB().env), node) // STUB Env, gets
    let PROP_INIT_FG = new IRIDIUM_FG(funBB)
    this.pushFGContext(PROP_INIT_FG);

    for (let s of node.body) {
      this.handleJS3AllowedProgStatement(s)
    }
    return funBB
  }

  //
  // ***********************        AMP          ***********************
  //
  handleJS3MemberExpression(node: JS3MemberExpression) {
    let prop: IV_Identifier | IV_PrivateName
    if (isIdentifier(node.property)) prop = new IV_Identifier(node.property, node.property.name)
    else prop = new IV_PrivateName(node.property, new IV_Identifier(node.property.id, node.property.id.name))

    if (isIdentifier(node.object)) {
      return new IV_MemberExpressionPA(node, new IV_Identifier(node.object, node.object.name), prop, node.computed)
    } else if (isThisExpression(node.object)) {
      return new IV_ThisLookupPA(node, prop, node.computed)
    } else {
      return new IV_SuperLookupPA(node, prop, node.computed)
    }
  }


  //
  // ***********************       RVALUES        ***********************
  //

  // *********************** Iridium_ClassExpression ***********************
  handleJS3ClassExpression(node: JS3ClassExpression, dropName: boolean = false) {
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
    let fgContext = this.getCurrentFGContext()

    // 
    // BB and lexical env creation
    // 
    let currBB = fgContext.getCurrentBB()
    let classInitLexicalEnv = new Environment(currBB.env)
    let classInitBB = new ClassInitBB(classInitLexicalEnv, node, node.id ? new IV_Identifier(node.id, node.id.name) : undefined);
    fgContext.declareBBNode(classInitBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    // 
    // Draw Edges
    // 
    fgContext.setBBEdge(currBB.idx, classInitBB.idx)
    fgContext.setBBEdge(classInitBB.idx, postBB.idx)

    // 
    // Add classExprResHolder to currBB
    // 
    let classExprValHolder = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("classExprRes"))
    classExprValHolder.isValue = true;
    let initClassExprValToNUBD = new IS_SimpleVarDecl(undefined, "let", classExprValHolder, new IV_NUBD(undefined))
    currBB.statements.push(initClassExprValToNUBD);

    // Set context to classInitBB

    fgContext.setCurrentBB(classInitBB)

    // 
    // Inside the ClassInit Block, initialize the THIS pointer and the classname binding (if it exists)
    // 
    //   <ClassInitThis> THIS = undefined <- most unhinged thing I've seen...
    let thisInitToUndef = new IS_ThisInitStmt(node)
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.getCurrentBB().statements.push(thisInitToUndef);
    
    let cName: IV_Identifier | undefined;
    if (isIdentifier(node.id)) {
      //   <ClassInitName> cName = NUBD
      cName = new IV_Identifier(node.id, node.id.name);
      let cNameInitToNUBD = new IS_ClassNameInitStmt(node, cName);
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.getCurrentBB().statements.push(cNameInitToNUBD);
    }

    // Heritage resolution 
    let IRI_heritage: undefined | IV_Identifier = undefined
    if (node.superClass) {
      IRI_heritage = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("heritageResult"))
      IRI_heritage.isValue = true
      this.lowerExprToBB(node.superClass, classInitBB, IRI_heritage)
    }

    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")

    // Name Resolution
    let IV_ComputedNameMap: Map<JS3ClassProperty | JS3ClassMethod, ISP_ClassProperty_key> = new Map()
    for (let bodyElem of node.body.body) {
      if (isJS3ClassProperty(bodyElem) || isJS3ClassMethod(bodyElem)) {
        if (bodyElem.computed) {
          let valResID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("computedName"))
          valResID.isValue = true
          this.lowerExprToBB(bodyElem.key, fgContext.getCurrentBB(), valResID)
          if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
          IV_ComputedNameMap.set(bodyElem, valResID)
        } else {
          if (isIdentifier(bodyElem.key) || isDecimalLiteral(bodyElem.key) || isBigIntLiteral(bodyElem.key) || isStringLiteral(bodyElem.key) || isNumericLiteral(bodyElem.key) || isNullLiteral(bodyElem.key) || isBooleanLiteral(bodyElem.key)) {
            let IRI_key: ISP_ClassProperty_key;
            if (isIdentifier(bodyElem.key)) IRI_key = new IV_Identifier(bodyElem.key, bodyElem.key.name)
            else if (isDecimalLiteral(bodyElem.key)) IRI_key = new IV_DecimalLiteral(bodyElem.key, bodyElem.key.value)
            else if (isBigIntLiteral(bodyElem.key)) IRI_key = new IV_BigIntLiteral(bodyElem.key, bodyElem.key.value)
            else if (isStringLiteral(bodyElem.key)) IRI_key = new IV_StringLiteral(bodyElem.key, bodyElem.key.value)
            else if (isNumericLiteral(bodyElem.key)) IRI_key = new IV_NumericLiteral(bodyElem.key, bodyElem.key.value)
            else if (isNullLiteral(bodyElem.key)) IRI_key = new IV_NullLiteral(bodyElem.key)
            else if (isBooleanLiteral(bodyElem.key)) IRI_key = new IV_BooleanLiteral(bodyElem.key, bodyElem.key.value)
            else debugConfig.logger.throwIriError("Unhandled Class Prop/method key name type")
            IV_ComputedNameMap.set(bodyElem, IRI_key)
          } else {
            debugConfig.logger.throwIriError("Unexpected key type for class property/method name", [bodyElem.key])
          }
        }
      }
    }

    let classProperties: IV_ClassExpression_properties = new Array();
    let staticPropSpill: Array<[ISP_ClassProperty_key, JS3ClassProperty_value, boolean] | JS3StaticBlock> = new Array()

    for (let bodyElem of node.body.body) {
      if (isJS3ClassProperty(bodyElem) || isJS3ClassPrivateProperty(bodyElem)) {

        let key: ISP_ClassProperty_key;
        let computed: boolean;

        if (isJS3ClassPrivateProperty(bodyElem)) {
          key = new IV_PrivateName(bodyElem.key, new IV_Identifier(bodyElem.key.id, bodyElem.key.id.name))
          computed = false
        } else {
          if (!IV_ComputedNameMap.has(bodyElem)) debugConfig.logger.throwIriError("expected resolved name but not found when generating code for class expression props")
          key = IV_ComputedNameMap.get(bodyElem)
          computed = bodyElem.computed
        }

        if (bodyElem.static) {
          // Static Property
          classProperties.push(new ISP_StaticClassProperty(bodyElem, key, new IV_Identifier(undefined, "undefined"), computed))
          staticPropSpill.push([key, bodyElem.value, computed])
        } else {

          // Non-static Property

          // Env for static block init
          let propInitEnv = new Environment(classInitLexicalEnv)

          let valResID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
          valResID.isValue = true
          let propComputationBlock = new ClassPropInitBB(propInitEnv, bodyElem.value)
          let PROP_INIT_FG = new IRIDIUM_FG(propComputationBlock)

          this.pushFGContext(PROP_INIT_FG);
          this.lowerExprToBB(bodyElem.value, propComputationBlock, valResID);
          this.popFGContext();

          if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")

          classProperties.push(new ISP_ClassProperty(bodyElem, key, PROP_INIT_FG, computed))
        }

      } else if (isJS3ClassMethod(bodyElem) || isJS3ClassPrivateMethod(bodyElem)) {
        let kind = bodyElem.kind
        let [params, funBody, fCon] = this.handleFunctionParams(bodyElem.params, this.handleFunctionBody(bodyElem.body))
        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
        let generator = bodyElem.generator;
        let async = bodyElem.async;

        let key: ISP_ClassProperty_key;
        let computed: boolean;

        if (isJS3ClassPrivateMethod(bodyElem)) {
          key = new IV_PrivateName(bodyElem.key, new IV_Identifier(bodyElem.key.id, bodyElem.key.id.name))
          computed = false
        } else {
          if (!IV_ComputedNameMap.has(bodyElem)) debugConfig.logger.throwIriError("expected resolved name but not found when generating code for class expression method")
          key = IV_ComputedNameMap.get(bodyElem)
          computed = bodyElem.computed
        }

        classProperties.push(new ISP_ClassMethod(bodyElem, kind, key, params, fCon, computed, generator, async, bodyElem.static))
      } else {
        // JS3StaticBlock
        staticPropSpill.push(bodyElem)
      }
    }

    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
     
    // let finInitClassRes = classExprValHolder = <ClassExpression> ...
    let iriClassExpr = new IV_ClassExpression(node, cName, IRI_heritage, classProperties, dropName)
    let iriAssn = new IV_SimpleAssn(undefined, classExprValHolder, iriClassExpr)
    let finInitClassRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
    fgContext.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", finInitClassRes, iriAssn))

    // <THIS_INIT> THIS = finInitClassRes
    thisInitToUndef = new IS_ThisInitStmt(node)
    thisInitToUndef.RVal = finInitClassRes
    fgContext.getCurrentBB().statements.push(thisInitToUndef);

    // <ClassNameInit> cName = finInitClassRes
    if (isIdentifier(node.id)) {
      let cNameInitToNUBD = new IS_ClassNameInitStmt(node, cName);
      cNameInitToNUBD.RVal = finInitClassRes
      fgContext.getCurrentBB().statements.push(cNameInitToNUBD);
    }

    for (let toSpill of staticPropSpill) {
      if (isJS3StaticBlock(toSpill)) {
        let currBB = fgContext.getCurrentBB()
        let staticBlockBody = new ClassStaticBB(new Environment(classInitLexicalEnv), toSpill)
        fgContext.declareBBNode(staticBlockBody)
        let postBB = fgContext.declareBBNode(currBB.create())
        if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
        fgContext.forwardSuccessorsBB(currBB, postBB)

        // Draw Edges
        fgContext.setBBEdge(currBB.idx, staticBlockBody.idx)
        fgContext.setBBEdge(staticBlockBody.idx, postBB.idx)

        fgContext.setCurrentBB(staticBlockBody)
        for (let s of toSpill.body) {
          this.handleJS3AllowedProgStatement(s);
        }

        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
        fgContext.setCurrentBB(postBB)
      } else {
        let classProp = toSpill[0]
        let propVal = toSpill[1]
        let computed = toSpill[2]

        let currBB = fgContext.getCurrentBB()
        let propComputationBlock = new BlockBB(classInitLexicalEnv)
        fgContext.declareBBNode(propComputationBlock)
        let postBB = fgContext.declareBBNode(currBB.create())
        if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
        fgContext.forwardSuccessorsBB(currBB, postBB)

        // Draw Edges
        fgContext.setBBEdge(currBB.idx, propComputationBlock.idx)
        fgContext.setBBEdge(propComputationBlock.idx, postBB.idx)

        let valResID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
        valResID.isValue = true

        this.lowerExprToBB(propVal, propComputationBlock, valResID)

        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
        fgContext.getCurrentBB().statements.push(new IS_ClassStaticPropInit(node, finInitClassRes, classProp, valResID, computed))

        fgContext.setCurrentBB(postBB)
      }
    }

    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB);

    return classExprValHolder;
  }


  // *********************** Iridium_UpdateExpression ***********************

  handleJS3UpdateExpression(node: JS3UpdateExpression) {
    let argument: IV_Identifier | IV_MemberExpressionPA | IV_ThisLookupPA | IV_SuperLookupPA
    if (isIdentifier(node.argument)) argument = new IV_Identifier(node.argument, node.argument.name)
    else argument = this.handleJS3MemberExpression(node.argument)
    return new IV_UpdateExpression(node, argument, node.operator, node.prefix)
  }

  // *********************** Iridium_Unop ***********************

  handleJS3UnaryExpression(node: JS3UnaryExpression) {
    if (node.operator === "delete") {
      let resId: Identifier = this.lowerExprToBB(node.argument, this.getCurrentFGContext().getCurrentBB())
      let resID = new IV_Identifier(resId, resId.name)
      resID.isValue = true
      return new IV_DUNOP(node, resID)
    } else {
      if (!isIdentifier(node.argument)) {
        debugConfig.logger.throwIriError("JS3UnaryExpression: Expected Identifier for non delete operators")
        return new IV_StringLiteral(undefined, "!!!INVALID!!")
      }
      let argument = new IV_Identifier(node.argument, node.argument.name)
      if (node.operator === "!" || node.operator === "+" || node.operator === "-" || node.operator === "~") {
        return new IV_AUNOP(node, argument, node.operator)
      } else if (node.operator === "void") {
        return new IV_BUNOP(node, argument)
      } else if (node.operator === "typeof") {
        return new IV_CUNOP(node, argument)
      } else {
        debugConfig.logger.throwIriError("JS3UnaryExpression: unsupported operator");
        return new IV_StringLiteral(undefined, "!!!INVALID!!")
      }
    }
  }

  // *********************** Iridium_NewExpression ***********************

  handleJS3NewExpression(node: JS3NewExpression) {
    let callee: IV_Identifier | ISP_Super | ISP_V8Intrinsic

    if (isIdentifier(node.callee)) callee = new IV_Identifier(node.callee, node.callee.name)
    else if (isSuper(node.callee)) callee = new ISP_Super(node.callee)
    else if (isV8IntrinsicIdentifier(node.callee)) callee = new ISP_V8Intrinsic(node.callee, new IV_Identifier(undefined, node.callee.name))

    let args: Array<IV_Identifier | ISP_ArgSpread> = new Array()

    for (let a of node.arguments) {
      if (isIdentifier(a)) {
        args.push(new IV_Identifier(a, a.name))
      } else {
        args.push(new ISP_ArgSpread(a, new IV_Identifier(a.argument, a.argument.name)))
      }
    }

    return new IV_NewExpression(node, callee, args)
  }

  // *********************** Iridium_ArrayExpression ***********************

  handleJS3ArrayExpression(node: JS3ArrayExpression) {
    let elements: Array<null | IV_Identifier | ISP_ArgSpread> = []

    for (let e of node.elements) {
      if (e === null) {
        elements.push(null)
      } else if (isIdentifier(e)) {
        elements.push(new IV_Identifier(e, e.name))
      } else if (isJS3SpreadElement(e)) {
        elements.push(new ISP_ArgSpread(e, new IV_Identifier(e.argument, e.argument.name)))
      }
    }

    return new IV_ArrayExpression(node, elements)
  }

  // *********************** Iridium_AnonMemberExpression ***********************

  handleJS3AnonMemberExpression(node: JS3AnonMemberExpression) {
    let element = node.object.elements[0];
    let fgContext = this.getCurrentFGContext()

    if (isJS3FunctionExpression(element)) {
      let [params, funBody, fCon] = this.handleFunctionParams(element.params, this.handleFunctionBody(element.body))
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      return new IV_FunctionExpression(element, params, fCon, undefined, element.generator, element.async, true)
    } else if (isJS3ArrowFunctionExpression(element)) {
      let [params, funBody, fCon] = this.handleFunctionParams(element.params, this.handleFunctionBody(element.body))
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      return new IV_ArrowFunctionExpression(element, params, fCon, undefined, element.generator, element.async, true)
    } else if (isJS3ClassExpression(element)) {
      let classExpr = this.handleJS3ClassExpression(element, true)
      return classExpr
    } else {
      debugConfig.logger.throwIriError("JS3AnonMemberExpression unhandled case")
    }
  }

  // *********************** Iridium_FunctionExpressions ***********************

  handleJS3FunctionExpression(node: JS3FunctionExpression) {
    let fgContext = this.getCurrentFGContext()
    let [params, funBody, fCon] = this.handleFunctionParams(node.params, this.handleFunctionBody(node.body))
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    let name: IV_Identifier | undefined = undefined
    if (isIdentifier(node.id)) name = new IV_Identifier(node.id, node.id.name)
    return new IV_FunctionExpression(node, params, fCon, name, node.generator, node.async)
  }

  handleJS3ArrowFunctionExpression(node: JS3ArrowFunctionExpression) {
    let fgContext = this.getCurrentFGContext()
    let [params, funBody, fCon] = this.handleFunctionParams(node.params, this.handleFunctionBody(node.body))
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    return new IV_ArrowFunctionExpression(node, params, fCon, undefined, node.generator, node.async)
  }

  // *********************** Iridium_ObjectExpression ***********************

  handleJS3ObjectExpression(node: JS3ObjectExpression) {
    let fgContext = this.getCurrentFGContext()

    let properties: Array<ISP_ObjectMethod | ISP_ObjectProperty | ISP_ArgSpread> = []

    node.properties.forEach(p => {
      if (isJS3ObjectMethod(p)) {
        let orig_key = p.key
        let fin_key: ISP_ObjectMethod_key
        if (isIdentifier(orig_key)) {
          fin_key = new IV_Identifier(orig_key, orig_key.name)
        } else if (isStringLiteral(orig_key)) {
          fin_key = new IV_StringLiteral(orig_key, orig_key.value)
        } else if (isNumericLiteral(orig_key)) {
          fin_key = new IV_NumericLiteral(orig_key, orig_key.value)
        } else if (isBigIntLiteral(orig_key)) {
          fin_key = new IV_BigIntLiteral(orig_key, orig_key.value)
        }

        let kind = p.kind
        let key = fin_key
        let [params, funBody, fCon] = this.handleFunctionParams(p.params, this.handleFunctionBody(p.body))
        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")

        let computed = p.computed
        let generator = p.generator;
        let async = p.async;

        properties.push(new ISP_ObjectMethod(p, kind, key, params, fCon, computed, generator, async))
      } else if (isJS3ObjectProperty(p)) {
        properties.push(ISP_ObjectProperty.from(p))
      } else if (isJS3SpreadElement(p)) {
        properties.push(new ISP_ArgSpread(p, IV_Identifier.from(p.argument)))
      }
    })

    return new IV_ObjectExpression(node, properties)

  }


  // *********************** Iridium_ConditionalExpression ***********************

  handleJS3ConditionalExpression(node: JS3ConditionalExpression) {
    let test = IV_Identifier.from(node.test)
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let trueBB = new BlockBB(currBB.env, node.consequent)
    fgContext.declareBBNode(trueBB)
    let falseBB = new BlockBB(currBB.env, node.alternate)
    fgContext.declareBBNode(falseBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, trueBB.idx, "T")
    fgContext.setBBEdge(currBB.idx, falseBB.idx, "F")
    fgContext.setBBEdge(trueBB.idx, postBB.idx)
    fgContext.setBBEdge(falseBB.idx, postBB.idx)
    
    currBB.branchTerminal = new BranchTerminal(node, test, trueBB, falseBB)

    // Lower true and false branches
    fgContext.setCurrentBB(trueBB)
    let trueRes: Identifier = this.lowerExprToBB(node.consequent, trueBB)
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(falseBB)
    let falseRes: Identifier = this.lowerExprToBB(node.alternate, falseBB)

    // Set PostBB
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB)

    // Return IV_ConditionalExpression
    return new IV_ConditionalExpression(node, test, IV_Identifier.from(trueRes, true), IV_Identifier.from(falseRes, true));
  }


  // *********************** Iridium_OptionalChaining ***********************

  handleOptionalChainExpression(parentNode: OptionalMemberExpression | OptionalCallExpression, existingState: { resID: IV_Identifier, fallthruBlock: BB, postBB: BB, callExprContext: boolean } | undefined = undefined) {

    let fgContext = this.getCurrentFGContext()

    // 
    // 1. Identify Terminal
    // 
    let isOptionalNode = (n: Node) => isOptionalCallExpression(n) || isOptionalMemberExpression(n);
    let getObjectToSpill = (n: OptionalCallExpression | OptionalMemberExpression) => isOptionalCallExpression(n) ? n.callee : n.object;
    // Genesis Node: A node whose "left"(obj/callee) Node is a non-optional node.
    //    * This serves as the base test for shortcircuiting.
    //    * This is expected to always be a optional=true node as chaining starts here.
    let getGenesisNode = (n: Node) => {
      if (isOptionalMemberExpression(n)) {
        if (isOptionalNode(n.object)) return getGenesisNode(n.object)
        else return n;
      } else if (isOptionalCallExpression(n)) {
        if (isOptionalNode(n.callee)) return getGenesisNode(n.callee)
        else return n;
      } else {
        debugConfig.logger.throwIriError("Genesis Node not found", [n])
      }
    };

    let genesisNode = getGenesisNode(parentNode);
    // Assert that genesisNode's optional field is always true
    if (!genesisNode.optional) {
      console.log("Node:", generate(parentNode).code);
      console.log("Genesis Node:", generate(genesisNode).code);
      debugConfig.logger.throwIriError("Optional field of the genesis node is always expected to be true!");
    }
    let objectToSpill: Expression | undefined = getObjectToSpill(genesisNode);

    // 
    // 2. Spill the genesis object part in the current scope 
    // 
    let genesisTestBB: BB, genesisTestTerminalBB: BB;

    // Base Case, initialize existing state for recursive calls
    if (!existingState) {
      let currBB = fgContext.getCurrentBB()
      let postBB = fgContext.declareBBNode(currBB.create())
      if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
      let fallthruBlock = new BlockBB(currBB.env, parentNode)
      fgContext.declareBBNode(fallthruBlock)
      genesisTestBB = new BlockBB(currBB.env, genesisNode)
      fgContext.declareBBNode(genesisTestBB)
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Set Edges
      fgContext.setBBEdge(currBB.idx, genesisTestBB.idx)
      fgContext.setBBEdge(fallthruBlock.idx, postBB.idx)
      
      // Declare chainResHolder in the starting BB
      let resID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("chainRes"))
      resID.isChainedValue = true
      // Create a declaration in the parent BB for resID
      currBB.statements.push(new IS_SimpleVarDecl(undefined, "let", resID, null))

      // Shortcircuit, set resID = undefined
      let fallthrough_assn = new IS_SimpleVarDecl(undefined, "let", new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined)), new IV_SimpleAssn(undefined, resID, new IV_Identifier(undefined, "undefined")))
      fallthruBlock.statements.push(fallthrough_assn)

      // Initialize State
      existingState = { resID, fallthruBlock, postBB, callExprContext: false }
    } else {
      genesisTestBB = fgContext.getCurrentBB()
    }

    genesisTestTerminalBB = genesisTestBB.create();
    fgContext.declareBBNode(genesisTestTerminalBB)

    let chainBB = new BlockBB(existingState.postBB.env, parentNode)
    fgContext.declareBBNode(chainBB)
    
    //    genesisTestBB --> genesisTestTerminalBB --TEST--> chainBB --GOTO--> postBB (contextual)
    //                                                |---> fallthruBlock (contextual) 
    fgContext.setBBEdge(genesisTestBB.idx, genesisTestTerminalBB.idx)
    fgContext.setBBEdge(genesisTestTerminalBB.idx, chainBB.idx, "T")
    fgContext.setBBEdge(genesisTestTerminalBB.idx, existingState.fallthruBlock.idx, "F")
    fgContext.setBBEdge(chainBB.idx, existingState.postBB.idx)

    // Set terminal
    let genesisTestRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("testRes"))
    genesisTestTerminalBB.branchTerminal = new BranchTerminal(parentNode, genesisTestRes, chainBB, existingState.fallthruBlock)

    // Lower Genesis Test
    fgContext.setCurrentBB(genesisTestBB)
    this.lowerExprToBB(objectToSpill, genesisTestBB, genesisTestRes)

    if (existingState.callExprContext) {
      let first = genesisTestBB.statements[0]
      if (first instanceof IS_SimpleVarDecl && first.RVal instanceof IV_Call && first.RVal.callee instanceof IV_Identifier) {
        first.RVal.staticThis = true;
        first.RVal.callee.isValue = true;
      } else {
        debugConfig.logger.throwIriError("Expected first statement of spilled node to be a IV_Call");
      }
    }

    existingState.callExprContext = isOptionalCallExpression(genesisNode)

    // Handle Chain condition
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(chainBB)

    // 
    // 3. Patch node and check for chain termination  
    // 

    let setLeft = (n: Node, r: Identifier) => {
      if (isOptionalCallExpression(n)) n.callee = r;
      else if (isOptionalMemberExpression(n)) n.object = r;
      else debugConfig.logger.throwIriError("Unexpected replace called on non optional node!")
    }

    let patchRecursively = (n: Node) => {
      if (isOptionalMemberExpression(n)) {
        return memberExpression(patchRecursively(n.object), n.property, n.computed, null)
      } else if (isOptionalCallExpression(n)) {
        return callExpression(patchRecursively(n.callee), n.arguments)
      } else {
        return n;
      }
    };
    let findAndPatch = (n: Node, toFind: Node, toReplaceWith: Identifier) => {
      if (n === toFind) {
        // 1. "left" of toFind is set to "toReplaceWith"
        setLeft(n, toReplaceWith);

        // 2. convert "toFind" node to non-optional node
        let res = patchRecursively(n)

        return { genesis: true, value: res };
      }

      if (isOptionalMemberExpression(n)) {
        let res = findAndPatch(n.object, toFind, toReplaceWith)
        // If I am optional = false, and genesis = true, get rid of optionalness
        if (n.optional === false && res.genesis === true) {
          return { genesis: true, value: memberExpression(res.value, n.property, n.computed, null) }
        } else {
          return { genesis: false, value: optionalMemberExpression(res.value, n.property, n.computed, n.optional) }
        }
      } else if (isOptionalCallExpression(n)) {
        let res = findAndPatch(n.callee, toFind, toReplaceWith)

        // If I am optional = false, and genesis = true, get rid of optionalness
        if (n.optional === false && res.genesis === true) {
          return { genesis: true, value: callExpression(res.value, n.arguments) }
        } else {
          return { genesis: false, value: optionalCallExpression(res.value, n.arguments, n.optional) }
        }
      } else {
        debugConfig.logger.throwIriError("findAndPatch, reached chain-end without reaching \"toFind\"")
      }
    };

    let { value: patchedNode } = findAndPatch(parentNode, genesisNode, identifier(genesisTestRes.name));

    // 
    // 5. Check if we have reached chain termination
    // 

    let containsOptionalNodeCheck = (node: Node) => {
      if (isOptionalMemberExpression(node)) {
        if (node.optional === true) return true
        else return containsOptionalNodeCheck(node.object)
      } else if (isOptionalCallExpression(node)) {
        if (node.optional === true) return true
        else return containsOptionalNodeCheck(node.callee)
      } else {
        return false;
      }
    };

    let containsOptionalNode = containsOptionalNodeCheck(patchedNode)

    if (!containsOptionalNode) { // Chain termination, all optional = true node were eliminated...

      // Get rid of all optional nodes
      patchedNode = patchRecursively(patchedNode);

      // Handle Chain termination.
      // resID = ...terminal_expr
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(chainBB)
      let resHolderID : Identifier = this.lowerExprToBB(patchedNode, chainBB)
      
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined)), new IV_SimpleAssn(undefined, existingState.resID, IV_Identifier.from(resHolderID))))
      
      // Retain context in base cases like : a = x.a?.()
      if (existingState.callExprContext) {
        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
        let first = fgContext.getCurrentBB().statements[0]
        if (first instanceof IS_SimpleVarDecl && first.RVal instanceof IV_Call && first.RVal.callee instanceof IV_Identifier) {
          first.RVal.staticThis = true;
          first.RVal.callee.isValue = true;
        } else {
          debugConfig.logger.throwIriError("Expected first statement of spilled node to be a IV_Call");
        }
      }

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(existingState.postBB)
      return existingState.resID
    } else {
      // Recursive case
      return this.handleOptionalChainExpression(patchedNode, existingState)
    }
  }

  // *********************** Iridium_AssignmentExpression ***********************
  handleJS3AssignmentExpression(node: JS3AssignmentExpression) {

    let left = node.left

    // case a.
    // ID = RVal
    if (isIdentifier(left)) {
      let LVal = new IV_Identifier(left, left.name)
      let RVal = this.handleJS3AssnInit(node.right)
      return new IV_SimpleAssn(node, LVal, RVal)
    }

    // case b.
    // ID.ID = RVal
    if (isJS3MemberExpression(left)) {
      let LValRes = this.handleJS3MemberExpression(left)
      let RVal = this.handleJS3AssnInit(node.right)

      if (LValRes instanceof IV_MemberExpressionPA) {
        return new IV_MemberAssn(node, LValRes, RVal)
      } else if (LValRes instanceof IV_ThisLookupPA) {
        return new IV_ThisAssn(node, LValRes, RVal)
      } else {
        return new IV_SuperAssn(node, LValRes, RVal)
      }
    }

    // case c.
    // [ ID, ...ID ] = RVal
    if (isJS3ArrayPattern(left)) {
      let LVal = left
      let RVal = this.handleJS3AssnInit(node.right)
      return new IV_ArrPatAssn(node, LVal, RVal)
    }

    // case d.
    // { TRIV_KEY: ID, ...ID } = RVal
    if (isJS3ObjectPattern(left)) {
      let LVal = left
      let RVal = this.handleJS3AssnInit(node.right)
      return new IV_ObjPatAssn(node, LVal, RVal);
    }


    debugConfig.logger.throwIriError("JS3AssignmentExpression: UNHANDLED")
    return;
  }

  // *********************** Iridium_BinaryExpression ***********************

  handleJS3BinaryExpression(node: JS3BinaryExpression) {
    let OPAs = ["+", "-", "/", "%", "*", "**"]
    let OPBs = ["&", "|", ">>", ">>>", "<<", "^"]
    let OPCs = ["==", "===", "!=", "!=="]
    let OPDs = ["in"]
    let OPEs = ["instanceof"]
    let OPFs = [">", "<", ">=", "<="]

    if (OPAs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_ABINOP(node, new IV_Identifier(node.left, node.left.name), new IV_Identifier(node.right, node.right.name), node.operator as OPA)
      } else debugConfig.logger.throwIriError(`Iridium: BINOP OPA expects left and right to be Identifiers`)
    }

    if (OPBs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_BBINOP(node, new IV_Identifier(node.left, node.left.name), new IV_Identifier(node.right, node.right.name), node.operator as OPB)
      } else debugConfig.logger.throwIriError(`Iridium: BINOP OPB expects left and right to be Identifiers`)
    }

    if (OPCs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_CBINOP(node, new IV_Identifier(node.left, node.left.name), new IV_Identifier(node.right, node.right.name), node.operator as OPC)
      } else debugConfig.logger.throwIriError(`Iridium: BINOP OPC expects left and right to be Identifiers`)
    }

    if (OPDs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_DBINOP(node, new IV_Identifier(node.left, node.left.name), new IV_Identifier(node.right, node.right.name), node.operator as OPD)
      } else if (isPrivateName(node.left) && isIdentifier(node.right)) {
        return new IV_DBINOP(node, new IV_PrivateName(node.left, new IV_Identifier(node.left.id, node.left.id.name)), new IV_Identifier(node.right, node.right.name), node.operator as OPD)

      } else debugConfig.logger.throwIriError(`Iridium: BINOP OPD expects left=(Identifier | JS3PrivateName) and right=(Identifier)`)
    }

    if (OPEs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_EBINOP(node, new IV_Identifier(node.left, node.left.name), new IV_Identifier(node.right, node.right.name), node.operator as OPE)
      } else debugConfig.logger.throwIriError(`Iridium: BINOP OPE expects left and right to be Identifiers`)
    }

    if (OPFs.includes(node.operator)) {
      if (isIdentifier(node.left) && isIdentifier(node.right)) {
        return new IV_FBINOP(node, new IV_Identifier(node.left, node.left.name), new IV_Identifier(node.right, node.right.name), node.operator as OPF)
      } else debugConfig.logger.throwIriError(`Iridium: BINOP OPF expects left and right to be Identifiers`)
    }

    debugConfig.logger.throwIriError("JS3BinaryExpression: UNHANDLED")
    return;
  }

  // *********************** Iridium_Call ***********************

  handleJS3CallExpression(node: JS3CallExpression) {
    let args: Array<IV_Identifier | ISP_ArgSpread> = new Array()

    for (let a of node.arguments) {
      if (isIdentifier(a)) {
        args.push(new IV_Identifier(a, a.name))
      } else {
        args.push(new ISP_ArgSpread(a, new IV_Identifier(a.argument, a.argument.name)))
      }
    }

    if (isJS3Import(node.callee)) {
      return new IV_ImportCall(node, args)
    } else if (isSuper(node.callee)) {
      return new IV_SuperCall(node, node.callee, args)
    } else if (isV8IntrinsicIdentifier(node.callee)) {
      return new IV_V8IntrinsicCall(node, node.callee, args)
    } else {
      let callee = new IV_Identifier(node.callee, node.callee.name);
      return new IV_Call(node, false, callee, args)
    }
  }

  handleJS3ContextualCallExpression(node: JS3ContextualCallExpression) {
    let LVal = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("ccallCallee"))
    LVal.isValue = true;
    let RVal = this.handleJS3AssnInit(node.callee)
    let stmt = new IS_SimpleVarDecl(undefined, "let", LVal, RVal)

    let fgContext = this.getCurrentFGContext()
    let currBB = fgContext.getCurrentBB()
    currBB.statements.push(stmt)

    let args: Array<IV_Identifier | ISP_ArgSpread> = new Array()

    for (let a of node.arguments) {
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      
      let currBB = fgContext.getCurrentBB()
      let argSpillBB = new BlockBB(currBB.env, a)
      fgContext.declareBBNode(argSpillBB)
      let postBB = fgContext.declareBBNode(currBB.create())
      if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, argSpillBB.idx)
      fgContext.setBBEdge(argSpillBB.idx, postBB.idx)

      let toSpill: JS3ContainedExprKey
      if (isSpreadElement(a)) {
        toSpill = a.argument
      } else {
        toSpill = a
      }

      fgContext.setCurrentBB(argSpillBB)
      let resholderID: Identifier = this.lowerExprToBB(toSpill, argSpillBB)
      let resHolder: IV_Identifier = IV_Identifier.from(resholderID)
      resHolder.isValue = true

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)

      if (isSpreadElement(a)) {
        args.push(new ISP_ArgSpread(generateJS3SpreadElement(resholderID, a), resHolder))
      } else {
        args.push(resHolder)
      }
    }
    return new IV_Call(node, true, LVal, args)
  }


  // *********************** Iridium_This ***********************

  handleThisExpression(node: ThisExpression) {
    return new IV_This(node);
  }

  // *********************** Iridium_YIELD_AWAIT ***********************

  handleJS3YieldExpression(node: JS3YieldExpression) {
    if (node.argument) {
      return new IV_YIELD(node, new IV_Identifier(node.argument, node.argument.name))
    } else {
      return new IV_YIELD(node)
    }
  }

  handleJS3AwaitExpression(node: JS3AwaitExpression) {
    return new IV_AWAIT(node, new IV_Identifier(node.argument, node.argument.name))
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
    return IV_TemplateLiteral.from(node)
  }

  handleJS3TaggedTemplateExpression(node: JS3TaggedTemplateExpression) {
    if (isIdentifier(node.tag)) {
      return new IV_TaggedTemplateCall(node, new IV_Identifier(node.tag, node.tag.name), this.handleJS3TemplateLiteral(node.quasi))
    } else {
      return new IV_TaggedTemplateCall(node, this.handleJS3MemberExpression(node.tag), this.handleJS3TemplateLiteral(node.quasi))
    }
  }

  // *********************** Iridium_Regexp ***********************

  handleJS3RegExpLiteral(init: JS3RegExpLiteral) {
    return new IV_Regexp(init, init.pattern, init.flags);
  }

  // *********************** STATEMENTS ***********************


  // *********************** Iridium_SwitchStatement ***********************
  handleJS3SwitchStatement(stmt: JS3SwitchStatement) {
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let switchBodyBB = new SwitchBodyBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(switchBodyBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, switchBodyBB.idx)
    fgContext.setBBEdge(switchBodyBB.idx, postBB.idx)

    let switchStmtTest: Identifier = stmt.discriminant;
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(switchBodyBB)
    for (let c of stmt.cases) {
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")

      // Declare nodes and forward successors
      let currBB = fgContext.getCurrentBB()
      let caseTestBB = new BlockBB(currBB.env, c)
      fgContext.declareBBNode(caseTestBB)
      let caseTestTerminalBB = caseTestBB.create()
      fgContext.declareBBNode(caseTestTerminalBB)
      let caseBody = new BlockBB(currBB.env, c)
      fgContext.declareBBNode(caseBody)
      let postBB = fgContext.declareBBNode(currBB.create())
      if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, caseTestBB.idx)
      fgContext.setBBEdge(caseTestBB.idx, caseTestTerminalBB.idx)
      fgContext.setBBEdge(caseTestTerminalBB.idx, caseBody.idx, "T")
      fgContext.setBBEdge(caseTestTerminalBB.idx, postBB.idx, "F")
      fgContext.setBBEdge(caseBody.idx, postBB.idx)

      let testResult = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("testResult"))
      caseTestTerminalBB.branchTerminal = new BranchTerminal(c, testResult, caseBody, postBB)

      // Lower Body
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(caseBody)
      this.handleJS3ProgramBody(c.consequent)

      // Lower Test?
      if (c.test) {
        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
        fgContext.setCurrentBB(caseTestBB)
        let caseID: Identifier = this.lowerExprToBB(c.test, caseTestBB)
        let comparison = new IV_CBINOP(undefined, IV_Identifier.from(switchStmtTest), IV_Identifier.from(caseID), "===")
        let finDecl = new IS_SimpleVarDecl(undefined, "let", testResult, comparison)
        if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
        fgContext.getCurrentBB().statements.push(finDecl)
      } else {
        let finDecl = new IS_SimpleVarDecl(undefined, "let", testResult, new IV_BooleanLiteral(undefined, true))
        caseTestBB.statements.push(finDecl)
      }

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)
    }

    // Restore postBB context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB)
  }

  // *********************** Iridium_DoWhileStatement ***********************
  handleJS3DoWhileStatement(stmt: JS3DoWhileStatement) {
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let testBodyBB = new LoopHeadBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(testBodyBB)
    let testBodyTerminalBB = testBodyBB.create()
    fgContext.declareBBNode(testBodyTerminalBB)
    let loopBodyBB = new BlockBB(new Environment(currBB.env), stmt.body)
    fgContext.declareBBNode(loopBodyBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    let testIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("loopTest"))
    testIV.isValue = true

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, loopBodyBB.idx)
    fgContext.setBBEdge(loopBodyBB.idx, testBodyBB.idx)
    fgContext.setBBEdge(testBodyBB.idx, testBodyTerminalBB.idx)
    fgContext.setBBEdge(testBodyTerminalBB.idx, loopBodyBB.idx, "T")
    fgContext.setBBEdge(testBodyTerminalBB.idx, postBB.idx, "F")

    testBodyTerminalBB.branchTerminal = new BranchTerminal(stmt, testIV, loopBodyBB, postBB)

    // Lower Test
    fgContext.setCurrentBB(testBodyBB)
    this.lowerExprToBB(stmt.test, testBodyBB, testIV)

    // Lower body
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(loopBodyBB)
    stmt.body.body.forEach(s => this.handleJS3AllowedProgStatement(s))

    // Restore postBB context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB)
  }

  // *********************** Iridium_ForStatement***********************
  handleJS3ForStatement(stmt: JS3ForStatement) {
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let initBB = new ForLoopInitBB(new Environment(currBB.env), stmt.init)
    fgContext.declareBBNode(initBB)
    let testBodyBB = new LoopHeadBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(testBodyBB)
    let testBodyTerminalBB = testBodyBB.create()
    fgContext.declareBBNode(testBodyTerminalBB)
    let updateBB = new BlockBB(initBB.env, stmt.update)
    fgContext.declareBBNode(updateBB)
    let loopBodyBB = new BlockBB(new Environment(initBB.env), stmt.body)
    fgContext.declareBBNode(loopBodyBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    let testIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("loopTest"))
    testIV.isValue = true

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, initBB.idx)
    fgContext.setBBEdge(initBB.idx, testBodyBB.idx)
    fgContext.setBBEdge(testBodyBB.idx, testBodyTerminalBB.idx)
    fgContext.setBBEdge(testBodyTerminalBB.idx, loopBodyBB.idx, "T")
    fgContext.setBBEdge(testBodyTerminalBB.idx, postBB.idx, "F")
    fgContext.setBBEdge(loopBodyBB.idx, updateBB.idx)
    fgContext.setBBEdge(updateBB.idx, testBodyBB.idx)

    // Set Test Terminal
    testBodyTerminalBB.branchTerminal = new BranchTerminal(stmt, testIV, loopBodyBB, postBB)

    // Set update context
    testBodyBB.updateContext = updateBB
    testBodyTerminalBB.updateContext = updateBB

    // Lower Init
    if (isJS3LoopDeclaration(stmt.init)) {
      // Simplify Declarations into JS3
      let kind = stmt.init.kind
      let otherProps = this.js3builder.utils
      let js3SpillHolder: JS3BlockStatement_body = new Array()
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }
      let generator = (LVal: JS3MemberExpression | JS3ArrayPattern | JS3ObjectPattern | Identifier, RVal: null | JS3VariableDeclarator_init) => {
        if (isJS3MemberExpression(LVal)) debugConfig.logger.log("LVal cannot be JS3MemberExpression in case of variable declarator...")
        else {
          let declarator = generateJS3VariableDeclaratorfromBaseNode(LVal, RVal, null, stmt.init)
          return generateJS3VariableDeclarationfromBaseNode([declarator], kind, null, stmt.init)
        }
      }
      // Lower into individual statements
      for (let d of stmt.init.declarations) {
        handleDeclaratorRec(d.id, d.init, updatedProps, generator, false);
      }
      // lower into Init BB
      fgContext.setCurrentBB(initBB)
      this.handleJS3ProgramBody(js3SpillHolder)
    } else if (isJS3ContainedExprKey(stmt.init)) {
      // lower into Init BB
      fgContext.setCurrentBB(initBB)
      this.lowerExprToBB(stmt.init, initBB)
    }

    // Lower Test
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(testBodyBB)
    if (stmt.test) this.lowerExprToBB(stmt.test, testBodyBB, testIV)
    else {
      testBodyBB.statements.push(new IS_SimpleVarDecl(undefined, "let", testIV, new IV_BooleanLiteral(undefined, true)))
    }

    // Lower Body
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(loopBodyBB)
    stmt.body.body.forEach(s => this.handleJS3AllowedProgStatement(s))

    // Lower Update
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(updateBB)
    if (stmt.update) this.lowerExprToBB(stmt.update, updateBB)

    // Restore PostBB context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB)
  }

  // *********************** Iridium_ForInOfstatement ***********************
  handleJS3ForInOfStatement(stmt: JS3ForInStatement | JS3ForOfStatement) {
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let initBB = new ForInOfLoopInitBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(initBB)
    let testBB = new LoopHeadBB(new Environment(initBB.env), stmt)
    fgContext.declareBBNode(testBB)
    let loopBodyBB = new BlockBB(new Environment(testBB.env), stmt.body)
    fgContext.declareBBNode(loopBodyBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    let testIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("loopTest"))
    testIV.isValue = true

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, initBB.idx)
    fgContext.setBBEdge(initBB.idx, testBB.idx)
    fgContext.setBBEdge(testBB.idx, loopBodyBB.idx, "T")
    fgContext.setBBEdge(testBB.idx, postBB.idx, "F")
    fgContext.setBBEdge(loopBodyBB.idx, testBB.idx)

    // Initialize Terminal
    testBB.branchTerminal = new BranchTerminal(stmt, testIV, loopBodyBB, postBB)

    // Init loop iterator
    // let iteratorIV = <InOp> in RVal | <OfOp> of RVal
    let inop: IV_InIterator | IV_OfIterator;
    if (isJS3ForInStatement(stmt)) inop = new IV_InIterator(stmt, IV_Identifier.from(stmt.right))
    else inop = new IV_OfIterator(stmt, IV_Identifier.from(stmt.right))
    let iteratorIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
    initBB.statements.push(new IS_SimpleVarDecl(undefined, "let", iteratorIV, inop))

    // Init Test BB
    // let testIV = <HasLoopNext> hasnext iteratorIV
    let hasLoopNext = new IV_HasLoopNext(stmt, iteratorIV)
    let testStmt = new IS_SimpleVarDecl(undefined, "let", testIV, hasLoopNext)
    testBB.statements.push(testStmt)

    // Loop Body BB
    // 1. Get next iterator value
    // let nextResHolder = <LoopNext> next iteratorIV
    let getNext = new IV_LoopNext(stmt, iteratorIV)
    let nextResHolder = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
    let nextResStmt = new IS_SimpleVarDecl(undefined, "let", nextResHolder, getNext)
    loopBodyBB.statements.push(nextResStmt)


    // 2. Generate bindings (or) perform assignments
    // for (let a of xx) ===> let a = nextOf(xx)
    // for (a of xx) ===> a = nextOf(xx)
    // for ([a, { b : c }] of xx) ===> [a, t1] = nextOf(xx); { b: c } = t1;
    fgContext.setCurrentBB(loopBodyBB) 
    if (isJS3LoopDeclaration(stmt.left)) {
      // Simplify Declarations into JS3
      let kind = stmt.left.kind
      let otherProps = this.js3builder.utils
      let js3SpillHolder: JS3BlockStatement_body = new Array()
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }

      let generator = (LVal: JS3MemberExpression | JS3ArrayPattern | JS3ObjectPattern | Identifier, RVal: null | JS3VariableDeclarator_init) => {
        if (isJS3MemberExpression(LVal)) debugConfig.logger.log("LVal cannot be JS3MemberExpression in case of variable declarator...")
        else {
          let declarator = generateJS3VariableDeclaratorfromBaseNode(LVal, RVal, null, stmt.left)
          return generateJS3VariableDeclarationfromBaseNode([declarator], kind, null, stmt.left)
        }
      }

      // Ideally we expect this to be only 1...
      if (stmt.left.declarations.length !== 1) debugConfig.logger.throwIriError("For loop test declaration LValue has more than one declaration")

      // Lower into individual statements
      for (let d of stmt.left.declarations) {
        // KIND declarationID = nextOf(xx)
        handleDeclaratorRec(d.id, identifier(nextResHolder.name), updatedProps, generator, false);
      }

      // lower into BB
      this.handleJS3ProgramBody(js3SpillHolder)
    } else {
      // Simplify Declarations into JS3
      let otherProps = this.js3builder.utils
      let js3SpillHolder: JS3BlockStatement_body = new Array()
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }

      let tempGen = this.js3builder.utils.getNewTemporary

      let generator = (LVal: JS3MemberExpression | JS3ArrayPattern | JS3ObjectPattern | Identifier, RVal: null | JS3VariableDeclarator_init) => {
        if (RVal === null || RVal === undefined) debugConfig.logger.throwJS3Error("In assignment expression RVal is not expected to be a null | undefined node...")
        let rr = generateJS3AssignmentExpressionfromBaseNode("=", LVal, RVal, stmt.left);
        return generateDummyJS3VariableDeclaration(stmt.left, generateIdentifier(stmt.left, tempGen("throwaway")), rr, "let", null, null);
      }

      // Generate assignments
      let lval = stmt.left
      let rval = identifier(nextResHolder.name)
      
      // KIND lvalExpr = nextOf(xx)
      handleDeclaratorRec(lval, rval, updatedProps, generator, true);

      // lower into BB
      this.handleJS3ProgramBody(js3SpillHolder)
    }

    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    stmt.body.body.forEach(s => this.handleJS3AllowedProgStatement(s))

    // Restore BB Context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")  
    fgContext.setCurrentBB(postBB)
  }

  // *********************** Iridium_LabeledStatement ***********************
  handleJS3LabeledStatement(stmt: JS3LabeledStatement) {
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let blockScopeBB = new BlockBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(blockScopeBB)
    blockScopeBB.setLabel(IV_Identifier.from(stmt.label))
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, blockScopeBB.idx)
    fgContext.setBBEdge(blockScopeBB.idx, postBB.idx)

    // Lower Code
    fgContext.setCurrentBB(blockScopeBB)
    this.handleJS3AllowedProgStatement(stmt.body)

    // Restore Context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB)
  }

  // *********************** Iridium_BlockStatement ***********************
  handleJS3BlockStatement(stmt: JS3BlockStatement) {
    let fgContext = this.getCurrentFGContext()

    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let blockScopeBB = new BlockBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(blockScopeBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, blockScopeBB.idx)
    fgContext.setBBEdge(blockScopeBB.idx, postBB.idx)

    // Lower Code
    fgContext.setCurrentBB(blockScopeBB)
    this.handleJS3ProgramBody(stmt.body)

    // Restore Context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB)
  }

  // *********************** Iridium_ContinueStatement ***********************
  handleJS3ContinueStatement(stmt: JS3ContinueStatement) {
    let fgContext = this.getCurrentFGContext()
    let currBB = fgContext.getCurrentBB()
    if (isIdentifier(stmt.label)) {
      let lbreakstmt = new IS_LContinue(stmt, IV_Identifier.from(stmt.label))
      currBB.statements.push(lbreakstmt)
    } else {
      let unlbreakstmt = new IS_Continue(stmt)
      currBB.statements.push(unlbreakstmt);
    }
  }

  // *********************** Iridium_Break_LBreak ***********************
  handleJS3BreakStatement(stmt: JS3BreakStatement) {
    let fgContext = this.getCurrentFGContext()
    let currBB = fgContext.getCurrentBB()
    if (isIdentifier(stmt.label)) {
      let lbreakstmt = new IS_LBreak(stmt, IV_Identifier.from(stmt.label))
      currBB.statements.push(lbreakstmt)
    } else {
      let unlbreakstmt = new IS_Break(stmt)
      currBB.statements.push(unlbreakstmt);
    }
  }

  // *********************** Iridium_WhileStatement ***********************
  handleJS3WhileStatement(stmt: JS3WhileStatement) {
    let fgContext = this.getCurrentFGContext()
      
    // Declare nodes and forward successors
    let currBB = fgContext.getCurrentBB()
    let testBodyBB = new LoopHeadBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(testBodyBB)
    let testBodyTerminalBB = testBodyBB.create()
    fgContext.declareBBNode(testBodyTerminalBB)
    let loopBodyBB = new BlockBB(new Environment(currBB.env), stmt)
    fgContext.declareBBNode(loopBodyBB)
    let postBB = fgContext.declareBBNode(currBB.create())
    if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
    fgContext.forwardSuccessorsBB(currBB, postBB)

    // Draw Edges
    fgContext.setBBEdge(currBB.idx, testBodyBB.idx)
    fgContext.setBBEdge(testBodyBB.idx, testBodyTerminalBB.idx) // This will ensure we never forward successors of a BB whose branch terminal is already set
    fgContext.setBBEdge(testBodyTerminalBB.idx, loopBodyBB.idx, "T")
    fgContext.setBBEdge(testBodyTerminalBB.idx, postBB.idx, "F")
    fgContext.setBBEdge(loopBodyBB.idx, testBodyBB.idx)

    // Set Terminal
    let test: IV_Identifier = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("whileTestRes"))
    test.isValue = true
    testBodyTerminalBB.branchTerminal = new BranchTerminal(stmt, test, loopBodyBB, postBB)

    // Lower While Loop Test
    this.lowerExprToBB(stmt.test, testBodyBB, test)

    // Lower While Loop Body
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(loopBodyBB)
    stmt.body.body.forEach(s => this.handleJS3AllowedProgStatement(s))

    // Restore postBB Context
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    fgContext.setCurrentBB(postBB);
  }

  // *********************** Iridium_TryStatement ***********************

  handleJS3TryStatement(stmt: JS3TryStatement) {
    if (stmt.handler && !stmt.finalizer) {
      // Case a. 
      //   try { BLOCK } catch(?ID) { HANDLER }

      let fgContext = this.getCurrentFGContext()
      
      // Declare nodes and forward successors
      let currBB = fgContext.getCurrentBB()
      let tryBlockBB = new TryBB(new Environment(currBB.env), stmt)
      fgContext.declareBBNode(tryBlockBB)
      let catchHandlerBB = new CatchBB(new Environment(currBB.env), stmt.handler, stmt.handler.param ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name) : undefined)
      fgContext.declareBBNode(catchHandlerBB)
      let postBB = fgContext.declareBBNode(currBB.create())
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, tryBlockBB.idx)
      fgContext.setBBEdge(tryBlockBB.idx, catchHandlerBB.idx, "E")
      fgContext.setBBEdge(tryBlockBB.idx, postBB.idx)
      fgContext.setBBEdge(catchHandlerBB.idx, postBB.idx)

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(tryBlockBB)
      stmt.block.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(catchHandlerBB)
      stmt.handler.body.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)
      return;
    }

    if (!stmt.handler && stmt.finalizer) {
      // Case b.
      //   try { BLOCK } finally { FINALIZER }
      let fgContext = this.getCurrentFGContext()
      
      // Declare nodes and forward successors
      let currBB = fgContext.getCurrentBB()
      let tryBlockBB = new TryBB(new Environment(currBB.env), stmt)
      fgContext.declareBBNode(tryBlockBB)
      let finalizerHandlerBB = new BlockBB(new Environment(currBB.env), stmt.finalizer)
      fgContext.declareBBNode(finalizerHandlerBB)
      let postBB = fgContext.declareBBNode(currBB.create())
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, tryBlockBB.idx)
      fgContext.setBBEdge(tryBlockBB.idx, finalizerHandlerBB.idx)
      fgContext.setBBEdge(finalizerHandlerBB.idx, postBB.idx)

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(tryBlockBB)
      stmt.block.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(finalizerHandlerBB)
      stmt.finalizer.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)
      return;
    }

    if (stmt.handler && stmt.finalizer) {
      // Case c.
      //   try { BLOCK } catch { HANDLER } finally { FINALIZER }

      let fgContext = this.getCurrentFGContext()
      
      // Declare nodes and forward successors
      let currBB = fgContext.getCurrentBB()
      let tryBlockBB = new TryBB(new Environment(currBB.env), stmt)
      fgContext.declareBBNode(tryBlockBB)
      let catchHandlerBB = new CatchBB(new Environment(currBB.env), stmt.handler, stmt.handler.param ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name) : undefined)
      fgContext.declareBBNode(catchHandlerBB)
      let finalizerHandlerBB = new BlockBB(new Environment(currBB.env), stmt.finalizer)
      fgContext.declareBBNode(finalizerHandlerBB)
      let postBB = fgContext.declareBBNode(currBB.create())
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, tryBlockBB.idx)
      fgContext.setBBEdge(tryBlockBB.idx, catchHandlerBB.idx, "E")
      fgContext.setBBEdge(tryBlockBB.idx, finalizerHandlerBB.idx)
      fgContext.setBBEdge(catchHandlerBB.idx, finalizerHandlerBB.idx)
      fgContext.setBBEdge(finalizerHandlerBB.idx, postBB.idx)

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(tryBlockBB)
      stmt.block.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(catchHandlerBB)
      stmt.handler.body.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(finalizerHandlerBB)
      stmt.finalizer.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)
      return;
    }

    debugConfig.logger.throwIriError("JS3TryStatement: UNHANDLED")
    return;
  }

  // *********************** Iridium_IfStatement ***********************

  handleJS3IfStatement(stmt: JS3IfStatement) {
    if (!stmt.alternate) {
      // Case a.
      // if (ID) { CONSEQ }
      let fgContext = this.getCurrentFGContext()
      
      // Declare nodes and forward successors
      let currBB = fgContext.getCurrentBB()
      let trueBB = new BlockBB(new Environment(currBB.env))
      fgContext.declareBBNode(trueBB)
      let postBB = fgContext.declareBBNode(currBB.create())
      if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, trueBB.idx, "T")
      fgContext.setBBEdge(currBB.idx, postBB.idx, "F")
      fgContext.setBBEdge(trueBB.idx, postBB.idx)

      // Set Terminals
      currBB.branchTerminal = new BranchTerminal(stmt, IV_Identifier.from(stmt.test), trueBB, postBB)

      // Lower Consequent
      fgContext.setCurrentBB(trueBB)
      stmt.consequent.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      // Restore BB Context
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)
    } else {
      // Case a.
      // if (ID) { CONSEQ } else { ALT }
      let fgContext = this.getCurrentFGContext()
      
      // Declare nodes and forward successors
      let currBB = fgContext.getCurrentBB()
      let trueBB = new BlockBB(new Environment(currBB.env))
      fgContext.declareBBNode(trueBB)
      let falseBB = new BlockBB(new Environment(currBB.env))
      fgContext.declareBBNode(falseBB)
      let postBB = fgContext.declareBBNode(currBB.create())
      if (currBB.branchTerminal) debugConfig.logger.throwIriError("Forwarding successors while branch terminal is already set")
      fgContext.forwardSuccessorsBB(currBB, postBB)

      // Draw Edges
      fgContext.setBBEdge(currBB.idx, trueBB.idx, "T")
      fgContext.setBBEdge(currBB.idx, falseBB.idx, "F")
      fgContext.setBBEdge(trueBB.idx, postBB.idx)
      fgContext.setBBEdge(falseBB.idx, postBB.idx)
      // 
      // currBB ----> trueBB  --|---> postBB
      //          |-> falseBB --| 
      // 

      // Set Terminals
      currBB.branchTerminal = new BranchTerminal(stmt, IV_Identifier.from(stmt.test), trueBB, falseBB)

      // Lower Consequent
      fgContext.setCurrentBB(trueBB)
      stmt.consequent.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      // Lower Alternate 
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(falseBB)
      stmt.alternate.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      // Restore BB Context
      if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
      fgContext.setCurrentBB(postBB)
    }
  }

  // *********************** Iridium_FunctionDeclaration *********************** 

  handleJS3FunctionDeclaration(stmt: JS3FunctionDeclaration) {
    let fgContext = this.getCurrentFGContext()

    let curr = fgContext.getCurrentBB()
    let [params, funBody, fCon] = this.handleFunctionParams(stmt.params, this.handleFunctionBody(stmt.body))
    if (this.getCurrentFGContext() !== fgContext) debugConfig.logger.throwIriError("FG Context not expected to change")
    
    fgContext.setCurrentBB(curr)
    curr.statements.push(new IS_FunDecl(stmt, params, fCon, new IV_Identifier(stmt.id, stmt.id.name), stmt.generator, stmt.async))
  }

  // *********************** Iridium_VariableDeclarations ***********************  

  handleJS3VariableDeclaration(stmt: JS3VariableDeclaration) {
    // Assert that only one specifier exists
    if (stmt.kind === "using" || stmt.kind === "await using") {
      debugConfig.logger.throwIriError("JS3VariableDeclaration: 'using' and 'await using' not supported in JS3")
      return;
    }

    // Assert that only one specifier exists
    if (stmt.declarations.length !== 1) {
      debugConfig.logger.throwIriError("JS3VariableDeclaration: expecting exactly one declaration in JS3")
      return;
    }

    let declaration = stmt.declarations[0]
    let KIND: IS_VAR_DECL_KIND = stmt.kind

    // case a.
    // KIND ID = RVal
    if (isIdentifier(declaration.id)) {
      let LVal = new IV_Identifier(declaration.id, declaration.id.name)
      let RVal = declaration.init ? this.handleJS3AssnInit(declaration.init) : null
      this.getCurrentFGContext().getCurrentBB().statements.push(new IS_SimpleVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    // case b.
    // KIND [ ID, ...ID ] = RVal
    if (isJS3ArrayPattern(declaration.id)) {
      let LVal = declaration.id
      let RVal = declaration.init ? this.handleJS3AssnInit(declaration.init) : null
      this.getCurrentFGContext().getCurrentBB().statements.push(new IS_ArrPatVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    // case c.
    // KIND { TRIV_KEY: ID, ...ID } = RVal
    if (isJS3ObjectPattern(declaration.id)) {

      let LVal = declaration.id
      let RVal = declaration.init ? this.handleJS3AssnInit(declaration.init) : null
      this.getCurrentFGContext().getCurrentBB().statements.push(new IS_ObjPatVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    debugConfig.logger.throwIriError("JS3VariableDeclaration: UNHANDLED")
    return;
  }


  // *********************** Iridium_Debugger_Return_Throw ***********************  

  handleJS3ThrowStatement(stmt: JS3ThrowStatement) {
    let currBB = this.getCurrentFGContext().getCurrentBB()
    // throw ID
    currBB.statements.push(new IS_Throw(stmt, new IV_Identifier(stmt.argument, stmt.argument.name)))
  }

  handleJS3ReturnStatement(stmt: JS3ReturnStatement) {
    let currBB = this.getCurrentFGContext().getCurrentBB()
    // return | return ID
    if (stmt.argument) {
      currBB.statements.push(new IS_Return(stmt, new IV_Identifier(stmt.argument, stmt.argument.name)))
    } else {
      currBB.statements.push(new IS_Return(stmt, null))
    }
  }

  handleJS3DebuggerStatement(stmt: JS3DebuggerStatement) {
    let currBB = this.getCurrentFGContext().getCurrentBB()
    // debugger; 
    currBB.statements.push(new IS_Debugger())
  }

  // *********************** Iridium_Imports_Exports ***********************  

  handleJS3ImportDeclaration(stmt: JS3ImportDeclaration) {
    let currBB = this.getCurrentFGContext().getCurrentBB()

    // case a.
    // import "FROM"
    if (stmt.specifiers.length === 0) {
      currBB.statements.push(new IS_AImport(stmt, new IV_StringLiteral(stmt.source, stmt.source.value)))
      return;
    }

    // Assert that only one specifier exists
    if (stmt.specifiers.length !== 1) {
      debugConfig.logger.throwIriError("JS3ImportDeclaration: Expected a single specifier in JS3")
      return;
    }

    let specifier = stmt.specifiers[0]

    // case b.
    // import { X as Y } from "FROM"
    if (isImportSpecifier(specifier)) {
      let remote: IV_Identifier | IV_StringLiteral
      if (isIdentifier(specifier.imported)) {
        remote = new IV_Identifier(specifier.imported, specifier.imported.name)
      } else {
        remote = new IV_StringLiteral(specifier.imported, specifier.imported.value)
      }
      let local = new IV_Identifier(specifier.local, specifier.local.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      currBB.statements.push(new IS_BImport(stmt, remote, local, FROM));
      return;
    }

    // case c.
    // import * as X from "FROM"
    else {
      let local = new IV_Identifier(specifier.local, specifier.local.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      currBB.statements.push(new IS_CImport(stmt, local, FROM));
      return;
    }
  }

  handleJS3ExportDefaultDeclaration(stmt: JS3ExportDefaultDeclaration) {
    let currBB = this.getCurrentFGContext().getCurrentBB()
    // export default ID
    currBB.statements.push(new IS_AExport(stmt, new IV_Identifier(stmt.declaration, stmt.declaration.name)))
  }

  handleJS3ExportNamedDeclaration(stmt: JS3ExportNamedDeclaration) {
    let currBB = this.getCurrentFGContext().getCurrentBB()

    // Assert that only one specifier exists
    if (stmt.specifiers.length !== 1) {
      debugConfig.logger.throwIriError("JS3ExportNamedDeclaration: Expected a single specifier in JS3")
      return;
    }

    let specifier = stmt.specifiers[0]

    if (isJS3ExportSpecifier(specifier) && !isStringLiteral(stmt.source)) {
      // case a.
      // export {LOCAL as REMOTE}
      let local = new IV_Identifier(specifier.local, specifier.local.name)
      let remote: IV_Identifier | IV_StringLiteral
      if (isIdentifier(specifier.exported)) {
        remote = new IV_Identifier(specifier.exported, specifier.exported.name)
      } else {
        remote = new IV_StringLiteral(specifier.exported, specifier.exported.value)
      }
      currBB.statements.push(new IS_BExport(stmt, local, remote))
      return;
    }

    if (isJS3ExportSpecifier(specifier) && isStringLiteral(stmt.source)) {
      // case b.
      // export {LOCAL as REMOTE} from FROM
      let local = new IV_Identifier(specifier.local, specifier.local.name)
      let remote: IV_Identifier | IV_StringLiteral
      if (isIdentifier(specifier.exported)) {
        remote = new IV_Identifier(specifier.exported, specifier.exported.name)
      } else {
        remote = new IV_StringLiteral(specifier.exported, specifier.exported.value)
      }
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      currBB.statements.push(new IS_CExport(stmt, local, remote, FROM))
      return;
    }

    if (isJS3ExportNamespaceSpecifier(specifier) && isIdentifier(specifier.exported)) {
      // case c.
      // export * as REMOTE FROM
      let remote = new IV_Identifier(specifier.exported, specifier.exported.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      currBB.statements.push(new IS_DExport(stmt, remote, FROM))
      return;
    }

    debugConfig.logger.throwIriError("JS3ExportNamedDeclaration: UNHANDLED")
    return;
  }

  handleJS3ExportAllDeclaration(stmt: JS3ExportAllDeclaration) {
    let currBB = this.getCurrentFGContext().getCurrentBB()
    let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
    currBB.statements.push(new IS_EExport(stmt, FROM))
  }
}

export class IRI_ERROR {
  msg: string
  objs: Array<any>
  constructor(msg: string, objs: Array<any> = []) {
    this.msg = msg
    this.objs = objs
  }
}

export class JS3_ASSERTION_FAILED extends IRI_ERROR {
  constructor(msg: string, objs: Array<any>) {
    super(msg, objs);
  }
}
