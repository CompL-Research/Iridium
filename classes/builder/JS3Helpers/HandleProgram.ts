// Generated on 6/8/2024, 10:15:01 am, generated 1 handlers
import {
  ExportAllDeclaration,
  ExportDefaultDeclaration,
  ExportNamedDeclaration,
  ExportNamespaceSpecifier,
  ExportSpecifier,
  ImportDeclaration,
  importSpecifier,
  isArrowFunctionExpression,
  isClassDeclaration,
  isClassExpression,
  isDeclareClass,
  isDeclareExportAllDeclaration,
  isDeclareExportDeclaration,
  isDeclareFunction,
  isDeclareInterface,
  isDeclareModule,
  isDeclareModuleExports,
  isDeclareOpaqueType,
  isDeclareTypeAlias,
  isDeclareVariable,
  isEnumDeclaration,
  isExportAllDeclaration,
  isExportDefaultDeclaration,
  isExportDefaultSpecifier,
  isExportNamedDeclaration,
  isExportNamespaceSpecifier,
  isExportSpecifier,
  isExpression,
  isExpressionStatement,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isImportAttribute,
  isImportDeclaration,
  isImportDefaultSpecifier,
  isInterfaceDeclaration,
  isOpaqueType,
  isTSDeclareFunction,
  isTSEnumDeclaration,
  isTSInterfaceDeclaration,
  isTSModuleDeclaration,
  isTSTypeAliasDeclaration,
  isTypeAlias,
  isVariableDeclaration,
  Program,
} from "@babel/types";
import {
  generateIdentifier,
  generateJS3ExportAllDeclaration,
  generateJS3ExportNamedDeclaration,
  generateJS3ExportNamedDeclarationfromBaseNode,
  generateJS3ExportNamespaceSpecifier,
  generateJS3ExportSpecifier,
  generateJS3ExportSpecifierfromBaseNode,
  generateJS3ImportDeclaration,
  generateJS3Program,
  generateJS3VariableDeclarationfromBaseNode,
  generateJS3VariableDeclaratorfromBaseNode,
} from "./JS3Constructors";
import {
  isJS3VariableDeclaration,
  JS3AllowedBlockStatement,
  JS3ExportAllDeclaration,
  JS3ExportAllDeclaration_assertions,
  JS3ExportAllDeclaration_attributes,
  JS3ExportDefaultDeclaration_declaration,
  JS3ExportNamedDeclaration_assertions,
  JS3ExportNamedDeclaration_attributes,
  JS3ExportNamedDeclaration_specifiers,
  JS3ExportNamespaceSpecifier,
  JS3ExportSpecifier,
  JS3ImportDeclaration_assertions,
  JS3ImportDeclaration_attributes,
  JS3ImportDeclaration_specifiers,
  JS3Program,
  JS3Program_body,
} from "./JS3Types";

import { JS3BuilderUtils } from "../JS3Builder";

import debugConfig from "#debugConfig";

import {
  handleFunctionDeclaration,
  handleStatement,
  handleVariableDeclaration,
} from "./HandleBlocks";
import { handleClassDeclaration } from "./HandleClassDeclaration";
import { handleExpression } from "./HandleExpression";

import babel from "@babel/core";
import _generate from "@babel/generator";
import _traverse from "@babel/traverse";
import { handleDefaultExportNames } from "./GenericConstructs";

// @ts-ignore
let generate = _generate.default;
// @ts-ignore
let traverse = _traverse.default;

type OtherProps = JS3BuilderUtils;

export function handleProgram(
  node: Program,
  otherProps: OtherProps,
): JS3Program {
  // 4 fallthrough props, 1 restricted props
  const orig_body = node.body; // Handling prop body
  const fin_body: JS3Program_body = []; // Handling prop body

  // Program Scope
  const updatedProps = {
    ...otherProps,
    others: { ...otherProps.others, holder: fin_body },
  };
  for (const _arrProp of orig_body) {
    if (isImportDeclaration(_arrProp)) {
      // ========================================================================================
      handleImportDeclaration(_arrProp, updatedProps);
      // ========================================================================================
    } else if (isExportDefaultDeclaration(_arrProp)) {
      // ========================================================================================
      handleExportDefaultDeclaration(_arrProp, updatedProps);
      // ========================================================================================
    } else if (isExportNamedDeclaration(_arrProp)) {
      // ========================================================================================
      handleExportNamedDeclaration(_arrProp, updatedProps);
      // ========================================================================================
    } else if (isExportAllDeclaration(_arrProp)) {
      // ========================================================================================
      handleExportAllDeclaration(_arrProp, updatedProps);
      // ========================================================================================
    } else {
      // ========================================================================================
      const blockStmt:
        | JS3AllowedBlockStatement
        | Array<JS3AllowedBlockStatement> = handleStatement(
        _arrProp,
        updatedProps,
      );
      if (Array.isArray(blockStmt)) blockStmt.forEach((s) => fin_body.push(s));
      else if (isExpressionStatement(_arrProp)) {
        /* empty */
      } else fin_body.push(blockStmt);
      // ========================================================================================
    }
  }
  // InterpreterDirective Example...
  // test262/test/language/comments/hashbang/line-terminator-carriage-return.js
  //
  const result: JS3Program = generateJS3Program(fin_body, node);
  return result;
}

// Import Declarations
export function handleImportDeclaration(
  node: ImportDeclaration,
  otherProps: OtherProps,
) {
  // 5 fallthrough props, 3 restricted props
  const orig_assertions = node.assertions; // Handling prop assertions
  const fin_assertions: JS3ImportDeclaration_assertions = null; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        throw new Error(
          "TODO // unhandled ImportDeclaration->[assertions]->ImportAttribute",
        );
      }
    }
  }

  const orig_attributes = node.attributes; // Handling prop attributes
  const fin_attributes: JS3ImportDeclaration_attributes = null; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        throw new Error(
          "TODO // unhandled ImportDeclaration->[attributes]->ImportAttribute",
        );
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

  const orig_specifiers = node.specifiers; // Handling prop specifiers
  if (Array.isArray(orig_specifiers)) {
    for (const _arrProp of orig_specifiers) {
      const fin_specifiers: JS3ImportDeclaration_specifiers = []; // Handling prop specifiers
      // Duplicate node
      const duplicatedNode = generateJS3ImportDeclaration(
        fin_specifiers,
        fin_assertions,
        fin_attributes,
        node,
      );

      //
      // If the specifier is ImportDefaultSpecifier we make it a ImportSpecifier
      // Basically,
      //   import x from "source" -> import { default as x } from "source";
      //

      if (isImportDefaultSpecifier(_arrProp)) {
        duplicatedNode.specifiers.push(
          importSpecifier(
            _arrProp.local,
            generateIdentifier(_arrProp, "default"),
          ),
        );
      } else {
        duplicatedNode.specifiers.push(_arrProp);
      }

      if (!otherProps.others) throw new Error("otherProps.others undefined");
      if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");

      // Add duplicated node to the resultArray
      (otherProps.others.holder as JS3Program_body).push(duplicatedNode);
    }
  }

  if (orig_specifiers.length === 0) {
    if (!otherProps.others) throw new Error("otherProps.others undefined");
    if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");

    (otherProps.others.holder as JS3Program_body).push(
      generateJS3ImportDeclaration([], fin_assertions, fin_attributes, node),
    );
  }
}

// Export Default Declaration, returns a list of declarations (may be caused by spilling) and finally a ExportDefaultDeclaration
export function handleExportDefaultDeclaration(
  node: ExportDefaultDeclaration,
  otherProps: OtherProps,
) {
  // 2 fallthrough props, 1 restricted props
  const orig_declaration = node.declaration; // Handling prop declaration
  let fin_declaration: JS3ExportDefaultDeclaration_declaration; // Handling prop declaration
  if (isTSDeclareFunction(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportDefaultDeclaration->declaration->TSDeclareFunction",
    );
  } else if (isFunctionDeclaration(orig_declaration)) {
    // ========================================================================================
    // Case 1: It has a name
    if (isIdentifier(orig_declaration.id)) {
      const js3FnDecl = handleFunctionDeclaration(orig_declaration, otherProps);
      if (!otherProps.others) throw new Error("otherProps.others undefined");
      if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
      otherProps.others.holder.push(js3FnDecl);
      fin_declaration = orig_declaration.id;
    }
    // Case 2: it is anonymous
    else {
      fin_declaration = handleDefaultExportNames(orig_declaration, otherProps);
    }
    // ========================================================================================
  } else if (isClassDeclaration(orig_declaration)) {
    // ========================================================================================
    // Case 1: It has a name
    if (isIdentifier(orig_declaration.id)) {
      const js3ClassDecl = handleClassDeclaration(orig_declaration, otherProps);
      
      js3ClassDecl.forEach((s) => {
        if (!otherProps.others) throw new Error("otherProps.others undefined");
        if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
        otherProps.others.holder.push(s);
      });

      fin_declaration = orig_declaration.id;
    }
    // Case 2: it is anonymous
    else {
      fin_declaration = handleDefaultExportNames(orig_declaration, otherProps);
    }
    // ========================================================================================
  } else if (
    isFunctionExpression(orig_declaration) ||
    isArrowFunctionExpression(orig_declaration) ||
    isClassExpression(orig_declaration)
  ) {
    // ========================================================================================
    //
    // TODO: Implement "JS3DefaultMemberExpression" <- This ensures the name is "default" and not ""
    //
    fin_declaration = handleDefaultExportNames(orig_declaration, otherProps);
    // ========================================================================================
  } else {
    // ========================================================================================
    if (!otherProps.others) throw new Error("otherProps.others undefined");
    if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
    otherProps.others.prefix = "exportDefExpr";
    fin_declaration = handleExpression(orig_declaration, otherProps);
    // ========================================================================================
  }

  const exportSpecifier = generateJS3ExportSpecifierfromBaseNode(
    fin_declaration,
    generateIdentifier(node, "default"),
    null,
    node,
  );
  const fin_specifiers: JS3ExportNamedDeclaration_specifiers = [];
  fin_specifiers.push(exportSpecifier);
  const duplicatedExportNamedDecl =
    generateJS3ExportNamedDeclarationfromBaseNode(
      null,
      fin_specifiers,
      null,
      null,
      null,
      null,
      node,
    );

  if (!otherProps.others) throw new Error("otherProps.others undefined");
  if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
  // Generate a export default statement and push it into the holder
  (otherProps.others.holder as JS3Program_body).push(duplicatedExportNamedDecl);
}

export function handleExportNamedDeclaration(
  node: ExportNamedDeclaration,
  otherProps: OtherProps,
) {
  // 3 fallthrough props, 4 restricted props

  const orig_assertions = node.assertions; // Handling prop assertions
  const fin_assertions: JS3ExportNamedDeclaration_assertions = null; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        throw new Error(
          "TODO // unhandled ExportNamedDeclaration->[assertions]->ImportAttribute",
        );
      }
    }
  }

  const orig_attributes = node.attributes; // Handling prop attributes
  const fin_attributes: JS3ExportNamedDeclaration_attributes = null; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        throw new Error(
          "TODO // unhandled ExportNamedDeclaration->[attributes]->ImportAttribute",
        );
      }
    }
  }

  const orig_declaration = node.declaration; // Handling prop declaration
  // let fin_declaration : JS3ExportNamedDeclaration_declaration = null; // Handling prop declaration
  if (isFunctionDeclaration(orig_declaration)) {
    // ========================================================================================
    const js3FnDecl = handleFunctionDeclaration(orig_declaration, otherProps);
    if (!otherProps.others) throw new Error("otherProps.others undefined");
    if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
    otherProps.others.holder.push(js3FnDecl);
    const specifierArray = [];
    const specifier = generateJS3ExportSpecifierfromBaseNode(
      js3FnDecl.id,
      js3FnDecl.id,
      "value",
      orig_declaration,
    );
    specifierArray.push(specifier);
    const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(
      null,
      specifierArray,
      fin_assertions,
      fin_attributes,
      node,
    );
    if (!otherProps.others) throw new Error("otherProps.others undefined");
    if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
    (otherProps.others.holder as JS3Program_body).push(
      duplicatedExportNamedDecl,
    );
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
    const fin_declarations = handleVariableDeclaration(
      orig_declaration,
      otherProps,
    );
    // Spill all declarations
    fin_declarations.forEach((s) => {
      if (!otherProps.others) throw new Error("otherProps.others undefined");
      if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
      otherProps.others.holder.push(s);
    });

    // throw new Error("WIP: export named var decl...")
    //
    // TODO: Much to improve here...
    //

    fin_declarations
      .filter((s) => isJS3VariableDeclaration(s))
      .forEach((s) => {
        const declaredBindings: Array<string> = [];

        if (!isIdentifier(s.declarations[0].id)) {
          // Find the identifiers created by this assignment pattern.
          try {
            // Generate a temp assignment of the form
            //  [a, ...rest] = undefined
            //  {a, b: { d: e }} = undefined
            const tempVarDeclarator = generateJS3VariableDeclaratorfromBaseNode(
              s.declarations[0].id,
              generateIdentifier(orig_declaration, "undefined"),
              null,
              orig_declaration,
            );
            const tempVarDecl = generateJS3VariableDeclarationfromBaseNode(
              [tempVarDeclarator],
              orig_declaration.kind,
              orig_declaration.declare === undefined ? null : orig_declaration.declare,
              orig_declaration,
            );

            // Generate source string
            const output = generate(tempVarDecl);

            // Generate AST
            const options = {
              ast: true,
            };
            const result = babel.transformSync(output.code, options);

            // Populate generated bindings
            if (!result) throw new Error("Expected result to be non-null, handleExportNamedDeclaration");
            traverse(result.ast, {
              Program(path: any) {
                for (const key in path.scope.bindings) {
                  const b = path.scope.bindings[key];
                  declaredBindings.push(b.identifier.name);
                }
              },
            });
          } catch (e) {
            throw new Error(
              `Failed lowering export declaration pattern: ${e}`
            );
          }
        } else {
          // Trivial case
          declaredBindings.push(s.declarations[0].id.name);
        }

        for (const b of declaredBindings) {
          const specifierArray = [];
          const specifier = generateJS3ExportSpecifierfromBaseNode(
            generateIdentifier(orig_declaration, b),
            generateIdentifier(orig_declaration, b),
            "value",
            orig_declaration,
          );
          specifierArray.push(specifier);

          const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(
            null,
            specifierArray,
            fin_assertions,
            fin_attributes,
            node,
          );
          if (!otherProps.others) throw new Error("otherProps.others undefined");
          if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
          (otherProps.others.holder as JS3Program_body).push(
            duplicatedExportNamedDecl,
          );
        }
      });
  } else if (isClassDeclaration(orig_declaration)) {
    //
    // This will always be named, we are not expecting unnamed declaration nodes to come up here.
    //
    const js3ClassDecl = handleClassDeclaration(orig_declaration, otherProps);
    js3ClassDecl.forEach((s) => {
      if (!otherProps.others) throw new Error("otherProps.others undefined");
      if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
      otherProps.others.holder.push(s);
    });
    // otherProps.others.holder.push(js3ClassDecl)
    const specifierArray = [];
    if (!orig_declaration.id) throw new Error("Expected declaration id to be non null");
    const specifier = generateJS3ExportSpecifierfromBaseNode(
      orig_declaration.id,
      orig_declaration.id,
      "value",
      orig_declaration,
    );
    specifierArray.push(specifier);
    const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(
      null,
      specifierArray,
      fin_assertions,
      fin_attributes,
      node,
    );
    if (!otherProps.others) throw new Error("otherProps.others undefined");
    if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
    (otherProps.others.holder as JS3Program_body).push(
      duplicatedExportNamedDecl,
    );
  } else if (isExportAllDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->ExportAllDeclaration",
    );
  } else if (isExportDefaultDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->ExportDefaultDeclaration",
    );
  } else if (isExportNamedDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->ExportNamedDeclaration",
    );
  } else if (isImportDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->ImportDeclaration",
    );
  } else if (isDeclareClass(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareClass",
    );
  } else if (isDeclareFunction(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareFunction",
    );
  } else if (isDeclareInterface(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareInterface",
    );
  } else if (isDeclareModule(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareModule",
    );
  } else if (isDeclareModuleExports(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareModuleExports",
    );
  } else if (isDeclareTypeAlias(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareTypeAlias",
    );
  } else if (isDeclareOpaqueType(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareOpaqueType",
    );
  } else if (isDeclareVariable(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareVariable",
    );
  } else if (isDeclareExportDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareExportDeclaration",
    );
  } else if (isDeclareExportAllDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->DeclareExportAllDeclaration",
    );
  } else if (isInterfaceDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->InterfaceDeclaration",
    );
  } else if (isOpaqueType(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->OpaqueType",
    );
  } else if (isTypeAlias(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->TypeAlias",
    );
  } else if (isEnumDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->EnumDeclaration",
    );
  } else if (isTSDeclareFunction(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->TSDeclareFunction",
    );
  } else if (isTSInterfaceDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->TSInterfaceDeclaration",
    );
  } else if (isTSTypeAliasDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->TSTypeAliasDeclaration",
    );
  } else if (isTSEnumDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->TSEnumDeclaration",
    );
  } else if (isTSModuleDeclaration(orig_declaration)) {
    throw new Error(
      "TODO // unhandled ExportNamedDeclaration->declaration->TSModuleDeclaration",
    );
  }

  const orig_specifiers = node.specifiers; // Handling prop specifiers
  // let fin_specifiers: JS3ExportNamedDeclaration_specifiers; // Handling prop specifiers
  if (Array.isArray(orig_specifiers)) {
    for (const _arrProp of orig_specifiers) {
      if (isExportSpecifier(_arrProp)) {
        const eSpec = handleExportSpecifier(_arrProp, otherProps);
        const fin_specifiers: JS3ExportNamedDeclaration_specifiers = [];
        fin_specifiers.push(eSpec);
        const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(
          null,
          fin_specifiers,
          fin_assertions,
          fin_attributes,
          node,
        );
        if (!otherProps.others) throw new Error("otherProps.others undefined");
        if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
        (otherProps.others.holder as JS3Program_body).push(
          duplicatedExportNamedDecl,
        );
      } else if (isExportDefaultSpecifier(_arrProp)) {
        throw new Error(
          "TODO // unhandled ExportNamedDeclaration->[specifiers]->ExportDefaultSpecifier",
        );
      } else if (isExportNamespaceSpecifier(_arrProp)) {
        const eSpec = handleExportNamespaceSpecifier(_arrProp, otherProps);
        const fin_specifiers: JS3ExportNamedDeclaration_specifiers = [];
        fin_specifiers.push(eSpec);
        const duplicatedExportNamedDecl = generateJS3ExportNamedDeclaration(
          null,
          fin_specifiers,
          fin_assertions,
          fin_attributes,
          node,
        );
        if (!otherProps.others) throw new Error("otherProps.others undefined");
        if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
        (otherProps.others.holder as JS3Program_body).push(
          duplicatedExportNamedDecl,
        );
      }
    }
  }

  // let result: JS3ExportNamedDeclaration = generateJS3ExportNamedDeclaration(fin_declaration, fin_specifiers, fin_assertions, fin_attributes, node);
}

export function handleExportSpecifier(
  node: ExportSpecifier,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _otherProps: OtherProps,
) {
  // 4 fallthrough props, 0 restricted props
  const result: JS3ExportSpecifier = generateJS3ExportSpecifier(node);
  return result;
}
export function handleExportNamespaceSpecifier(
  node: ExportNamespaceSpecifier,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _otherProps: OtherProps,
) {
  // 2 fallthrough props, 0 restricted props
  const result: JS3ExportNamespaceSpecifier =
    generateJS3ExportNamespaceSpecifier(node);
  return result;
}

export function handleExportAllDeclaration(
  node: ExportAllDeclaration,
  otherProps: OtherProps,
) {
  // 3 fallthrough props, 2 restricted props
  const orig_assertions = node.assertions; // Handling prop assertions
  const fin_assertions: JS3ExportAllDeclaration_assertions = null; // Handling prop assertions
  if (Array.isArray(orig_assertions)) {
    for (const _arrProp of orig_assertions) {
      if (isImportAttribute(_arrProp)) {
        throw new Error(
          "TODO // unhandled ExportAllDeclaration->[assertions]->ImportAttribute",
        );
      }
    }
  }

  const orig_attributes = node.attributes; // Handling prop attributes
  const fin_attributes: JS3ExportAllDeclaration_attributes = null; // Handling prop attributes
  if (Array.isArray(orig_attributes)) {
    for (const _arrProp of orig_attributes) {
      if (isImportAttribute(_arrProp)) {
        throw new Error(
          "TODO // unhandled ExportAllDeclaration->[attributes]->ImportAttribute",
        );
      }
    }
  }

  const result: JS3ExportAllDeclaration = generateJS3ExportAllDeclaration(
    fin_assertions,
    fin_attributes,
    node,
  );
  if (!otherProps.others) throw new Error("otherProps.others undefined");
  if (!otherProps.others.holder) throw new Error("otherProps.others.holder is null");
  // Generate a export default statement and push it into the holder
  (otherProps.others.holder as JS3Program_body).push(result);
}
