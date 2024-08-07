// Generated on 7/8/2024, 7:56:10 pm, generated 21 constructors 

import { AssignmentExpression, BinaryExpression, BlockStatement, CallExpression, ExpressionStatement, FunctionExpression, IfStatement, LogicalExpression, MemberExpression, NewExpression, Program, ObjectExpression, ReturnStatement, VariableDeclaration, VariableDeclarator, ClassBody, ClassDeclaration, ExportDefaultDeclaration, ImportDeclaration, ClassMethod, ClassProperty, Directive, StringLiteral, InterpreterDirective, Node, LVal, Identifier, } from "@babel/types";
import { JS3AssignmentExpression, JS3AssignmentExpression_left, JS3AssignmentExpression_right, JS3BinaryExpression, JS3BinaryExpression_left, JS3BinaryExpression_right, JS3BlockStatement, JS3BlockStatement_body, JS3CallExpression, JS3CallExpression_callee, JS3CallExpression_arguments, JS3CallExpression_typeArguments, JS3CallExpression_typeParameters, JS3ExpressionStatement, JS3ExpressionStatement_expression, JS3FunctionExpression, JS3FunctionExpression_id, JS3FunctionExpression_params, JS3FunctionExpression_body, JS3FunctionExpression_predicate, JS3FunctionExpression_returnType, JS3FunctionExpression_typeParameters, JS3IfStatement, JS3IfStatement_test, JS3IfStatement_consequent, JS3IfStatement_alternate, JS3LogicalExpression, JS3LogicalExpression_left, JS3LogicalExpression_right, JS3MemberExpression, JS3MemberExpression_object, JS3MemberExpression_property, JS3NewExpression, JS3NewExpression_callee, JS3NewExpression_arguments, JS3NewExpression_typeArguments, JS3NewExpression_typeParameters, JS3Program, JS3Program_body, JS3ObjectExpression, JS3ObjectExpression_properties, JS3ReturnStatement, JS3ReturnStatement_argument, JS3VariableDeclaration, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_init, JS3ClassBody, JS3ClassBody_body, JS3ClassDeclaration, JS3ClassDeclaration_superClass, JS3ClassDeclaration_body, JS3ClassDeclaration_decorators, JS3ClassDeclaration_implements, JS3ClassDeclaration_mixins, JS3ClassDeclaration_superTypeParameters, JS3ClassDeclaration_typeParameters, JS3ExportDefaultDeclaration, JS3ExportDefaultDeclaration_declaration, JS3ImportDeclaration, JS3ImportDeclaration_specifiers, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ClassMethod, JS3ClassMethod_key, JS3ClassMethod_params, JS3ClassMethod_body, JS3ClassMethod_decorators, JS3ClassMethod_returnType, JS3ClassMethod_typeParameters, JS3ClassProperty, JS3ClassProperty_key, JS3ClassProperty_value, JS3ClassProperty_typeAnnotation, JS3ClassProperty_decorators, JS3ClassProperty_variance, } from "./JS3Types.ts";

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


export function generateJS3AssignmentExpression(_left : JS3AssignmentExpression_left, _right : JS3AssignmentExpression_right, from: AssignmentExpression) : JS3AssignmentExpression {
  let to: JS3AssignmentExpression = generateBaseNodeFrom(from) as JS3AssignmentExpression;
  to.type = from.type;
  to.operator = from.operator;
  to.left = _left;
  to.right = _right;
  return to;
}

export function generateJS3AssignmentExpressionfromBaseNode(_left : JS3AssignmentExpression_left, _right : JS3AssignmentExpression_right, _operator : string, from: Node) : JS3AssignmentExpression {
  let to: JS3AssignmentExpression = generateBaseNodeFrom(from) as JS3AssignmentExpression;
  to.type = "AssignmentExpression";
  to.operator = _operator;
  to.left = _left;
  to.right = _right;
  return to;
}

export function generateJS3BinaryExpression(_left : JS3BinaryExpression_left, _right : JS3BinaryExpression_right, from: BinaryExpression) : JS3BinaryExpression {
  let to: JS3BinaryExpression = generateBaseNodeFrom(from) as JS3BinaryExpression;
  to.type = from.type;
  to.operator = from.operator;
  to.left = _left;
  to.right = _right;
  return to;
}

export function generateJS3BinaryExpressionfromBaseNode(_left : JS3BinaryExpression_left, _right : JS3BinaryExpression_right, _operator : "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=" | "|>", from: Node) : JS3BinaryExpression {
  let to: JS3BinaryExpression = generateBaseNodeFrom(from) as JS3BinaryExpression;
  to.type = "BinaryExpression";
  to.operator = _operator;
  to.left = _left;
  to.right = _right;
  return to;
}

export function generateJS3BlockStatement(_body : JS3BlockStatement_body, from: BlockStatement) : JS3BlockStatement {
  let to: JS3BlockStatement = generateBaseNodeFrom(from) as JS3BlockStatement;
  to.type = from.type;
  to.directives = from.directives;
  to.body = _body;
  return to;
}

export function generateJS3BlockStatementfromBaseNode(_body : JS3BlockStatement_body, _directives : Array<Directive>, from: Node) : JS3BlockStatement {
  let to: JS3BlockStatement = generateBaseNodeFrom(from) as JS3BlockStatement;
  to.type = "BlockStatement";
  to.directives = _directives;
  to.body = _body;
  return to;
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

export function generateJS3CallExpressionfromBaseNode(_callee : JS3CallExpression_callee, _arguments : JS3CallExpression_arguments, _typeArguments : JS3CallExpression_typeArguments, _typeParameters : JS3CallExpression_typeParameters, _optional : true | false | null, from: Node) : JS3CallExpression {
  let to: JS3CallExpression = generateBaseNodeFrom(from) as JS3CallExpression;
  to.type = "CallExpression";
  to.optional = _optional;
  to.callee = _callee;
  to.arguments = _arguments;
  to.typeArguments = _typeArguments;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ExpressionStatement(_expression : JS3ExpressionStatement_expression, from: ExpressionStatement) : JS3ExpressionStatement {
  let to: JS3ExpressionStatement = generateBaseNodeFrom(from) as JS3ExpressionStatement;
  to.type = from.type;
  to.expression = _expression;
  return to;
}

export function generateJS3ExpressionStatementfromBaseNode(_expression : JS3ExpressionStatement_expression, from: Node) : JS3ExpressionStatement {
  let to: JS3ExpressionStatement = generateBaseNodeFrom(from) as JS3ExpressionStatement;
  to.type = "ExpressionStatement";
  to.expression = _expression;
  return to;
}

export function generateJS3FunctionExpression(_id : JS3FunctionExpression_id, _params : JS3FunctionExpression_params, _body : JS3FunctionExpression_body, _predicate : JS3FunctionExpression_predicate, _returnType : JS3FunctionExpression_returnType, _typeParameters : JS3FunctionExpression_typeParameters, from: FunctionExpression) : JS3FunctionExpression {
  let to: JS3FunctionExpression = generateBaseNodeFrom(from) as JS3FunctionExpression;
  to.type = from.type;
  to.generator = from.generator;
  to.async = from.async;
  to.id = _id;
  to.params = _params;
  to.body = _body;
  to.predicate = _predicate;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3FunctionExpressionfromBaseNode(_id : JS3FunctionExpression_id, _params : JS3FunctionExpression_params, _body : JS3FunctionExpression_body, _predicate : JS3FunctionExpression_predicate, _returnType : JS3FunctionExpression_returnType, _typeParameters : JS3FunctionExpression_typeParameters, _generator : boolean, _async : boolean, from: Node) : JS3FunctionExpression {
  let to: JS3FunctionExpression = generateBaseNodeFrom(from) as JS3FunctionExpression;
  to.type = "FunctionExpression";
  to.generator = _generator;
  to.async = _async;
  to.id = _id;
  to.params = _params;
  to.body = _body;
  to.predicate = _predicate;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3IfStatement(_test : JS3IfStatement_test, _consequent : JS3IfStatement_consequent, _alternate : JS3IfStatement_alternate, from: IfStatement) : JS3IfStatement {
  let to: JS3IfStatement = generateBaseNodeFrom(from) as JS3IfStatement;
  to.type = from.type;
  to.test = _test;
  to.consequent = _consequent;
  to.alternate = _alternate;
  return to;
}

export function generateJS3IfStatementfromBaseNode(_test : JS3IfStatement_test, _consequent : JS3IfStatement_consequent, _alternate : JS3IfStatement_alternate, from: Node) : JS3IfStatement {
  let to: JS3IfStatement = generateBaseNodeFrom(from) as JS3IfStatement;
  to.type = "IfStatement";
  to.test = _test;
  to.consequent = _consequent;
  to.alternate = _alternate;
  return to;
}

export function generateJS3LogicalExpression(_left : JS3LogicalExpression_left, _right : JS3LogicalExpression_right, from: LogicalExpression) : JS3LogicalExpression {
  let to: JS3LogicalExpression = generateBaseNodeFrom(from) as JS3LogicalExpression;
  to.type = from.type;
  to.operator = from.operator;
  to.left = _left;
  to.right = _right;
  return to;
}

export function generateJS3LogicalExpressionfromBaseNode(_left : JS3LogicalExpression_left, _right : JS3LogicalExpression_right, _operator : "||" | "&&" | "??", from: Node) : JS3LogicalExpression {
  let to: JS3LogicalExpression = generateBaseNodeFrom(from) as JS3LogicalExpression;
  to.type = "LogicalExpression";
  to.operator = _operator;
  to.left = _left;
  to.right = _right;
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

export function generateJS3MemberExpressionfromBaseNode(_object : JS3MemberExpression_object, _property : JS3MemberExpression_property, _computed : boolean, _optional : true | false | null, from: Node) : JS3MemberExpression {
  let to: JS3MemberExpression = generateBaseNodeFrom(from) as JS3MemberExpression;
  to.type = "MemberExpression";
  to.computed = _computed;
  to.optional = _optional;
  to.object = _object;
  to.property = _property;
  return to;
}

export function generateJS3NewExpression(_callee : JS3NewExpression_callee, _arguments : JS3NewExpression_arguments, _typeArguments : JS3NewExpression_typeArguments, _typeParameters : JS3NewExpression_typeParameters, from: NewExpression) : JS3NewExpression {
  let to: JS3NewExpression = generateBaseNodeFrom(from) as JS3NewExpression;
  to.type = from.type;
  to.optional = from.optional;
  to.callee = _callee;
  to.arguments = _arguments;
  to.typeArguments = _typeArguments;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3NewExpressionfromBaseNode(_callee : JS3NewExpression_callee, _arguments : JS3NewExpression_arguments, _typeArguments : JS3NewExpression_typeArguments, _typeParameters : JS3NewExpression_typeParameters, _optional : true | false | null, from: Node) : JS3NewExpression {
  let to: JS3NewExpression = generateBaseNodeFrom(from) as JS3NewExpression;
  to.type = "NewExpression";
  to.optional = _optional;
  to.callee = _callee;
  to.arguments = _arguments;
  to.typeArguments = _typeArguments;
  to.typeParameters = _typeParameters;
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

export function generateJS3ProgramfromBaseNode(_body : JS3Program_body, _directives : Array<Directive>, _sourceType : "script" | "module", _interpreter : InterpreterDirective | null, from: Node) : JS3Program {
  let to: JS3Program = generateBaseNodeFrom(from) as JS3Program;
  to.type = "Program";
  to.directives = _directives;
  to.sourceType = _sourceType;
  to.interpreter = _interpreter;
  to.body = _body;
  return to;
}

export function generateJS3ObjectExpression(_properties : JS3ObjectExpression_properties, from: ObjectExpression) : JS3ObjectExpression {
  let to: JS3ObjectExpression = generateBaseNodeFrom(from) as JS3ObjectExpression;
  to.type = from.type;
  to.properties = _properties;
  return to;
}

export function generateJS3ObjectExpressionfromBaseNode(_properties : JS3ObjectExpression_properties, from: Node) : JS3ObjectExpression {
  let to: JS3ObjectExpression = generateBaseNodeFrom(from) as JS3ObjectExpression;
  to.type = "ObjectExpression";
  to.properties = _properties;
  return to;
}

export function generateJS3ReturnStatement(_argument : JS3ReturnStatement_argument, from: ReturnStatement) : JS3ReturnStatement {
  let to: JS3ReturnStatement = generateBaseNodeFrom(from) as JS3ReturnStatement;
  to.type = from.type;
  to.argument = _argument;
  return to;
}

export function generateJS3ReturnStatementfromBaseNode(_argument : JS3ReturnStatement_argument, from: Node) : JS3ReturnStatement {
  let to: JS3ReturnStatement = generateBaseNodeFrom(from) as JS3ReturnStatement;
  to.type = "ReturnStatement";
  to.argument = _argument;
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

export function generateJS3VariableDeclarationfromBaseNode(_declarations : JS3VariableDeclaration_declarations, _kind : "var" | "let" | "const" | "using" | "await using", _declare : boolean | null, from: Node) : JS3VariableDeclaration {
  let to: JS3VariableDeclaration = generateBaseNodeFrom(from) as JS3VariableDeclaration;
  to.type = "VariableDeclaration";
  to.kind = _kind;
  to.declare = _declare;
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

export function generateJS3VariableDeclaratorfromBaseNode(_init : JS3VariableDeclarator_init, _id : LVal, _definite : boolean | null, from: Node) : JS3VariableDeclarator {
  let to: JS3VariableDeclarator = generateBaseNodeFrom(from) as JS3VariableDeclarator;
  to.type = "VariableDeclarator";
  to.id = _id;
  to.definite = _definite;
  to.init = _init;
  return to;
}

export function generateJS3ClassBody(_body : JS3ClassBody_body, from: ClassBody) : JS3ClassBody {
  let to: JS3ClassBody = generateBaseNodeFrom(from) as JS3ClassBody;
  to.type = from.type;
  to.body = _body;
  return to;
}

export function generateJS3ClassBodyfromBaseNode(_body : JS3ClassBody_body, from: Node) : JS3ClassBody {
  let to: JS3ClassBody = generateBaseNodeFrom(from) as JS3ClassBody;
  to.type = "ClassBody";
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

export function generateJS3ClassDeclarationfromBaseNode(_superClass : JS3ClassDeclaration_superClass, _body : JS3ClassDeclaration_body, _decorators : JS3ClassDeclaration_decorators, _implements : JS3ClassDeclaration_implements, _mixins : JS3ClassDeclaration_mixins, _superTypeParameters : JS3ClassDeclaration_superTypeParameters, _typeParameters : JS3ClassDeclaration_typeParameters, _id : Identifier | null, _abstract : boolean | null, _declare : boolean | null, from: Node) : JS3ClassDeclaration {
  let to: JS3ClassDeclaration = generateBaseNodeFrom(from) as JS3ClassDeclaration;
  to.type = "ClassDeclaration";
  to.id = _id;
  to.abstract = _abstract;
  to.declare = _declare;
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

export function generateJS3ExportDefaultDeclarationfromBaseNode(_declaration : JS3ExportDefaultDeclaration_declaration, _exportKind : "value" | null, from: Node) : JS3ExportDefaultDeclaration {
  let to: JS3ExportDefaultDeclaration = generateBaseNodeFrom(from) as JS3ExportDefaultDeclaration;
  to.type = "ExportDefaultDeclaration";
  to.exportKind = _exportKind;
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

export function generateJS3ImportDeclarationfromBaseNode(_specifiers : JS3ImportDeclaration_specifiers, _assertions : JS3ImportDeclaration_assertions, _attributes : JS3ImportDeclaration_attributes, _source : StringLiteral, _importKind : "type" | "typeof" | "value" | null, _module : boolean | null, _phase : "source" | "defer" | null, from: Node) : JS3ImportDeclaration {
  let to: JS3ImportDeclaration = generateBaseNodeFrom(from) as JS3ImportDeclaration;
  to.type = "ImportDeclaration";
  to.source = _source;
  to.importKind = _importKind;
  to.module = _module;
  to.phase = _phase;
  to.specifiers = _specifiers;
  to.assertions = _assertions;
  to.attributes = _attributes;
  return to;
}

export function generateJS3ClassMethod(_key : JS3ClassMethod_key, _params : JS3ClassMethod_params, _body : JS3ClassMethod_body, _decorators : JS3ClassMethod_decorators, _returnType : JS3ClassMethod_returnType, _typeParameters : JS3ClassMethod_typeParameters, from: ClassMethod) : JS3ClassMethod {
  let to: JS3ClassMethod = generateBaseNodeFrom(from) as JS3ClassMethod;
  to.type = from.type;
  to.kind = from.kind;
  to.computed = from.computed;
  to.static = from.static;
  to.generator = from.generator;
  to.async = from.async;
  to.abstract = from.abstract;
  to.access = from.access;
  to.accessibility = from.accessibility;
  to.optional = from.optional;
  to.override = from.override;
  to.key = _key;
  to.params = _params;
  to.body = _body;
  to.decorators = _decorators;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ClassMethodfromBaseNode(_key : JS3ClassMethod_key, _params : JS3ClassMethod_params, _body : JS3ClassMethod_body, _decorators : JS3ClassMethod_decorators, _returnType : JS3ClassMethod_returnType, _typeParameters : JS3ClassMethod_typeParameters, _kind : "get" | "set" | "method" | "constructor", _computed : boolean, _static : boolean, _generator : boolean, _async : boolean, _abstract : boolean | null, _access : "public" | "private" | "protected" | null, _accessibility : "public" | "private" | "protected" | null, _optional : boolean | null, _override : boolean, from: Node) : JS3ClassMethod {
  let to: JS3ClassMethod = generateBaseNodeFrom(from) as JS3ClassMethod;
  to.type = "ClassMethod";
  to.kind = _kind;
  to.computed = _computed;
  to.static = _static;
  to.generator = _generator;
  to.async = _async;
  to.abstract = _abstract;
  to.access = _access;
  to.accessibility = _accessibility;
  to.optional = _optional;
  to.override = _override;
  to.key = _key;
  to.params = _params;
  to.body = _body;
  to.decorators = _decorators;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ClassProperty(_key : JS3ClassProperty_key, _value : JS3ClassProperty_value, _typeAnnotation : JS3ClassProperty_typeAnnotation, _decorators : JS3ClassProperty_decorators, _variance : JS3ClassProperty_variance, from: ClassProperty) : JS3ClassProperty {
  let to: JS3ClassProperty = generateBaseNodeFrom(from) as JS3ClassProperty;
  to.type = from.type;
  to.computed = from.computed;
  to.static = from.static;
  to.abstract = from.abstract;
  to.accessibility = from.accessibility;
  to.declare = from.declare;
  to.definite = from.definite;
  to.optional = from.optional;
  to.override = from.override;
  to.readonly = from.readonly;
  to.key = _key;
  to.value = _value;
  to.typeAnnotation = _typeAnnotation;
  to.decorators = _decorators;
  to.variance = _variance;
  return to;
}

export function generateJS3ClassPropertyfromBaseNode(_key : JS3ClassProperty_key, _value : JS3ClassProperty_value, _typeAnnotation : JS3ClassProperty_typeAnnotation, _decorators : JS3ClassProperty_decorators, _variance : JS3ClassProperty_variance, _computed : boolean, _static : boolean, _abstract : boolean | null, _accessibility : "public" | "private" | "protected" | null, _declare : boolean | null, _definite : boolean | null, _optional : boolean | null, _override : boolean, _readonly : boolean | null, from: Node) : JS3ClassProperty {
  let to: JS3ClassProperty = generateBaseNodeFrom(from) as JS3ClassProperty;
  to.type = "ClassProperty";
  to.computed = _computed;
  to.static = _static;
  to.abstract = _abstract;
  to.accessibility = _accessibility;
  to.declare = _declare;
  to.definite = _definite;
  to.optional = _optional;
  to.override = _override;
  to.readonly = _readonly;
  to.key = _key;
  to.value = _value;
  to.typeAnnotation = _typeAnnotation;
  to.decorators = _decorators;
  to.variance = _variance;
  return to;
}

