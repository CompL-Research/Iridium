// Generated on 6/8/2024, 10:15:01 am, generated 1 handlers 
import { ExportDefaultDeclaration, ImportDeclaration, Program, isClassDeclaration, isExportDefaultDeclaration, isExpression, isFunctionDeclaration, isImportAttribute, isImportDeclaration, isTSDeclareFunction } from "@babel/types";
import { generateJS3ExportDefaultDeclaration, generateJS3ImportDeclaration, generateJS3Program } from "./JS3Constructors.ts";
import { JS3ExportDefaultDeclaration_declaration, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ImportDeclaration_specifiers, JS3Program, JS3Program_body } from "./JS3Types.ts";

import { JS3BuilderUtils, } from "../JS3Builder.ts";

import debugConfig from "#debugConfig";
import { generateCommentLine } from "#utils";

import { handleFunctionDeclarationWithRet, handleStatement } from "./HandleBlocks.ts";
import { handleClassDeclarationWithRet } from "./HandleClassDeclaration.ts";
import { handleExpression } from "./HandleExpression.ts";

type OtherProps = JS3BuilderUtils;

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

export function handleProgram(node: Program, otherProps: OtherProps) : JS3Program {
  otherProps.debugTrace.push("Program");
  // 4 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body : JS3Program_body = new Array(); // Handling prop body

  // All spills will be held by fin_body
  const updatedProps = { ...otherProps, others: { ...otherProps.others, holder: fin_body } }
  for (const _arrProp of orig_body) {
    if (isImportDeclaration(_arrProp)) {
      // ========================================================================================
      handleImportDeclaration(_arrProp, updatedProps)
      // ========================================================================================
    } else if (isExportDefaultDeclaration(_arrProp)) {
      // ========================================================================================
      handleExportDefaultDeclaration(_arrProp, updatedProps)
      // ========================================================================================
    } else {
      handleStatement(_arrProp, updatedProps)
    }
  }
  let result: JS3Program = generateJS3Program(fin_body, node);
  otherProps.debugTrace.pop()
  return result
}

// Import Declarations
export function handleImportDeclaration(node: ImportDeclaration, otherProps: OtherProps) {
  otherProps.debugTrace.push("ImportDeclaration");
  // 5 fallthrough props, 3 restricted props
  let orig_assertions = node.assertions; // Handling prop assertions
  let fin_assertions: JS3ImportDeclaration_assertions; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ImportDeclaration->[assertions]->ImportAttribute");
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
        debugConfig.logger.throwJS3Error("TODO // unhandled ImportDeclaration->[attributes]->ImportAttribute");
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

  let orig_specifiers = node.specifiers; // Handling prop specifiers
  if (Array.isArray(orig_specifiers)) {
    for (const _arrProp of orig_specifiers) {

      let fin_specifiers: JS3ImportDeclaration_specifiers = new Array(); // Handling prop specifiers
      // Duplicate node
      const duplicatedNode = generateJS3ImportDeclaration(fin_specifiers, fin_assertions, fin_attributes, node);

      // Add a trailing comment if the module path has been resolved
      const resolvedPath = otherProps.isResolvedModuleImport(node)
      duplicatedNode.trailingComments = []
      duplicatedNode.trailingComments.push(generateCommentLine(resolvedPath ? " Resolved: " + resolvedPath : " Unresolved"))

      // We dont care about the kind of specifier, only one per node is the restriction
      duplicatedNode.specifiers.push(_arrProp);

      // Add duplicated node to the resultArray
      (otherProps.others.holder as JS3Program_body).push(duplicatedNode);
    }
  }
  otherProps.debugTrace.pop()
}

// Export Default Declaration, returns a list of declarations (may be caused by spilling) and finally a ExportDefaultDeclaration
export function handleExportDefaultDeclaration(node: ExportDefaultDeclaration, otherProps: OtherProps) {
  otherProps.debugTrace.push("ExportDefaultDeclaration");

  // 2 fallthrough props, 1 restricted props
  let orig_declaration = node.declaration; // Handling prop declaration
  let fin_declaration: JS3ExportDefaultDeclaration_declaration; // Handling prop declaration
  if (isTSDeclareFunction(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportDefaultDeclaration->declaration->TSDeclareFunction");
  } else if (isFunctionDeclaration(orig_declaration)) {
    // ========================================================================================
    otherProps.others.prefix = "exportDefFunc"
    fin_declaration = handleFunctionDeclarationWithRet(orig_declaration, otherProps)
    // ========================================================================================
  } else if (isClassDeclaration(orig_declaration)) {
    // ========================================================================================
    otherProps.others.prefix = "exportDefClass"
    fin_declaration = handleClassDeclarationWithRet(orig_declaration, otherProps)
    // ========================================================================================
  } else if (isExpression(orig_declaration)) {
    // ========================================================================================
    otherProps.others.prefix = "exportDefExpr"
    fin_declaration = handleExpression(orig_declaration, otherProps)
    // ========================================================================================
  }

  // Generate a export default statement and push it into the holder
  (otherProps.others.holder as JS3Program_body).push(generateJS3ExportDefaultDeclaration(fin_declaration, node))
  otherProps.debugTrace.pop()
}