// Generated on 6/8/2024, 10:15:01 am, generated 1 handlers 
import { isExpressionStatement, ExportDefaultDeclaration, ExportNamedDeclaration, ImportDeclaration, Program, isClassDeclaration, isDeclareClass, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportDefaultSpecifier, isExportNamedDeclaration, isExportNamespaceSpecifier, isExportSpecifier, isExpression, isFunctionDeclaration, isImportAttribute, isImportDeclaration, isInterfaceDeclaration, isOpaqueType, isTSDeclareFunction, isTSEnumDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSTypeAliasDeclaration, isTypeAlias, isVariableDeclaration } from "@babel/types";
import { generateJS3ExportDefaultDeclaration, generateJS3ExportNamedDeclaration, generateJS3ImportDeclaration, generateJS3Program } from "./JS3Constructors.ts";
import { JS3AllowedBlockStatement, JS3ExportDefaultDeclaration_declaration, JS3ExportNamedDeclaration_assertions, JS3ExportNamedDeclaration_attributes, JS3ExportNamedDeclaration_specifiers, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ImportDeclaration_specifiers, JS3Program, JS3Program_body, JS3VariableDeclaration } from "./JS3Types.ts";

import { JS3BuilderUtils, } from "../JS3Builder.ts";

import debugConfig from "#debugConfig";
import { generateCommentLine } from "#utils";

import { handleFunctionDeclaration, handleStatement, handleVariableDeclaration } from "./HandleBlocks.ts";
import { handleClassDeclaration } from "./HandleClassDeclaration.ts";
import { handleExpression } from "./HandleExpression.ts";

type OtherProps = JS3BuilderUtils;

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

export function handleProgram(node: Program, otherProps: OtherProps): JS3Program {
  otherProps.debugTrace.push("Program");
  // 4 fallthrough props, 1 restricted props
  let orig_body = node.body; // Handling prop body
  let fin_body: JS3Program_body = new Array(); // Handling prop body

  // Program Scope
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
    } else if (isExportNamedDeclaration(_arrProp)) {
      // ========================================================================================
      handleExportNamedDeclaration(_arrProp, updatedProps)
      // ========================================================================================
    } else {
      // ========================================================================================
      const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(_arrProp, updatedProps)
      if (Array.isArray(blockStmt)) blockStmt.forEach(s => fin_body.push(s))
      else if (isExpressionStatement(_arrProp)) {}
      else fin_body.push(blockStmt)
      // ========================================================================================
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
  let fin_assertions: JS3ImportDeclaration_assertions = null; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ImportDeclaration->[assertions]->ImportAttribute");
      }
    }
  }


  let orig_attributes = node.attributes; // Handling prop attributes
  let fin_attributes: JS3ImportDeclaration_attributes = null; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ImportDeclaration->[attributes]->ImportAttribute");
      }
    }
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

  if (orig_specifiers.length === 0) {
    (otherProps.others.holder as JS3Program_body).push(generateJS3ImportDeclaration(new Array(), fin_assertions, fin_attributes, node))
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
    fin_declaration = handleFunctionDeclaration(orig_declaration, otherProps)
    // ========================================================================================
  } else if (isClassDeclaration(orig_declaration)) {
    // ========================================================================================
    otherProps.others.prefix = "exportDefClass"
    fin_declaration = handleClassDeclaration(orig_declaration, otherProps)
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

export function handleExportNamedDeclaration(node: ExportNamedDeclaration, otherProps: OtherProps) {
  // 3 fallthrough props, 4 restricted props

  let orig_assertions = node.assertions; // Handling prop assertions
  let fin_assertions: JS3ExportNamedDeclaration_assertions = null; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->[assertions]->ImportAttribute");
      }
    }
  }

  let orig_attributes = node.attributes; // Handling prop attributes
  let fin_attributes: JS3ExportNamedDeclaration_attributes = null; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->[attributes]->ImportAttribute");
      }
    }
  }


  let orig_declaration = node.declaration; // Handling prop declaration
  // let fin_declaration : JS3ExportNamedDeclaration_declaration = null; // Handling prop declaration
  if (isFunctionDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->FunctionDeclaration");
  } else if (isVariableDeclaration(orig_declaration)) {

    const fin_declarations = handleVariableDeclaration(orig_declaration, otherProps)
    for (const dec of fin_declarations) {
      if (node.specifiers.length !== 0) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->VariableDeclaration: node.specifiers.length !== 0");
      }
      const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(dec, new Array(), fin_assertions, fin_attributes, node);
      (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
    }

  } else if (isClassDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->ClassDeclaration");
  } else if (isExportAllDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->ExportAllDeclaration");
  } else if (isExportDefaultDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->ExportDefaultDeclaration");
  } else if (isExportNamedDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->ExportNamedDeclaration");
  } else if (isImportDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->ImportDeclaration");
  } else if (isDeclareClass(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareClass");
  } else if (isDeclareFunction(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareFunction");
  } else if (isDeclareInterface(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareInterface");
  } else if (isDeclareModule(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareModule");
  } else if (isDeclareModuleExports(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareModuleExports");
  } else if (isDeclareTypeAlias(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareTypeAlias");
  } else if (isDeclareOpaqueType(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareOpaqueType");
  } else if (isDeclareVariable(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareVariable");
  } else if (isDeclareExportDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareExportDeclaration");
  } else if (isDeclareExportAllDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->DeclareExportAllDeclaration");
  } else if (isInterfaceDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->InterfaceDeclaration");
  } else if (isOpaqueType(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->OpaqueType");
  } else if (isTypeAlias(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->TypeAlias");
  } else if (isEnumDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->EnumDeclaration");
  } else if (isTSDeclareFunction(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->TSDeclareFunction");
  } else if (isTSInterfaceDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->TSInterfaceDeclaration");
  } else if (isTSTypeAliasDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->TSTypeAliasDeclaration");
  } else if (isTSEnumDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->TSEnumDeclaration");
  } else if (isTSModuleDeclaration(orig_declaration)) {
    debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->declaration->TSModuleDeclaration");
  }

  let orig_specifiers = node.specifiers; // Handling prop specifiers
  let fin_specifiers: JS3ExportNamedDeclaration_specifiers; // Handling prop specifiers
  if (Array.isArray(orig_specifiers)) {
    for (const _arrProp of orig_specifiers) {
      if (isExportSpecifier(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->[specifiers]->ExportSpecifier");
      } else if (isExportDefaultSpecifier(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->[specifiers]->ExportDefaultSpecifier");
      } else if (isExportNamespaceSpecifier(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->[specifiers]->ExportNamespaceSpecifier");
      }
    }
  }


  // let result: JS3ExportNamedDeclaration = generateJS3ExportNamedDeclaration(fin_declaration, fin_specifiers, fin_assertions, fin_attributes, node);
}