import { Expression, isBigIntLiteral, isBooleanLiteral, isDecimalLiteral, isIdentifier, isNullLiteral, isNumericLiteral, isStringLiteral } from "@babel/types";
import { JS3BuilderUtils } from "../JS3Builder.ts";
import { handleExpression } from "./HandleExpression.ts";
import { generateBaseNodeFrom, generateJS3BlockStatementfromBaseNode, generateJS3CallExpressionfromBaseNode, generateJS3FunctionExpressionfromBaseNode, generateJS3ReturnStatement } from "./JS3Constructors.ts";
import { JS3BlockStatement_body, JS3ContainedExprKey, JS3ReturnStatement } from "./JS3Types.ts";


const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;



export function lowerComputedKey(node: Expression, otherProps: OtherProps): JS3ContainedExprKey  {

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

  const funcExpr = generateJS3FunctionExpressionfromBaseNode(null, new Array(), funcExprBody, null, null, null, false, false, dummyNode); // function {BODY}
  const callFnExpr = generateJS3CallExpressionfromBaseNode(funcExpr, new Array(), null, null, null, dummyNode); // func()
  
  return callFnExpr
}