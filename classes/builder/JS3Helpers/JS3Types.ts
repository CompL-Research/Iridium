// Generated on 6/8/2024, 6:02:03 pm, extended 9 interfaces 

import { PrivateName, Super, V8IntrinsicIdentifier, TSDeclareFunction, FunctionDeclaration, ClassProperty, StringLiteral, NumericLiteral, NullLiteral, BooleanLiteral, CallExpression, Identifier, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, MemberExpression, Program, VariableDeclaration, VariableDeclarator, ClassBody, ClassDeclaration, ExportDefaultDeclaration, ImportDeclaration, } from "@babel/types";

export type JS3CallExpression_callee = Identifier | Super | V8IntrinsicIdentifier;
export type JS3CallExpression_arguments = Array < Identifier >;
export type JS3CallExpression_typeArguments = null;
export type JS3CallExpression_typeParameters = null;
export type JS3MemberExpression_object = Identifier | Super;
export type JS3MemberExpression_property = Identifier | PrivateName;
export type JS3Program_body = Array< JS3ImportDeclaration | JS3VariableDeclaration | JS3ExportDefaultDeclaration >;
export type JS3VariableDeclaration_declarations = Array<JS3VariableDeclarator>;
export type JS3VariableDeclarator_init = Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | JS3CallExpression | JS3MemberExpression;
export type JS3ClassBody_body = Array<ClassProperty>;
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


export interface JS3CallExpression extends CallExpression {
  callee: JS3CallExpression_callee;
  arguments: JS3CallExpression_arguments;
  typeArguments: JS3CallExpression_typeArguments;
  typeParameters: JS3CallExpression_typeParameters;
}

export interface JS3MemberExpression extends MemberExpression {
  object: JS3MemberExpression_object;
  property: JS3MemberExpression_property;
}

export interface JS3Program extends Program {
  body: JS3Program_body;
}

export interface JS3VariableDeclaration extends VariableDeclaration {
  declarations: JS3VariableDeclaration_declarations;
}

export interface JS3VariableDeclarator extends VariableDeclarator {
  init: JS3VariableDeclarator_init;
}

export interface JS3ClassBody extends ClassBody {
  body: JS3ClassBody_body;
}

export interface JS3ClassDeclaration extends ClassDeclaration {
  superClass: JS3ClassDeclaration_superClass;
  body: JS3ClassDeclaration_body;
  decorators: JS3ClassDeclaration_decorators;
  implements: JS3ClassDeclaration_implements;
  mixins: JS3ClassDeclaration_mixins;
  superTypeParameters: JS3ClassDeclaration_superTypeParameters;
  typeParameters: JS3ClassDeclaration_typeParameters;
}

export interface JS3ExportDefaultDeclaration extends ExportDefaultDeclaration {
  declaration: JS3ExportDefaultDeclaration_declaration;
}

export interface JS3ImportDeclaration extends ImportDeclaration {
  specifiers: JS3ImportDeclaration_specifiers;
  assertions: JS3ImportDeclaration_assertions;
  attributes: JS3ImportDeclaration_attributes;
}

