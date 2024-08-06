// 
// Variable Declaration
// 
// 

import debugConfig from "#debugConfig"
import { generateIdentifier, generateJS3ExportDefaultDeclaration } from "#utils"
import { ExportDefaultDeclaration, isExpression, TSDeclareFunction, FunctionDeclaration, ClassDeclaration, Identifier, isClassDeclaration } from "@babel/types"
import { JS3BuilderUtils } from "../JS3Builder"
import { JS3Statement, JS3ExportDefaultDeclaration, JS3ClassDeclaration } from "../JS3Instructions"
import { handleExpression } from "./ExperssionHandler"
import { handleClassDeclaration } from "./ClassDeclarationHandler"

// interface ExportDefaultDeclaration extends BaseNode {
//   type: "ExportDefaultDeclaration";
//   declaration: TSDeclareFunction | FunctionDeclaration | ClassDeclaration | Expression;
//   exportKind?: "value" | null;
// }

export function handleExportDefaultDeclaration(node: ExportDefaultDeclaration, holder: Array<JS3Statement>, utils: JS3BuilderUtils) {
  let declarationHolder: JS3ClassDeclaration | Identifier
  const declarationNode = node.declaration
  if (isExpression(declarationNode)) {
    declarationHolder = handleExpression(declarationNode, holder, utils)
  }
  else if (isClassDeclaration(declarationNode)) {
    declarationHolder = handleClassDeclaration(declarationNode, holder, utils)
  }
  else {
    declarationHolder = generateIdentifier(declarationNode, "$TODO")
    debugConfig.logger.error(`TODO // Handle export: ${declarationNode.type} @ ExportDefaultDeclarationHandler.ts`)
    // throw new JS3GenerationError(`TODO // Handle export: ${node.type} @ ExportDefaultDeclarationHandler.ts`);
  }

  // Push to holder
  holder.push(generateJS3ExportDefaultDeclaration(node, declarationHolder, node.exportKind));
}