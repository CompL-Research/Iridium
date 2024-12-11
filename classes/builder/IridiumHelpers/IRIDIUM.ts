import debugConfig from "#debugConfig";
import _generate from "@babel/generator";
import { assignmentExpression, callExpression, Expression, identifier, Identifier, isArrayPattern, isArrowFunctionExpression, isClassExpression, isFunctionExpression, isIdentifier, isImportSpecifier, isObjectPattern, isOptionalCallExpression, isOptionalMemberExpression, isPrivateName, isRestElement, isSpreadElement, isStringLiteral, isSuper, isThisExpression, isV8IntrinsicIdentifier, memberExpression, Node, OptionalCallExpression, optionalCallExpression, OptionalMemberExpression, optionalMemberExpression, ThisExpression } from "@babel/types";
import _traverse from "@babel/traverse";

const traverse = _traverse.default

import JS3Builder from "../JS3Builder.ts";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks.ts";
import { handleExpression, handleSpreadElement, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression.ts";
import { generateIdentifier, generateJS3RestElement, generateJS3RestElementfromBaseNode, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Helpers/JS3Constructors.ts";
import { isJS3ArrayPattern, isJS3AssignmentExpression, isJS3AwaitExpression, isJS3BinaryExpression, isJS3CallExpression, isJS3ConditionalExpression, isJS3ContextualCallExpression, isJS3DebuggerStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportNamespaceSpecifier, isJS3ExportSpecifier, isJS3FunctionDeclaration, isJS3FunctionExpression, isJS3IfStatement, isJS3Import, isJS3ImportDeclaration, isJS3MemberExpression, isJS3MetaProperty, isJS3ObjectPattern, isJS3RegExpLiteral, isJS3ReturnStatement, isJS3TaggedTemplateExpression, isJS3TemplateLiteral, isJS3ThrowStatement, isJS3TryStatement, isJS3VariableDeclaration, isJS3YieldExpression, JS3AllowedProgStatement, JS3ArrayPattern, JS3AssignmentExpression, JS3AssnInit, JS3AwaitExpression, JS3BinaryExpression, JS3BlockStatement_body, JS3CallExpression, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3DebuggerStatement, JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3FunctionDeclaration, JS3FunctionExpression, JS3IfStatement, JS3ImportDeclaration, JS3MemberExpression, JS3MetaProperty, JS3ObjectPattern, JS3Program, JS3RegExpLiteral, JS3ReturnStatement, JS3SpreadElement, JS3TaggedTemplateExpression, JS3TemplateLiteral, JS3ThrowStatement, JS3TryStatement, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3YieldExpression } from "../JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_PrivateName, IV_SuperLookupPA, IV_ThisLookupPA } from "./ALL_AMP/ALL_AMP.ts";
import { IS_Debugger, IS_Return, IS_Throw } from "./ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS_FunDecl } from "./ALL_IS/IS_FunDecl.ts";
import { IS_AExport, IS_AImport, IS_BExport, IS_BImport, IS_CExport, IS_CImport, IS_DExport, IS_EExport } from "./ALL_IS/IS_Imports_Exports.ts";
import { IS_ArrPatVarDecl, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_VAR_DECL_KIND } from "./ALL_IS/IS_VarDecl.ts";
import { ISP_ArgSpread, ISP_RestElement } from "./ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "./ALL_RVal/ALL_RVal.ts";
import { IV_ArrPatAssn, IV_MemberAssn, IV_ObjPatAssn, IV_SimpleAssn, IV_SuperAssn, IV_ThisAssn } from "./ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP, OPA, OPB, OPC, OPD, OPE, OPF } from "./ALL_RVal/IV_Binop.ts";
import { IV_Call, IV_ImportCall, IV_SuperCall, IV_V8IntrinsicCall } from "./ALL_RVal/IV_Call.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "./ALL_RVal/IV_Literals.ts";
import { IV_ModuleMeta, IV_NewTarget } from "./ALL_RVal/IV_META.ts";
import { IV_Regexp } from "./ALL_RVal/IV_Regexp.ts";
import { IV_TaggedTemplateCall, IV_TemplateLiteral } from "./ALL_RVal/IV_Templates.ts";
import { IV_This } from "./ALL_RVal/IV_This.ts";
import { IV_AWAIT, IV_YIELD } from "./ALL_RVal/IV_YIELD_AWAIT.ts";
import { BB, BlockBB, BranchTerminal, CatchBB, ContainedBB, ExitNode, FunctionInitBB, ModuleBB, OptionalBranchTerminal, ScriptBB, TryBB, TryCatchConditionalGoto, UnconditionalGoto } from "./BB.ts";
import { I_File } from "./I_GENERAL/I_File.ts";

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

export default class IRIDIUM {
  js3builder: JS3Builder
  node: JS3Program
  currentBB: BB

  valueBlock: boolean = false
  immediateCallContext: boolean = false

  errors: Array<IRI_ERROR>

  // Static Constructor...
  static create(js3builder: JS3Builder) {
    return new I_File(js3builder)
  }

  constructor(js3builder: JS3Builder) {
    this.node = js3builder.generatedAST.program
    this.js3builder = js3builder
    this.errors = []
    this.initialize();
  }

  initialize() {
    if (this.node.sourceType === "module") {
      let bb = new ModuleBB(this.node)
      bb.terminal = new ExitNode()
      this.setCurrentBB(bb);
    } else {
      let bb = new ScriptBB(this.node)
      bb.terminal = new ExitNode()
      this.setCurrentBB(bb);
    }
  }

  setCurrentBB(bb: BB) { this.currentBB = bb; }
  getCurrentBB() { return this.currentBB; }

  getValueBlockContext() { return this.valueBlock; }
  setValueBlockContext(val: boolean) { this.valueBlock = val; }

  getImmediateCallContext() { return this.immediateCallContext; }
  setImmediateCallContext(val: boolean) { this.immediateCallContext = true; }


  static tVar = 0

  generateTemporaryIdentifier() {
    return new IV_Identifier(undefined, "IV_TMP$" + ((IRIDIUM.tVar++)))
  }


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

    else debugConfig.logger.throwIriError(`IRIDIUM: Unhandled Statement ${stmt.type}, ${stmt.js3type}`)
  }

  handleJS3AssnInit(init: JS3AssnInit): IV_ASSIGNABLE {
    let immediateCallContext = this.getImmediateCallContext();
    this.setImmediateCallContext(false);
    if (init.type === "DecimalLiteral") {
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
    } else if (init.type === "Identifier") {
      return new IV_Identifier(init, init.name);
    } else if (isJS3RegExpLiteral(init)) {
      return this.handleJS3RegExpLiteral(init);
    } else if (isJS3TemplateLiteral(init)) {
      return this.handleJS3TemplateLiteral(init);
    } else if (isJS3MemberExpression(init)) {
      return this.handleJS3MemberExpression(init);
    } else if (isJS3TaggedTemplateExpression(init)) {
      return this.handleJS3TaggedTemplateExpression(init);
    } else if (isJS3CallExpression(init)) {
      return this.handleJS3CallExpression(init, immediateCallContext);
    } else if (isJS3MetaProperty(init)) {
      return this.handleJS3MetaProperty(init)
    } else if (isJS3YieldExpression(init)) {
      return this.handleJS3YieldExpression(init);
    } else if (isJS3AwaitExpression(init)) {
      return this.handleJS3AwaitExpression(init);
    } else if (init.type === "ThisExpression") {
      return this.handleThisExpression(init)
    } else if (isJS3BinaryExpression(init)) {
      return this.handleJS3BinaryExpression(init);
    } else if (isJS3AssignmentExpression(init)) {
      return this.handleJS3AssignmentExpression(init);
    } else if (init.type === "OptionalMemberExpression" || init.type === "OptionalCallExpression") {
      return this.handleOptionalChainExpression(init)
    } else if (isJS3ContextualCallExpression(init)) {
      return this.handleJS3ContextualCallExpression(init)
    } else if (isJS3ConditionalExpression(init)) {
      return this.handleJS3ConditionalExpression(init);
    }

    else {
      return new IV_StringLiteral(undefined, `😞💔(${init.type})`);
      // // @ts-ignore
      // debugConfig.logger.throwIriError(`IRIDIUM: Unhandled Statement ${init.type}, ${init.js3type ? init.js3type : undefined}`)
    }
  }

  handleJS3ProgramBody(body: Array<JS3AllowedProgStatement>) {
    for (let _st of body) {
      this.handleJS3AllowedProgStatement(_st)
    }
  }

  build() {
    let body = new IRIDIUM_FG(this.currentBB)
    this.handleJS3ProgramBody(this.node.body)
    return body
  }

  lowerExprToValueBlock(from : JS3ContainedExprKey, block: BB, resID : IV_Identifier) {
    // Generate 3JS code
    let otherProps = this.js3builder.utils
    let js3SpillHolder: JS3BlockStatement_body = new Array()
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }
    let exprRes = handleExpression(from, updatedProps);
    
    // Start value block context
    let oldVal = this.getValueBlockContext()
    this.setValueBlockContext(true)

    this.setCurrentBB(block)
    this.handleJS3ProgramBody(js3SpillHolder)
    
    // resID = ...exprRes
    this.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "VALUE", resID, new IV_Identifier(exprRes, exprRes.name)));

    // Restore old context
    this.setValueBlockContext(oldVal)
    
  }

  // ***********************        AMP          ***********************

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


  // ***********************       RVALUES        ***********************

  // *********************** Iridium_ConditionalExpression ***********************

  handleJS3ConditionalExpression(node: JS3ConditionalExpression) {
    let curr = this.getCurrentBB()
    let postBB = curr.create()
    postBB.terminal = curr.terminal

    let finRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("condRes"))

    let test = new IV_Identifier(node.test, node.test.name)

    let TrueBB  = new ContainedBB(node.consequent, "CondExpr: T")
    TrueBB.terminal = new UnconditionalGoto(postBB)
    let FalseBB  = new ContainedBB(node.alternate, "CondExpr: F")
    FalseBB.terminal = new UnconditionalGoto(postBB)

    curr.terminal = new BranchTerminal(node, test, TrueBB, FalseBB)

    this.lowerExprToValueBlock(node.consequent, TrueBB, finRes)
    this.lowerExprToValueBlock(node.alternate, FalseBB, finRes)
    this.setCurrentBB(postBB)

    return finRes;
  }

  // *********************** Iridium_CCall ***********************

  handleJS3ContextualCallExpression(node: JS3ContextualCallExpression) {
    let LVal = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("ccallCallee"))
    let RVal = this.handleJS3AssnInit(node.callee)
    let stmt = new IS_SimpleVarDecl(undefined, "VALUE", LVal, RVal)

    let curr = this.getCurrentBB()
    curr.statements.push(stmt)

    let args: Array<IV_Identifier | ISP_ArgSpread> = new Array()

    for (let a of node.arguments) {
      let otherProps = this.js3builder.utils
      let js3SpillHolder: JS3BlockStatement_body = new Array()
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }

      let spilled: Identifier
      let js3SpreadElement: JS3SpreadElement

      if (isSpreadElement(a)) {
        js3SpreadElement = handleSpreadElement(a, updatedProps);
        spilled = js3SpreadElement.argument
      } else if (isFunctionExpression(a) || isArrowFunctionExpression(a) || isClassExpression(a)) {
        spilled = lowerToAnonArrayExpr(a, updatedProps)
      } else {
        spilled = handleExpression(a, updatedProps);
      }

      let curr = this.getCurrentBB()
      let postBB = curr.create()
      postBB.terminal = curr.terminal
      let argSpillBB = new ContainedBB()

      curr.terminal = new UnconditionalGoto(argSpillBB)
      argSpillBB.terminal = new UnconditionalGoto(postBB)

      this.setCurrentBB(argSpillBB)
      this.handleJS3ProgramBody(js3SpillHolder)
      this.setCurrentBB(postBB)

      if (isSpreadElement(a)) {
        args.push(new ISP_ArgSpread(js3SpreadElement, new IV_Identifier(spilled, spilled.name)))
      } else {
        args.push(new IV_Identifier(spilled, spilled.name))
      }
    }

    return new IV_Call(node, true, LVal, args)
  }

  // *********************** Iridium_OptionalChaining ***********************

  handleOptionalChainExpression(parentNode: OptionalMemberExpression | OptionalCallExpression, existingState: { resID: IV_Identifier, fallthruBlock: BB, postBB: BB } | undefined = undefined) {

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
    let genesisTestRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("genesisTestRes"))
    let genesisTestBB : BB;

    
    // Base Case, initialize existing state for recursive calls
    if (!existingState) {
      let curr = this.getCurrentBB()
      let postBB = curr.create()
      postBB.terminal = curr.terminal
      
      let resID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("chainRes"))
      let fallthruBlock = new ContainedBB(parentNode, "Chained Short-Circuit Terminal")
      let fallthrough_assn = new IS_SimpleVarDecl(undefined, "VALUE", resID, new IV_Identifier(undefined, "undefined"))
      fallthruBlock.statements.push(fallthrough_assn)
      fallthruBlock.terminal = new UnconditionalGoto(postBB)
      existingState = { resID, fallthruBlock, postBB }

      // 
      //    CURR --GOTO--> genesisTestBB

      // CURR --GOTO--> genesisTestBB
      genesisTestBB = new ContainedBB(genesisNode, `Chain Expression: ${generate(parentNode).code}`)
      curr.terminal = new UnconditionalGoto(genesisTestBB)

    } else {
      genesisTestBB = this.getCurrentBB()
      if (genesisTestBB instanceof ContainedBB) {
      } else debugConfig.logger.throwIriError("For recursive case, basic block is expected to be a value block")
    }

    //    genesisTestBB --TEST--> chainBB --GOTO--> postBB (contextual)
    //                      |---> fallthruBlock (contextual) 
    
    // chainBB --GOTO--> postBB
    let chainBB = new ContainedBB(parentNode)
    chainBB.terminal = new UnconditionalGoto(existingState.postBB);

    // genesisTestBB --TEST--> chainBB
    //                   |---> fallthruBlock
    genesisTestBB.terminal = new OptionalBranchTerminal(parentNode, genesisTestRes, chainBB, existingState.fallthruBlock);

    let immediateCallContext = this.getImmediateCallContext()
    this.setImmediateCallContext(true)
    this.lowerExprToValueBlock(objectToSpill, genesisTestBB, genesisTestRes)
    this.setImmediateCallContext(immediateCallContext)

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
      
      // Handle Chain termination.
      // resID = ...terminal_expr
      let immediateCallContext = this.getImmediateCallContext()
      this.setImmediateCallContext(true)
      this.lowerExprToValueBlock(patchedNode, chainBB, existingState.resID)
      this.setImmediateCallContext(immediateCallContext)
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


    this.errors.push(new JS3_ASSERTION_FAILED("JS3AssignmentExpression: UNHANDLED", [node]))
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

    this.errors.push(new JS3_ASSERTION_FAILED("JS3BinaryExpression: UNHANDLED", [node]))
    debugConfig.logger.throwIriError("JS3BinaryExpression: UNHANDLED")
    return;
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

  handleJS3CallExpression(node: JS3CallExpression, immediateCallContext = false) {
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
      return new IV_SuperCall(node, args)
    } else if (isV8IntrinsicIdentifier(node.callee)) {
      return new IV_V8IntrinsicCall(node, new IV_Identifier(node.callee, node.callee.name), args)
    } else {
      let callee = new IV_Identifier(node.callee, node.callee.name);
      return new IV_Call(node, immediateCallContext, callee, args)
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

  // *********************** Iridium_TryStatement ***********************

  handleJS3TryStatement(stmt: JS3TryStatement) {

    if (stmt.handler && !stmt.finalizer) {
      // Case a. 
      //   try { BLOCK } catch(?ID) { HANDLER }
      let curr = this.getCurrentBB()
      let TryBlockBB = new TryBB(stmt)
      let CatchHandlerBB = new CatchBB(stmt.handler, stmt.handler.param ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name) : undefined)
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
      let TryBlockBB = new TryBB(stmt)
      let FinallyBB = new BlockBB(stmt.finalizer)
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
      let TryBlockBB = new TryBB(stmt)
      let CatchHandlerBB = new CatchBB(stmt.handler, stmt.handler.param ? new IV_Identifier(stmt.handler.param, stmt.handler.param.name) : undefined)
      let FinallyBB = new BlockBB(stmt.finalizer)
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

    this.errors.push(new JS3_ASSERTION_FAILED("JS3TryStatement: UNHANDLED", [stmt]))
    debugConfig.logger.throwIriError("JS3TryStatement: UNHANDLED")
    return;
  }

  // *********************** Iridium_IfStatement ***********************

  handleJS3IfStatement(stmt: JS3IfStatement) {
    if (!stmt.alternate) {
      // Case a.
      // if (ID) { CONSEQ }
      let curr = this.getCurrentBB()
      let TrueBB = new BlockBB()
      let PostBB: BB = curr.create() // Create a continuation...
      PostBB.terminal = curr.terminal

      let ID = new IV_Identifier(stmt.test, stmt.test.name)
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
      let TrueBB = new BlockBB()
      let FalseBB = new BlockBB()
      let PostBB: BB = curr.create() // Create a continuation...
      PostBB.terminal = curr.terminal

      let ID = new IV_Identifier(stmt.test, stmt.test.name)

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
    // Lower function body
    let curr = this.getCurrentBB()

    let fin_args: Array<IV_Identifier | ISP_RestElement> = []

    let funBB = new FunctionInitBB(stmt)
    let postBB = funBB.create()
    funBB.terminal = new ExitNode()
    postBB.terminal = funBB.terminal

    this.setCurrentBB(funBB)

    // Spill arguments
    for (let arg of stmt.params) {
      // Identifier | ArrayPattern | ObjectPattern | AssignmentPattern | RestElement
      if (isIdentifier(arg)) {
        fin_args.push(new IV_Identifier(arg, arg.name));
      } else if (isArrayPattern(arg) || isObjectPattern(arg)) {
        let temp: Identifier = generateIdentifier(arg, this.js3builder.utils.getNewTemporary("farg"))
        fin_args.push(new IV_Identifier(temp, temp.name));

        let spilledAssn = assignmentExpression("=", arg, temp);

        // Generate 3JS
        let otherProps = this.js3builder.utils
        let js3SpillHolder: JS3BlockStatement_body = new Array()
        const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }
        handleExpression(spilledAssn, updatedProps);

        this.handleJS3ProgramBody(js3SpillHolder)

      } else if (isRestElement(arg)) {
        if (isIdentifier(arg.argument)) {
          fin_args.push(new ISP_RestElement(generateJS3RestElement(arg.argument, arg), new IV_Identifier(arg.argument, arg.argument.name)))
        } else {
          let temp: Identifier = generateIdentifier(arg, this.js3builder.utils.getNewTemporary("farg"))
          fin_args.push(new ISP_RestElement(generateJS3RestElementfromBaseNode(temp, null, null, null, arg), new IV_Identifier(temp, temp.name)))


          // Generate 3JS
          let otherProps = this.js3builder.utils
          let js3SpillHolder: JS3BlockStatement_body = new Array()
          const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }

          let generator = (LVal: JS3MemberExpression | JS3ArrayPattern | JS3ObjectPattern | Identifier, RVal: null | JS3VariableDeclarator_init) => {
            if (isJS3MemberExpression(LVal)) debugConfig.logger.log("LVal cannot be JS3MemberExpression in case of variable declarator...")
            else {
              let declarator = generateJS3VariableDeclaratorfromBaseNode(LVal, RVal, null, arg)
              return generateJS3VariableDeclarationfromBaseNode([declarator], "let", null, arg)
            }
          }
          handleDeclaratorRec(arg.argument, temp, updatedProps, generator, true);
          this.handleJS3ProgramBody(js3SpillHolder)
        }
      } else {
        let temp: Identifier = generateIdentifier(arg, this.js3builder.utils.getNewTemporary("farg"))
        fin_args.push(new IV_Identifier(temp, temp.name));

        // Generate 3JS
        let otherProps = this.js3builder.utils
        let js3SpillHolder: JS3BlockStatement_body = new Array()
        const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: js3SpillHolder } }

        let generator = (LVal: JS3MemberExpression | JS3ArrayPattern | JS3ObjectPattern | Identifier, RVal: null | JS3VariableDeclarator_init) => {
          if (isJS3MemberExpression(LVal)) debugConfig.logger.log("LVal cannot be JS3MemberExpression in case of variable declarator...")
          else {
            let declarator = generateJS3VariableDeclaratorfromBaseNode(LVal, RVal, null, arg)
            return generateJS3VariableDeclarationfromBaseNode([declarator], "let", null, arg)
          }
        }
        handleDeclaratorRec(arg, temp, updatedProps, generator, true);
        this.handleJS3ProgramBody(js3SpillHolder)
      }
    }

    let bodyBB = new BlockBB()
    bodyBB.terminal = new UnconditionalGoto(postBB);
    this.getCurrentBB().terminal = new UnconditionalGoto(bodyBB)

    this.setCurrentBB(bodyBB)

    for (let s of stmt.body.body) {
      this.handleJS3AllowedProgStatement(s)
    }

    this.setCurrentBB(curr)
    curr.statements.push(new IS_FunDecl(stmt, funBB, fin_args))
  }

  // *********************** Iridium_VariableDeclarations ***********************  

  handleJS3VariableDeclaration(stmt: JS3VariableDeclaration) {
    let curr = this.getCurrentBB()

    // Assert that only one specifier exists
    if (stmt.kind === "using" || stmt.kind === "await using") {
      this.errors.push(new JS3_ASSERTION_FAILED("JS3VariableDeclaration: 'using' and 'await using' not supported in JS3", [stmt]))
      debugConfig.logger.throwIriError("JS3VariableDeclaration: 'using' and 'await using' not supported in JS3")
      return;
    }

    // Assert that only one specifier exists
    if (stmt.declarations.length !== 1) {
      this.errors.push(new JS3_ASSERTION_FAILED("JS3VariableDeclaration: expecting exactly one declaration in JS3", [stmt]))
      debugConfig.logger.throwIriError("JS3VariableDeclaration: expecting exactly one declaration in JS3")
      return;
    }

    let declaration = stmt.declarations[0]
    let KIND: IS_VAR_DECL_KIND = this.getValueBlockContext() ? "VALUE" : stmt.kind

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

    this.errors.push(new JS3_ASSERTION_FAILED("JS3VariableDeclaration: UNHANDLED", [stmt]))
    debugConfig.logger.throwIriError("JS3VariableDeclaration: UNHANDLED")
    return;
  }


  // *********************** Iridium_Debugger_Return_Throw ***********************  

  handleJS3DebuggerStatement(stmt: JS3DebuggerStatement) {
    let curr = this.getCurrentBB()
    // debugger; 
    curr.statements.push(new IS_Debugger())
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

  handleJS3ThrowStatement(stmt: JS3ThrowStatement) {
    let curr = this.getCurrentBB()
    // throw ID
    curr.statements.push(new IS_Throw(stmt, new IV_Identifier(stmt.argument, stmt.argument.name)))
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
      this.errors.push(new JS3_ASSERTION_FAILED("JS3ImportDeclaration: Expected a single specifier in JS3", [stmt]))
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
      this.errors.push(new JS3_ASSERTION_FAILED("JS3ExportNamedDeclaration: Expected a single specifier in JS3", [stmt]))
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

    this.errors.push(new JS3_ASSERTION_FAILED("JS3ExportNamedDeclaration: UNHANDLED", [stmt]))
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