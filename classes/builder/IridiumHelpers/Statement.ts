import { isJS3ImportDeclaration, isJS3TryStatement, JS3AllowedProgStatement } from "../JS3Helpers/JS3Types.ts"
import debugConfig from "#debugConfig";
import { handleJS3ImportDeclaration } from "./Imports.ts";
import { handleJS3TryStatement } from "./Try.ts";
import { F_Unhandled } from "./General.ts";

export function handleJS3AllowedProgStatement(n: JS3AllowedProgStatement) {
  

  // Handle each case here
  if (isJS3ImportDeclaration(n)) {
    handleJS3ImportDeclaration.call(this, n)
  } else if (isJS3TryStatement(n)) {
    handleJS3TryStatement.call(this, n)
  } else {
    debugConfig.logger.throwIriError(`[Iridium] Unhandled ${n.type} -- ${n.js3type}`, [n])
    // @ts-ignore
    this.current.pushInstruction(new F_Unhandled(n))
  }
}