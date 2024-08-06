// 
// Block Statement Handlers
// 
// https://tc39.es/ecma262/#prod-Block
// 

import { BlockStatement, CatchClause } from "@babel/types"
import { ProjectFile } from "../../ProjectFile"
import { CatchClauseParam, JS3Block, JS3CatchClause, JS3Module } from "../JS3Module"
import { isImportDeclaration } from "@babel/types"
import { handleImportDeclaration } from "./ImportDeclarationHandler"
import { isVariableDeclaration } from "@babel/types"
import { handleVariableDeclaration } from "./VariableDeclarationHandler"
import debugConfig from "#debugConfig"
import assert from "node:assert"
import { isIdentifier } from "@babel/types"
import { isExpressionStatement } from "@babel/types"
import { handleExpressionStatement } from "./ExperssionHandler"

// interface BlockStatement extends BaseNode {
//   type: "BlockStatement";
//   body: Array<Statement>;
//   directives: Array<Directive>;
// }
export function handleBlockStatement(node: BlockStatement, module: JS3Module, projectFile: ProjectFile) : JS3Block {
  const temporaryModule = new JS3Block(module)
  for (const s of node.body) {
    if (isImportDeclaration(s)) {
      assert(false) // import declaration inside blocks are not allowed!!!
    } else if (isVariableDeclaration(s)) {
      handleVariableDeclaration(s, temporaryModule, projectFile)
    } else if (isExpressionStatement(s)) {
      handleExpressionStatement(s.expression, temporaryModule, projectFile)
    }
    
    else {
      debugConfig.logger.error(`// TODO BLOCKSTMT: ${s.type}`, [s]);
    }
  }
  return temporaryModule
}

// interface CatchClause extends BaseNode {
//   type: "CatchClause";
//   param?: Identifier | ArrayPattern | ObjectPattern | null;
//   body: BlockStatement;
// }
export function handleCatchClause(node: CatchClause, module: JS3Module, projectFile: ProjectFile) : JS3CatchClause {
  let param: CatchClauseParam
  
  if (isIdentifier(node.param)) {
    param = node.param.name
  } else if (node.param === null) {
    param = ""
  } else {
    debugConfig.logger.log(`// TODO Catch Clause Param: ${node.param?.type}`, [node.param])
    param = "$TODO$"
  }

  const blockModule = handleBlockStatement(node.body, module, projectFile)
  const temporaryModule = new JS3CatchClause(module, param, blockModule)

  return temporaryModule
}