// Generated on 6/8/2024, 10:15:01 am, generated 1 handlers 
import { ExportDefaultDeclaration, ImportDeclaration, Program, VariableDeclaration, VariableDeclarator, isBlockStatement, isBreakStatement, isClassDeclaration, isContinueStatement, isDebuggerStatement, isDeclareClass, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isDoWhileStatement, isEmptyStatement, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isExpression, isExpressionStatement, isForInStatement, isForOfStatement, isForStatement, isFunctionDeclaration, isIdentifier, isIfStatement, isImportAttribute, isImportDeclaration, isInterfaceDeclaration, isLabeledStatement, isOpaqueType, isReturnStatement, isSwitchStatement, isTSDeclareFunction, isTSEnumDeclaration, isTSExportAssignment, isTSImportEqualsDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSNamespaceExportDeclaration, isTSTypeAliasDeclaration, isThrowStatement, isTryStatement, isTypeAlias, isVariableDeclaration, isWhileStatement, isWithStatement } from "@babel/types";
import { generateJS3ExportDefaultDeclaration, generateJS3ImportDeclaration, generateJS3Program, generateJS3VariableDeclaration, generateJS3VariableDeclarator } from "./JS3Constructors.ts";
import { JS3BlockStatement_body, JS3ExportDefaultDeclaration, JS3ExportDefaultDeclaration_declaration, JS3ImportDeclaration, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ImportDeclaration_specifiers, JS3Program, JS3Program_body, JS3VariableDeclaration, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_init, } from "./JS3Types.ts";

import { JS3BuilderUtils, } from "../JS3Builder.ts";

import debugConfig from "#debugConfig";
import { generateCommentLine } from "#utils";

import assert from "node:assert";
import { handleExpressionStatement } from "./HandleBlocks.ts";
import { handleClassDeclaration } from "./HandleClassDeclaration.ts";
import { handleExpression } from "./HandleExpression.ts";

type OtherProps = JS3BuilderUtils;

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

export function handleProgram(node: Program, otherProps: OtherProps): JS3Program {
  otherProps.debugTrace.push("Program");
  // 4 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3Program_body = new Array() // Handling prop body
  if (Array.isArray(orig_body)) {
    for (const _arrProp of orig_body) {
      if (isBlockStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->BlockStatement");
      } else if (isBreakStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->BreakStatement");
      } else if (isContinueStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ContinueStatement");
      } else if (isDebuggerStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DebuggerStatement");
      } else if (isDoWhileStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DoWhileStatement");
      } else if (isEmptyStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->EmptyStatement");
      } else if (isExpressionStatement(_arrProp)) {
        // ========================================================================================
        const holder : JS3BlockStatement_body = new Array()
        const updatedProps = { ...otherProps, others: { ...otherProps.others, holder } }
        const exprStmt = handleExpressionStatement(_arrProp, updatedProps)
        holder.forEach(s => fin_body.push(s))
        fin_body.push(exprStmt)
        // ========================================================================================
      } else if (isForInStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ForInStatement");
      } else if (isForStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ForStatement");
      } else if (isFunctionDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->FunctionDeclaration");
      } else if (isIfStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->IfStatement");
      } else if (isLabeledStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->LabeledStatement");
      } else if (isReturnStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ReturnStatement");
      } else if (isSwitchStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->SwitchStatement");
      } else if (isThrowStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ThrowStatement");
      } else if (isTryStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TryStatement");
      } else if (isVariableDeclaration(_arrProp)) {
        // ========================================================================================
        handleVariableDeclaration(_arrProp, otherProps).forEach(d => fin_body.push(d))
        // ========================================================================================
      } else if (isWhileStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->WhileStatement");
      } else if (isWithStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->WithStatement");
      } else if (isClassDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ClassDeclaration");
      } else if (isExportAllDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ExportAllDeclaration");
      } else if (isExportDefaultDeclaration(_arrProp)) {
        // ========================================================================================
        handleExportDefaultDeclaration(_arrProp, otherProps).forEach(d => fin_body.push(d))
        // ========================================================================================
      } else if (isExportNamedDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ExportNamedDeclaration");
      } else if (isForOfStatement(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->ForOfStatement");
      } else if (isImportDeclaration(_arrProp)) {
        // ========================================================================================
        handleImportDeclaration(_arrProp, otherProps).forEach(d => fin_body.push(d))
        // ========================================================================================
      } else if (isDeclareClass(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareClass");
      } else if (isDeclareFunction(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareFunction");
      } else if (isDeclareInterface(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareInterface");
      } else if (isDeclareModule(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareModule");
      } else if (isDeclareModuleExports(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareModuleExports");
      } else if (isDeclareTypeAlias(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareTypeAlias");
      } else if (isDeclareOpaqueType(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareOpaqueType");
      } else if (isDeclareVariable(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareVariable");
      } else if (isDeclareExportDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareExportDeclaration");
      } else if (isDeclareExportAllDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->DeclareExportAllDeclaration");
      } else if (isInterfaceDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->InterfaceDeclaration");
      } else if (isOpaqueType(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->OpaqueType");
      } else if (isTypeAlias(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TypeAlias");
      } else if (isEnumDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->EnumDeclaration");
      } else if (isTSDeclareFunction(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSDeclareFunction");
      } else if (isTSInterfaceDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSInterfaceDeclaration");
      } else if (isTSTypeAliasDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSTypeAliasDeclaration");
      } else if (isTSEnumDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSEnumDeclaration");
      } else if (isTSModuleDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSModuleDeclaration");
      } else if (isTSImportEqualsDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSImportEqualsDeclaration");
      } else if (isTSExportAssignment(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSExportAssignment");
      } else if (isTSNamespaceExportDeclaration(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled Program->[body]->TSNamespaceExportDeclaration");
      }
    }
  }

  let result: JS3Program = generateJS3Program(fin_body, node);
  otherProps.debugTrace.pop()
  return result
}

// Variable declaration
// A variable declaration can have many declarations inside it of the form.
//   let a = 1, b = 2, c = 3
// 
// We break it down to generate
//   let a = 1
//   let b = 2
//   let c = 3 
// 
export function handleVariableDeclaration(node: VariableDeclaration, otherProps: OtherProps): Array<JS3VariableDeclaration> {
  otherProps.debugTrace.push("VariableDeclaration");

  // One variable declaration is broken down into multiple variable declarations
  let finalResult = new Array<JS3VariableDeclaration>()

  // 3 fallthrough props, 1 restricted props
  let orig_declarations = node.declarations; // Handling prop declarations

  if (Array.isArray(orig_declarations)) {
    for (const _arrProp of orig_declarations) {

      // A JS3VariableDeclaration will only contain one declaration inside it
      const fin_declarations: JS3VariableDeclaration_declarations = new Array()

      // Holder holds the generated intermediate nodes
      const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: new Array<JS3VariableDeclaration>() } }

      // If the LVal is an identifier we can use it as prefix for the temporaries
      if (isIdentifier(_arrProp.id)) updatedProps.others.prefix = _arrProp.id.name;

      // When we handle a variable declarator, the expression node may be broken down into multiple variable declarations
      // We want these declaration to sit right above the final declarator node
      fin_declarations.push(handleVariableDeclarator(_arrProp, updatedProps))

      // Push the generated nodes before
      updatedProps.others.holder.forEach((d) => {
        finalResult.push(d)
      })

      // Push the final node at the end
      const duplicatedNode = generateJS3VariableDeclaration(fin_declarations, node);
      finalResult.push(duplicatedNode)
    }
  }
  otherProps.debugTrace.pop()
  return finalResult
}

// VariableDeclarator
// 
// LVal = init 
// 
// init must be reduced down to Identifier and the a final JS3VariableDeclarator must be of the form LVal = $result_holder$
// 
export function handleVariableDeclarator(node: VariableDeclarator, otherProps: OtherProps): JS3VariableDeclarator {
  otherProps.debugTrace.push("VariableDeclarator");
  assert(Array.isArray(otherProps.others.holder), "handleVariableDeclarator expects an holder to spill intermediate values");
  // 3 fallthrough props, 1 restricted props
  let orig_init = node.init; // Handling prop init
  let fin_init: JS3VariableDeclarator_init = null; // Handling prop init
  if (isExpression(orig_init)) {
    fin_init = handleExpression(orig_init, otherProps)
  }
  let result: JS3VariableDeclarator = generateJS3VariableDeclarator(fin_init, node);
  otherProps.debugTrace.pop()
  return result;
}

// Import Declarations
export function handleImportDeclaration(node: ImportDeclaration, otherProps: OtherProps): Array<JS3ImportDeclaration> {
  otherProps.debugTrace.push("ImportDeclaration");
  // 5 fallthrough props, 3 restricted props
  let orig_assertions = node.assertions; // Handling prop assertions
  let fin_assertions: JS3ImportDeclaration_assertions; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled ImportDeclaration->[assertions]->ImportAttribute");
      }
    }
  }
  if (isnull(orig_assertions)) {
    fin_assertions = null
  }
  let orig_attributes = node.attributes; // Handling prop attributes
  let fin_attributes: JS3ImportDeclaration_attributes; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.error("TODO // unhandled ImportDeclaration->[attributes]->ImportAttribute");
      }
    }
  }
  if (isnull(orig_attributes)) {
    fin_attributes = null
  }

  // All assertions that were not handled will be thrown by this point

  // We are breaking down the import declaration on the basis of specifier, each specifier gets a unique declaration statement
  // import a, { abc } from "abc"
  //
  // import a from "abc"
  // import { abc } from "abc"
  //
  let finalResult: Array<JS3ImportDeclaration> = new Array<JS3ImportDeclaration>()

  let orig_specifiers = node.specifiers; // Handling prop specifiers
  if (Array.isArray(orig_specifiers)) {
    for (const _arrProp of orig_specifiers) {

      let fin_specifiers: JS3ImportDeclaration_specifiers = new Array(); // Handling prop specifiers
      // Duplicate node
      const duplicatedNode = generateJS3ImportDeclaration(fin_specifiers, fin_assertions, fin_attributes, node);

      // Add a trailing comment if the module path has been resolved
      const resolvedPath = otherProps.isResolvedModuleImport(node)
      duplicatedNode.trailingComments = []
      duplicatedNode.trailingComments.push(generateCommentLine(resolvedPath ? " Resolved: " + resolvedPath : "Unresolved"))

      // We dont care about the kind of specifier, only one per node is the restriction
      duplicatedNode.specifiers.push(_arrProp)

      // Add duplicated node to the resultArray
      finalResult.push(duplicatedNode);
    }
  }
  otherProps.debugTrace.pop()
  return finalResult
}

// Export Default Declaration, returns a list of declarations (may be caused by spilling) and finally a ExportDefaultDeclaration
export function handleExportDefaultDeclaration(node: ExportDefaultDeclaration, otherProps: OtherProps): JS3Program_body {
  otherProps.debugTrace.push("ExportDefaultDeclaration");
  const finalResult: JS3Program_body = new Array()

  // 2 fallthrough props, 1 restricted props
  let orig_declaration = node.declaration; // Handling prop declaration
  let fin_declaration: JS3ExportDefaultDeclaration_declaration; // Handling prop declaration
  if (isTSDeclareFunction(orig_declaration)) {
    debugConfig.logger.error("TODO // unhandled ExportDefaultDeclaration->declaration->TSDeclareFunction");
  } else if (isFunctionDeclaration(orig_declaration)) {
    debugConfig.logger.error("TODO // unhandled ExportDefaultDeclaration->declaration->FunctionDeclaration");
  } else if (isClassDeclaration(orig_declaration)) {

    // This may cause spilling as the 
    const holder: JS3Program_body = new Array()
    // Holder holds the generated intermediate nodes
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder, prefix: "expDef" } }
    
    fin_declaration = handleClassDeclaration(orig_declaration, updatedProps)
    
    // Add spilled to the parent holder
    holder.forEach(e => finalResult.push(e))

  } else if (isExpression(orig_declaration)) {
    // This may cause spilling as the 
    const holder: JS3Program_body = new Array()
    // Holder holds the generated intermediate nodes
    const updatedProps = { ...otherProps, others: { ...otherProps.others, holder, prefix: "expDef" } }
    
    fin_declaration = handleExpression(orig_declaration, updatedProps)
    
    // Add spilled to the parent holder
    holder.forEach(e => finalResult.push(e))
  }

  let result: JS3ExportDefaultDeclaration = generateJS3ExportDefaultDeclaration(fin_declaration, node);
  finalResult.push(result)
  otherProps.debugTrace.pop()
  return finalResult
}