import { generateCommentBlock } from "#utils";
import {
  ArrowFunctionExpression,
  ClassDeclaration,
  ClassExpression,
  Expression,
  FunctionDeclaration,
  FunctionExpression,
  identifier,
  Identifier,
  isArrowFunctionExpression,
  isBigIntLiteral,
  isBooleanLiteral,
  isClassDeclaration,
  isDecimalLiteral,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isNullLiteral,
  isNumericLiteral,
  isStringLiteral,
  isYieldExpression,
  objectExpression,
  objectProperty
} from "@babel/types";
import { JS3BuilderUtils } from "../JS3Builder";
import {
  handleArrowFunctionExpression,
  handleClassExpression,
  handleFunctionExpression,
} from "./HandleExpression";
import {
  generateIdentifier,
  generateJS3DefaultExportMemberExpression,
  generateJS3VariableDeclarationfromBaseNode,
  generateJS3VariableDeclaratorfromBaseNode
} from "./JS3Constructors";
import {
  JS3ArrowFunctionExpression,
  JS3ClassExpression,
  JS3ContainedExprKey,
  JS3FunctionExpression,
  JS3Program_body
} from "./JS3Types";

type OtherProps = JS3BuilderUtils;

export function handleDefaultExportNames(
  orig_declaration:
    | FunctionDeclaration
    | ClassDeclaration
    | FunctionExpression
    | ArrowFunctionExpression
    | ClassExpression,
  otherProps: OtherProps,
): Identifier {
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

  let finDecl:
    | JS3FunctionExpression
    | JS3ClassExpression
    | JS3ArrowFunctionExpression;

  if (isClassDeclaration(orig_declaration)) {
    //@ts-expect-error: We are processing class declaration as a class expression here.
    orig_declaration.type = "ClassExpression";

    //@ts-expect-error: We are processing class declaration as a class expression here.
    finDecl = handleClassExpression(orig_declaration, otherProps);

    orig_declaration.type = "ClassDeclaration";
  } else if (isFunctionDeclaration(orig_declaration)) {
    //@ts-expect-error: We are processing function declaration as a function expression here.
    orig_declaration.type = "FunctionExpression";

    //@ts-expect-error: We are processing function declaration as a function expression here.
    finDecl = handleFunctionExpression(orig_declaration, otherProps);

    orig_declaration.type = "FunctionDeclaration";
  } else if (isFunctionExpression(orig_declaration)) {
    finDecl = handleFunctionExpression(orig_declaration, otherProps); // Not sure if this is possible
  } else if (isArrowFunctionExpression(orig_declaration)) {
    finDecl = handleArrowFunctionExpression(orig_declaration, otherProps);
  } else {
    finDecl = handleClassExpression(orig_declaration, otherProps); // Not sure if this is possible
  }

  const memberExprObj = objectExpression([
    objectProperty(identifier("default"), finDecl, false, false, null),
  ]);
  const temp$1 = generateIdentifier(
    orig_declaration,
    otherProps.getNewTemporary("exportDefUnnamed"),
  );
  const varDecl = generateJS3VariableDeclaratorfromBaseNode(
    temp$1,
    generateJS3DefaultExportMemberExpression(
      memberExprObj,
      identifier("default"),
      false,
      false,
      orig_declaration,
    ),
    null,
    orig_declaration,
  );
  if (!otherProps.others) throw new Error("otherProps.others undefined");
  if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
  (otherProps.others.holder as JS3Program_body).push(
    generateJS3VariableDeclarationfromBaseNode(
      [varDecl],
      "let",
      null,
      orig_declaration,
    ),
  );

  return temp$1;
}

export function lowerComputedKey(
  node: Expression,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  otherProps: OtherProps,
): JS3ContainedExprKey {
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
  } 
  // else if (isYieldExpression(node) && !node.argument) {
  //   return generateIdentifier(node, "yield");
  // } 
  else {
    node.leadingComments = [generateCommentBlock("JS3ContainedExprKey")];
    //@ts-expect-error: Mark the node as JS3ContainedExprKey, js3type prop helps validate it later.
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

  //   throw new Error("lowerComputeKey error: cannot lower expressions to keys that have 'yield'")
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
