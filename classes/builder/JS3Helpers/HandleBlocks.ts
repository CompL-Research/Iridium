// Generated on 7/8/2024, 5:50:38 pm, generated 16 handlers 

import { BlockStatement, BreakStatement, CatchClause, ContinueStatement, DoWhileStatement, EmptyStatement, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement, FunctionDeclaration, IfStatement, isArrowFunctionExpression, isBigIntLiteral, isBlockStatement, isBooleanLiteral, isBreakStatement, isCatchClause, isClassDeclaration, isClassExpression, isContinueStatement, isDebuggerStatement, isDecimalLiteral, isDeclareClass, isDeclaredPredicate, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isDoWhileStatement, isEmptyStatement, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isExpression, isExpressionStatement, isForInStatement, isForOfStatement, isForStatement, isFunctionDeclaration, isFunctionExpression, isIdentifier, isIfStatement, isImportDeclaration, isInferredPredicate, isInterfaceDeclaration, isLabeledStatement, isLVal, isNoop, isNullLiteral, isNumericLiteral, isOpaqueType, isPattern, isRestElement, isReturnStatement, isStatement, isStringLiteral, isSwitchStatement, isThrowStatement, isTryStatement, isTSDeclareFunction, isTSEnumDeclaration, isTSExportAssignment, isTSImportEqualsDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSNamespaceExportDeclaration, isTSTypeAliasDeclaration, isTSTypeAnnotation, isTSTypeParameterDeclaration, isTypeAlias, isTypeAnnotation, isTypeParameterDeclaration, isVariableDeclaration, isWhileStatement, isWithStatement, LabeledStatement, ReturnStatement, Statement, SwitchCase, SwitchStatement, ThrowStatement, TryStatement, VariableDeclaration, VariableDeclarator, WithStatement } from "@babel/types";
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { JS3AllowedBlockStatement, JS3BlockStatement, JS3BlockStatement_body, JS3BreakStatement, JS3BreakStatement_label, JS3CatchClause_body, JS3ContinueStatement, JS3ContinueStatement_label, JS3DoWhileStatement, JS3DoWhileStatement_test, JS3ExpressionStatement, JS3ExpressionStatement_expression, JS3ForInStatement, JS3ForInStatement_body, JS3ForInStatement_left, JS3ForInStatement_right, JS3ForOfStatement, JS3ForOfStatement_left, JS3ForOfStatement_right, JS3ForStatement, JS3ForStatement_body, JS3ForStatement_init, JS3ForStatement_test, JS3ForStatement_update, JS3FunctionDeclaration, JS3FunctionDeclaration_body, JS3FunctionDeclaration_id, JS3FunctionDeclaration_params, JS3FunctionDeclaration_predicate, JS3FunctionDeclaration_returnType, JS3FunctionDeclaration_typeParameters, JS3IfStatement_alternate, JS3IfStatement_consequent, JS3IfStatement_test, JS3LabeledStatement, JS3LabeledStatement_body, JS3ReturnStatement_argument, JS3SwitchCase, JS3SwitchCase_consequent, JS3SwitchCase_test, JS3SwitchStatement, JS3SwitchStatement_cases, JS3SwitchStatement_discriminant, JS3ThrowStatement_argument, JS3TryStatement_block, JS3TryStatement_finalizer, JS3TryStatement_handler, JS3VariableDeclaration, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_init, JS3WithStatement, JS3WithStatement_body, JS3WithStatement_object } from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { handleArrowFunctionExpression, handleClassExpression, handleExpression, handleFunctionExpression } from "./HandleExpression.ts";
import { generateBaseNodeFrom, generateIdentifier, generateJS3BlockStatement, generateJS3BlockStatementfromBaseNode, generateJS3BreakStatement, generateJS3BreakStatementfromBaseNode, generateJS3CatchClause, generateJS3ContinueStatement, generateJS3DoWhileStatement, generateJS3ExpressionStatement, generateJS3ForInStatement, generateJS3ForOfStatement, generateJS3ForStatement, generateJS3FunctionDeclaration, generateJS3IfStatement, generateJS3IfStatementfromBaseNode, generateJS3LabeledStatement, generateJS3ReturnStatement, generateJS3SwitchCase, generateJS3SwitchStatement, generateJS3ThrowStatement, generateJS3TryStatement, generateJS3UnaryExpressionfromBaseNode, generateJS3VariableDeclaration, generateJS3VariableDeclarator, generateJS3WithStatement } from "./JS3Constructors.ts";

import { generateCommentLine } from "#utils";
import assert from 'node:assert';
import { lowerComputedKey } from "./GenericConstructs.ts";
import { handleClassDeclaration } from "./HandleClassDeclaration.ts";

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;


export function handleBlockStatement(node: BlockStatement, otherProps: OtherProps): JS3BlockStatement {
  // 2 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3BlockStatement_body = new Array(); // Handling prop body

  // Block Scope
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: fin_body } }
  for (const stmt of orig_body) {
    const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(stmt, updatedProps)
    if (Array.isArray(blockStmt)) blockStmt.forEach(s => fin_body.push(s))
    else fin_body.push(blockStmt)
  }

  let result: JS3BlockStatement = generateJS3BlockStatement(fin_body, node);
  return result
}

export function handleStatement(node: Statement, otherProps: OtherProps): JS3AllowedBlockStatement | Array<JS3VariableDeclaration> {
  if (isBlockStatement(node)) return handleBlockStatement(node, otherProps)

  else if (isBreakStatement(node)) return handleBreakStatement(node, otherProps)

  else if (isContinueStatement(node)) return handleContinueStatement(node, otherProps)

  else if (isDebuggerStatement(node)) debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DebuggerStatement");

  else if (isDoWhileStatement(node)) return handleDoWhileStatement(node, otherProps)

  else if (isEmptyStatement(node)) return node

  else if (isExpressionStatement(node)) return handleExpressionStatement(node, otherProps)

  else if (isForInStatement(node)) return handleForInStatement(node, otherProps)

  else if (isForOfStatement(node)) return handleForOfStatement(node, otherProps);

  else if (isForStatement(node)) return handleForStatement(node, otherProps)

  else if (isFunctionDeclaration(node)) return handleFunctionDeclaration(node, otherProps)

  else if (isIfStatement(node)) return handleIfStatement(node, otherProps)

  else if (isLabeledStatement(node)) return handleLabeledStatement(node, otherProps)

  else if (isReturnStatement(node)) return handleReturnStatement(node, otherProps)

  else if (isSwitchStatement(node)) return handleSwitchStatement(node, otherProps);

  else if (isThrowStatement(node)) return handleThrowStatement(node, otherProps)

  else if (isTryStatement(node)) return handleTryStatement(node, otherProps)

  else if (isVariableDeclaration(node)) return handleVariableDeclaration(node, otherProps)

  else if (isWhileStatement(node)) debugConfig.logger.throwJS3Error("TODO // unhandled Statement->WhileStatement");

  else if (isWithStatement(node)) return handleWithStatement(node, otherProps)

  else if (isClassDeclaration(node)) return handleClassDeclaration(node, otherProps)

  else if (isExportAllDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->ExportAllDeclaration");
  } else if (isExportDefaultDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->ExportDefaultDeclaration");
  } else if (isExportNamedDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->ExportNamedDeclaration");
  } else if (isImportDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->ImportDeclaration");
  } else if (isDeclareClass(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareClass");
  } else if (isDeclareFunction(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareFunction");
  } else if (isDeclareInterface(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareInterface");
  } else if (isDeclareModule(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareModule");
  } else if (isDeclareModuleExports(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareModuleExports");
  } else if (isDeclareTypeAlias(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareTypeAlias");
  } else if (isDeclareOpaqueType(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareOpaqueType");
  } else if (isDeclareVariable(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareVariable");
  } else if (isDeclareExportDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareExportDeclaration");
  } else if (isDeclareExportAllDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->DeclareExportAllDeclaration");
  } else if (isInterfaceDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->InterfaceDeclaration");
  } else if (isOpaqueType(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->OpaqueType");
  } else if (isTypeAlias(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TypeAlias");
  } else if (isEnumDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->EnumDeclaration");
  } else if (isTSDeclareFunction(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSDeclareFunction");
  } else if (isTSInterfaceDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSInterfaceDeclaration");
  } else if (isTSTypeAliasDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSTypeAliasDeclaration");
  } else if (isTSEnumDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSEnumDeclaration");
  } else if (isTSModuleDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSModuleDeclaration");
  } else if (isTSImportEqualsDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSImportEqualsDeclaration");
  } else if (isTSExportAssignment(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSExportAssignment");
  } else if (isTSNamespaceExportDeclaration(node)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled Statement->TSNamespaceExportDeclaration");
  }

  const unhandledStmt = generateBaseNodeFrom(node) as EmptyStatement
  unhandledStmt.type = "EmptyStatement"
  unhandledStmt.trailingComments = []
  unhandledStmt.trailingComments.push(generateCommentLine(` Unhandled stmt: '${node.type}'`))

  return unhandledStmt
}

// 
// (1) ExpressionStatement: (Expression)  --> (Identifier)
// 
// Spill: Expression --> otherProps.others.holder
// Result: (JS3ExpressionStatement_expression)
//
export function handleExpressionStatement(node: ExpressionStatement, otherProps: OtherProps) {
  otherProps.debugTrace.push("ExpressionStatement")
  assert(Array.isArray(otherProps.others.holder), `handleExpressionStatement expects an holder to spill intermediate values`);

  // 1 fallthrough props, 1 restricted props
  let orig_expression = node.expression; // Handling prop expression
  let fin_expression: JS3ExpressionStatement_expression; // Handling prop expression
  if (isExpression(orig_expression)) {
    fin_expression = handleExpression(orig_expression, otherProps)
  }
  let result: JS3ExpressionStatement = generateJS3ExpressionStatement(fin_expression, node);
  otherProps.debugTrace.pop()
  return result
}

//
// (2) IfStatement: If (Expression) [Statement] [? Else] [Statement]
// 
// Spill: test --> otherProps.others.holder, Consequent | Alternate --> JS3BlockStatement
// Result: If (Identifier) [JS3BlockStatement] [? Else] [JS3BlockStatement]
//
export function handleIfStatement(node: IfStatement, otherProps: OtherProps) {
  otherProps.debugTrace.push("IfStatement")
  assert(Array.isArray(otherProps.others.holder), `handleIfStatement expects an holder to spill intermediate values`);

  const oldPrefix = otherProps.others.prefix
  otherProps.others.prefix = "ifTest"

  // 1 fallthrough props, 3 restricted props
  let orig_test = node.test; // Handling prop test
  let fin_test: JS3IfStatement_test; // Handling prop test
  if (isExpression(orig_test)) {
    fin_test = handleExpression(orig_test, otherProps)
  }

  otherProps.others.prefix = "ifTrue"
  let orig_consequent = node.consequent; // Handling prop consequent
  let fin_consequent: JS3IfStatement_consequent; // Handling prop consequent
  if (isStatement(orig_consequent)) {
    if (isBlockStatement(orig_consequent)) {
      fin_consequent = handleBlockStatement(orig_consequent, otherProps)
    } else {
      const dummyBlockHolder: JS3BlockStatement_body = new Array();
      const dummyBlockStatement = generateJS3BlockStatementfromBaseNode(dummyBlockHolder, new Array(), orig_consequent)
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: dummyBlockHolder } }

      const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_consequent, updatedProps)
      if (Array.isArray(blockStmt)) blockStmt.forEach(s => dummyBlockHolder.push(s))
      else dummyBlockHolder.push(blockStmt)



      fin_consequent = dummyBlockStatement
    }
  }

  otherProps.others.prefix = "ifFalse"
  let orig_alternate = node.alternate; // Handling prop alternate
  let fin_alternate: JS3IfStatement_alternate = null; // Handling prop alternate
  if (isStatement(orig_alternate)) {
    if (isBlockStatement(orig_alternate)) {
      fin_alternate = handleBlockStatement(orig_alternate, otherProps)
    } else {
      const dummyBlockHolder: JS3BlockStatement_body = new Array();
      const dummyBlockStatement = generateJS3BlockStatementfromBaseNode(dummyBlockHolder, new Array(), orig_alternate)
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: dummyBlockHolder } }

      const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_alternate, updatedProps)
      if (Array.isArray(blockStmt)) blockStmt.forEach(s => dummyBlockHolder.push(s))
      else dummyBlockHolder.push(blockStmt)

      fin_alternate = dummyBlockStatement
    }
  }
  otherProps.others.prefix = oldPrefix
  const result = generateJS3IfStatement(fin_test, fin_consequent, fin_alternate, node)
  otherProps.debugTrace.pop()
  return result
}

//
// (3) ReturnStatement: Return [? Expression]
// 
// Spill: argument --> otherProps.others.holder
// Result: Return [? Identifier]
//
export function handleReturnStatement(node: ReturnStatement, otherProps: OtherProps) {
  otherProps.debugTrace.push("ReturnStatement")
  assert(Array.isArray(otherProps.others.holder), `handleReturnStatement expects an holder to spill intermediate values`);

  const oldPrefix = otherProps.others.prefix
  otherProps.others.prefix = "returnStmt"

  // 1 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3ReturnStatement_argument = generateIdentifier(node, "$TODO"); // Handling prop argument
  if (isIdentifier(orig_argument) ||  isDecimalLiteral(orig_argument) || isBigIntLiteral(orig_argument) || isStringLiteral(orig_argument) || isNumericLiteral(orig_argument) || isNullLiteral(orig_argument) || isBooleanLiteral(orig_argument) ) {
    fin_argument = orig_argument
  } else if (isExpression(orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps)
  } else if (isnull(orig_argument)) {
    fin_argument = null;
  }

  otherProps.others.prefix = oldPrefix
  const result = generateJS3ReturnStatement(fin_argument, node)
  otherProps.debugTrace.pop()
  return result
}

//
// (4) VariableDeclaration: [let|const...] [declaration1, declaration2, declaration3...]
// 
// Spill: [one VariableDeclaration breaks into multiple JS3VariableDeclarations]-> otherProps.others.holder
// Result: [let|const|... declaration1, let|const|... declaration2, let|const|... declaration3,...]
//
export function handleVariableDeclaration(node: VariableDeclaration, otherProps: OtherProps): Array<JS3VariableDeclaration> {
  otherProps.debugTrace.push("VariableDeclaration")
  assert(Array.isArray(otherProps.others.holder), `handleVariableDeclaration expects an holder to spill intermediate values`);

  const finalResult: Array<JS3VariableDeclaration> = new Array()

  // 3 fallthrough props, 1 restricted props
  let orig_declarations = node.declarations; // Handling prop declarations

  for (const _arrProp of orig_declarations) {
    // A JS3VariableDeclaration will only contain one declaration inside it
    const fin_declarations: JS3VariableDeclaration_declarations = new Array()

    // When we handle a variable declarator, the expression node may be broken down into multiple variable declarations
    // We want these declaration to sit right above the final declarator node
    fin_declarations.push(handleVariableDeclarator(_arrProp, otherProps))

    // Push the final node at the end
    finalResult.push(generateJS3VariableDeclaration(fin_declarations, node))
  }

  otherProps.debugTrace.pop()
  return finalResult
}

//
// (4.1) VariableDeclarator: LVal = Expression
// 
// Spill: init --> otherProps.others.holder
// Result: LVal = JS3VariableDeclarator_init
//
export function handleVariableDeclarator(node: VariableDeclarator, otherProps: OtherProps): JS3VariableDeclarator {
  otherProps.debugTrace.push("VariableDeclarator");
  assert(Array.isArray(otherProps.others.holder), "handleVariableDeclarator expects an holder to spill intermediate values");

  const oldPrefix = otherProps.others.prefix
  if (isIdentifier(node.id)) otherProps.others.prefix = node.id.name;

  // 3 fallthrough props, 1 restricted props
  let orig_init = node.init; // Handling prop init
  let fin_init: JS3VariableDeclarator_init = null; // Handling prop init
  
  if (isIdentifier(orig_init) || isDecimalLiteral(orig_init) || isBigIntLiteral(orig_init) || isStringLiteral(orig_init) || isNumericLiteral(orig_init) || isNullLiteral(orig_init) || isBooleanLiteral(orig_init)) {
    fin_init = orig_init
  } else if (isArrowFunctionExpression(orig_init)) {
    fin_init = handleArrowFunctionExpression(orig_init, otherProps);
  } else if (isFunctionExpression(orig_init)) {
    fin_init = handleFunctionExpression(orig_init, otherProps);
  } else if (isClassExpression(orig_init)) {
    fin_init = handleClassExpression(orig_init, otherProps);
  } else if (isExpression(orig_init)) {
    fin_init = handleExpression(orig_init, otherProps)
  }

  let result: JS3VariableDeclarator = generateJS3VariableDeclarator(fin_init, node);
  otherProps.others.prefix = oldPrefix
  otherProps.debugTrace.pop()
  return result;
}

//
// (5) TryStatement
//
// TODO
export function handleTryStatement(node: TryStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 3 restricted props
  let orig_block = node.block; // Handling prop block
  let fin_block: JS3TryStatement_block; // Handling prop block
  if (isBlockStatement(orig_block)) {
    fin_block = handleBlockStatement(orig_block, otherProps)
  }
  let orig_handler = node.handler; // Handling prop handler
  let fin_handler: JS3TryStatement_handler = null; // Handling prop handler
  if (isCatchClause(orig_handler)) {
    fin_handler = handleCatchClause(orig_handler, otherProps)
  }
  let orig_finalizer = node.finalizer; // Handling prop finalizer
  let fin_finalizer: JS3TryStatement_finalizer = null; // Handling prop finalizer
  if (isBlockStatement(orig_finalizer)) {
    fin_finalizer = handleBlockStatement(orig_finalizer, otherProps)
  }
  const result = generateJS3TryStatement(fin_block, fin_handler, fin_finalizer, node)
  return result

}
//
// (5.1) CatchClause
//
// TODO
export function handleCatchClause(node: CatchClause, otherProps: OtherProps) {
  // 2 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3CatchClause_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
  }
  return generateJS3CatchClause(fin_body, node)
}

//
// (6) ThrowStatement
//
// TODO
export function handleThrowStatement(node: ThrowStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3ThrowStatement_argument; // Handling prop argument
  if (isExpression(orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps)
  }
  const result = generateJS3ThrowStatement(fin_argument, node)
  return result
}

//
// (6) FunctionDeclaration
//
// TODO

export function handleFunctionDeclaration(node: FunctionDeclaration, otherProps: OtherProps): JS3FunctionDeclaration {
  // 4 fallthrough props, 6 restricted props
  let orig_id = node.id; // Handling prop id
  let fin_id: JS3FunctionDeclaration_id = null; // Handling prop id
  if (isIdentifier(orig_id)) {
    fin_id = orig_id
  }

  let orig_params = node.params; // Handling prop params
  let fin_params: JS3FunctionDeclaration_params = new Array(); // Handling prop params
  if (Array.isArray(orig_params)) {
    for (const _arrProp of orig_params) {
      if (isIdentifier(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isPattern(_arrProp)) {
        fin_params.push(_arrProp)
      } else if (isRestElement(_arrProp)) {
        fin_params.push(_arrProp)
      }
    }
  }

  let orig_body = node.body; // Handling prop body
  let fin_body: JS3FunctionDeclaration_body; // Handling prop body
  if (isBlockStatement(orig_body)) {
    fin_body = handleBlockStatement(orig_body, otherProps)
  }

  let orig_predicate = node.predicate; // Handling prop predicate
  let fin_predicate: JS3FunctionDeclaration_predicate = null; // Handling prop predicate
  if (isDeclaredPredicate(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->predicate->DeclaredPredicate");
  } else if (isInferredPredicate(orig_predicate)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->predicate->InferredPredicate");
  }

  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3FunctionDeclaration_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->returnType->Noop");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3FunctionDeclaration_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled FunctionDeclaration->typeParameters->Noop");
  }

  let result: JS3FunctionDeclaration = generateJS3FunctionDeclaration(fin_id, fin_params, fin_body, fin_predicate, fin_returnType, fin_typeParameters, node);
  return result;
}

export function handleForStatement(node: ForStatement, otherProps: OtherProps) {
  // 
  // Input:
  // for (expr1; expr2; expr3) {
  //   ...
  // }
  // 
  // Output:
  // for (init; ;update) {
  //   // Condition Check
  // 
  //   // Loop Body 
  // }
  // 
  // Did Not Work:: handling labled statements becomes a pain when transforming loops :(
  // {   <--- outerBlock
  //   // Init
  //   expr1
  //   while(true) {  <--- whileBlockBodyHolder
  //     // Condition Check
  //     ...
  //     expr2Res = expr2;
  //     if (!expr2Res) break;
  //     {
  //       // Loop Body
  //       ...
  //     }
  //     // Increment
  //     ...
  //     expr3
  //     expr2Res = expr3;
  //   }
  // }
  // 

  // 1 fallthrough props, 4 restricted props
  let orig_init = node.init; // Handling prop init
  let fin_init: JS3ForStatement_init = null; // Handling prop init
  if (isVariableDeclaration(orig_init)) {
    fin_init = orig_init
  } else if (isExpression(orig_init)) {
    fin_init = orig_init
  }

  // Body that holds the loop
  const loopBodyHolder: JS3BlockStatement_body = new Array()
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: loopBodyHolder } }
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3ForStatement_body = generateJS3BlockStatementfromBaseNode(loopBodyHolder, new Array(), orig_body);

  // Add condition check to the top of the loop's body
  let orig_test = node.test; // Handling prop test
  let fin_test: JS3ForStatement_test = null; // Handling prop test
  if (isExpression(orig_test)) {
    const testExpressionResult = handleExpression(orig_test, updatedProps)
    const negatedCondition = handleExpression(generateJS3UnaryExpressionfromBaseNode(testExpressionResult, "!", true, orig_test), updatedProps)
    const ifStmtBody: JS3BlockStatement_body = new Array()
    ifStmtBody.push(generateJS3BreakStatementfromBaseNode(null, orig_test)) // Break statement
    const ifStmt = generateJS3IfStatementfromBaseNode(negatedCondition, generateJS3BlockStatementfromBaseNode(ifStmtBody, new Array(), node), null, orig_test);
    loopBodyHolder.push(ifStmt);
  }

  // Add body
  if (isStatement(orig_body)) {
    const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_body, updatedProps)
    if (Array.isArray(blockStmt)) blockStmt.forEach(s => loopBodyHolder.push(s))
    else loopBodyHolder.push(blockStmt)
  }

  // Add update code
  let orig_update = node.update; // Handling prop update
  let fin_update: JS3ForStatement_update = null; // Handling prop update
  if (isExpression(orig_update)) {
    fin_update = orig_update
  }

  let result: JS3ForStatement = generateJS3ForStatement(fin_init, fin_test, fin_update, fin_body, node);
  return result
}

export function handleDoWhileStatement(node: DoWhileStatement, otherProps: OtherProps) {

  
  

  // 1 fallthrough props, 2 restricted props
  let orig_test = node.test; // Handling prop test
  let fin_test : JS3DoWhileStatement_test; // Handling prop test
  if(isExpression (orig_test)) {
    fin_test = orig_test
  }

  let orig_body = node.body; // Handling prop body
  // Body that holds the loop
  const loopBodyHolder: JS3BlockStatement_body = new Array()
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: loopBodyHolder } }
  let fin_body: JS3ForStatement_body = generateJS3BlockStatementfromBaseNode(loopBodyHolder, new Array(), orig_body);

  if(isStatement (orig_body)) {
    const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_body, updatedProps)
    if (Array.isArray(blockStmt)) blockStmt.forEach(s => loopBodyHolder.push(s))
    else loopBodyHolder.push(blockStmt)
  }

  let result: JS3DoWhileStatement = generateJS3DoWhileStatement(fin_test, fin_body, node);
  return result
}

export function handleForInStatement(node: ForInStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 3 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left : JS3ForInStatement_left; // Handling prop left
  if(isVariableDeclaration (orig_left)) {
    fin_left = orig_left
  } else if(isLVal (orig_left)) {
    fin_left = orig_left
  }

  let orig_right = node.right; // Handling prop right
  let fin_right : JS3ForInStatement_right; // Handling prop right
  if(isExpression (orig_right)) {
    fin_right = handleExpression(orig_right, otherProps);
  }

  let orig_body = node.body; // Handling prop body
  let fin_body : JS3ForInStatement_body; // Handling prop body
  if(isStatement (orig_body)) {
    const blockBody : JS3BlockStatement_body = new Array();
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockBody } }

    const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_body, updatedProps)
    if (Array.isArray(blockStmt)) blockStmt.forEach(s => blockBody.push(s))
    else blockBody.push(blockStmt)

    fin_body = generateJS3BlockStatementfromBaseNode(blockBody, new Array(), orig_body)
  }

  let result: JS3ForInStatement = generateJS3ForInStatement(fin_left, fin_right, fin_body, node);
  return result
}

export function handleForOfStatement(node: ForOfStatement, otherProps: OtherProps) {
  // 2 fallthrough props, 3 restricted props
  let orig_left = node.left; // Handling prop left
  let fin_left : JS3ForOfStatement_left; // Handling prop left
  if(isVariableDeclaration (orig_left)) {
    fin_left = orig_left
  } else if(isLVal (orig_left)) {
    fin_left = orig_left
  }

  let orig_right = node.right; // Handling prop right
  let fin_right : JS3ForOfStatement_right; // Handling prop right
  if(isExpression (orig_right)) {
    fin_right = handleExpression(orig_right, otherProps)
  }

  let orig_body = node.body; // Handling prop body
  let fin_body : JS3ForInStatement_body; // Handling prop body
  if(isStatement (orig_body)) {
    const blockBody : JS3BlockStatement_body = new Array();
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockBody } }

    const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_body, updatedProps)
    if (Array.isArray(blockStmt)) blockStmt.forEach(s => blockBody.push(s))
    else blockBody.push(blockStmt)

    fin_body = generateJS3BlockStatementfromBaseNode(blockBody, new Array(), orig_body)
  }
  
  let result: JS3ForOfStatement = generateJS3ForOfStatement(fin_left, fin_right, fin_body, node);
  return result;
}

export function handleLabeledStatement(node: LabeledStatement, otherProps: OtherProps) {
  // 2 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3LabeledStatement_body; // Handling prop body
  if (isStatement(orig_body)) {
    const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_body, otherProps)

    if (Array.isArray(blockStmt)) {
      const blockBody: JS3BlockStatement_body = new Array()
      fin_body = generateJS3BlockStatementfromBaseNode(blockBody, new Array(), orig_body)
      blockStmt.forEach(s => blockBody.push(s))
    }
    else fin_body = blockStmt

  }
  let result: JS3LabeledStatement = generateJS3LabeledStatement(fin_body, node);
  return result
}

export function handleBreakStatement(node: BreakStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_label = node.label; // Handling prop label
  let fin_label: JS3BreakStatement_label = orig_label; // Handling prop label
  let result: JS3BreakStatement = generateJS3BreakStatement(fin_label, node);
  return result
}

export function handleContinueStatement(node: ContinueStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 1 restricted props
  let orig_label = node.label; // Handling prop label
  let fin_label: JS3ContinueStatement_label = orig_label; // Handling prop label
  let result: JS3ContinueStatement = generateJS3ContinueStatement(fin_label, node);
  return result
}

export function handleSwitchCase(node: SwitchCase, otherProps: OtherProps) {
  // 1 fallthrough props, 2 restricted props
  let orig_test = node.test; // Handling prop test
  let fin_test : JS3SwitchCase_test = null; // Handling prop test
  if(isExpression (orig_test)) {
    fin_test = lowerComputedKey(orig_test, otherProps);
  }

  let orig_consequent = node.consequent; // Handling prop consequent
  let fin_consequent : JS3SwitchCase_consequent = new Array(); // Handling prop consequent

  // Block Scope
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: fin_consequent } }

  if (Array.isArray ( orig_consequent )) { 
    for (const _arrProp of orig_consequent) {
      const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(_arrProp, updatedProps)
      if (Array.isArray(blockStmt)) blockStmt.forEach(s => fin_consequent.push(s))
      else fin_consequent.push(blockStmt)
    }
  }
  let result: JS3SwitchCase = generateJS3SwitchCase(fin_test, fin_consequent, node);
  return result;
}

export function handleSwitchStatement(node: SwitchStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 2 restricted props
  let orig_discriminant = node.discriminant; // Handling prop discriminant
  let fin_discriminant : JS3SwitchStatement_discriminant; // Handling prop discriminant
  if(isExpression (orig_discriminant)) {
    fin_discriminant = lowerComputedKey(orig_discriminant, otherProps);
  }
  
  let orig_cases = node.cases; // Handling prop cases
  let fin_cases : JS3SwitchStatement_cases = new Array(); // Handling prop cases
  if (Array.isArray ( orig_cases )) { 
    for (const _arrProp of orig_cases) {
      fin_cases.push(handleSwitchCase(_arrProp, otherProps))
    }
  } 
  let result: JS3SwitchStatement = generateJS3SwitchStatement(fin_discriminant, fin_cases, node);
  return result
}

export function handleWithStatement(node: WithStatement, otherProps: OtherProps) {
  // 1 fallthrough props, 2 restricted props
  let orig_object = node.object; // Handling prop object
  let fin_object : JS3WithStatement_object; // Handling prop object
  if(isExpression (orig_object)) {
    fin_object = handleExpression(orig_object, otherProps);
  } 
  let orig_body = node.body; // Handling prop body
  let fin_body : JS3WithStatement_body; // Handling prop body
  if(isStatement (orig_body)) {
    if (isBlockStatement(orig_body)) {
      fin_body = handleBlockStatement(orig_body, otherProps);
    } else {

      const blockBody: JS3BlockStatement_body = new Array()
      fin_body = generateJS3BlockStatementfromBaseNode(blockBody, new Array(), orig_body)

      // Block Scope
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: blockBody } }

      // Push the lowered statement to the end of the block, previous statements are spilled stuff
      const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(orig_body, updatedProps)
      if (Array.isArray(blockStmt)) blockStmt.forEach(s => blockBody.push(s))
      else blockBody.push(blockStmt)
    }
  } 
  let result: JS3WithStatement = generateJS3WithStatement(fin_object, fin_body, node);
  return result;
}