// 
// Variable Declaration
// 
// https://tc39.es/ecma262/#sec-declarations-and-the-variable-statement
// 

import { isExpression, VariableDeclaration } from "@babel/types"
import { generateJS3VariableDeclaration } from "#utils"
import { JS3BuilderUtils } from "../JS3Builder"
import { JS3Statement } from "../JS3Instructions"
import { handleExpression } from "./ExperssionHandler"

// interface VariableDeclaration extends BaseNode {
//   type: "VariableDeclaration";
//   kind: "var" | "let" | "const" | "using" | "await using";
//   declarations: Array<VariableDeclarator>;
//   declare?: boolean | null;
// }

// interface VariableDeclarator extends BaseNode {
//   type: "VariableDeclarator";
//   id: LVal;
//   init?: Expression | null;
//   definite?: boolean | null;
// }

// type LVal = Identifier | MemberExpression | RestElement | AssignmentPattern | ArrayPattern | ObjectPattern | TSParameterProperty | TSAsExpression | TSSatisfiesExpression | TSTypeAssertion | TSNonNullExpression;

export function handleVariableDeclaration(node: VariableDeclaration, holder: Array<JS3Statement>, utils: JS3BuilderUtils) {
  for (const declarator of node.declarations) {
    const result = isExpression(declarator.init) ? handleExpression(declarator.init, holder, utils) : null
    const duplicatedNode = generateJS3VariableDeclaration(node, declarator.id, result, node.kind, node.declare, declarator.definite)
    // Push to holder
    holder.push(duplicatedNode)
  }
}