import { isJS3BlockStatement, isJS3CatchClause, JS3TryStatement } from '../JS3Helpers/JS3Types.ts'
import { createBackLink, F_Block } from './Block.ts'
import { handleJS3AllowedProgStatement } from './Statement.ts'

export function handleJS3TryStatement(node: JS3TryStatement) {
  let parentBlock: F_Block = this.current
  let nextBlock = new F_Block()
  nextBlock.name = "Post-Try"

  let tryBlock = new F_Block()
  tryBlock.name = "Try"
  let catchBlock = undefined
  let finalizerBlock = undefined

  // Try Block  
  this.current = tryBlock
  node.block.body.forEach(i => handleJS3AllowedProgStatement.call(this, i))

  createBackLink(parentBlock, tryBlock)

  // If no catch or finalizer
  if (!(isJS3CatchClause(node.handler) || isJS3BlockStatement(node.finalizer))) {
    createBackLink(tryBlock, nextBlock)
  }

  // Catch Block
  if (isJS3CatchClause(node.handler)) {
    catchBlock = new F_Block()
    catchBlock.name = "Catch"
    this.current = catchBlock
    node.handler.body.body.forEach(i => handleJS3AllowedProgStatement.call(this, i))

    createBackLink(tryBlock, catchBlock)
    createBackLink(catchBlock, nextBlock)
  }

  // Finalizer Block
  if (isJS3BlockStatement(node.finalizer)) {
    finalizerBlock = new F_Block()
    finalizerBlock.name = "Finalize"
    this.current = finalizerBlock
    node.finalizer.body.forEach(i => handleJS3AllowedProgStatement.call(this, i))

    createBackLink(tryBlock, finalizerBlock)
    if (catchBlock) createBackLink(catchBlock, finalizerBlock)
    createBackLink(finalizerBlock, nextBlock)
  }

  this.current = nextBlock
}