// Generated on 6/8/2024, 2:27:09 pm, extended 5 interfaces 

import { StringLiteral, NumericLiteral, NullLiteral, BooleanLiteral, CallExpression, Identifier, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, Program, VariableDeclaration, VariableDeclarator, ImportDeclaration, } from "@babel/types";

export type JS3CallExpression_callee = Identifier;
export type JS3CallExpression_arguments = Array < Identifier >;
export type JS3CallExpression_typeArguments = null;
export type JS3CallExpression_typeParameters = null;
export type JS3Program_body = Array< JS3ImportDeclaration | JS3VariableDeclaration >;
export type JS3VariableDeclaration_declarations = Array<JS3VariableDeclarator>;
export type JS3VariableDeclarator_init = Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | JS3CallExpression;
export type JS3ImportDeclaration_specifiers = Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
export type JS3ImportDeclaration_assertions = undefined | null;
export type JS3ImportDeclaration_attributes = undefined | null;


export interface JS3CallExpression extends CallExpression {
  callee: JS3CallExpression_callee;
  arguments: JS3CallExpression_arguments;
  typeArguments: JS3CallExpression_typeArguments;
  typeParameters: JS3CallExpression_typeParameters;
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

export interface JS3ImportDeclaration extends ImportDeclaration {
  specifiers: JS3ImportDeclaration_specifiers;
  assertions: JS3ImportDeclaration_assertions;
  attributes: JS3ImportDeclaration_attributes;
}

