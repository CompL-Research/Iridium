// Generated on 6/8/2024, 10:15:01 am, generated 1 handlers 
import { Program, isBlockStatement, isBreakStatement, isContinueStatement, isDebuggerStatement, isDoWhileStatement, isEmptyStatement, isExpressionStatement, isForInStatement, isForStatement, isFunctionDeclaration, isIfStatement, isLabeledStatement, isReturnStatement, isSwitchStatement, isThrowStatement, isTryStatement, isVariableDeclaration, isWhileStatement, isWithStatement, isClassDeclaration, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isForOfStatement, isImportDeclaration, isDeclareClass, isDeclareFunction, isDeclareInterface, isDeclareModule, isDeclareModuleExports, isDeclareTypeAlias, isDeclareOpaqueType, isDeclareVariable, isDeclareExportDeclaration, isDeclareExportAllDeclaration, isInterfaceDeclaration, isOpaqueType, isTypeAlias, isEnumDeclaration, isTSDeclareFunction, isTSInterfaceDeclaration, isTSTypeAliasDeclaration, isTSEnumDeclaration, isTSModuleDeclaration, isTSImportEqualsDeclaration, isTSExportAssignment, isTSNamespaceExportDeclaration, VariableDeclaration, isVariableDeclarator, VariableDeclarator, isArrayExpression, isAssignmentExpression, isBinaryExpression, isCallExpression, isConditionalExpression, isFunctionExpression, isIdentifier, isStringLiteral, isNumericLiteral, isNullLiteral, isBooleanLiteral, isRegExpLiteral, isLogicalExpression, isMemberExpression, isNewExpression, isObjectExpression, isSequenceExpression, isParenthesizedExpression, isThisExpression, isUnaryExpression, isUpdateExpression, isArrowFunctionExpression, isClassExpression, isImportExpression, isMetaProperty, isSuper, isTaggedTemplateExpression, isTemplateLiteral, isYieldExpression, isAwaitExpression, isImport, isBigIntLiteral, isOptionalMemberExpression, isOptionalCallExpression, isTypeCastExpression, isJSXElement, isJSXFragment, isBindExpression, isDoExpression, isRecordExpression, isTupleExpression, isDecimalLiteral, isModuleExpression, isTopicReference, isPipelineTopicExpression, isPipelineBareFunction, isPipelinePrimaryTopicReference, isTSInstantiationExpression, isTSAsExpression, isTSSatisfiesExpression, isTSTypeAssertion, isTSNonNullExpression, ImportDeclaration, isImportSpecifier, isImportDefaultSpecifier, isImportNamespaceSpecifier, isImportAttribute, } from "@babel/types";
import { JS3Program_body, JS3Program, JS3VariableDeclaration_declarations, JS3VariableDeclaration, JS3VariableDeclarator_init, JS3VariableDeclarator, JS3ImportDeclaration_specifiers, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ImportDeclaration, } from "./JS3Types.ts";
import { generateJS3Program, generateJS3VariableDeclaration, generateJS3VariableDeclarator, generateJS3ImportDeclaration, generateIdentifier, } from "./JS3Constructors.ts";

import { JS3BuilderUtils, } from "../JS3Builder.ts";

import debugConfig from "#debugConfig";
import { generateCommentLine } from "#utils";
import { handleCallExpression, handleCallExpressionAndGetResultIdentifier } from "./HandleCallExpression.ts";

import assert from "node:assert"

const isnull = (a) => a === null;
const isundefined = (a) => a === undefined;

type OtherProps = JS3BuilderUtils;

export function handleProgram(node: Program, otherProps: OtherProps): JS3Program {
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
        debugConfig.logger.error("TODO // unhandled Program->[body]->ExpressionStatement");
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
        debugConfig.logger.error("TODO // unhandled Program->[body]->ExportDefaultDeclaration");
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
export function handleVariableDeclaration(node: VariableDeclaration, otherProps: OtherProps) : Array<JS3VariableDeclaration> {
  // One variable declaration is broken down into multiple variable declarations
  let finalResult = new Array<JS3VariableDeclaration>()
  
  // 3 fallthrough props, 1 restricted props
  let orig_declarations = node.declarations; // Handling prop declarations

  if (Array.isArray(orig_declarations)) {
    for (const _arrProp of orig_declarations) {

      // A JS3VariableDeclaration will only contain one declaration inside it
      const fin_declarations: JS3VariableDeclaration_declarations = new Array()
      
      // Holder holds the generated intermediate nodes
      const updatedProps = { others: { holder: new Array<JS3VariableDeclaration>() }, ...otherProps }

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
  return finalResult
}

// VariableDeclarator
// 
// LVal = init 
// 
// init must be reduced down to Identifier and the a final JS3VariableDeclarator must be of the form LVal = $result_holder$
// 
export function handleVariableDeclarator(node: VariableDeclarator, otherProps: OtherProps) : JS3VariableDeclarator {

  assert(Array.isArray(otherProps.others.holder), "handleVariableDeclarator expects an holder to spill intermediate values");

  // 
  // We need to reduce orig_init -> Identifier
  // 
  // We can spill intermediates into intermediatesHolder
  // 
  // 

  // 3 fallthrough props, 1 restricted props
  let orig_init = node.init; // Handling prop init
  let fin_init: JS3VariableDeclarator_init = generateIdentifier(node, "$TODO"); // Handling prop init
  if (isArrayExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ArrayExpression");
  } else if (isAssignmentExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->AssignmentExpression");
  } else if (isBinaryExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->BinaryExpression");
  } else if (isCallExpression(orig_init)) {
// ========================================================================================
    fin_init = handleCallExpressionAndGetResultIdentifier(orig_init, otherProps);
// ========================================================================================
  } else if (isConditionalExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ConditionalExpression");
  } else if (isFunctionExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->FunctionExpression");
  } else if (isIdentifier(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->Identifier");
  } else if (isStringLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->StringLiteral");
  } else if (isNumericLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->NumericLiteral");
  } else if (isNullLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->NullLiteral");
  } else if (isBooleanLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->BooleanLiteral");
  } else if (isRegExpLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->RegExpLiteral");
  } else if (isLogicalExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->LogicalExpression");
  } else if (isMemberExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->MemberExpression");
  } else if (isNewExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->NewExpression");
  } else if (isObjectExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ObjectExpression");
  } else if (isSequenceExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->SequenceExpression");
  } else if (isParenthesizedExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ParenthesizedExpression");
  } else if (isThisExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ThisExpression");
  } else if (isUnaryExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->UnaryExpression");
  } else if (isUpdateExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->UpdateExpression");
  } else if (isArrowFunctionExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ArrowFunctionExpression");
  } else if (isClassExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ClassExpression");
  } else if (isImportExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ImportExpression");
  } else if (isMetaProperty(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->MetaProperty");
  } else if (isSuper(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->Super");
  } else if (isTaggedTemplateExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TaggedTemplateExpression");
  } else if (isTemplateLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TemplateLiteral");
  } else if (isYieldExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->YieldExpression");
  } else if (isAwaitExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->AwaitExpression");
  } else if (isImport(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->Import");
  } else if (isBigIntLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->BigIntLiteral");
  } else if (isOptionalMemberExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->OptionalMemberExpression");
  } else if (isOptionalCallExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->OptionalCallExpression");
  } else if (isTypeCastExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TypeCastExpression");
  } else if (isJSXElement(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->JSXElement");
  } else if (isJSXFragment(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->JSXFragment");
  } else if (isBindExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->BindExpression");
  } else if (isDoExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->DoExpression");
  } else if (isRecordExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->RecordExpression");
  } else if (isTupleExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TupleExpression");
  } else if (isDecimalLiteral(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->DecimalLiteral");
  } else if (isModuleExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->ModuleExpression");
  } else if (isTopicReference(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TopicReference");
  } else if (isPipelineTopicExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->PipelineTopicExpression");
  } else if (isPipelineBareFunction(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->PipelineBareFunction");
  } else if (isPipelinePrimaryTopicReference(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->PipelinePrimaryTopicReference");
  } else if (isTSInstantiationExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TSInstantiationExpression");
  } else if (isTSAsExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TSAsExpression");
  } else if (isTSSatisfiesExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TSSatisfiesExpression");
  } else if (isTSTypeAssertion(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TSTypeAssertion");
  } else if (isTSNonNullExpression(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->TSNonNullExpression");
  } else if (isnull(orig_init)) {
    debugConfig.logger.error("TODO // unhandled VariableDeclarator->init->null");
  }

  const final = generateJS3VariableDeclarator(fin_init, node);

  return final;
}

// Import Declarations
export function handleImportDeclaration(node: ImportDeclaration, otherProps: OtherProps): Array<JS3ImportDeclaration> {
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

  return finalResult
}

