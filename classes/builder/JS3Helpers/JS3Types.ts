// Generated on 8/8/2024, 11:15:41 am, extended 24 interfaces 

import { ArgumentPlaceholder, ThisExpression, TSParameterProperty, DecimalLiteral, ObjectMethod, ObjectProperty, SpreadElement, Pattern, RestElement, BigIntLiteral, PrivateName, Super, V8IntrinsicIdentifier, TSDeclareFunction, FunctionDeclaration, ClassProperty, StringLiteral, NumericLiteral, NullLiteral, BooleanLiteral, CallExpression, Identifier, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, ExpressionStatement, AssignmentExpression, BinaryExpression, BlockStatement, CatchClause, FunctionExpression, IfStatement, LogicalExpression, MemberExpression, NewExpression, Program, ObjectExpression, ReturnStatement, ThrowStatement, TryStatement, VariableDeclaration, VariableDeclarator, ClassBody, ClassDeclaration, ExportDefaultDeclaration, ImportDeclaration, ClassMethod, } from "@babel/types";

export type JS3AllowedBlockStatement = JS3VariableDeclaration | JS3ReturnStatement | JS3ExpressionStatement | JS3IfStatement | JS3TryStatement | JS3ThrowStatement;

export type JS3AssignmentExpression_left = JS3MemberExpression | Identifier;
export type JS3AssignmentExpression_right = Identifier;
export type JS3BinaryExpression_left = Identifier | PrivateName;
export type JS3BinaryExpression_right = Identifier;
export type JS3BlockStatement_body = Array<JS3AllowedBlockStatement>;
export type JS3CallExpression_callee = Identifier | Super | V8IntrinsicIdentifier | FunctionExpression;
export type JS3CallExpression_arguments = Array < Identifier >;
export type JS3CallExpression_typeArguments = null;
export type JS3CallExpression_typeParameters = null;
export type JS3CatchClause_body = JS3BlockStatement;
export type JS3ExpressionStatement_expression = JS3AssignmentExpression | JS3CallExpression | Identifier;
export type JS3FunctionExpression_id = null | Identifier | undefined;
export type JS3FunctionExpression_params = Array<Identifier | Pattern | RestElement>;
export type JS3FunctionExpression_body = JS3BlockStatement;
export type JS3FunctionExpression_predicate = undefined | null;
export type JS3FunctionExpression_returnType = undefined | null;
export type JS3FunctionExpression_typeParameters = undefined | null;
export type JS3IfStatement_test = Identifier;
export type JS3IfStatement_consequent = JS3BlockStatement;
export type JS3IfStatement_alternate = null | undefined | JS3BlockStatement;
export type JS3LogicalExpression_left = Identifier;
export type JS3LogicalExpression_right = Identifier;
export type JS3MemberExpression_object = Identifier | Super;
export type JS3MemberExpression_property = Identifier | PrivateName;
export type JS3NewExpression_callee = Identifier | Super | V8IntrinsicIdentifier;
export type JS3NewExpression_arguments = Array<Identifier | SpreadElement | ArgumentPlaceholder>;
export type JS3NewExpression_typeArguments = null;
export type JS3NewExpression_typeParameters = null;
export type JS3Program_body = Array< JS3ImportDeclaration | JS3ExportDefaultDeclaration | JS3AllowedBlockStatement >;
export type JS3ObjectExpression_properties = Array<ObjectMethod | ObjectProperty | SpreadElement>;
export type JS3ReturnStatement_argument = undefined | null | Identifier;
export type JS3ThrowStatement_argument = Identifier;
export type JS3TryStatement_block = JS3BlockStatement;
export type JS3TryStatement_handler = null | undefined | JS3CatchClause;
export type JS3TryStatement_finalizer = null | undefined | JS3BlockStatement;
export type JS3VariableDeclaration_declarations = Array<JS3VariableDeclarator>;
export type JS3VariableDeclarator_init = ThisExpression | JS3FunctionExpression | Identifier | BigIntLiteral | DecimalLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | JS3MemberExpression | JS3CallExpression | JS3ObjectExpression | JS3NewExpression | JS3BinaryExpression | JS3LogicalExpression | JS3AssignmentExpression;
export type JS3ClassBody_body = Array<JS3ClassProperty | JS3ClassMethod>;
export type JS3ClassDeclaration_superClass = null | undefined | Identifier;
export type JS3ClassDeclaration_body = JS3ClassBody;
export type JS3ClassDeclaration_decorators = null;
export type JS3ClassDeclaration_implements = null;
export type JS3ClassDeclaration_mixins = null;
export type JS3ClassDeclaration_superTypeParameters = null;
export type JS3ClassDeclaration_typeParameters = null;
export type JS3ExportDefaultDeclaration_declaration = TSDeclareFunction | FunctionDeclaration | JS3ClassDeclaration | Identifier;
export type JS3ImportDeclaration_specifiers = Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
export type JS3ImportDeclaration_assertions = undefined | null;
export type JS3ImportDeclaration_attributes = undefined | null;
export type JS3ClassMethod_key = Identifier | StringLiteral | NumericLiteral | BigIntLiteral;
export type JS3ClassMethod_params = Array<Identifier | Pattern | RestElement | TSParameterProperty>;
export type JS3ClassMethod_body = JS3BlockStatement;
export type JS3ClassMethod_decorators = null;
export type JS3ClassMethod_returnType = null;
export type JS3ClassMethod_typeParameters = null;
export type JS3ClassProperty_key = Identifier | StringLiteral | NumericLiteral | BigIntLiteral;
export type JS3ClassProperty_value = undefined | null | Identifier | StringLiteral | NumericLiteral | BigIntLiteral | JS3ExpressionStatement;
export type JS3ClassProperty_typeAnnotation = null;
export type JS3ClassProperty_decorators = null;
export type JS3ClassProperty_variance = null;


// @ts-ignore
export interface JS3AssignmentExpression extends AssignmentExpression {
  left: JS3AssignmentExpression_left;
  right: JS3AssignmentExpression_right;
}

// @ts-ignore
export interface JS3BinaryExpression extends BinaryExpression {
  left: JS3BinaryExpression_left;
  right: JS3BinaryExpression_right;
}

// @ts-ignore
export interface JS3BlockStatement extends BlockStatement {
  body: JS3BlockStatement_body;
}

// @ts-ignore
export interface JS3CallExpression extends CallExpression {
  callee: JS3CallExpression_callee;
  arguments: JS3CallExpression_arguments;
  typeArguments: JS3CallExpression_typeArguments;
  typeParameters: JS3CallExpression_typeParameters;
}

// @ts-ignore
export interface JS3CatchClause extends CatchClause {
  body: JS3CatchClause_body;
}

// @ts-ignore
export interface JS3ExpressionStatement extends ExpressionStatement {
  expression: JS3ExpressionStatement_expression;
}

// @ts-ignore
export interface JS3FunctionExpression extends FunctionExpression {
  id: JS3FunctionExpression_id;
  params: JS3FunctionExpression_params;
  body: JS3FunctionExpression_body;
  predicate: JS3FunctionExpression_predicate;
  returnType: JS3FunctionExpression_returnType;
  typeParameters: JS3FunctionExpression_typeParameters;
}

// @ts-ignore
export interface JS3IfStatement extends IfStatement {
  test: JS3IfStatement_test;
  consequent: JS3IfStatement_consequent;
  alternate: JS3IfStatement_alternate;
}

// @ts-ignore
export interface JS3LogicalExpression extends LogicalExpression {
  left: JS3LogicalExpression_left;
  right: JS3LogicalExpression_right;
}

// @ts-ignore
export interface JS3MemberExpression extends MemberExpression {
  object: JS3MemberExpression_object;
  property: JS3MemberExpression_property;
}

// @ts-ignore
export interface JS3NewExpression extends NewExpression {
  callee: JS3NewExpression_callee;
  arguments: JS3NewExpression_arguments;
  typeArguments: JS3NewExpression_typeArguments;
  typeParameters: JS3NewExpression_typeParameters;
}

// @ts-ignore
export interface JS3Program extends Program {
  body: JS3Program_body;
}

// @ts-ignore
export interface JS3ObjectExpression extends ObjectExpression {
  properties: JS3ObjectExpression_properties;
}

// @ts-ignore
export interface JS3ReturnStatement extends ReturnStatement {
  argument: JS3ReturnStatement_argument;
}

// @ts-ignore
export interface JS3ThrowStatement extends ThrowStatement {
  argument: JS3ThrowStatement_argument;
}

// @ts-ignore
export interface JS3TryStatement extends TryStatement {
  block: JS3TryStatement_block;
  handler: JS3TryStatement_handler;
  finalizer: JS3TryStatement_finalizer;
}

// @ts-ignore
export interface JS3VariableDeclaration extends VariableDeclaration {
  declarations: JS3VariableDeclaration_declarations;
}

// @ts-ignore
export interface JS3VariableDeclarator extends VariableDeclarator {
  init: JS3VariableDeclarator_init;
}

// @ts-ignore
export interface JS3ClassBody extends ClassBody {
  body: JS3ClassBody_body;
}

// @ts-ignore
export interface JS3ClassDeclaration extends ClassDeclaration {
  superClass: JS3ClassDeclaration_superClass;
  body: JS3ClassDeclaration_body;
  decorators: JS3ClassDeclaration_decorators;
  implements: JS3ClassDeclaration_implements;
  mixins: JS3ClassDeclaration_mixins;
  superTypeParameters: JS3ClassDeclaration_superTypeParameters;
  typeParameters: JS3ClassDeclaration_typeParameters;
}

// @ts-ignore
export interface JS3ExportDefaultDeclaration extends ExportDefaultDeclaration {
  declaration: JS3ExportDefaultDeclaration_declaration;
}

// @ts-ignore
export interface JS3ImportDeclaration extends ImportDeclaration {
  specifiers: JS3ImportDeclaration_specifiers;
  assertions: JS3ImportDeclaration_assertions;
  attributes: JS3ImportDeclaration_attributes;
}

// @ts-ignore
export interface JS3ClassMethod extends ClassMethod {
  key: JS3ClassMethod_key;
  params: JS3ClassMethod_params;
  body: JS3ClassMethod_body;
  decorators: JS3ClassMethod_decorators;
  returnType: JS3ClassMethod_returnType;
  typeParameters: JS3ClassMethod_typeParameters;
}

// @ts-ignore
export interface JS3ClassProperty extends ClassProperty {
  key: JS3ClassProperty_key;
  value: JS3ClassProperty_value;
  typeAnnotation: JS3ClassProperty_typeAnnotation;
  decorators: JS3ClassProperty_decorators;
  variance: JS3ClassProperty_variance;
}

