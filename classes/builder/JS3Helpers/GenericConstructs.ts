import debugConfig from "#debugConfig";
import _traverse from "@babel/traverse";
import { Expression, isAwaitExpression, isBigIntLiteral, isBooleanLiteral, isDecimalLiteral, isIdentifier, isNullLiteral, isNumericLiteral, isStringLiteral, isYieldExpression } from "@babel/types";
import * as walk from 'babel-walk';
import { JS3BuilderUtils } from "../JS3Builder.ts";
import { handleExpression } from "./HandleExpression.ts";
import { generateBaseNodeFrom, generateIdentifier, generateJS3ArrowFunctionExpressionfromBaseNode, generateJS3AwaitExpressionfromBaseNode, generateJS3BlockStatementfromBaseNode, generateJS3CallExpressionfromBaseNode, generateJS3ReturnStatement, generateJS3YieldExpression } from "./JS3Constructors.ts";
import { JS3BlockStatement_body, JS3ContainedExprKey, JS3ReturnStatement } from "./JS3Types.ts";

const traverse = _traverse.default;

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;



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
  } else if (isYieldExpression(node)) {
    let loweredExpression = lowerComputedKey(node.argument, otherProps)
    return generateJS3YieldExpression(loweredExpression, node);
  } else if (isAwaitExpression(node)) {
    let loweredExpression = lowerComputedKey(node.argument, otherProps)
    return generateJS3AwaitExpressionfromBaseNode(loweredExpression, node);
  }

  const countAwaitYield = walk.recursive({
    AwaitExpression(node, state, c) {
      state.counter++;
    },
    YieldExpression(node, state, c) {
      state.counter++;
    }
  });
  
  function containsAwaitOrYield(node) {
    const state = {
      counter: 0,
    };
    countAwaitYield(node, state);
    return state.counter > 0;
  }

  const hasAwaitOrYield = containsAwaitOrYield(node);

  if (hasAwaitOrYield) {
    debugConfig.logger.throwJS3Error("cannot lower expressions in arrow scope that contain `await` or `yield` expressions.")
  }



  // Create a call expression of the form
  // (function() { Expression is evaluated and returned as a result of this function }())

  // Evaluate the expression and get all its spills
  const holder: JS3BlockStatement_body = new Array()
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }
  const res = handleExpression(node, updatedProps)


  const dummyNode = generateBaseNodeFrom(node)

  const bodyOfTheFunc: JS3BlockStatement_body = updatedProps.others.holder;
  const funcExprBody = generateJS3BlockStatementfromBaseNode(bodyOfTheFunc, new Array(), dummyNode); // Function block

  const retStmt = generateBaseNodeFrom(node) as JS3ReturnStatement                                   // Add a return statement
  retStmt.type = "ReturnStatement";
  const js3RetStmt = generateJS3ReturnStatement(res, retStmt)
  bodyOfTheFunc.push(js3RetStmt)


  const funcExpr = generateJS3ArrowFunctionExpressionfromBaseNode(new Array(), funcExprBody, null, null, null, false, true, false, dummyNode); // function {BODY}

  // const funcExpr = generateJS3FunctionExpressionfromBaseNode(null, new Array(), funcExprBody, null, null, null, false, false, dummyNode); // function {BODY}

  const callFnExpr = generateJS3CallExpressionfromBaseNode(funcExpr, new Array(), null, null, null, dummyNode); // func()

  return callFnExpr
}