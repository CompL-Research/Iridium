import debugConfig from "#debugConfig";
import _traverse from "@babel/traverse";
import { ArrowFunctionExpression, ClassDeclaration, ClassExpression, Expression, FunctionDeclaration, FunctionExpression, identifier, Identifier, isArrayPattern, isArrowFunctionExpression, isAssignmentPattern, isBigIntLiteral, isBooleanLiteral, isClassDeclaration, isClassExpression, isDecimalLiteral, isFunctionDeclaration, isFunctionExpression, isIdentifier, isMemberExpression, isNullLiteral, isNumericLiteral, isObjectPattern, isRestElement, isStringLiteral, isTSAsExpression, isTSNonNullExpression, isTSParameterProperty, isTSSatisfiesExpression, isTSTypeAssertion, isYieldExpression, objectExpression, objectProperty, VariableDeclaration } from "@babel/types";
import { JS3BuilderUtils } from "../JS3Builder.ts";
import { generateIdentifier, generateJS3DefaultExportMemberExpression, generateJS3LoopDeclarationfromBaseNode, generateJS3LoopDeclaratorfromBaseNode, generateJS3VariableDeclarationfromBaseNode, generateJS3VariableDeclaratorfromBaseNode } from "./JS3Constructors.ts";
import { isJS3ClassExpression, JS3ArrowFunctionExpression, JS3ClassExpression, JS3ContainedExprKey, JS3FunctionExpression, JS3LoopDeclaration, JS3LoopDeclaration_declarations, JS3LoopDeclarator_id, JS3Program_body } from "./JS3Types.ts";
import { generateCommentBlock } from "#utils";
import { handleArrowFunctionExpression, handleClassExpression, handleFunctionExpression } from "./HandleExpression.ts";

const traverse = _traverse.default;

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;

export function handleDefaultExportNames(orig_declaration: FunctionDeclaration | ClassDeclaration | FunctionExpression | ArrowFunctionExpression | ClassExpression, otherProps) : Identifier {
  // input: 
  // export default function() {  }
  // export default class {}
  // export default () => {}
  // 
  // 
  // output:
  // 
  // let temp$1 = { default: JS3FunctionExpression }.default
  // export temp$1


  let finDecl : JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression

  if (isClassDeclaration(orig_declaration)) {
    //@ts-ignore
    orig_declaration.type = "ClassExpression"

    //@ts-ignore
    finDecl = handleClassExpression(orig_declaration, otherProps);
    
    //@ts-ignore
    orig_declaration.type = "ClassDeclaration"

  } else if (isFunctionDeclaration(orig_declaration)) {
    //@ts-ignore
    orig_declaration.type = "FunctionExpression"

    //@ts-ignore
    finDecl = handleFunctionExpression(orig_declaration, otherProps);

    //@ts-ignore
    orig_declaration.type = "FunctionDeclaration"

  } else if (isFunctionExpression(orig_declaration)) {
    finDecl = handleFunctionExpression(orig_declaration, otherProps); // Not sure if this is possible
  } else if (isArrowFunctionExpression(orig_declaration)) {
    finDecl = handleArrowFunctionExpression(orig_declaration, otherProps);
  } else if (isClassExpression(orig_declaration)) {
    finDecl = handleClassExpression(orig_declaration, otherProps); // Not sure if this is possible
  }

  let memberExprObj = objectExpression([objectProperty(identifier("default"), finDecl, false, false, null)])
  let temp$1 = generateIdentifier(orig_declaration, otherProps.getNewTemporary("exportDefUnnamed"))
  let varDecl = generateJS3VariableDeclaratorfromBaseNode(temp$1, generateJS3DefaultExportMemberExpression(memberExprObj, identifier("default"), false, false, orig_declaration), null, orig_declaration);
  (otherProps.others.holder as JS3Program_body).push(generateJS3VariableDeclarationfromBaseNode([varDecl], "let", null, orig_declaration))

  return temp$1
}


export function handleLoopDeclaration(node: VariableDeclaration, otherProps: OtherProps) : JS3LoopDeclaration {

  // Iterate over the delarations and enacapsulate the inits into an anonymous namespace...
  
  let orig_declarations = node.declarations;
  let fin_declarations : JS3LoopDeclaration_declarations = new Array()

  for (let d of orig_declarations) {
    let init = d.init ? lowerComputedKey(d.init, otherProps) : null;
    let orig_id = d.id
    let fin_id : JS3LoopDeclarator_id = null;
    if (isIdentifier(orig_id)) {
      otherProps.others.isNamedEvalContext = orig_id.name
      fin_id = orig_id
    } else if (isArrayPattern(orig_id)) {
      fin_id = orig_id
    } else if (isObjectPattern(orig_id)) {
      fin_id = orig_id
    } else if (isMemberExpression(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->MemberExpression");
    } else if (isRestElement(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->RestElement");
    } else if (isAssignmentPattern(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->AssignmentPattern");
    } else if (isTSParameterProperty(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->TSParameterProperty");
    } else if (isTSAsExpression(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->TSAsExpression");
    } else if (isTSSatisfiesExpression(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->TSSatisfiesExpression");
    } else if (isTSTypeAssertion(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->TSTypeAssertion");
    } else if (isTSNonNullExpression(orig_id)) {
      debugConfig.logger.throwJS3Error("TODO // [JS3LoopDecl]unhandled VariableDeclarator->id->TSNonNullExpression");
    }

    fin_declarations.push(generateJS3LoopDeclaratorfromBaseNode(fin_id, init, d.definite, d))
  }

  let result : JS3LoopDeclaration = generateJS3LoopDeclarationfromBaseNode(fin_declarations, node.kind, node.declare, node)
  return result
}


export function lowerComputedKey(node: Expression, otherProps: OtherProps): JS3ContainedExprKey {
  if (isIdentifier(node)) {
    return node;
  } else if (isStringLiteral(node)) {
    return node;
  } else if (isNumericLiteral(node)) {
    return node;
  } else if (isNullLiteral(node)) {
    return node;
  } else if (isBooleanLiteral(node)) {
    return node;
  } else if (isBigIntLiteral(node)) {
    return node;
  } else if (isDecimalLiteral(node)) {
    return node;
  } else if (isYieldExpression(node) && (!node.argument)) {
    return generateIdentifier(node, "yield")
  } else {
    node.leadingComments = [generateCommentBlock("JS3ContainedExprKey")];
    // @ts-ignore
    node.js3type = "JS3ContainedExprKey";
    return node;
  }
  
  // else if (isYieldExpression(node)) {
  //   let loweredExpression = lowerComputedKey(node.argument, otherProps)
  //   return generateJS3YieldExpression(loweredExpression, node);
  // } else if (isAwaitExpression(node)) {
  //   let loweredExpression = lowerComputedKey(node.argument, otherProps)
  //   return generateJS3AwaitExpressionfromBaseNode(loweredExpression, node);
  // }

  // type WalkState = {
  //   yield: number,
  //   await: number
  // }

  // const countNodes = walk.recursive<WalkState>({
  //   AwaitExpression(node, state, c) {
  //     state.await++;
  //   },
  //   YieldExpression(node, state, c) {
  //     state.yield++;
  //   }
  // });


  // const state: WalkState = {
  //   yield: 0,
  //   await: 0,
  // };

  // countNodes(node, state);

  // const hasYield = state.yield > 0;

  // if (hasYield) {

  //   debugConfig.logger.throwJS3Error("lowerComputeKey error: cannot lower expressions to keys that have 'yield'")
  // }

  // const hasAwait = state.await > 0;
  
  // // 
  // // If we have an expression that has await, let us consider the following
  // // 
  // // EXPR: "a" + (await abv) + "d"
  // // 
  // // f ("a" + (await abv) + "d")
  // // 
  // // We could lower it down as follows:
  // // 
  // // f (
  // //    await ((async () => {
  // //    $res = lower expression...
  // //    return $res
  // //    })())
  // // )
  // // 


  // if (hasAwait) {
  //   // Evaluate the expression and get all its spills
  //   const holder: JS3BlockStatement_body = new Array()
  //   const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }

  //   let res : Identifier;
  //   if (isFunctionExpression(node) || isArrowFunctionExpression(node) || isClassExpression(node)) {
  //     res = lowerToAnonArrayExpr(node, updatedProps)
  //   } else {
  //     res = handleExpression(node, updatedProps)
  //   }

  //   const dummyNode = generateBaseNodeFrom(node)
  
  //   const bodyOfTheFunc: JS3BlockStatement_body = updatedProps.others.holder;
  //   const funcExprBody = generateJS3BlockStatementfromBaseNode(bodyOfTheFunc, new Array(), dummyNode); // Function block
  
  //   const retStmt = generateBaseNodeFrom(node) as JS3ReturnStatement                                   // Add a return statement
  //   retStmt.type = "ReturnStatement";
  //   const js3RetStmt = generateJS3ReturnStatement(res, retStmt)
  //   bodyOfTheFunc.push(js3RetStmt)
  
  
  //   const funcExpr = generateJS3ArrowFunctionExpressionfromBaseNode(new Array(), funcExprBody, null, null, null, true, true, false, dummyNode); // async () => {BODY}

  //   const callFnExpr = generateJS3CallExpressionfromBaseNode(funcExpr, new Array(), null, null, null, dummyNode); // (async () => {BODY})()

  //   const awaitExpr = generateJS3AwaitExpressionfromBaseNode(callFnExpr, dummyNode) // await ((async () => {BODY})())
    
  //   return awaitExpr
  // } else {
  //   // Create a call expression of the form
  //   // (function() { Expression is evaluated and returned as a result of this function }())
  
  //   // Evaluate the expression and get all its spills
  //   const holder: JS3BlockStatement_body = new Array()
  //   const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }
    
  //   // TODO: Handle anonymous fn/class namespace...
  //   let res : Identifier;
  //   if (isFunctionExpression(node) || isArrowFunctionExpression(node) || isClassExpression(node)) {
  //     res = lowerToAnonArrayExpr(node, updatedProps)
  //   } else {
  //     res = handleExpression(node, updatedProps)
  //   }
  
  //   const dummyNode = generateBaseNodeFrom(node)
  
  //   const bodyOfTheFunc: JS3BlockStatement_body = updatedProps.others.holder;
  //   const funcExprBody = generateJS3BlockStatementfromBaseNode(bodyOfTheFunc, new Array(), dummyNode); // Function block
  
  //   const retStmt = generateBaseNodeFrom(node) as JS3ReturnStatement                                   // Add a return statement
  //   retStmt.type = "ReturnStatement";
  //   const js3RetStmt = generateJS3ReturnStatement(res, retStmt)
  //   bodyOfTheFunc.push(js3RetStmt)
  
  
  //   const funcExpr = generateJS3ArrowFunctionExpressionfromBaseNode(new Array(), funcExprBody, null, null, null, false, true, false, dummyNode); // () => {BODY}
    
  //   const callFnExpr = generateJS3CallExpressionfromBaseNode(funcExpr, new Array(), null, null, null, dummyNode); // (() => {BODY})()
  
  //   return callFnExpr
  // }
}