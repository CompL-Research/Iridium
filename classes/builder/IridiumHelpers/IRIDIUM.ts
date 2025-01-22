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
import { BB, BlockBB, BranchTerminal, CatchBB, ClassInitBB, ClassPropInitBB, ClassPropInitExit, ClassStaticBB, ClassStaticExit, ContainedBB, ContainedOptionalChainBB, ExitNode, ForInOfLoopInitBB, ForLoopInitBB, FunctionArgInitBB, FunctionBB, GotoFunctionBody, ModuleBB, OptionalBranchTerminal, ScriptBB, SwitchBodyBB, SwitchCaseTerminal, TryBB, TryCatchConditionalGoto, UnconditionalGoto } from "./BB.ts";
import { I_File } from "./I_GENERAL/I_File.ts";
import { Environment } from "./I_GENERAL/I_Scope.ts";
import { initializeEnvDefs } from "./Passes/EnvInit.ts";
import { populatePreds } from "./Passes/PopulatePreds.ts";
import { cleanupBBs } from "./Passes/BBCleanup.ts";

const generate = _generate.default

export class IRIDIUM_FG {
  bb: BB

  constructor(bb: BB) { this.bb = bb; }
}

export function printScopedSpace(space) {
  let res = "";
  for (let i = 0; i < space; i++) {
    res += (i >= 4 && (i % 2 === 0)) ? "░" : " "
  }
  return res;
}

export function printSpace(space) {
  let res = "";
  for (let i = 0; i < space; i++) {
    res += " "
  }
  return res;
}

export default class IRIDIUM {
  js3builder: JS3Builder
  node: JS3Program
  currentBB: BB
  envContext: Array<Environment>

  // Static Constructor
  static create(js3builder: JS3Builder) {
    return new I_File(js3builder)
  }

  constructor(js3builder: JS3Builder) {
    this.node = js3builder.generatedAST.program
    this.js3builder = js3builder
    this.initialize();
  }

  // Start CFG Construction
  initialize() {
    let MAIN_ENV = new Environment(undefined)
    if (this.node.sourceType === "module") {
      let bb = new ModuleBB(MAIN_ENV, this.node)
      bb.terminal = new ExitNode()
      this.setCurrentBB(bb);
    } else {
      let bb = new ScriptBB(MAIN_ENV, this.node)
      bb.terminal = new ExitNode()
      this.setCurrentBB(bb);
    }
  }

  // Start Building Iridium Flowgraph
  build() {
    let body = new IRIDIUM_FG(this.currentBB)
    this.handleJS3ProgramBody(this.node.body)
    populatePreds(body.bb)
    console.log(body.bb.toString())
    
    cleanupBBs(body.bb)
    initializeEnvDefs(body.bb)

    return body
  }

  // Set/Get current BB
  setCurrentBB(bb: BB) { this.currentBB = bb; }
  getCurrentBB() { return this.currentBB; }

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

    this.setCurrentBB(block)
    this.handleJS3ProgramBody(js3SpillHolder)

    // resID = ...exprRes
    if (resID)
      this.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", resID, new IV_Identifier(exprRes, exprRes.name)));

    return exprRes;
  }

  //
  // *********************** Functions Related Lowering ***********************
  //
  handleFunctionParams(params: Array<JS3AllowedFunctionArgs>, functionBody: FunctionBB): [Array<IV_Identifier | ISP_RestElement>, FunctionArgInitBB] {
    let oldBB = this.getCurrentBB()
    let fin_args: Array<IV_Identifier | ISP_RestElement> = []


    let argInitEnv = new Environment(oldBB.env)
    functionBody.env.parent.children.delete(functionBody.env)
    functionBody.env.parent = argInitEnv
    argInitEnv.children.add(functionBody.env)
    

    let argInitBlock = new FunctionArgInitBB(argInitEnv, params)
    let finalGoto = new GotoFunctionBody(functionBody)
    let curr = argInitBlock
    argInitBlock.terminal = finalGoto
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
      this.setCurrentBB(curr)
      this.handleJS3ProgramBody(js3SpillHolder)

      let finBB = this.getCurrentBB()

      if (finBB instanceof FunctionArgInitBB) {
        curr = finBB
      } else {
        debugConfig.logger.throwIriError("When spilling arguments, the final BB is expected to be FunctionArgInitBB")
      }

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

    if (curr.terminal !== finalGoto)
      debugConfig.logger.throwIriError(`Iridium function arg, control must flow to body after argument initialization`)

    this.setCurrentBB(oldBB)

    return [fin_args, argInitBlock]
  }

  handleFunctionBody(node: JS3BlockStatement) {

    let oldBB = this.getCurrentBB()
    // Lower function body
    let funBB = new FunctionBB(new Environment(oldBB.env), node) // STUB Env, gets replaced when processing arguments
    funBB.terminal = new ExitNode()

    this.setCurrentBB(funBB)
    for (let s of node.body) {
      this.handleJS3AllowedProgStatement(s)
    }

    this.setCurrentBB(oldBB)
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
    let curr = this.getCurrentBB();
    let classExprValHolder = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("classExprRes"))
    classExprValHolder.isValue = true;
    let initClassExprValToNUBD = new IS_SimpleVarDecl(undefined, "let", classExprValHolder, new IV_NUBD(undefined))
    curr.statements.push(initClassExprValToNUBD);

    // Branch from curr to classInitBB
    let postBB = curr.create();
    postBB.terminal = curr.terminal;
    
    // Env Context
    let classInitLexicalEnv = new Environment(curr.env)

    let classInitBB = new ClassInitBB(classInitLexicalEnv, node, node.id ? new IV_Identifier(node.id, node.id.name) : undefined);
    classInitBB.terminal = new UnconditionalGoto(postBB);
    curr.terminal = new UnconditionalGoto(classInitBB);

    this.setCurrentBB(classInitBB);

    // 
    //     <ClassInitThis> THIS = undefined <- most unhinged thing I've seen...
    //     <ClassInitName>? cName = NUBD
    //
    let thisInitToUndef = new IS_ThisInitStmt(node)
    this.getCurrentBB().statements.push(thisInitToUndef);

    let cName: IV_Identifier | undefined;

    if (isIdentifier(node.id)) {
      cName = new IV_Identifier(node.id, node.id.name);
      let cNameInitToNUBD = new IS_ClassNameInitStmt(node, cName);
      this.getCurrentBB().statements.push(cNameInitToNUBD);
    }

    // Heritage resolution 
    let IRI_heritage: undefined | IV_Identifier = undefined
    if (node.superClass) {
      IRI_heritage = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("heritageResult"))
      IRI_heritage.isValue = true
      this.lowerExprToBB(node.superClass, this.getCurrentBB(), IRI_heritage)
    }

    // Name Resolution
    let IV_ComputedNameMap: Map<JS3ClassProperty | JS3ClassMethod, ISP_ClassProperty_key> = new Map()
    for (let bodyElem of node.body.body) {
      if (isJS3ClassProperty(bodyElem) || isJS3ClassMethod(bodyElem)) {
        if (bodyElem.computed) {
          let valResID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("computedName"))
          valResID.isValue = true
          this.lowerExprToBB(bodyElem.key, this.getCurrentBB(), valResID)
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
          let oldBB = this.getCurrentBB()

          // Env for static block init
          let propInitEnv = new Environment(classInitLexicalEnv)

          let valResID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
          valResID.isValue = true
          let propComputationBlock = new ClassPropInitBB(propInitEnv, bodyElem.value)
          propComputationBlock.terminal = new ClassPropInitExit(valResID)
          
          this.lowerExprToBB(bodyElem.value, propComputationBlock, valResID)

          classProperties.push(new ISP_ClassProperty(bodyElem, key, propComputationBlock, computed))
          
          this.setCurrentBB(oldBB)
        }

      } else if (isJS3ClassMethod(bodyElem) || isJS3ClassPrivateMethod(bodyElem)) {
        let kind = bodyElem.kind
        let [params, funBody] = this.handleFunctionParams(bodyElem.params, this.handleFunctionBody(bodyElem.body))
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

        classProperties.push(new ISP_ClassMethod(bodyElem, kind, key, params, funBody, computed, generator, async, bodyElem.static))
      } else {
        // JS3StaticBlock
        staticPropSpill.push(bodyElem)
      }
    }

    // v <- ...IRIClassExpression 
    let iriClassExpr = new IV_ClassExpression(node, cName, IRI_heritage, classProperties, dropName)
    let iriAssn = new IV_SimpleAssn(undefined, classExprValHolder, iriClassExpr)
    let finInitClassRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
    this.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", finInitClassRes, iriAssn))

    thisInitToUndef = new IS_ThisInitStmt(node)
    thisInitToUndef.RVal = finInitClassRes
    this.getCurrentBB().statements.push(thisInitToUndef);

    if (isIdentifier(node.id)) {
      let cNameInitToNUBD = new IS_ClassNameInitStmt(node, cName);
      cNameInitToNUBD.RVal = finInitClassRes
      this.getCurrentBB().statements.push(cNameInitToNUBD);
    }

    for (let toSpill of staticPropSpill) {
      if (isJS3StaticBlock(toSpill)) {
        let currBB = this.getCurrentBB()
        let postBB = currBB.create()
        postBB.terminal = currBB.terminal
        

        // Env for static block init
        let staticEvalEnv = new Environment(classInitLexicalEnv)

        let staticBlockBody = new ClassStaticBB(staticEvalEnv, toSpill)
        currBB.terminal = new UnconditionalGoto(staticBlockBody)

        staticBlockBody.terminal = new ClassStaticExit(postBB)

        this.setCurrentBB(staticBlockBody)
        for (let s of toSpill.body) {
          this.handleJS3AllowedProgStatement(s);
        }

        this.setCurrentBB(postBB)
      } else {
        let classProp = toSpill[0]
        let propVal = toSpill[1]
        let computed = toSpill[2]

        let currBB = this.getCurrentBB()
        let postBB = currBB.create()
        postBB.terminal = currBB.terminal

        let propComputationBlock = new BlockBB(classInitLexicalEnv)
        currBB.terminal = new UnconditionalGoto(propComputationBlock)
        propComputationBlock.terminal = new UnconditionalGoto(postBB)

        let valResID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
        valResID.isValue = true

        this.lowerExprToBB(propVal, propComputationBlock, valResID)
        this.getCurrentBB().statements.push(new IS_ClassStaticPropInit(node, finInitClassRes, classProp, valResID, computed))

        this.setCurrentBB(postBB)
      }
    }

    this.setCurrentBB(postBB);

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
      let resId: Identifier = this.lowerExprToBB(node.argument, this.getCurrentBB())
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
    if (isJS3FunctionExpression(element)) {
      let [params, funBody] = this.handleFunctionParams(element.params, this.handleFunctionBody(element.body))
      return new IV_FunctionExpression(element, params, funBody, undefined, element.generator, element.async, true)
    } else if (isJS3ArrowFunctionExpression(element)) {
      let [params, funBody] = this.handleFunctionParams(element.params, this.handleFunctionBody(element.body))
      return new IV_ArrowFunctionExpression(element, params, funBody, undefined, element.generator, element.async, true)
    } else if (isJS3ClassExpression(element)) {
      let classExpr = this.handleJS3ClassExpression(element, true)
      return classExpr
    } else {
      debugConfig.logger.throwIriError("JS3AnonMemberExpression unhandled case")
    }
  }

  // *********************** Iridium_FunctionExpressions ***********************

  handleJS3FunctionExpression(node: JS3FunctionExpression) {
    let [params, funBody] = this.handleFunctionParams(node.params, this.handleFunctionBody(node.body))
    let name: IV_Identifier | undefined = undefined
    if (isIdentifier(node.id)) name = new IV_Identifier(node.id, node.id.name)
    return new IV_FunctionExpression(node, params, funBody, name, node.generator, node.async)
  }

  handleJS3ArrowFunctionExpression(node: JS3ArrowFunctionExpression) {
    let [params, funBody] = this.handleFunctionParams(node.params, this.handleFunctionBody(node.body))
    return new IV_ArrowFunctionExpression(node, params, funBody, undefined, node.generator, node.async)
  }

  // *********************** Iridium_ObjectExpression ***********************

  handleJS3ObjectExpression(node: JS3ObjectExpression) {

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
        let [params, funBody] = this.handleFunctionParams(p.params, this.handleFunctionBody(p.body))
        let computed = p.computed
        let generator = p.generator;
        let async = p.async;

        properties.push(new ISP_ObjectMethod(p, kind, key, params, funBody, computed, generator, async))
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

    // Set BB links
    let curr = this.getCurrentBB()
    let postBB = curr.create()
    let TrueBB = new ContainedBB(new Environment(curr.env), node.consequent, curr)
    let FalseBB = new ContainedBB(new Environment(curr.env), node.alternate, curr)
    postBB.terminal = curr.terminal
    TrueBB.terminal = new UnconditionalGoto(postBB)
    FalseBB.terminal = new UnconditionalGoto(postBB)
    curr.terminal = new BranchTerminal(node, test, TrueBB, FalseBB)

    // Lower true and false branches
    let trueRes: Identifier = this.lowerExprToBB(node.consequent, TrueBB)
    let falseRes: Identifier = this.lowerExprToBB(node.alternate, FalseBB)

    // Set PostBB
    this.setCurrentBB(postBB)

    // Return IV_ConditionalExpression
    return new IV_ConditionalExpression(node, test, IV_Identifier.from(trueRes, true), IV_Identifier.from(falseRes, true));
  }


  // *********************** Iridium_OptionalChaining ***********************

  handleOptionalChainExpression(parentNode: OptionalMemberExpression | OptionalCallExpression, existingState: { resID: IV_Identifier, fallthruBlock: BB, postBB: BB, callExprContext: boolean } | undefined = undefined) {

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
    let genesisTestBB: BB;

    // Base Case, initialize existing state for recursive calls
    if (!existingState) {
      let curr = this.getCurrentBB()
      let postBB = curr.create()
      postBB.terminal = curr.terminal

      let resID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("chainRes"))
      resID.isValue = true

      // Create a declaration in the parent BB for resID
      curr.statements.push(new IS_SimpleVarDecl(undefined, "let", resID, null))

      let fallthruBlock = new ContainedOptionalChainBB(curr.env, parentNode, "Chained Short-Circuit Terminal", true, true, true)

      let fallthrough_assn = new IS_SimpleVarDecl(undefined, "let", new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined)), new IV_SimpleAssn(undefined, resID, new IV_Identifier(undefined, "undefined")))
      fallthruBlock.statements.push(fallthrough_assn)
      fallthruBlock.terminal = new UnconditionalGoto(postBB)
      existingState = { resID, fallthruBlock, postBB, callExprContext: false }

      // 
      //    CURR --GOTO--> genesisTestBB

      // CURR --GOTO--> genesisTestBB
      genesisTestBB = new ContainedOptionalChainBB(existingState.postBB.env, genesisNode, `Chain Expression: ${generate(parentNode).code}`, false)
      curr.terminal = new UnconditionalGoto(genesisTestBB)

    } else {
      genesisTestBB = this.getCurrentBB()
      if (genesisTestBB instanceof ContainedOptionalChainBB) {
      } else debugConfig.logger.throwIriError("For recursive case, basic block is expected to be a value block")
    }

    //    genesisTestBB --TEST--> chainBB --GOTO--> postBB (contextual)
    //                      |---> fallthruBlock (contextual) 

    // chainBB --GOTO--> postBB
    let chainBB = new ContainedOptionalChainBB(existingState.postBB.env, parentNode, "", true)
    chainBB.terminal = new UnconditionalGoto(existingState.postBB);

    // genesisTestBB --TEST--> chainBB
    //                   |---> fallthruBlock

    let genesisTestResID: Identifier = this.lowerExprToBB(objectToSpill, genesisTestBB)
    let genesisTestRes = IV_Identifier.from(genesisTestResID, true)
    genesisTestBB.terminal = new OptionalBranchTerminal(parentNode, genesisTestRes, chainBB, existingState.fallthruBlock);

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
    this.setCurrentBB(chainBB)

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

      chainBB.comment = `Terminal node: ${generate(patchedNode).code}`
      chainBB.isTerminal = true;

      // Handle Chain termination.
      // resID = ...terminal_expr
      let resHolderID : Identifier = this.lowerExprToBB(patchedNode, chainBB)

      this.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined)), new IV_SimpleAssn(undefined, existingState.resID, IV_Identifier.from(resHolderID))))
      
      this.setCurrentBB(existingState.postBB)

      return existingState.resID
    } else {
      chainBB.comment = `Recursive case: ${generate(patchedNode).code}`
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

    let curr = this.getCurrentBB()
    curr.statements.push(stmt)

    let args: Array<IV_Identifier | ISP_ArgSpread> = new Array()

    for (let a of node.arguments) {
      let curr = this.getCurrentBB()
      let postBB = curr.create()
      let argSpillBB = new ContainedBB(curr.env, a, curr)
      postBB.terminal = curr.terminal
      curr.terminal = new UnconditionalGoto(argSpillBB)
      argSpillBB.terminal = new UnconditionalGoto(postBB)

      let toSpill: JS3ContainedExprKey
      if (isSpreadElement(a)) {
        toSpill = a.argument
      } else {
        toSpill = a
      }

      let resholderID: Identifier = this.lowerExprToBB(toSpill, argSpillBB)
      let resHolder: IV_Identifier = IV_Identifier.from(resholderID)
      resHolder.isValue = true

      this.setCurrentBB(postBB)

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
    let currBB = this.getCurrentBB()
    let postBB = currBB.create()
    let switchBodyBB = new SwitchBodyBB(new Environment(currBB.env), stmt)

    postBB.terminal = currBB.terminal
    currBB.terminal = new UnconditionalGoto(switchBodyBB)
    switchBodyBB.terminal = new UnconditionalGoto(postBB)

    let switchStmtTest: Identifier = stmt.discriminant;
    this.setCurrentBB(switchBodyBB)
    for (let c of stmt.cases) {
      let curr = this.getCurrentBB()
      let postBB = curr.create()
      let caseTest = new ContainedBB(curr.env, c, switchBodyBB)
      let caseBody = new ContainedBB(curr.env, c, switchBodyBB)

      let testResult = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("testResult"))

      postBB.terminal = curr.terminal
      curr.terminal = new UnconditionalGoto(caseTest)
      caseTest.terminal = new SwitchCaseTerminal(c, testResult, caseBody, postBB)
      caseBody.terminal = new UnconditionalGoto(postBB)

      // Lower Body
      this.setCurrentBB(caseBody)
      this.handleJS3ProgramBody(c.consequent)

      // Lower Test?
      if (c.test) {
        this.setCurrentBB(caseTest)
        let caseID: Identifier = this.lowerExprToBB(c.test, caseTest)
        let comparison = new IV_CBINOP(undefined, IV_Identifier.from(switchStmtTest), IV_Identifier.from(caseID), "===")
        let finDecl = new IS_SimpleVarDecl(undefined, "let", testResult, comparison)
        this.getCurrentBB().statements.push(finDecl)
      } else {
        let finDecl = new IS_SimpleVarDecl(undefined, "let", testResult, new IV_BooleanLiteral(undefined, true))
        caseTest.statements.push(finDecl)
      }

      this.setCurrentBB(postBB)
    }
    this.setCurrentBB(postBB)
  }

  // *********************** Iridium_DoWhileStatement ***********************
  handleJS3DoWhileStatement(stmt: JS3DoWhileStatement) {
    let currBB = this.getCurrentBB()
    let postBB = currBB.create()
    let testBB = new ContainedBB(currBB.env, stmt.test, currBB)
    let loopBodyBB = new BlockBB(new Environment(currBB.env), stmt.body)

    let testIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("loopTest"))
    testIV.isValue = true

    postBB.terminal = currBB.terminal
    currBB.terminal = new UnconditionalGoto(loopBodyBB)
    loopBodyBB.terminal = new UnconditionalGoto(testBB)
    testBB.terminal = new BranchTerminal(stmt, testIV, loopBodyBB, postBB)

    // Lower test
    this.lowerExprToBB(stmt.test, testBB, testIV)

    // Lower body
    this.setCurrentBB(loopBodyBB)
    this.handleJS3AllowedProgStatement(stmt.body)

    // Restore postBB context
    this.setCurrentBB(postBB)
  }

  // *********************** Iridium_ForStatement***********************
  handleJS3ForStatement(stmt: JS3ForStatement) {
    let currBB = this.getCurrentBB()
    let postBB = currBB.create()
    let initBB = new ForLoopInitBB(new Environment(currBB.env), stmt.init)
    let testBB = new ContainedBB(initBB.env, stmt.test, initBB, "For ~ Test BB")
    let updateBB = new ContainedBB(initBB.env, stmt.update, initBB, "For ~ Update BB")
    let loopBodyBB = new BlockBB(new Environment(initBB.env), stmt.body)

    let testIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("loopTest"))
    testIV.isValue = true

    postBB.terminal = currBB.terminal
    currBB.terminal = new UnconditionalGoto(initBB)
    initBB.terminal = new UnconditionalGoto(testBB)
    testBB.terminal = new BranchTerminal(stmt, testIV, loopBodyBB, postBB)
    loopBodyBB.terminal = new UnconditionalGoto(updateBB)
    updateBB.terminal = new UnconditionalGoto(testBB)

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

      // lower into BB
      this.setCurrentBB(initBB)
      this.handleJS3ProgramBody(js3SpillHolder)

    } else if (isJS3ContainedExprKey(stmt.init)) {
      this.lowerExprToBB(stmt.init, initBB)
    }

    // Lower Test
    this.lowerExprToBB(stmt.test, testBB, testIV)

    // Lower Body
    this.setCurrentBB(loopBodyBB)
    this.handleJS3AllowedProgStatement(stmt.body)

    // Lower Update
    this.lowerExprToBB(stmt.update, updateBB)

    // Restore PostBB context
    this.setCurrentBB(postBB)
  }

  // *********************** Iridium_ForInOfstatement ***********************
  handleJS3ForInOfStatement(stmt: JS3ForInStatement | JS3ForOfStatement) {

    let currBB = this.getCurrentBB()
    let postBB = currBB.create()
    let initBB = new ForInOfLoopInitBB(new Environment(currBB.env), stmt)
    let testBB = new BlockBB(new Environment(initBB.env), stmt)
    let loopBodyBB = new BlockBB(new Environment(testBB.env), stmt.body)

    let testIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("loopTest"))
    testIV.isValue = true

    postBB.terminal = currBB.terminal
    currBB.terminal = new UnconditionalGoto(initBB)
    initBB.terminal = new UnconditionalGoto(testBB)
    testBB.terminal = new BranchTerminal(stmt, testIV, loopBodyBB, postBB)
    loopBodyBB.terminal = new UnconditionalGoto(testBB)

    // Init loop head
    // let iteratorIV = <InOp> in RVal | <OfOp> of RVal
    let inop: IV_InIterator | IV_OfIterator; 
    if (isJS3ForInStatement(stmt)) inop = new IV_InIterator(stmt, IV_Identifier.from(stmt.right))
    else inop = new IV_OfIterator(stmt, IV_Identifier.from(stmt.right))

    let iteratorIV = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
    let assnStmt = new IS_SimpleVarDecl(undefined, "let", iteratorIV, inop)
    initBB.statements.push(assnStmt)

    // Test BB
    let hasLoopNext = new IV_HasLoopNext(stmt, iteratorIV)
    let testStmt = new IS_SimpleVarDecl(undefined, "let", testIV, hasLoopNext)
    testBB.statements.push(testStmt)

    // LoopBody BB
    // Initialize loop bindings
    let getNext = new IV_LoopNext(stmt, iteratorIV)
    let nextResHolder = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary(undefined))
    let nextResStmt = new IS_SimpleVarDecl(undefined, "let", nextResHolder, getNext)
    loopBodyBB.statements.push(nextResStmt)

    this.setCurrentBB(loopBodyBB)
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

      // Lower into individual statements
      for (let d of stmt.left.declarations) {
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
      handleDeclaratorRec(lval, rval, updatedProps, generator, true);
      
      // lower into BB
      this.handleJS3ProgramBody(js3SpillHolder)
    }
    this.handleFunctionBody(stmt.body)

    this.setCurrentBB(postBB)
  }

  // *********************** Iridium_LabeledStatement ***********************
  handleJS3LabeledStatement(stmt: JS3LabeledStatement) {
    let currBB = this.getCurrentBB()
    let postBB = currBB.create()
    let labelledScope = new BlockBB(new Environment(currBB.env), stmt)
    postBB.terminal = currBB.terminal
    currBB.terminal = new UnconditionalGoto(labelledScope)
    labelledScope.terminal = new UnconditionalGoto(postBB)

    // Add a label, this will help us in debugging.
    // prolly not needed for final codegen I believe.
    labelledScope.label = IV_Identifier.from(stmt.label)

    this.setCurrentBB(labelledScope);
    this.handleJS3AllowedProgStatement(stmt.body);

    this.setCurrentBB(postBB);
  }

  // *********************** Iridium_BlockStatement ***********************
  handleJS3BlockStatement(stmt: JS3BlockStatement) {
    let currBB = this.getCurrentBB()
    let postBB = currBB.create()
    let blockScopeBB = new BlockBB(new Environment(currBB.env), stmt)
    postBB.terminal = currBB.terminal
    currBB.terminal = new UnconditionalGoto(blockScopeBB)
    blockScopeBB.terminal = new UnconditionalGoto(postBB)

    this.setCurrentBB(blockScopeBB)
    this.handleJS3ProgramBody(stmt.body)

    this.setCurrentBB(postBB)
  }

  // *********************** Iridium_ContinueStatement ***********************
  handleJS3ContinueStatement(stmt: JS3ContinueStatement) {
    if (isIdentifier(stmt.label)) {
      let lbreakstmt = new IS_LContinue(stmt, IV_Identifier.from(stmt.label))
      this.getCurrentBB().statements.push(lbreakstmt)
    } else {
      let unlbreakstmt = new IS_Continue(stmt)
      this.getCurrentBB().statements.push(unlbreakstmt);
    }
  }

  // *********************** Iridium_Break_LBreak ***********************
  handleJS3BreakStatement(stmt: JS3BreakStatement) {
    if (isIdentifier(stmt.label)) {
      let lbreakstmt = new IS_LBreak(stmt, IV_Identifier.from(stmt.label))
      this.getCurrentBB().statements.push(lbreakstmt)
    } else {
      let unlbreakstmt = new IS_Break(stmt)
      this.getCurrentBB().statements.push(unlbreakstmt);
    }
  }

  // *********************** Iridium_WhileStatement ***********************
  handleJS3WhileStatement(stmt: JS3WhileStatement) {
    let curr = this.getCurrentBB()
    let postBB = curr.create()
    let testBody = new ContainedBB(curr.env, stmt.test, curr, "While Test")
    let loopBody = new BlockBB(new Environment(curr.env), stmt)
    let testID: Identifier = this.lowerExprToBB(stmt.test, testBody)
    let test: IV_Identifier = IV_Identifier.from(testID)

    postBB.terminal = curr.terminal
    curr.terminal = new UnconditionalGoto(testBody)
    testBody.terminal = new BranchTerminal(stmt, test, loopBody, postBB)
    loopBody.terminal = new UnconditionalGoto(testBody)

    this.setCurrentBB(loopBody)
    this.handleJS3ProgramBody(stmt.body.body)
    this.setCurrentBB(postBB);
  }

  // *********************** Iridium_TryStatement ***********************

  handleJS3TryStatement(stmt: JS3TryStatement) {
    if (stmt.handler && !stmt.finalizer) {
      // Case a. 
      //   try { BLOCK } catch(?ID) { HANDLER }
      let curr = this.getCurrentBB()
      let TryBlockBB = new TryBB(new Environment(curr.env), stmt)
      let CatchHandlerBB = new CatchBB(new Environment(curr.env), stmt.handler, stmt.handler.param ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name) : undefined)
      let PostBB = curr.create()
      PostBB.terminal = curr.terminal

      curr.terminal = new UnconditionalGoto(TryBlockBB)
      TryBlockBB.terminal = new TryCatchConditionalGoto(CatchHandlerBB, PostBB)
      CatchHandlerBB.terminal = new UnconditionalGoto(PostBB)

      this.setCurrentBB(TryBlockBB)
      stmt.block.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(CatchHandlerBB)
      stmt.handler.body.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
      return;
    }

    if (!stmt.handler && stmt.finalizer) {
      // Case b.
      //   try { BLOCK } finally { FINALIZER }
      let curr = this.getCurrentBB()
      let TryBlockBB = new TryBB(new Environment(curr.env), stmt)
      let FinallyBB = new BlockBB(new Environment(curr.env), stmt.finalizer)
      let PostBB = curr.create()
      PostBB.terminal = curr.terminal

      curr.terminal = new UnconditionalGoto(TryBlockBB)
      TryBlockBB.terminal = new UnconditionalGoto(FinallyBB)
      FinallyBB.terminal = new UnconditionalGoto(PostBB)

      this.setCurrentBB(TryBlockBB)
      stmt.block.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(FinallyBB)
      stmt.finalizer.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
      return;
    }

    if (stmt.handler && stmt.finalizer) {
      // Case c.
      //   try { BLOCK } catch { HANDLER } finally { FINALIZER }

      let curr = this.getCurrentBB()
      let TryBlockBB = new TryBB(new Environment(curr.env), stmt)
      let CatchHandlerBB = new CatchBB(new Environment(curr.env), stmt.handler, stmt.handler.param ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name) : undefined)
      let FinallyBB = new BlockBB(new Environment(curr.env), stmt.finalizer)
      let PostBB = curr.create()
      PostBB.terminal = curr.terminal

      curr.terminal = new UnconditionalGoto(TryBlockBB)
      TryBlockBB.terminal = new TryCatchConditionalGoto(CatchHandlerBB, FinallyBB)
      CatchHandlerBB.terminal = new UnconditionalGoto(FinallyBB)
      FinallyBB.terminal = new UnconditionalGoto(PostBB)

      this.setCurrentBB(TryBlockBB)
      stmt.block.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(CatchHandlerBB)
      stmt.handler.body.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(FinallyBB)
      stmt.finalizer.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
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
      let curr = this.getCurrentBB()
      let TrueBB = new BlockBB(new Environment(curr.env))
      let PostBB: BB = curr.create() // Create a continuation...
      let ID = IV_Identifier.from(stmt.test)
      PostBB.terminal = curr.terminal
      curr.terminal = new BranchTerminal(stmt, ID, TrueBB, PostBB)
      TrueBB.terminal = new UnconditionalGoto(PostBB)

      this.setCurrentBB(TrueBB)
      stmt.consequent.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
    } else {
      // Case a.
      // if (ID) { CONSEQ } else { ALT }
      let curr = this.getCurrentBB()
      let TrueBB = new BlockBB(new Environment(curr.env))
      let FalseBB = new BlockBB(new Environment(curr.env))
      let PostBB: BB = curr.create() // Create a continuation...
      let ID = new IV_Identifier(stmt.test, stmt.test.name)
      PostBB.terminal = curr.terminal
      curr.terminal = new BranchTerminal(stmt, ID, TrueBB, FalseBB)
      TrueBB.terminal = new UnconditionalGoto(PostBB)
      FalseBB.terminal = new UnconditionalGoto(PostBB)

      this.setCurrentBB(TrueBB)
      stmt.consequent.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(FalseBB)
      stmt.alternate.body.forEach(s => {
        this.handleJS3AllowedProgStatement(s);
      })

      this.setCurrentBB(PostBB)
    }
  }

  // *********************** Iridium_FunctionDeclaration *********************** 

  handleJS3FunctionDeclaration(stmt: JS3FunctionDeclaration) {
    let curr = this.getCurrentBB()
    let [params, funBody] = this.handleFunctionParams(stmt.params, this.handleFunctionBody(stmt.body))

    this.setCurrentBB(curr)
    curr.statements.push(new IS_FunDecl(stmt, params, funBody, new IV_Identifier(stmt.id, stmt.id.name), stmt.generator, stmt.async))
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
      this.getCurrentBB().statements.push(new IS_SimpleVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    // case b.
    // KIND [ ID, ...ID ] = RVal
    if (isJS3ArrayPattern(declaration.id)) {
      let LVal = declaration.id
      let RVal = declaration.init ? this.handleJS3AssnInit(declaration.init) : null
      this.getCurrentBB().statements.push(new IS_ArrPatVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    // case c.
    // KIND { TRIV_KEY: ID, ...ID } = RVal
    if (isJS3ObjectPattern(declaration.id)) {

      let LVal = declaration.id
      let RVal = declaration.init ? this.handleJS3AssnInit(declaration.init) : null
      this.getCurrentBB().statements.push(new IS_ObjPatVarDecl(stmt, KIND, LVal, RVal));
      return;
    }

    debugConfig.logger.throwIriError("JS3VariableDeclaration: UNHANDLED")
    return;
  }


  // *********************** Iridium_Debugger_Return_Throw ***********************  

  handleJS3ThrowStatement(stmt: JS3ThrowStatement) {
    let curr = this.getCurrentBB()
    // throw ID
    curr.statements.push(new IS_Throw(stmt, new IV_Identifier(stmt.argument, stmt.argument.name)))
  }

  handleJS3ReturnStatement(stmt: JS3ReturnStatement) {
    let curr = this.getCurrentBB()
    // return | return ID
    if (stmt.argument) {
      curr.statements.push(new IS_Return(stmt, new IV_Identifier(stmt.argument, stmt.argument.name)))
    } else {
      curr.statements.push(new IS_Return(stmt, null))
    }
  }

  handleJS3DebuggerStatement(stmt: JS3DebuggerStatement) {
    let curr = this.getCurrentBB()
    // debugger; 
    curr.statements.push(new IS_Debugger())
  }

  // *********************** Iridium_Imports_Exports ***********************  

  handleJS3ImportDeclaration(stmt: JS3ImportDeclaration) {
    let curr = this.getCurrentBB()

    // case a.
    // import "FROM"
    if (stmt.specifiers.length === 0) {
      curr.statements.push(new IS_AImport(stmt, new IV_StringLiteral(stmt.source, stmt.source.value)))
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
      curr.statements.push(new IS_BImport(stmt, remote, local, FROM));
      return;
    }

    // case c.
    // import * as X from "FROM"
    else {
      let local = new IV_Identifier(specifier.local, specifier.local.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      curr.statements.push(new IS_CImport(stmt, local, FROM));
      return;
    }
  }

  handleJS3ExportDefaultDeclaration(stmt: JS3ExportDefaultDeclaration) {
    let curr = this.getCurrentBB()
    // export default ID
    curr.statements.push(new IS_AExport(stmt, new IV_Identifier(stmt.declaration, stmt.declaration.name)))
  }

  handleJS3ExportNamedDeclaration(stmt: JS3ExportNamedDeclaration) {
    let curr = this.getCurrentBB()

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
      curr.statements.push(new IS_BExport(stmt, local, remote))
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
      curr.statements.push(new IS_CExport(stmt, local, remote, FROM))
      return;
    }

    if (isJS3ExportNamespaceSpecifier(specifier) && isIdentifier(specifier.exported)) {
      // case c.
      // export * as REMOTE FROM
      let remote = new IV_Identifier(specifier.exported, specifier.exported.name)
      let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
      curr.statements.push(new IS_DExport(stmt, remote, FROM))
      return;
    }

    debugConfig.logger.throwIriError("JS3ExportNamedDeclaration: UNHANDLED")
    return;
  }

  handleJS3ExportAllDeclaration(stmt: JS3ExportAllDeclaration) {
    let curr = this.getCurrentBB()
    let FROM = new IV_StringLiteral(stmt.source, stmt.source.value)
    curr.statements.push(new IS_EExport(stmt, FROM))
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
