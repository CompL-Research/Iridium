// 
// Try Statement Handlers
// 
// https://tc39.es/ecma262/#sec-declarations-and-the-variable-statement
// 

import { TryStatement } from "@babel/types"
import { ProjectFile } from "../../ProjectFile"
import { JS3Block, JS3CatchClause, JS3Module } from "../JS3Module"
import { handleBlockStatement, handleCatchClause } from "./BlockStatementHandler"
import { TryStmt } from "../JS3Instructions"
import { isCatchClause } from "@babel/types"
import { isBlockStatement } from "@babel/types"

// interface TryStatement extends BaseNode {
//     type: "TryStatement";
//     block: BlockStatement;
//     handler?: CatchClause | null;
//     finalizer?: BlockStatement | null;
// }
export function handleTryStatement(node: TryStatement, module: JS3Module, projectFile: ProjectFile) {
  const toTry = handleBlockStatement(node.block, module, projectFile)
  let ifCaught : JS3CatchClause | null = null
  let inTheEnd : JS3Block | null = null
  if (isCatchClause(node.handler)) ifCaught = handleCatchClause(node.handler, module, projectFile)
  if (isBlockStatement(node.handler)) inTheEnd = handleBlockStatement(node.handler, module, projectFile)


  const tryStmt = new TryStmt(node, toTry, ifCaught, inTheEnd)

  module.addStatement(tryStmt)
  
}