import debugConfig from "#debugConfig";
import _generate from "@babel/generator";
import _traverse from "@babel/traverse";
import { ArrayPattern, AssignmentPattern, callExpression, Expression, identifier, Identifier, isArrayPattern, isArrowFunctionExpression, isAssignmentPattern, isBigIntLiteral, isClassExpression, isFunctionExpression, isIdentifier, isImportSpecifier, isNumericLiteral, isObjectPattern, isOptionalCallExpression, isOptionalMemberExpression, isPrivateName, isSpreadElement, isStringLiteral, isSuper, isThisExpression, isV8IntrinsicIdentifier, memberExpression, Node, ObjectPattern, OptionalCallExpression, optionalCallExpression, OptionalMemberExpression, optionalMemberExpression, ThisExpression } from "@babel/types";

const traverse = _traverse.default

import JS3Builder from "../JS3Builder.ts";
import { handleDeclaratorRec } from "../JS3Helpers/HandleBlocks.ts";
import { handleExpression, lowerToAnonArrayExpr } from "../JS3Helpers/HandleExpression.ts";
import { generateIdentifier, generateJS3RestElementfromBaseNode, generateJS3SpreadElement, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "../JS3Helpers/JS3Constructors.ts";
import { isJS3AnonMemberExpression, isJS3ArrayExpression, isJS3ArrayPattern, isJS3ArrowFunctionExpression, isJS3AssignmentExpression, isJS3AwaitExpression, isJS3BinaryExpression, isJS3CallExpression, isJS3ClassExpression, isJS3ConditionalExpression, isJS3ContextualCallExpression, isJS3DebuggerStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ExportNamespaceSpecifier, isJS3ExportSpecifier, isJS3FunctionDeclaration, isJS3FunctionExpression, isJS3IfStatement, isJS3Import, isJS3ImportDeclaration, isJS3MemberExpression, isJS3MetaProperty, isJS3NewExpression, isJS3ObjectExpression, isJS3ObjectMethod, isJS3ObjectPattern, isJS3ObjectProperty, isJS3RegExpLiteral, isJS3ReturnStatement, isJS3SpreadElement, isJS3TaggedTemplateExpression, isJS3TemplateLiteral, isJS3ThrowStatement, isJS3TryStatement, isJS3UnaryExpression, isJS3UpdateExpression, isJS3VariableDeclaration, isJS3YieldExpression, JS3AllowedFunctionArgs, JS3AllowedProgStatement, JS3AnonMemberExpression, JS3ArrayExpression, JS3ArrayPattern, JS3ArrowFunctionExpression, JS3AssignmentExpression, JS3AssnInit, JS3AwaitExpression, JS3BinaryExpression, JS3BlockStatement, JS3BlockStatement_body, JS3CallExpression, JS3ClassExpression, JS3ConditionalExpression, JS3ContainedExprKey, JS3ContextualCallExpression, JS3DebuggerStatement, JS3ExportAllDeclaration, JS3ExportDefaultDeclaration, JS3ExportNamedDeclaration, JS3FunctionDeclaration, JS3FunctionExpression, JS3IfStatement, JS3ImportDeclaration, JS3MemberExpression, JS3MetaProperty, JS3NewExpression, JS3ObjectExpression, JS3ObjectPattern, JS3Program, JS3RegExpLiteral, JS3ReturnStatement, JS3TaggedTemplateExpression, JS3TemplateLiteral, JS3ThrowStatement, JS3TryStatement, JS3UnaryExpression, JS3UpdateExpression, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3YieldExpression } from "../JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_PrivateName, IV_SuperLookupPA, IV_ThisLookupPA } from "./ALL_AMP/ALL_AMP.ts";
import { IS_Debugger, IS_Return, IS_Throw } from "./ALL_IS/IS_Debugger_Return_Throw.ts";
import { IS_FunDecl } from "./ALL_IS/IS_FunDecl.ts";
import { IS_AExport, IS_AImport, IS_BExport, IS_BImport, IS_CExport, IS_CImport, IS_DExport, IS_EExport } from "./ALL_IS/IS_Imports_Exports.ts";
import { IS_ArrPatVarDecl, IS_ObjPatVarDecl, IS_SimpleVarDecl, IS_VAR_DECL_KIND } from "./ALL_IS/IS_VarDecl.ts";
import { ISP_ArgSpread, ISP_ObjectMethod, ISP_ObjectMethod_key, ISP_ObjectProperty, ISP_RestElement, ISP_Super, ISP_V8Intrinsic } from "./ALL_RVal/ALL_ISP.ts";
import { IV_ASSIGNABLE } from "./ALL_RVal/ALL_RVal.ts";
import { IV_ArrayExpression } from "./ALL_RVal/IV_ArrayExpression.ts";
import { IV_ArrowFunctionExpression } from "./ALL_RVal/IV_ArrowFunctionExpression.ts";
import { IV_ArrPatAssn, IV_MemberAssn, IV_ObjPatAssn, IV_SimpleAssn, IV_SuperAssn, IV_ThisAssn } from "./ALL_RVal/IV_Assignment.ts";
import { IV_ABINOP, IV_BBINOP, IV_CBINOP, IV_DBINOP, IV_EBINOP, IV_FBINOP, OPA, OPB, OPC, OPD, OPE, OPF } from "./ALL_RVal/IV_Binop.ts";
import { IV_Call, IV_ImportCall, IV_SuperCall, IV_V8IntrinsicCall } from "./ALL_RVal/IV_Call.ts";
import { IV_ConditionalExpression } from "./ALL_RVal/IV_ConditionalExpression.ts";
import { IV_FunctionExpression } from "./ALL_RVal/IV_FunctionExpression.ts";
import { IV_BigIntLiteral, IV_BooleanLiteral, IV_DecimalLiteral, IV_NullLiteral, IV_NumericLiteral, IV_StringLiteral } from "./ALL_RVal/IV_Literals.ts";
import { IV_ModuleMeta, IV_NewTarget } from "./ALL_RVal/IV_META.ts";
import { IV_NewExpression } from "./ALL_RVal/IV_NewExpression.ts";
import { IV_ObjectExpression } from "./ALL_RVal/IV_ObjectExpression.ts";
import { IV_Regexp } from "./ALL_RVal/IV_Regexp.ts";
import { IV_TaggedTemplateCall, IV_TemplateLiteral } from "./ALL_RVal/IV_Templates.ts";
import { IV_This } from "./ALL_RVal/IV_This.ts";
import { IV_AUNOP, IV_BUNOP, IV_CUNOP, IV_DUNOP } from "./ALL_RVal/IV_Unop.ts";
import { IV_UpdateExpression } from "./ALL_RVal/IV_UpdateExpression.ts";
import { IV_AWAIT, IV_YIELD } from "./ALL_RVal/IV_YIELD_AWAIT.ts";
import { BB, BlockBB, BranchTerminal, CatchBB, ContainedBB, ContainedOptionalChainBB, ExitNode, FunctionArgInitBB, FunctionBB, GotoFunctionBody, ModuleBB, OptionalBranchTerminal, ScriptBB, TryBB, TryCatchConditionalGoto, UnconditionalGoto } from "./BB.ts";
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
      return this.handleJS3CallExpression(init);
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
    } else if (isJS3ObjectExpression(init)) {
      return this.handleJS3ObjectExpression(init)
    } else if (isJS3FunctionExpression(init)) {
      return this.handleJS3FunctionExpression(init)
    } else if (isJS3ArrowFunctionExpression(init)) {
      return this.handleJS3ArrowFunctionExpression(init)
    } else if (isJS3AnonMemberExpression(init)) {
      return this.handleJS3AnonMemberExpression(init)
    } else if (isJS3ArrayExpression(init)) {
      return this.handleJS3ArrayExpression(init)
    } else if (isJS3NewExpression(init)) {
      return this.handleJS3NewExpression(init);
    } else if (isJS3UnaryExpression(init)) {
      return this.handleJS3UnaryExpression(init);
    } else if (isJS3UpdateExpression(init)) {
      return this.handleJS3UpdateExpression(init);
    } else if (isJS3ClassExpression(init)) {
      // return this.handleJS3ClassExpression(init)
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

  lowerExprToValueBlock(from: JS3ContainedExprKey, block: BB, resID: IV_Identifier) {
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
    this.getCurrentBB().statements.push(new IS_SimpleVarDecl(undefined, "let", resID, new IV_Identifier(exprRes, exprRes.name)));

    // This is needed sometimes; to create JS3SpreadElement 
    return exprRes;

  }

  handleFunctionParams(params: Array<JS3AllowedFunctionArgs>, functionBody: FunctionBB): [Array<IV_Identifier | ISP_RestElement>, FunctionArgInitBB] {
    let oldBB = this.getCurrentBB()
    let fin_args: Array<IV_Identifier | ISP_RestElement> = []

    let argInitBlock = new FunctionArgInitBB(params)
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
    // Lower function body
    let funBB = new FunctionBB(node)
    funBB.terminal = new ExitNode()

    let oldBB = this.getCurrentBB()

    this.setCurrentBB(funBB)
    for (let s of node.body) {
      this.handleJS3AllowedProgStatement(s)
    }

    this.setCurrentBB(oldBB)
    return funBB
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

  // *********************** Iridium_ClassExpression ***********************

  handleJS3ClassExpression(node: JS3ClassExpression) {
    // 
    // Classes in JS are complicated, the shape is not known statically
    // the order in which side effects appear is not very easy to statically determine
    // Iridium separates the initialization logic of a class and the actual class declaration
    // Idea is that statically knowning class shape will help static analysis.
    // 
    // JS class initialization order:
    //  1. Super initialization: The super block is evaluated under a special new environment where the class name is bound as a non-writable property.
    //  2. Field Name Initialization: local / static fields in declaration order.
    //  3. Static Value Initialization: static field / static block value initialization in declaration order.
    //  4. Field Value Initialization: local / private field value initialization in declaration order.
    // 

    // 
    // Example Input: 
    // 

    // var probeBefore = function() { console.log("[probe before]");  return C; };
    // var probeHeritage;
    // var C = 'outside';
    // const Test = class C extends ( // <- This evaluation happens under a specific new scope
    //   ( 
    //     console.log("super stuff"), 
    //     probeHeritage = function() { console.log("[probe after]"); return C; }, // This (i.e. C) is a non-writable property
    //     function () {} 
    //   )
    // ) {
    //   #private1 = (console.log("[private-1] value init"), 1);;
    //   [(console.log("[local-field-1] name init"), "field1")] = (console.log("[local-field-1] value init"), 1);
    //   static [(console.log("[static-field-1] name init"), "field1")] = (console.log("[static-field-1] value init"), 1);
    //   static {
    //     console.log("[static-block-1]", this === C, this.field1, this.field2, this.field3)
    //   }
    //   #private2 = (console.log("[private-2] value init"), 1);;
    //   [(console.log("[local-field-2] name init"), "field2")] = (console.log("[local-field-2] value init"), 1);
    //   static [(console.log("[static-field-2] name init"), "field2")] = (console.log("[static-field-2] value init"), 1);
    //   static {
    //     console.log("[static-block-2]", this === C, this.field1, this.field2, this.field3)
    //   }
    //   #private3 = (console.log("[private-3] value init"), 1);;
    //   [(console.log("[local-field-3] name init"), "field3")] = (console.log("[local-field-3] value init"), 1);
    //   static [(console.log("[static-field-3] name init"), "field3")] = (console.log("[static-field-3] value init"), 1);
    //   static {
    //     console.log("[static-block-3]", this === C, this.field1, this.field2, this.field3)
    //   }
    // }


    // Example output:
    // super stuff
    // [local-field-1] name init
    // [static-field-1] name init
    // [local-field-2] name init
    // [static-field-2] name init
    // [local-field-3] name init
    // [static-field-3] name init
    // [static-field-1] value init
    // [static-block-1] true 1 undefined undefined
    // [static-field-2] value init
    // [static-block-2] true 1 1 undefined
    // [static-field-3] value init
    // [static-block-3] true 1 1 1
    // [private-1] value init
    // [local-field-1] value init
    // [private-2] value init
    // [local-field-2] value init
    // [private-3] value init
    // [local-field-3] value init
    // C { field1: 1, field2: 1, field3: 1 }
    // [probe before]
    // [probe after]

    // 
    // ClassInitBB:
    // 
    //   ...lowerHeritage
    //   ...lowerLocalOrStaticFieldNames
    //   ...lowerStaticFieldValueAndStaticBlocks
    //   ...lowerLocalandPrivateFieldValue
    //



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

      let curr = this.getCurrentBB()
      let postBB = curr.create()
      postBB.terminal = curr.terminal

      let resID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("unaryArg"))
      resID.isValue = true

      let unaryBB = new ContainedBB(node)
      curr.terminal = new UnconditionalGoto(unaryBB)
      unaryBB.terminal = new UnconditionalGoto(postBB)

      this.lowerExprToValueBlock(node.argument, unaryBB, resID)
      this.setCurrentBB(postBB)

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
    } else {
      debugConfig.logger.throwIriError("JS3AnonMemberExpression unhandled case")
    }
  }

  // *********************** Iridium_FunctionExpressions ***********************

  handleJS3ArrowFunctionExpression(node: JS3ArrowFunctionExpression) {
    let [params, funBody] = this.handleFunctionParams(node.params, this.handleFunctionBody(node.body))
    return new IV_ArrowFunctionExpression(node, params, funBody, undefined, node.generator, node.async)
  }

  handleJS3FunctionExpression(node: JS3FunctionExpression) {
    let [params, funBody] = this.handleFunctionParams(node.params, this.handleFunctionBody(node.body))
    let name: IV_Identifier | undefined = undefined
    if (isIdentifier(node.id)) name = new IV_Identifier(node.id, node.id.name)
    return new IV_FunctionExpression(node, params, funBody, name, node.generator, node.async)
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
        properties.push(new ISP_ArgSpread(p, new IV_Identifier(p.argument, p.argument.name)))
      }
    })

    return new IV_ObjectExpression(node, properties)

  }


  // *********************** Iridium_ConditionalExpression ***********************

  handleJS3ConditionalExpression(node: JS3ConditionalExpression) {
    let curr = this.getCurrentBB()
    let postBB = curr.create()
    postBB.terminal = curr.terminal

    let trueRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("trueRes"))
    trueRes.isValue = true
    let falseRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("falseRes"))
    falseRes.isValue = true

    let test = new IV_Identifier(node.test, node.test.name)
    test.isValue = true

    let TrueBB = new ContainedBB(node.consequent, "CondExpr: T")
    TrueBB.terminal = new UnconditionalGoto(postBB)
    let FalseBB = new ContainedBB(node.alternate, "CondExpr: F")
    FalseBB.terminal = new UnconditionalGoto(postBB)

    curr.terminal = new BranchTerminal(node, test, TrueBB, FalseBB)

    this.lowerExprToValueBlock(node.consequent, TrueBB, trueRes)
    this.lowerExprToValueBlock(node.alternate, FalseBB, falseRes)
    this.setCurrentBB(postBB)

    return new IV_ConditionalExpression(node, test, trueRes, falseRes);
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
    let genesisTestRes = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("genesisTestRes"))
    genesisTestRes.isValue = true
    let genesisTestBB: BB;


    // Base Case, initialize existing state for recursive calls
    if (!existingState) {
      let curr = this.getCurrentBB()
      let postBB = curr.create()
      postBB.terminal = curr.terminal

      let resID = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("chainRes"))
      resID.isValue = true
      let fallthruBlock = new ContainedOptionalChainBB(parentNode, "Chained Short-Circuit Terminal", true, true, true)
      let fallthrough_assn = new IS_SimpleVarDecl(undefined, "let", resID, new IV_Identifier(undefined, "undefined"))
      fallthruBlock.statements.push(fallthrough_assn)
      fallthruBlock.terminal = new UnconditionalGoto(postBB)
      existingState = { resID, fallthruBlock, postBB, callExprContext: false }

      // 
      //    CURR --GOTO--> genesisTestBB

      // CURR --GOTO--> genesisTestBB
      genesisTestBB = new ContainedOptionalChainBB(genesisNode, `Chain Expression: ${generate(parentNode).code}`, false)
      curr.terminal = new UnconditionalGoto(genesisTestBB)

    } else {
      genesisTestBB = this.getCurrentBB()
      if (genesisTestBB instanceof ContainedOptionalChainBB) {
      } else debugConfig.logger.throwIriError("For recursive case, basic block is expected to be a value block")
    }

    //    genesisTestBB --TEST--> chainBB --GOTO--> postBB (contextual)
    //                      |---> fallthruBlock (contextual) 

    // chainBB --GOTO--> postBB
    let chainBB = new ContainedOptionalChainBB(parentNode, "", true)
    chainBB.terminal = new UnconditionalGoto(existingState.postBB);

    // genesisTestBB --TEST--> chainBB
    //                   |---> fallthruBlock
    genesisTestBB.terminal = new OptionalBranchTerminal(parentNode, genesisTestRes, chainBB, existingState.fallthruBlock);

    this.lowerExprToValueBlock(objectToSpill, genesisTestBB, genesisTestRes)
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
      this.lowerExprToValueBlock(patchedNode, chainBB, existingState.resID)
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
      let resHolder = new IV_Identifier(undefined, this.js3builder.utils.getNewTemporary("arg"))
      resHolder.isValue = true

      let curr = this.getCurrentBB()
      let postBB = curr.create()
      postBB.terminal = curr.terminal
      let argSpillBB = new ContainedBB()
      curr.terminal = new UnconditionalGoto(argSpillBB)
      argSpillBB.terminal = new UnconditionalGoto(postBB)

      let toSpill: JS3ContainedExprKey

      if (isSpreadElement(a)) {
        toSpill = a.argument
      } else {
        toSpill = a
      }

      let loweredID = this.lowerExprToValueBlock(toSpill, argSpillBB, resHolder)

      this.setCurrentBB(postBB)

      if (isSpreadElement(a)) {
        args.push(new ISP_ArgSpread(generateJS3SpreadElement(loweredID, a), resHolder))
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
    let curr = this.getCurrentBB()
    let [params, funBody] = this.handleFunctionParams(stmt.params, this.handleFunctionBody(stmt.body))

    this.setCurrentBB(curr)
    curr.statements.push(new IS_FunDecl(stmt, params, funBody, new IV_Identifier(stmt.id, stmt.id.name), stmt.generator, stmt.async))
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