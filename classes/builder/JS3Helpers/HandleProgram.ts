// Generated on 6/8/2024, 10:15:01 am, generated 1 handlers 
import {ExportAllDeclaration, ExportNamespaceSpecifier, ExportSpecifier, isExpressionStatement, ExportDefaultDeclaration, ExportNamedDeclaration, ImportDeclaration, Program, isClassDeclaration, isDeclareClass, isDeclareExportAllDeclaration, isDeclareExportDeclaration, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareOpaqueType, isDeclareTypeAlias, isDeclareVariable, isEnumDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportDefaultSpecifier, isExportNamedDeclaration, isExportNamespaceSpecifier, isExportSpecifier, isExpression, isFunctionDeclaration, isImportAttribute, isImportDeclaration, isInterfaceDeclaration, isOpaqueType, isTSDeclareFunction, isTSEnumDeclaration, isTSInterfaceDeclaration, isTSModuleDeclaration, isTSTypeAliasDeclaration, isTypeAlias, isVariableDeclaration, isIdentifier, FunctionExpression, numericLiteral, classExpression } from "@babel/types";
import { generateDummyJS3VariableDeclaration, generateIdentifier, generateJS3AnonArrayExpressionfromBaseNode, generateJS3AnonMemberExpressionfromBaseNode, generateJS3ClassExpressionfromBaseNode, generateJS3ExportAllDeclaration, generateJS3ExportDefaultDeclaration, generateJS3ExportNamedDeclaration, generateJS3ExportNamespaceSpecifier, generateJS3ExportSpecifier, generateJS3ExportSpecifierfromBaseNode, generateJS3FunctionExpressionfromBaseNode, generateJS3ImportDeclaration, generateJS3Program } from "./JS3Constructors.ts";
import { JS3AllowedBlockStatement, JS3ArrowFunctionExpression, JS3ClassExpression, JS3ExportAllDeclaration, JS3ExportAllDeclaration_assertions, JS3ExportAllDeclaration_attributes, JS3ExportDefaultDeclaration_declaration, JS3ExportNamedDeclaration_assertions, JS3ExportNamedDeclaration_attributes, JS3ExportNamedDeclaration_specifiers, JS3ExportNamespaceSpecifier, JS3ExportSpecifier, JS3FunctionExpression, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ImportDeclaration_specifiers, JS3Program, JS3Program_body, JS3VariableDeclaration } from "./JS3Types.ts";

import { JS3BuilderUtils, } from "../JS3Builder.ts";

import debugConfig from "#debugConfig";
import { generateCommentLine } from "#utils";

import { handleBlockStatement, handleFunctionDeclaration, handleStatement, handleVariableDeclaration } from "./HandleBlocks.ts";
import { handleClassDeclaration } from "./HandleClassDeclaration.ts";
import { handleClassExpression, handleExpression, handleFunctionExpression } from "./HandleExpression.ts";

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
    } else if (isExportAllDeclaration(_arrProp)) {
      // ========================================================================================
      handleExportAllDeclaration(_arrProp, updatedProps)
      // ========================================================================================
    }
    
    else {
      // ========================================================================================
      const blockStmt: JS3AllowedBlockStatement | Array<JS3VariableDeclaration> = handleStatement(_arrProp, updatedProps)
      if (Array.isArray(blockStmt)) blockStmt.forEach(s => fin_body.push(s))
      else if (isExpressionStatement(_arrProp)) { }
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
    // Case 1: It has a name
    if (isIdentifier(orig_declaration.id)) {
      let js3FnDecl = handleFunctionDeclaration(orig_declaration, otherProps)
      otherProps.others.holder.push(js3FnDecl)
      fin_declaration = orig_declaration.id
    }
    // Case 2: it is anonymous
    else {
      //@ts-ignore
      orig_declaration.type = "FunctionExpression"
      //@ts-ignore
      const fnExpr = handleFunctionExpression(orig_declaration, otherProps);
      //@ts-ignore
      orig_declaration.type = "FunctionDeclaration"

      const holder: Array<JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression> = new Array();
      holder.push(fnExpr);

      // [ function { ... } ]
      const arrNode = generateJS3AnonArrayExpressionfromBaseNode(holder, orig_declaration)

      // [ function { ... } ] [0]
      const anonArrExpr = generateJS3AnonMemberExpressionfromBaseNode(arrNode, numericLiteral(0), true, false, orig_declaration)

      // let temp = [func...][0]
      let resHolder = generateIdentifier(orig_declaration, otherProps.getNewTemporary(otherProps.others.prefix))
      otherProps.others.holder.push(generateDummyJS3VariableDeclaration(orig_declaration, resHolder, anonArrExpr, "let", null, null))
      fin_declaration = resHolder
    }
    // ========================================================================================
  } else if (isClassDeclaration(orig_declaration)) {
    // ========================================================================================
    // Case 1: It has a name
    if (isIdentifier(orig_declaration.id)) {
      let js3ClassDecl = handleClassDeclaration(orig_declaration, otherProps)
      otherProps.others.holder.push(js3ClassDecl)
      fin_declaration = orig_declaration.id
    }
    // Case 2: it is anonymous
    else {
      //@ts-ignore
      orig_declaration.type = "ClassExpression"
      //@ts-ignore
      const fnExpr = handleFunctionExpression(orig_declaration, otherProps);
      //@ts-ignore
      orig_declaration.type = "ClassDeclaration"

      const holder: Array<JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression> = new Array();
      holder.push(fnExpr);

      // [ class { ... } ]
      const arrNode = generateJS3AnonArrayExpressionfromBaseNode(holder, orig_declaration)

      // [ class { ... } ] [0]
      const anonArrExpr = generateJS3AnonMemberExpressionfromBaseNode(arrNode, numericLiteral(0), true, false, orig_declaration)

      // let temp = [class...][0]
      let resHolder = generateIdentifier(orig_declaration, otherProps.getNewTemporary(otherProps.others.prefix))
      otherProps.others.holder.push(generateDummyJS3VariableDeclaration(orig_declaration, resHolder, anonArrExpr, "let", null, null))
      fin_declaration = resHolder
    }
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
    // ========================================================================================
    let js3FnDecl = handleFunctionDeclaration(orig_declaration, otherProps)
    otherProps.others.holder.push(js3FnDecl)
    let specifierArray = new Array()
    let specifier = generateJS3ExportSpecifierfromBaseNode(js3FnDecl.id, js3FnDecl.id, "value", orig_declaration)
    specifierArray.push(specifier)
    const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(null, specifierArray, fin_assertions, fin_attributes, node);
    (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
    // ========================================================================================
  } else if (isVariableDeclaration(orig_declaration)) {
    // 
    // Input:
    // export let {a, b: foo} = { a: 1, b: 121 }
    // export let x = 121, y = 11.2
    // 
    // Output:
    // let js3$1 = {
    //   a: 1,
    //   b: 121
    // };
    // export let {
    //   a,
    //   b: foo
    // } = js3$1;
    // let x = 121;
    // export { x };
    // let y = 11.2;
    // export { y }; 
    const fin_declarations = handleVariableDeclaration(orig_declaration, otherProps)
    fin_declarations.forEach(s => {
      if (!isIdentifier(s.declarations[0].id)) {
        const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(s, new Array(), fin_assertions, fin_attributes, node);
      (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
      } else {
        otherProps.others.holder.push(s);
        let specifierArray = new Array()
        let specifier = generateJS3ExportSpecifierfromBaseNode(s.declarations[0].id, s.declarations[0].id, "value", orig_declaration)
        specifierArray.push(specifier)
  
        const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(null, specifierArray, fin_assertions, fin_attributes, node);
        (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
      }
    })

  } else if (isClassDeclaration(orig_declaration)) {
    let js3ClassDecl = handleClassDeclaration(orig_declaration, otherProps)
    otherProps.others.holder.push(js3ClassDecl)
    let specifierArray = new Array()
    let specifier = generateJS3ExportSpecifierfromBaseNode(js3ClassDecl.id, js3ClassDecl.id, "value", orig_declaration)
    specifierArray.push(specifier)
    const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(null, specifierArray, fin_assertions, fin_attributes, node);
    (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
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
  // let fin_specifiers: JS3ExportNamedDeclaration_specifiers; // Handling prop specifiers
  if (Array.isArray(orig_specifiers)) {
    for (const _arrProp of orig_specifiers) {
      if (isExportSpecifier(_arrProp)) {
        const eSpec = handleExportSpecifier(_arrProp, otherProps)
        let fin_specifiers: JS3ExportNamedDeclaration_specifiers = new Array()
        fin_specifiers.push(eSpec)
        const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(undefined, fin_specifiers, fin_assertions, fin_attributes, node);
        (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
      } else if (isExportDefaultSpecifier(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportNamedDeclaration->[specifiers]->ExportDefaultSpecifier");
      } else if (isExportNamespaceSpecifier(_arrProp)) {
        const eSpec = handleExportNamespaceSpecifier(_arrProp, otherProps)
        let fin_specifiers: JS3ExportNamedDeclaration_specifiers = new Array()
        fin_specifiers.push(eSpec)
        const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(undefined, fin_specifiers, fin_assertions, fin_attributes, node);
        (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl)
      }
    }
  }


  // let result: JS3ExportNamedDeclaration = generateJS3ExportNamedDeclaration(fin_declaration, fin_specifiers, fin_assertions, fin_attributes, node);
}

export function handleExportSpecifier(node: ExportSpecifier, otherProps: OtherProps) {
  // 4 fallthrough props, 0 restricted props
  let result: JS3ExportSpecifier = generateJS3ExportSpecifier(node);
  return result
}
export function handleExportNamespaceSpecifier(node: ExportNamespaceSpecifier, otherProps: OtherProps) {
  // 2 fallthrough props, 0 restricted props
  let result: JS3ExportNamespaceSpecifier = generateJS3ExportNamespaceSpecifier(node);
  return result
}

export function handleExportAllDeclaration(node: ExportAllDeclaration, otherProps: OtherProps) {
  // 3 fallthrough props, 2 restricted props
  let orig_assertions = node.assertions; // Handling prop assertions
  let fin_assertions: JS3ExportAllDeclaration_assertions = null; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportAllDeclaration->[assertions]->ImportAttribute");
      }
    }
  }

  let orig_attributes = node.attributes; // Handling prop attributes
  let fin_attributes: JS3ExportAllDeclaration_attributes = null; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        debugConfig.logger.throwJS3Error("TODO // unhandled ExportAllDeclaration->[attributes]->ImportAttribute");
      }
    }
  }

  let result: JS3ExportAllDeclaration = generateJS3ExportAllDeclaration(fin_assertions, fin_attributes, node);
  // Generate a export default statement and push it into the holder
  (otherProps.others.holder as JS3Program_body).push(result)
}