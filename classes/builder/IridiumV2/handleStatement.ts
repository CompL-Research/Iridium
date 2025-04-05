import { isJS3BlockStatement, isJS3BreakStatement, isJS3ContinueStatement, isJS3DebuggerStatement, isJS3DoWhileStatement, isJS3EmptyStatement, isJS3ExportAllDeclaration, isJS3ExportDefaultDeclaration, isJS3ExportNamedDeclaration, isJS3ForInStatement, isJS3ForOfStatement, isJS3ForStatement, isJS3FunctionDeclaration, isJS3IfStatement, isJS3ImportDeclaration, isJS3LabeledStatement, isJS3ReturnStatement, isJS3SwitchStatement, isJS3ThrowStatement, isJS3TryStatement, isJS3VariableDeclaration, isJS3WhileStatement, JS3AllowedProgStatement, JS3BlockStatement, JS3IfStatement, JS3ReturnStatement, JS3VariableDeclaration } from "../JS3Helpers/JS3Types.ts";
import { isIdentifier } from "@babel/types";
import { IridiumBuildContext, IRIDIUMV2 } from "./IRIDIUMV2.ts";
import debugConfig from "#debugConfig";
import { IS_VAR_DECL_KIND } from "../IridiumHelpers/ALL_IS/IS_VarDecl.ts";
import { BBSEXP, EnvRead, Goto, IfElseJump, JSEnvWrite } from "./Types.ts";
import { IRIV2_RVAL } from "./handleRVal.ts";

export const IRIV2_STMT = (cx: IRIDIUMV2, stmt: JS3AllowedProgStatement) => {
  if (isJS3ImportDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ImportDeclaration");
  } else if (isJS3ExportDefaultDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ExportDefaultDeclaration");
  } else if (isJS3ExportNamedDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ExportNamedDeclaration");
  } else if (isJS3ExportAllDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ExportAllDeclaration");
  } else if (isJS3DebuggerStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3DebuggerStatement");
  } else if (isJS3ReturnStatement(stmt)) {
    handleReturnStatement(cx, stmt);
  } else if (isJS3ThrowStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ThrowStatement");
  } else if (isJS3VariableDeclaration(stmt)) {
    handleVariableDeclaration(cx, stmt);
  } else if (isJS3FunctionDeclaration(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3FunctionDeclaration");
  } else if (isJS3IfStatement(stmt)) {
    handleIfStatement(cx, stmt);
  } else if (isJS3TryStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3TryStatement");
  } else if (isJS3EmptyStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3EmptyStatement");
  } else if (isJS3WhileStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3WhileStatement");
  } else if (isJS3BreakStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3BreakStatement");
  } else if (isJS3ContinueStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ContinueStatement");
  } else if (isJS3BlockStatement(stmt)) {
    handleBlockStatement(cx, stmt);
  } else if (isJS3ForInStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ForInStatement");
  } else if (isJS3LabeledStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3LabeledStatement");
  } else if (isJS3ForStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ForStatement");
  } else if (isJS3DoWhileStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3DoWhileStatement");
  } else if (isJS3SwitchStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3SwitchStatement");
  } else if (isJS3ForOfStatement(stmt)) {
    debugConfig.logger.throwIriError("IRIV2: TODO JS3ForOfStatement");
  } else {
    debugConfig.logger.throwIriError(
      `IRIV2: Unhandled Statement ${stmt.type}, ${stmt.js3type}`,
    );
  }
};

const handleBlockStatement = (cx: IRIDIUMV2, stmt: JS3BlockStatement): IridiumBuildContext => {
  const oldContext = cx.getCurrentContext();
  const newContext = cx.declareAndPushLexicalContext();
  
  // Add Gotos from oldContext's last BB to currentBB.
  oldContext.getCurrentBB().args.push(new Goto(newContext.BB[0].idx))
  cx.addContinuation(oldContext);

  for (const s of stmt.body) {
    IRIV2_STMT(cx, s);
  }

  // After generating the code, add a goto from the last lowered block to the oldContexts continuation
  cx.getCurrentBB().args.push(new Goto(oldContext.getCurrentBB().idx));
  cx.popContext();

  return newContext;
}

const handleReturnStatement = (cx: IRIDIUMV2, stmt: JS3ReturnStatement) => {
  cx.getCurrentBB().args.push(new Goto(-1));
}

const handleIfStatement = (cx: IRIDIUMV2, stmt: JS3IfStatement) => {
  const currentContext = cx.getCurrentContext();
  const currentBB = currentContext.getCurrentBB();
  cx.addContinuation(currentContext);
  const postBB = currentContext.getCurrentBB();

  // Lower If code
  const trueContext = cx.declareAndPushLexicalContext();
  for (const s of stmt.consequent.body) {
    IRIV2_STMT(cx, s);
  }
  cx.getCurrentBB().args.push(new Goto(postBB.idx));
  cx.popContext();

  // Lower Else code
  let falseContext = undefined;
  if (stmt.alternate) {
    falseContext = cx.declareAndPushLexicalContext();
    for (const s of stmt.alternate.body) {
      IRIV2_STMT(cx, s);
    }
    cx.getCurrentBB().args.push(new Goto(postBB.idx));
    cx.popContext();
  }
  // Make branch check the last instruction of currentBB
  const ifElseJump = new IfElseJump(new EnvRead(stmt.test.name), trueContext.BB[0].idx, falseContext ? falseContext.BB[0].idx : postBB.idx)
  currentBB.args.push(ifElseJump);
}

const handleVariableDeclaration = (cx: IRIDIUMV2, stmt: JS3VariableDeclaration) => {
  // Assert that only one specifier exists
  if (stmt.kind === "using" || stmt.kind === "await using") {
    debugConfig.logger.throwIriError(
      "JS3VariableDeclaration: 'using' and 'await using' not supported in JS3",
    );
    return;
  }

  // Assert that only one specifier exists
  if (stmt.declarations.length !== 1) {
    debugConfig.logger.throwIriError(
      "JS3VariableDeclaration: expecting exactly one declaration in JS3",
    );
    return;
  }

  const declaration = stmt.declarations[0];
  const KIND: IS_VAR_DECL_KIND = stmt.kind;

  // case a.
  // KIND ID = RVal
  if (isIdentifier(declaration.id)) {
    const rValTarget = IRIV2_RVAL(cx, declaration.init);
    const envWrite = new JSEnvWrite(declaration.id.name, rValTarget, KIND);
    cx.getCurrentBB().args.push(envWrite);
    return;
  }

  // // case b.
  // // KIND [ ID, ...ID ] = RVal
  // if (isJS3ArrayPattern(declaration.id)) {
  //   const LVal = declaration.id;
  //   const RVal = declaration.init
  //     ? this.handleJS3AssnInit(declaration.init)
  //     : null;
  //   this.getCurrentFGContext()
  //     .getCurrentBB()
  //     .statements.push(new IS_ArrPatVarDecl(stmt, KIND, LVal, RVal));
  //   return;
  // }

  // // case c.
  // // KIND { TRIV_KEY: ID, ...ID } = RVal
  // if (isJS3ObjectPattern(declaration.id)) {
  //   const LVal = declaration.id;
  //   const RVal = declaration.init
  //     ? this.handleJS3AssnInit(declaration.init)
  //     : null;
  //   this.getCurrentFGContext()
  //     .getCurrentBB()
  //     .statements.push(new IS_ObjPatVarDecl(stmt, KIND, LVal, RVal));
  //   return;
  // }

  debugConfig.logger.throwIriError("IRIV2: JS3VariableDeclaration UNHANDLED");
  return;
}