// Generated on 7/8/2024, 5:50:38 pm, generated 16 handlers 

import { BlockStatement, CatchClause, ExpressionStatement, FunctionDeclaration, IfStatement, isArrayPattern, isAssignmentPattern, isBlockStatement, isBreakStatement, isCatchClause, isClassDeclaration, isContinueStatement, isDebuggerStatement, isDeclareClass, isDeclaredPredicate, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isDoWhileStatement, isEmptyStatement, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isExpression, isExpressionStatement, isForInStatement, isForOfStatement, isForStatement, isFunctionDeclaration, isIdentifier, isIfStatement, isImportDeclaration, isInferredPredicate, isInterfaceDeclaration, isLabeledStatement, isNoop, isObjectPattern, isOpaqueType, isRestElement, isReturnStatement, isStatement, isSwitchStatement, isThrowStatement, isTryStatement, isTSDeclareFunction, isTSEnumDeclaration, isTSExportAssignment, isTSImportEqualsDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSNamespaceExportDeclaration, isTSTypeAliasDeclaration, isTSTypeAnnotation, isTSTypeParameterDeclaration, isTypeAlias, isTypeAnnotation, isTypeParameterDeclaration, isVariableDeclaration, isWhileStatement, isWithStatement, ReturnStatement, Statement, ThrowStatement, TryStatement, VariableDeclaration, VariableDeclarator } from "@babel/types";
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { JS3BlockStatement, JS3BlockStatement_body, JS3CatchClause_body, JS3ExpressionStatement, JS3ExpressionStatement_expression, JS3FunctionDeclaration, JS3FunctionDeclaration_body, JS3FunctionDeclaration_id, JS3FunctionDeclaration_params, JS3FunctionDeclaration_predicate, JS3FunctionDeclaration_returnType, JS3FunctionDeclaration_typeParameters, JS3IfStatement_alternate, JS3IfStatement_consequent, JS3IfStatement_test, JS3ReturnStatement_argument, JS3ThrowStatement_argument, JS3TryStatement_block, JS3TryStatement_finalizer, JS3TryStatement_handler, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_init } from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { handleExpression } from "./HandleExpression.ts";
import { generateIdentifier, generateJS3BlockStatement, generateJS3BlockStatementfromBaseNode, generateJS3CatchClause, generateJS3ExpressionStatement, generateJS3FunctionDeclaration, generateJS3IfStatement, generateJS3ReturnStatement, generateJS3ThrowStatement, generateJS3TryStatement, generateJS3VariableDeclaration, generateJS3VariableDeclarator } from "./JS3Constructors.ts";

import assert from 'node:assert';
import { handleClassDeclaration } from "./HandleClassDeclaration.ts";

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;


export function handleBlockStatement(node: BlockStatement, otherProps: OtherProps): JS3BlockStatement {
  // 2 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3BlockStatement_body = new Array(); // Handling prop body
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: fin_body } }

  for (const stmt of orig_body) {
    handleStatement(stmt, updatedProps)
  }

  let result: JS3BlockStatement = generateJS3BlockStatement(fin_body, node);
  return result
}

export function handleStatement(node: Statement, otherProps: OtherProps) {
  if (isBlockStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->BlockStatement");
  } else if (isBreakStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->BreakStatement");
  } else if (isContinueStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ContinueStatement");
  } else if (isDebuggerStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DebuggerStatement");
  } else if (isDoWhileStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DoWhileStatement");
  } else if (isEmptyStatement(node)) {
    otherProps.others.holder.push(node)
  } else if (isExpressionStatement(node)) {
    // ========================================================================================
    handleExpressionStatement(node, otherProps)
    // ========================================================================================
  } else if (isForInStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ForInStatement");
  } else if (isForStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ForStatement");
  } else if (isFunctionDeclaration(node)) {
    // ========================================================================================
    handleFunctionDeclaration(node, otherProps)
    // ========================================================================================
  } else if (isIfStatement(node)) {
    // ========================================================================================
    handleIfStatement(node, otherProps)
    // ========================================================================================
  } else if (isLabeledStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->LabeledStatement");
  } else if (isReturnStatement(node)) {
    // ========================================================================================
    handleReturnStatement(node, otherProps)
    // ========================================================================================
  } else if (isSwitchStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->SwitchStatement");
  } else if (isThrowStatement(node)) {
    // ========================================================================================
    handleThrowStatement(node, otherProps)
    // ========================================================================================
  } else if (isTryStatement(node)) {
    // ========================================================================================
    handleTryStatement(node, otherProps)
    // ========================================================================================
  } else if (isVariableDeclaration(node)) {
    // ========================================================================================
    handleVariableDeclaration(node, otherProps)
    // ========================================================================================
  } else if (isWhileStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->WhileStatement");
  } else if (isWithStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->WithStatement");
  } else if (isClassDeclaration(node)) {
    // ========================================================================================
    handleClassDeclaration(node, otherProps)
    // ========================================================================================
  } else if (isExportAllDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ExportAllDeclaration");
  } else if (isExportDefaultDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ExportDefaultDeclaration");
  } else if (isExportNamedDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ExportNamedDeclaration");
  } else if (isForOfStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ForOfStatement");
  } else if (isImportDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ImportDeclaration");
  } else if (isDeclareClass(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareClass");
  } else if (isDeclareFunction(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareFunction");
  } else if (isDeclareInterface(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareInterface");
  } else if (isDeclareModule(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareModule");
  } else if (isDeclareModuleExports(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareModuleExports");
  } else if (isDeclareTypeAlias(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareTypeAlias");
  } else if (isDeclareOpaqueType(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareOpaqueType");
  } else if (isDeclareVariable(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareVariable");
  } else if (isDeclareExportDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareExportDeclaration");
  } else if (isDeclareExportAllDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->DeclareExportAllDeclaration");
  } else if (isInterfaceDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->InterfaceDeclaration");
  } else if (isOpaqueType(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->OpaqueType");
  } else if (isTypeAlias(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TypeAlias");
  } else if (isEnumDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->EnumDeclaration");
  } else if (isTSDeclareFunction(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSDeclareFunction");
  } else if (isTSInterfaceDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSInterfaceDeclaration");
  } else if (isTSTypeAliasDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSTypeAliasDeclaration");
  } else if (isTSEnumDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSEnumDeclaration");
  } else if (isTSModuleDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSModuleDeclaration");
  } else if (isTSImportEqualsDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSImportEqualsDeclaration");
  } else if (isTSExportAssignment(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSExportAssignment");
  } else if (isTSNamespaceExportDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TSNamespaceExportDeclaration");
  }
}

// 
// (1) ExpressionStatement: (Expression)  --> (Identifier)
// 
// Spill: Expression --> otherProps.others.holder
// Result: (JS3ExpressionStatement_expression)
//
export function handleExpressionStatement(node: ExpressionStatement, otherProps: OtherProps): void {
  otherProps.debugTrace.push("ExpressionStatement")
  assert(Array.isArray(otherProps.others.holder), `handleExpressionStatement expects an holder to spill intermediate values`);

  // 1 fallthrough props, 1 restricted props
  let orig_expression = node.expression; // Handling prop expression
  let fin_expression: JS3ExpressionStatement_expression; // Handling prop expression
  if (isExpression(orig_expression)) {
    fin_expression = handleExpression(orig_expression, otherProps)
  }
  let result: JS3ExpressionStatement = generateJS3ExpressionStatement(fin_expression, node);
  otherProps.others.holder.push(result)
  otherProps.debugTrace.pop()
}

//
// (2) IfStatement: If (Expression) [Statement] [? Else] [Statement]
// 
// Spill: test --> otherProps.others.holder, Consequent | Alternate --> JS3BlockStatement
// Result: If (Identifier) [JS3BlockStatement] [? Else] [JS3BlockStatement]
//
export function handleIfStatement(node: IfStatement, otherProps: OtherProps): void {
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
      handleStatement(orig_consequent, updatedProps)
      fin_consequent = dummyBlockStatement
    }
  }

  otherProps.others.prefix = "ifFalse"
  let orig_alternate = node.alternate; // Handling prop alternate
  let fin_alternate: JS3IfStatement_alternate = null; // Handling prop alternate
  if (isStatement(orig_alternate)) {
    if (isBlockStatement(orig_consequent)) {
      fin_consequent = handleBlockStatement(orig_consequent, otherProps)
    } else {
      const dummyBlockHolder: JS3BlockStatement_body = new Array();
      const dummyBlockStatement = generateJS3BlockStatementfromBaseNode(dummyBlockHolder, new Array(), orig_consequent)
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: dummyBlockHolder } }
      handleStatement(orig_consequent, updatedProps)
      fin_consequent = dummyBlockStatement
    }
  }
  otherProps.others.prefix = oldPrefix
  otherProps.others.holder.push(generateJS3IfStatement(fin_test, fin_consequent, fin_alternate, node));
  otherProps.debugTrace.pop()
}

//
// (3) ReturnStatement: Return [? Expression]
// 
// Spill: argument --> otherProps.others.holder
// Result: Return [? Identifier]
//
export function handleReturnStatement(node: ReturnStatement, otherProps: OtherProps): void {
  otherProps.debugTrace.push("ReturnStatement")
  assert(Array.isArray(otherProps.others.holder), `handleReturnStatement expects an holder to spill intermediate values`);

  const oldPrefix = otherProps.others.prefix
  otherProps.others.prefix = "returnStmt"

  // 1 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument: JS3ReturnStatement_argument = generateIdentifier(node, "$TODO"); // Handling prop argument
  if (isExpression(orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps)
  } else if (isnull(orig_argument)) {
    fin_argument = null;
  }

  otherProps.others.prefix = oldPrefix
  otherProps.others.holder.push(generateJS3ReturnStatement(fin_argument, node));
  otherProps.debugTrace.pop()
}

//
// (4) VariableDeclaration: [let|const...] [declaration1, declaration2, declaration3...]
// 
// Spill: [one VariableDeclaration breaks into multiple JS3VariableDeclarations]-> otherProps.others.holder
// Result: [let|const|... declaration1, let|const|... declaration2, let|const|... declaration3,...]
//
export function handleVariableDeclaration(node: VariableDeclaration, otherProps: OtherProps) {
  otherProps.debugTrace.push("VariableDeclaration")
  assert(Array.isArray(otherProps.others.holder), `handleVariableDeclaration expects an holder to spill intermediate values`);

  // 3 fallthrough props, 1 restricted props
  let orig_declarations = node.declarations; // Handling prop declarations

  for (const _arrProp of orig_declarations) {
    // A JS3VariableDeclaration will only contain one declaration inside it
    const fin_declarations: JS3VariableDeclaration_declarations = new Array()

    // When we handle a variable declarator, the expression node may be broken down into multiple variable declarations
    // We want these declaration to sit right above the final declarator node
    fin_declarations.push(handleVariableDeclarator(_arrProp, otherProps))

    // Push the final node at the end
    otherProps.others.holder.push(generateJS3VariableDeclaration(fin_declarations, node))
  }

  otherProps.debugTrace.pop()
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
  if (isExpression(orig_init)) {
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
  otherProps.others.holder.push(generateJS3TryStatement(fin_block, fin_handler, fin_finalizer, node))

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
  otherProps.others.holder.push(generateJS3ThrowStatement(fin_argument, node))
}

//
// (6) FunctionDeclaration
//
// TODO

export function handleFunctionDeclaration(node: FunctionDeclaration, otherProps: OtherProps) {
  const res = handleFunctionDeclarationWithRet(node, otherProps)
  otherProps.others.holder.push(res)

}

export function handleFunctionDeclarationWithRet(node: FunctionDeclaration, otherProps: OtherProps) : JS3FunctionDeclaration {
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
      } else if (isAssignmentPattern(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled FunctionDeclaration->[params]->AssignmentPattern");
      } else if (isArrayPattern(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled FunctionDeclaration->[params]->ArrayPattern");
      } else if (isObjectPattern(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled FunctionDeclaration->[params]->ObjectPattern");
      } else if (isRestElement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled FunctionDeclaration->[params]->RestElement");
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
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->predicate->DeclaredPredicate");
  } else if (isInferredPredicate(orig_predicate)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->predicate->InferredPredicate");
  }

  let orig_returnType = node.returnType; // Handling prop returnType
  let fin_returnType: JS3FunctionDeclaration_returnType = null; // Handling prop returnType
  if (isTypeAnnotation(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->returnType->TypeAnnotation");
  } else if (isTSTypeAnnotation(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->returnType->TSTypeAnnotation");
  } else if (isNoop(orig_returnType)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->returnType->Noop");
  }

  let orig_typeParameters = node.typeParameters; // Handling prop typeParameters
  let fin_typeParameters: JS3FunctionDeclaration_typeParameters = null; // Handling prop typeParameters
  if (isTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->typeParameters->TypeParameterDeclaration");
  } else if (isTSTypeParameterDeclaration(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->typeParameters->TSTypeParameterDeclaration");
  } else if (isNoop(orig_typeParameters)) {
    debugConfig.logger.error("TODO // unhandled FunctionDeclaration->typeParameters->Noop");
  }

  let result: JS3FunctionDeclaration = generateJS3FunctionDeclaration(fin_id, fin_params, fin_body, fin_predicate, fin_returnType, fin_typeParameters, node);
  return result;
}