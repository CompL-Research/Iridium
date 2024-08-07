// Generated on 7/8/2024, 5:50:38 pm, generated 16 handlers 

import { BlockStatement, ExpressionStatement, IfStatement, isBlockStatement, isBreakStatement, isClassDeclaration, isContinueStatement, isDebuggerStatement, isDeclareClass, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isDoWhileStatement, isEmptyStatement, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isExpression, isExpressionStatement, isForInStatement, isForOfStatement, isForStatement, isFunctionDeclaration, isIfStatement, isImportDeclaration, isInterfaceDeclaration, isLabeledStatement, isOpaqueType, isReturnStatement, isSwitchStatement, isThrowStatement, isTryStatement, isTSDeclareFunction, isTSEnumDeclaration, isTSExportAssignment, isTSImportEqualsDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSNamespaceExportDeclaration, isTSTypeAliasDeclaration, isTypeAlias, isVariableDeclaration, isWhileStatement, isWithStatement, ReturnStatement } from "@babel/types";
import { JS3BuilderUtils, } from "../JS3Builder.ts";
import { JS3BlockStatement, JS3BlockStatement_body, JS3ExpressionStatement, JS3ExpressionStatement_expression, JS3IfStatement, JS3IfStatement_alternate, JS3IfStatement_consequent, JS3IfStatement_test, JS3ReturnStatement, JS3ReturnStatement_argument } from "./JS3Types.ts";

import debugConfig from "#debugConfig";
import { handleExpression } from "./HandleExpression.ts";
import { handleVariableDeclaration } from "./HandleProgram.ts";
import { generateIdentifier, generateJS3BlockStatement, generateJS3BlockStatementfromBaseNode, generateJS3ExpressionStatement, generateJS3IfStatement, generateJS3ReturnStatement } from "./JS3Constructors.ts";

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;


export function handleBlockStatement(node: BlockStatement, otherProps: OtherProps) : JS3BlockStatement {
  // 2 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body : JS3BlockStatement_body = new Array(); // Handling prop body
  if (Array.isArray ( orig_body )) { 
    for (const _arrProp of orig_body) {
      if(isBlockStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->BlockStatement");
      } else if(isBreakStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->BreakStatement");
      } else if(isContinueStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ContinueStatement");
      } else if(isDebuggerStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DebuggerStatement");
      } else if(isDoWhileStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DoWhileStatement");
      } else if(isEmptyStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->EmptyStatement");
      } else if(isExpressionStatement (_arrProp)) {
        // ========================================================================================
        const holder : JS3BlockStatement_body = new Array()
        const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }
        const exprStmt = handleExpressionStatement(_arrProp, updatedProps)
        holder.forEach(s => fin_body.push(s))
        fin_body.push(exprStmt)
        // ========================================================================================
      } else if(isForInStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ForInStatement");
      } else if(isForStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ForStatement");
      } else if(isFunctionDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->FunctionDeclaration");
      } else if(isIfStatement (_arrProp)) {
        // ========================================================================================
        const holder : JS3BlockStatement_body = new Array()
        const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }
        const ifStmt = handleIfStatement(_arrProp, updatedProps)
        holder.forEach(s => fin_body.push(s))
        fin_body.push(ifStmt)
        // ========================================================================================

      } else if(isLabeledStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->LabeledStatement");
      } else if(isReturnStatement (_arrProp)) {
        // ========================================================================================
        const holder : JS3BlockStatement_body = new Array()
        const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }
        const returnStatement = handleReturnStatement(_arrProp, updatedProps)
        holder.forEach(s => fin_body.push(s))
        fin_body.push(returnStatement)
        // ========================================================================================
      } else if(isSwitchStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->SwitchStatement");
      } else if(isThrowStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ThrowStatement");
      } else if(isTryStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TryStatement");
      } else if(isVariableDeclaration (_arrProp)) {
        // ========================================================================================
        handleVariableDeclaration(_arrProp, otherProps).forEach(d => fin_body.push(d))
        // ========================================================================================
      } else if(isWhileStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->WhileStatement");
      } else if(isWithStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->WithStatement");
      } else if(isClassDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ClassDeclaration");
      } else if(isExportAllDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ExportAllDeclaration");
      } else if(isExportDefaultDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ExportDefaultDeclaration");
      } else if(isExportNamedDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ExportNamedDeclaration");
      } else if(isForOfStatement (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ForOfStatement");
      } else if(isImportDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->ImportDeclaration");
      } else if(isDeclareClass (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareClass");
      } else if(isDeclareFunction (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareFunction");
      } else if(isDeclareInterface (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareInterface");
      } else if(isDeclareModule (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareModule");
      } else if(isDeclareModuleExports (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareModuleExports");
      } else if(isDeclareTypeAlias (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareTypeAlias");
      } else if(isDeclareOpaqueType (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareOpaqueType");
      } else if(isDeclareVariable (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareVariable");
      } else if(isDeclareExportDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareExportDeclaration");
      } else if(isDeclareExportAllDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->DeclareExportAllDeclaration");
      } else if(isInterfaceDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->InterfaceDeclaration");
      } else if(isOpaqueType (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->OpaqueType");
      } else if(isTypeAlias (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TypeAlias");
      } else if(isEnumDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->EnumDeclaration");
      } else if(isTSDeclareFunction (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSDeclareFunction");
      } else if(isTSInterfaceDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSInterfaceDeclaration");
      } else if(isTSTypeAliasDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSTypeAliasDeclaration");
      } else if(isTSEnumDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSEnumDeclaration");
      } else if(isTSModuleDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSModuleDeclaration");
      } else if(isTSImportEqualsDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSImportEqualsDeclaration");
      } else if(isTSExportAssignment (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSExportAssignment");
      } else if(isTSNamespaceExportDeclaration (_arrProp)) {
        debugConfig.logger.error("TODO // unhandled BlockStatement->[body]->TSNamespaceExportDeclaration");
      } 
    }
  } 
  let result: JS3BlockStatement = generateJS3BlockStatement(fin_body, node);
  return result
}

export function handleReturnStatement(node: ReturnStatement, otherProps: OtherProps) : JS3ReturnStatement {
  // 1 fallthrough props, 1 restricted props
  let orig_argument = node.argument; // Handling prop argument
  let fin_argument : JS3ReturnStatement_argument = generateIdentifier(node, "$TODO"); // Handling prop argument
  if(isExpression (orig_argument)) {
    fin_argument = handleExpression(orig_argument, otherProps)
  } else if(isnull (orig_argument)) {
    fin_argument = null;
  }
  let result: JS3ReturnStatement = generateJS3ReturnStatement(fin_argument, node);
  return result
}

export function handleExpressionStatement(node: ExpressionStatement, otherProps: OtherProps) : JS3ExpressionStatement{
  // 1 fallthrough props, 1 restricted props
  let orig_expression = node.expression; // Handling prop expression
  let fin_expression : JS3ExpressionStatement_expression; // Handling prop expression
  if(isExpression (orig_expression)) {
    fin_expression = handleExpression(orig_expression, otherProps)
  } 
  let result: JS3ExpressionStatement = generateJS3ExpressionStatement(fin_expression, node);
  return result
} 

export function handleIfStatement(node: IfStatement, otherProps: OtherProps) : JS3IfStatement {
  // 1 fallthrough props, 3 restricted props
  let orig_test = node.test; // Handling prop test
  let fin_test : JS3IfStatement_test; // Handling prop test
  if(isExpression (orig_test)) {
    fin_test = handleExpression(orig_test, otherProps)
  } 
  let orig_consequent = node.consequent; // Handling prop consequent
  let fin_consequent : JS3IfStatement_consequent = generateJS3BlockStatementfromBaseNode(new Array(), new Array(), node.consequent); // Handling prop consequent
  if(isBlockStatement (orig_consequent)) {
    fin_consequent = handleBlockStatement(orig_consequent, otherProps)
  } else if(isBreakStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->BreakStatement");
  } else if(isContinueStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ContinueStatement");
  } else if(isDebuggerStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DebuggerStatement");
  } else if(isDoWhileStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DoWhileStatement");
  } else if(isEmptyStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->EmptyStatement");
  } else if(isExpressionStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ExpressionStatement");
  } else if(isForInStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ForInStatement");
  } else if(isForStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ForStatement");
  } else if(isFunctionDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->FunctionDeclaration");
  } else if(isIfStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->IfStatement");
  } else if(isLabeledStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->LabeledStatement");
  } else if(isReturnStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ReturnStatement");
  } else if(isSwitchStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->SwitchStatement");
  } else if(isThrowStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ThrowStatement");
  } else if(isTryStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TryStatement");
  } else if(isVariableDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->VariableDeclaration");
  } else if(isWhileStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->WhileStatement");
  } else if(isWithStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->WithStatement");
  } else if(isClassDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ClassDeclaration");
  } else if(isExportAllDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ExportAllDeclaration");
  } else if(isExportDefaultDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ExportDefaultDeclaration");
  } else if(isExportNamedDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ExportNamedDeclaration");
  } else if(isForOfStatement (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ForOfStatement");
  } else if(isImportDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->ImportDeclaration");
  } else if(isDeclareClass (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareClass");
  } else if(isDeclareFunction (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareFunction");
  } else if(isDeclareInterface (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareInterface");
  } else if(isDeclareModule (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareModule");
  } else if(isDeclareModuleExports (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareModuleExports");
  } else if(isDeclareTypeAlias (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareTypeAlias");
  } else if(isDeclareOpaqueType (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareOpaqueType");
  } else if(isDeclareVariable (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareVariable");
  } else if(isDeclareExportDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareExportDeclaration");
  } else if(isDeclareExportAllDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->DeclareExportAllDeclaration");
  } else if(isInterfaceDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->InterfaceDeclaration");
  } else if(isOpaqueType (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->OpaqueType");
  } else if(isTypeAlias (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TypeAlias");
  } else if(isEnumDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->EnumDeclaration");
  } else if(isTSDeclareFunction (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSDeclareFunction");
  } else if(isTSInterfaceDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSInterfaceDeclaration");
  } else if(isTSTypeAliasDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSTypeAliasDeclaration");
  } else if(isTSEnumDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSEnumDeclaration");
  } else if(isTSModuleDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSModuleDeclaration");
  } else if(isTSImportEqualsDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSImportEqualsDeclaration");
  } else if(isTSExportAssignment (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSExportAssignment");
  } else if(isTSNamespaceExportDeclaration (orig_consequent)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->consequent->TSNamespaceExportDeclaration");
  }

  let orig_alternate = node.alternate; // Handling prop alternate
  let fin_alternate : JS3IfStatement_alternate = null; // Handling prop alternate
  if(isBlockStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->BlockStatement");
  } else if(isBreakStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->BreakStatement");
  } else if(isContinueStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ContinueStatement");
  } else if(isDebuggerStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DebuggerStatement");
  } else if(isDoWhileStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DoWhileStatement");
  } else if(isEmptyStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->EmptyStatement");
  } else if(isExpressionStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ExpressionStatement");
  } else if(isForInStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ForInStatement");
  } else if(isForStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ForStatement");
  } else if(isFunctionDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->FunctionDeclaration");
  } else if(isIfStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->IfStatement");
  } else if(isLabeledStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->LabeledStatement");
  } else if(isReturnStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ReturnStatement");
  } else if(isSwitchStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->SwitchStatement");
  } else if(isThrowStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ThrowStatement");
  } else if(isTryStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TryStatement");
  } else if(isVariableDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->VariableDeclaration");
  } else if(isWhileStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->WhileStatement");
  } else if(isWithStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->WithStatement");
  } else if(isClassDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ClassDeclaration");
  } else if(isExportAllDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ExportAllDeclaration");
  } else if(isExportDefaultDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ExportDefaultDeclaration");
  } else if(isExportNamedDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ExportNamedDeclaration");
  } else if(isForOfStatement (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ForOfStatement");
  } else if(isImportDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->ImportDeclaration");
  } else if(isDeclareClass (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareClass");
  } else if(isDeclareFunction (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareFunction");
  } else if(isDeclareInterface (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareInterface");
  } else if(isDeclareModule (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareModule");
  } else if(isDeclareModuleExports (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareModuleExports");
  } else if(isDeclareTypeAlias (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareTypeAlias");
  } else if(isDeclareOpaqueType (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareOpaqueType");
  } else if(isDeclareVariable (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareVariable");
  } else if(isDeclareExportDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareExportDeclaration");
  } else if(isDeclareExportAllDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->DeclareExportAllDeclaration");
  } else if(isInterfaceDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->InterfaceDeclaration");
  } else if(isOpaqueType (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->OpaqueType");
  } else if(isTypeAlias (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TypeAlias");
  } else if(isEnumDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->EnumDeclaration");
  } else if(isTSDeclareFunction (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSDeclareFunction");
  } else if(isTSInterfaceDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSInterfaceDeclaration");
  } else if(isTSTypeAliasDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSTypeAliasDeclaration");
  } else if(isTSEnumDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSEnumDeclaration");
  } else if(isTSModuleDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSModuleDeclaration");
  } else if(isTSImportEqualsDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSImportEqualsDeclaration");
  } else if(isTSExportAssignment (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSExportAssignment");
  } else if(isTSNamespaceExportDeclaration (orig_alternate)) {
    debugConfig.logger.error("TODO // unhandled IfStatement->alternate->TSNamespaceExportDeclaration");
  }

  let result: JS3IfStatement = generateJS3IfStatement(fin_test, fin_consequent, fin_alternate, node);
  return result
}