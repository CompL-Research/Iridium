import debugConfig from "#debugConfig";
import { generateCommentLine, generateIdentifier, generateJS3CallExpression, generateJS3VariableDeclaration } from "#utils";
import { CallExpression, Expression, Identifier, isBooleanLiteral, isCallExpression, isExpression, isIdentifier, isNullLiteral, isNumericLiteral, isStringLiteral } from "@babel/types";
import { JS3BuilderUtils } from "../JS3Builder";
import { JS3Statement } from "../JS3Instructions";


// Returns an Identifier containing the result of the evaluated expression
export function handleExpression(node: Expression, holder: Array<JS3Statement>, utils: JS3BuilderUtils, prefix : string | undefined = undefined) : Identifier {
  const resultHolder = generateIdentifier(node, utils.getNewTemporary(prefix))

  if (isIdentifier(node)) {
    return node
  } else if (isStringLiteral(node) || isNumericLiteral(node) || isNullLiteral(node) || isBooleanLiteral(node)) {

    // Generate a new variable declaration node
    const assnm = generateJS3VariableDeclaration(node, resultHolder, node)
    assnm.trailingComments = []
    if (prefix) {
      assnm.trailingComments.push(generateCommentLine("source -- " + prefix))
    }

    // Push to holder
    holder.push(assnm)

  } else if (isCallExpression(node)) {
    
    // Handle call expression
    const callResult = handleCallExpression(node, holder, utils, prefix);
    
    // Generate a new variable declaration node
    const assnm = generateJS3VariableDeclaration(node, resultHolder, callResult)
    assnm.trailingComments = []
    if (prefix) {
      assnm.trailingComments.push(generateCommentLine("source -- " + prefix))
    }
    
    // Push to holder
    holder.push(assnm)
  }

  else {
    resultHolder.name = "$TODO"
    debugConfig.logger.error(`TODO // Handle expr: ${node.type} @ ExpressionHandler.ts`)
    // throw new JS3GenerationError(`TODO // Handle stmt: ${node.type} @ ExpressionHandler.ts`);
  }

  return resultHolder
}

export function handleCallExpression(node: CallExpression, holder: Array<JS3Statement>, utils: JS3BuilderUtils, prefix : string | undefined = undefined) : Identifier {
  const resultHolder = generateIdentifier(node, utils.getNewTemporary(prefix))
  let callee : Identifier 
  // Handle Callee
  if (isExpression(node.callee)) {
    callee = handleExpression(node.callee, holder, utils, prefix)
  }
  else {
    callee = generateIdentifier(node, "$TODO")
    debugConfig.logger.error(`TODO // Handle callexpr callee: ${node.callee.type} @ ExpressionHandler.ts`)
    // throw new JS3GenerationError(`TODO // Handle stmt: ${node.type} @ ExpressionHandler.ts`);
  }

  // Handle Arguments
  let args = new Array<Identifier>()
  for (const arg of node.arguments) {
    if (isExpression(arg)) {
      args.push(handleExpression(arg, holder, utils, prefix))
    }
    else {
      callee = generateIdentifier(node, "$TODO")
      debugConfig.logger.error(`TODO // Handle callexpr args: ${arg.type} @ ExpressionHandler.ts`)
      // throw new JS3GenerationError(`TODO // Handle stmt: ${node.type} @ ExpressionHandler.ts`);
    }
  }

  // Generate JS3 Call expression
  const js3CallExpression = generateJS3CallExpression(node, callee, args, node.optional, node.typeArguments, node.typeParameters)

  // Function call here
  const assnm = generateJS3VariableDeclaration(node, resultHolder, js3CallExpression)
  assnm.trailingComments = []
  if (prefix) {
    assnm.trailingComments.push(generateCommentLine("source -- " + prefix))
  }

  // push to holder
  holder.push(assnm)

  return resultHolder;
}
