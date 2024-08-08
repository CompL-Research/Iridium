// Generated on 7/8/2024, 5:50:38 pm, generated 16 handlers 

import { BlockStatement, ExpressionStatement, IfStatement, isBlockStatement, isBreakStatement, isClassDeclaration, isContinueStatement, isDebuggerStatement, isDeclareClass, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isDoWhileStatement, isEmptyStatement, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isExpression, isExpressionStatement, isForInStatement, isForOfStatement, isForStatement, isFunctionDeclaration, isIdentifier, isIfStatement, isImportDeclaration, isInterfaceDeclaration, isLabeledStatement, isOpaqueType, isReturnStatement, isStatement, isSwitchStatement, isThrowStatement, isTryStatement, isTSDeclareFunction, isTSEnumDeclaration, isTSExportAssignment, isTSImportEqualsDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSNamespaceExportDeclaration, isTSTypeAliasDeclaration, isTypeAlias, isVariableDeclaration, isWhileStatement, isWithStatement, ReturnStatement, Statement, VariableDeclaration, VariableDeclarator } from "@babel/types";
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { JS3BlockStatement, JS3BlockStatement_body, JS3ExpressionStatement, JS3ExpressionStatement_expression, JS3IfStatement_alternate, JS3IfStatement_consequent, JS3IfStatement_test, JS3ReturnStatement_argument, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_init } from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { handleExpression } from "./HandleExpression.ts";
import { generateIdentifier, generateJS3BlockStatement, generateJS3BlockStatementfromBaseNode, generateJS3ExpressionStatement, generateJS3IfStatement, generateJS3ReturnStatement, generateJS3VariableDeclaration, generateJS3VariableDeclarator } from "./JS3Constructors.ts";

import assert from 'node:assert';

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
    debugConfig.logger.error("TODO // unhandled Statement->EmptyStatement");
  } else if (isExpressionStatement(node)) {
    // ========================================================================================
    handleExpressionStatement(node, otherProps)
    // ========================================================================================
  } else if (isForInStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ForInStatement");
  } else if (isForStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ForStatement");
  } else if (isFunctionDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->FunctionDeclaration");
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
    debugConfig.logger.error("TODO // unhandled Statement->ThrowStatement");
  } else if (isTryStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->TryStatement");
  } else if (isVariableDeclaration(node)) {
    // ========================================================================================
    handleVariableDeclaration(node, otherProps)
    // ========================================================================================
  } else if (isWhileStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->WhileStatement");
  } else if (isWithStatement(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->WithStatement");
  } else if (isClassDeclaration(node)) {
    debugConfig.logger.error("TODO // unhandled Statement->ClassDeclaration");
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
