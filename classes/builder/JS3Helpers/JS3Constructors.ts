// Generated on 6/8/2024, 6:02:03 pm, generated 9 constructors 

import { CallExpression, MemberExpression, Program, VariableDeclaration, VariableDeclarator, ClassBody, ClassDeclaration, ExportDefaultDeclaration, ImportDeclaration, Node, LVal, Identifier, } from "@babel/types";
import { JS3CallExpression, JS3CallExpression_callee, JS3CallExpression_arguments, JS3CallExpression_typeArguments, JS3CallExpression_typeParameters, JS3MemberExpression, JS3MemberExpression_object, JS3MemberExpression_property, JS3Program, JS3Program_body, JS3VariableDeclaration, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_init, JS3ClassBody, JS3ClassBody_body, JS3ClassDeclaration, JS3ClassDeclaration_superClass, JS3ClassDeclaration_body, JS3ClassDeclaration_decorators, JS3ClassDeclaration_implements, JS3ClassDeclaration_mixins, JS3ClassDeclaration_superTypeParameters, JS3ClassDeclaration_typeParameters, JS3ExportDefaultDeclaration, JS3ExportDefaultDeclaration_declaration, JS3ImportDeclaration, JS3ImportDeclaration_specifiers, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, } from "./JS3Types.ts";

export function generateBaseNodeFrom(from: Node): Node {
  const { start, end, loc, range, extra } = from;
  const result = { start, end, loc, range, extra } as Node
  return result
}
export function generateDummyJS3VariableDeclaration(
  from: Node, 
  lVal: LVal, 
  init: JS3VariableDeclarator_init, 
  kind: "var" | "let" | "const" | "using" | "await using" = "let", 
  declare: boolean | null | undefined = undefined,
  definite: boolean | null | undefined = undefined
): JS3VariableDeclaration {
  const result = generateBaseNodeFrom(from) as JS3VariableDeclaration
  result.type = "VariableDeclaration";
  result.kind =  kind;
  result.declarations = new Array<JS3VariableDeclarator>()
  result.declare = declare

  const declarator = generateBaseNodeFrom(from) as JS3VariableDeclarator
  declarator.type = "VariableDeclarator";
  declarator.id = lVal;
  declarator.init = init;
  declarator.definite = definite

  result.declarations.push(declarator)
  return result
}
export function generateIdentifier(from: Node, name: string): Identifier {
  const result = generateBaseNodeFrom(from) as Identifier
  result.type = "Identifier"
  result.name = name
  return result
}

export function generateJS3CallExpression(_callee : JS3CallExpression_callee, _arguments : JS3CallExpression_arguments, _typeArguments : JS3CallExpression_typeArguments, _typeParameters : JS3CallExpression_typeParameters, from: CallExpression) : JS3CallExpression {
  let to: JS3CallExpression = generateBaseNodeFrom(from) as JS3CallExpression;
  to.type = from.type;
  to.optional = from.optional;
  to.callee = _callee;
  to.arguments = _arguments;
  to.typeArguments = _typeArguments;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3MemberExpression(_object : JS3MemberExpression_object, _property : JS3MemberExpression_property, from: MemberExpression) : JS3MemberExpression {
  let to: JS3MemberExpression = generateBaseNodeFrom(from) as JS3MemberExpression;
  to.type = from.type;
  to.computed = from.computed;
  to.optional = from.optional;
  to.object = _object;
  to.property = _property;
  return to;
}

export function generateJS3Program(_body : JS3Program_body, from: Program) : JS3Program {
  let to: JS3Program = generateBaseNodeFrom(from) as JS3Program;
  to.type = from.type;
  to.directives = from.directives;
  to.sourceType = from.sourceType;
  to.interpreter = from.interpreter;
  to.body = _body;
  return to;
}

export function generateJS3VariableDeclaration(_declarations : JS3VariableDeclaration_declarations, from: VariableDeclaration) : JS3VariableDeclaration {
  let to: JS3VariableDeclaration = generateBaseNodeFrom(from) as JS3VariableDeclaration;
  to.type = from.type;
  to.kind = from.kind;
  to.declare = from.declare;
  to.declarations = _declarations;
  return to;
}

export function generateJS3VariableDeclarator(_init : JS3VariableDeclarator_init, from: VariableDeclarator) : JS3VariableDeclarator {
  let to: JS3VariableDeclarator = generateBaseNodeFrom(from) as JS3VariableDeclarator;
  to.type = from.type;
  to.id = from.id;
  to.definite = from.definite;
  to.init = _init;
  return to;
}

export function generateJS3ClassBody(_body : JS3ClassBody_body, from: ClassBody) : JS3ClassBody {
  let to: JS3ClassBody = generateBaseNodeFrom(from) as JS3ClassBody;
  to.type = from.type;
  to.body = _body;
  return to;
}

export function generateJS3ClassDeclaration(_superClass : JS3ClassDeclaration_superClass, _body : JS3ClassDeclaration_body, _decorators : JS3ClassDeclaration_decorators, _implements : JS3ClassDeclaration_implements, _mixins : JS3ClassDeclaration_mixins, _superTypeParameters : JS3ClassDeclaration_superTypeParameters, _typeParameters : JS3ClassDeclaration_typeParameters, from: ClassDeclaration) : JS3ClassDeclaration {
  let to: JS3ClassDeclaration = generateBaseNodeFrom(from) as JS3ClassDeclaration;
  to.type = from.type;
  to.id = from.id;
  to.abstract = from.abstract;
  to.declare = from.declare;
  to.superClass = _superClass;
  to.body = _body;
  to.decorators = _decorators;
  to.implements = _implements;
  to.mixins = _mixins;
  to.superTypeParameters = _superTypeParameters;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ExportDefaultDeclaration(_declaration : JS3ExportDefaultDeclaration_declaration, from: ExportDefaultDeclaration) : JS3ExportDefaultDeclaration {
  let to: JS3ExportDefaultDeclaration = generateBaseNodeFrom(from) as JS3ExportDefaultDeclaration;
  to.type = from.type;
  to.exportKind = from.exportKind;
  to.declaration = _declaration;
  return to;
}

export function generateJS3ImportDeclaration(_specifiers : JS3ImportDeclaration_specifiers, _assertions : JS3ImportDeclaration_assertions, _attributes : JS3ImportDeclaration_attributes, from: ImportDeclaration) : JS3ImportDeclaration {
  let to: JS3ImportDeclaration = generateBaseNodeFrom(from) as JS3ImportDeclaration;
  to.type = from.type;
  to.source = from.source;
  to.importKind = from.importKind;
  to.module = from.module;
  to.phase = from.phase;
  to.specifiers = _specifiers;
  to.assertions = _assertions;
  to.attributes = _attributes;
  return to;
}

