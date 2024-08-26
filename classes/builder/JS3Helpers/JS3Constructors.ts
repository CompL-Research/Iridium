// Generated on 26/8/2024, 4:24:41 pm, generated 60 constructors 

import { ArrayExpression, AssignmentExpression, BinaryExpression, BlockStatement, BreakStatement, CallExpression, CatchClause, ConditionalExpression, ContinueStatement, DoWhileStatement, ExpressionStatement, ForInStatement, ForStatement, FunctionDeclaration, FunctionExpression, IfStatement, LabeledStatement, RegExpLiteral, LogicalExpression, MemberExpression, NewExpression, Program, ObjectExpression, ObjectMethod, ObjectProperty, ReturnStatement, SequenceExpression, SwitchCase, SwitchStatement, ThrowStatement, TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator, WhileStatement, WithStatement, ArrowFunctionExpression, ClassBody, ClassExpression, ClassDeclaration, ExportDefaultDeclaration, ForOfStatement, ImportDeclaration, ImportExpression, MetaProperty, ClassMethod, SpreadElement, TaggedTemplateExpression, TemplateLiteral, YieldExpression, AwaitExpression, Import, OptionalMemberExpression, OptionalCallExpression, ClassProperty, ClassPrivateProperty, ClassPrivateMethod, PrivateName, StaticBlock, ArrayPattern, ObjectPattern, Directive, StringLiteral, InterpreterDirective, Node, LVal, Identifier, NumericLiteral, } from "@babel/types";
import { JS3ArrayExpression, JS3ArrayExpression_elements, JS3AssignmentExpression, JS3AssignmentExpression_left, JS3AssignmentExpression_right, JS3BinaryExpression, JS3BinaryExpression_left, JS3BinaryExpression_right, JS3BlockStatement, JS3BlockStatement_body, JS3BreakStatement, JS3BreakStatement_label, JS3CallExpression, JS3CallExpression_callee, JS3CallExpression_arguments, JS3CallExpression_typeArguments, JS3CallExpression_typeParameters, JS3CatchClause, JS3CatchClause_body, JS3ConditionalExpression, JS3ConditionalExpression_test, JS3ConditionalExpression_consequent, JS3ConditionalExpression_alternate, JS3ContinueStatement, JS3ContinueStatement_label, JS3DoWhileStatement, JS3DoWhileStatement_test, JS3DoWhileStatement_body, JS3ExpressionStatement, JS3ExpressionStatement_expression, JS3ForInStatement, JS3ForInStatement_left, JS3ForInStatement_right, JS3ForInStatement_body, JS3ForStatement, JS3ForStatement_init, JS3ForStatement_test, JS3ForStatement_update, JS3ForStatement_body, JS3FunctionDeclaration, JS3FunctionDeclaration_id, JS3FunctionDeclaration_params, JS3FunctionDeclaration_body, JS3FunctionDeclaration_predicate, JS3FunctionDeclaration_returnType, JS3FunctionDeclaration_typeParameters, JS3FunctionExpression, JS3FunctionExpression_id, JS3FunctionExpression_params, JS3FunctionExpression_body, JS3FunctionExpression_predicate, JS3FunctionExpression_returnType, JS3FunctionExpression_typeParameters, JS3IfStatement, JS3IfStatement_test, JS3IfStatement_consequent, JS3IfStatement_alternate, JS3LabeledStatement, JS3LabeledStatement_body, JS3RegExpLiteral, JS3LogicalExpression, JS3LogicalExpression_left, JS3LogicalExpression_right, JS3MemberExpression, JS3MemberExpression_object, JS3MemberExpression_property, JS3NewExpression, JS3NewExpression_callee, JS3NewExpression_arguments, JS3NewExpression_typeArguments, JS3NewExpression_typeParameters, JS3Program, JS3Program_body, JS3ObjectExpression, JS3ObjectExpression_properties, JS3ObjectMethod, JS3ObjectMethod_key, JS3ObjectMethod_params, JS3ObjectMethod_body, JS3ObjectMethod_decorators, JS3ObjectMethod_returnType, JS3ObjectMethod_typeParameters, JS3ObjectProperty, JS3ObjectProperty_key, JS3ObjectProperty_value, JS3ObjectProperty_decorators, JS3ReturnStatement, JS3ReturnStatement_argument, JS3SequenceExpression, JS3SequenceExpression_expressions, JS3SwitchCase, JS3SwitchCase_test, JS3SwitchCase_consequent, JS3SwitchStatement, JS3SwitchStatement_discriminant, JS3SwitchStatement_cases, JS3ThrowStatement, JS3ThrowStatement_argument, JS3TryStatement, JS3TryStatement_block, JS3TryStatement_handler, JS3TryStatement_finalizer, JS3UnaryExpression, JS3UnaryExpression_argument, JS3UpdateExpression, JS3UpdateExpression_argument, JS3VariableDeclaration, JS3VariableDeclaration_declarations, JS3VariableDeclarator, JS3VariableDeclarator_id, JS3VariableDeclarator_init, JS3WhileStatement, JS3WhileStatement_test, JS3WhileStatement_body, JS3WithStatement, JS3WithStatement_object, JS3WithStatement_body, JS3ArrowFunctionExpression, JS3ArrowFunctionExpression_params, JS3ArrowFunctionExpression_body, JS3ArrowFunctionExpression_predicate, JS3ArrowFunctionExpression_returnType, JS3ArrowFunctionExpression_typeParameters, JS3ClassBody, JS3ClassBody_body, JS3ClassExpression, JS3ClassExpression_superClass, JS3ClassExpression_body, JS3ClassExpression_decorators, JS3ClassExpression_implements, JS3ClassExpression_mixins, JS3ClassExpression_superTypeParameters, JS3ClassExpression_typeParameters, JS3ClassDeclaration, JS3ClassDeclaration_superClass, JS3ClassDeclaration_body, JS3ClassDeclaration_decorators, JS3ClassDeclaration_implements, JS3ClassDeclaration_mixins, JS3ClassDeclaration_superTypeParameters, JS3ClassDeclaration_typeParameters, JS3ExportDefaultDeclaration, JS3ExportDefaultDeclaration_declaration, JS3ForOfStatement, JS3ForOfStatement_left, JS3ForOfStatement_right, JS3ForOfStatement_body, JS3ImportDeclaration, JS3ImportDeclaration_specifiers, JS3ImportDeclaration_assertions, JS3ImportDeclaration_attributes, JS3ImportExpression, JS3ImportExpression_source, JS3ImportExpression_options, JS3MetaProperty, JS3ClassMethod, JS3ClassMethod_key, JS3ClassMethod_params, JS3ClassMethod_body, JS3ClassMethod_decorators, JS3ClassMethod_returnType, JS3ClassMethod_typeParameters, JS3SpreadElement, JS3SpreadElement_argument, JS3TaggedTemplateExpression, JS3TaggedTemplateExpression_tag, JS3TaggedTemplateExpression_quasi, JS3TaggedTemplateExpression_typeParameters, JS3TemplateLiteral, JS3TemplateLiteral_quasis, JS3TemplateLiteral_expressions, JS3YieldExpression, JS3YieldExpression_argument, JS3AwaitExpression, JS3AwaitExpression_argument, JS3Import, JS3OptionalMemberExpression, JS3OptionalMemberExpression_object, JS3OptionalMemberExpression_property, JS3OptionalCallExpression, JS3OptionalCallExpression_callee, JS3OptionalCallExpression_arguments, JS3OptionalCallExpression_typeArguments, JS3OptionalCallExpression_typeParameters, JS3ClassProperty, JS3ClassProperty_key, JS3ClassProperty_value, JS3ClassProperty_typeAnnotation, JS3ClassProperty_decorators, JS3ClassProperty_variance, JS3ClassPrivateProperty, JS3ClassPrivateProperty_value, JS3ClassPrivateProperty_decorators, JS3ClassPrivateProperty_typeAnnotation, JS3ClassPrivateProperty_variance, JS3ClassPrivateMethod, JS3ClassPrivateMethod_params, JS3ClassPrivateMethod_body, JS3ClassPrivateMethod_decorators, JS3ClassPrivateMethod_returnType, JS3ClassPrivateMethod_typeParameters, JS3PrivateName, JS3StaticBlock, JS3StaticBlock_body, JS3AnonMemberExpression, JS3AnonArrayExpression, } from "./JS3Types.ts";

export function generateBaseNodeFrom(from: Node): Node {
  const { start, end, loc, range, extra } = { start: from.start, end: from.end, loc: from.loc, range: from.range, extra: from.extra };
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
  // @ts-ignore
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


/// CUSTOM CONSTRUCTORS START

export function generateJS3AnonMemberExpressionfromBaseNode(_object : JS3AnonArrayExpression, _property : NumericLiteral, _computed : boolean, _optional : true | false | null, from: Node) : JS3AnonMemberExpression {
  let to: JS3AnonMemberExpression = generateBaseNodeFrom(from) as JS3AnonMemberExpression;
  to.type = "MemberExpression";
  to.computed = _computed;
  to.optional = _optional;
  to.object = _object;
  to.property = _property;
  return to;
}

export function generateJS3AnonArrayExpressionfromBaseNode(_elements : Array<JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression>, from: Node) : JS3AnonArrayExpression {
  let to: JS3AnonArrayExpression = generateBaseNodeFrom(from) as JS3AnonArrayExpression;
  to.type = "ArrayExpression";
  to.elements = _elements;
  return to;
}

/// CUSTOM CONSTRUCTORS END
export function generateJS3ArrayExpression(_elements : JS3ArrayExpression_elements, from: ArrayExpression) : JS3ArrayExpression {
  let to: JS3ArrayExpression = generateBaseNodeFrom(from) as JS3ArrayExpression;
  to.type = from.type;
  to.elements = _elements;
  return to;
}

export function generateJS3ArrayExpressionfromBaseNode(_elements : JS3ArrayExpression_elements, from: Node) : JS3ArrayExpression {
  let to: JS3ArrayExpression = generateBaseNodeFrom(from) as JS3ArrayExpression;
  to.type = "ArrayExpression";
  to.elements = _elements;
  return to;
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

export function generateJS3BreakStatement(_label : JS3BreakStatement_label, from: BreakStatement) : JS3BreakStatement {
  let to: JS3BreakStatement = generateBaseNodeFrom(from) as JS3BreakStatement;
  to.type = from.type;
  to.label = _label;
  return to;
}

export function generateJS3BreakStatementfromBaseNode(_label : JS3BreakStatement_label, from: Node) : JS3BreakStatement {
  let to: JS3BreakStatement = generateBaseNodeFrom(from) as JS3BreakStatement;
  to.type = "BreakStatement";
  to.label = _label;
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

export function generateJS3CatchClause(_body : JS3CatchClause_body, from: CatchClause) : JS3CatchClause {
  let to: JS3CatchClause = generateBaseNodeFrom(from) as JS3CatchClause;
  to.type = from.type;
  to.param = from.param;
  to.body = _body;
  return to;
}

export function generateJS3CatchClausefromBaseNode(_body : JS3CatchClause_body, _param : Identifier | ArrayPattern | ObjectPattern | null, from: Node) : JS3CatchClause {
  let to: JS3CatchClause = generateBaseNodeFrom(from) as JS3CatchClause;
  to.type = "CatchClause";
  to.param = _param;
  to.body = _body;
  return to;
}

export function generateJS3ConditionalExpression(_test : JS3ConditionalExpression_test, _consequent : JS3ConditionalExpression_consequent, _alternate : JS3ConditionalExpression_alternate, from: ConditionalExpression) : JS3ConditionalExpression {
  let to: JS3ConditionalExpression = generateBaseNodeFrom(from) as JS3ConditionalExpression;
  to.type = from.type;
  to.test = _test;
  to.consequent = _consequent;
  to.alternate = _alternate;
  return to;
}

export function generateJS3ConditionalExpressionfromBaseNode(_test : JS3ConditionalExpression_test, _consequent : JS3ConditionalExpression_consequent, _alternate : JS3ConditionalExpression_alternate, from: Node) : JS3ConditionalExpression {
  let to: JS3ConditionalExpression = generateBaseNodeFrom(from) as JS3ConditionalExpression;
  to.type = "ConditionalExpression";
  to.test = _test;
  to.consequent = _consequent;
  to.alternate = _alternate;
  return to;
}

export function generateJS3ContinueStatement(_label : JS3ContinueStatement_label, from: ContinueStatement) : JS3ContinueStatement {
  let to: JS3ContinueStatement = generateBaseNodeFrom(from) as JS3ContinueStatement;
  to.type = from.type;
  to.label = _label;
  return to;
}

export function generateJS3ContinueStatementfromBaseNode(_label : JS3ContinueStatement_label, from: Node) : JS3ContinueStatement {
  let to: JS3ContinueStatement = generateBaseNodeFrom(from) as JS3ContinueStatement;
  to.type = "ContinueStatement";
  to.label = _label;
  return to;
}

export function generateJS3DoWhileStatement(_test : JS3DoWhileStatement_test, _body : JS3DoWhileStatement_body, from: DoWhileStatement) : JS3DoWhileStatement {
  let to: JS3DoWhileStatement = generateBaseNodeFrom(from) as JS3DoWhileStatement;
  to.type = from.type;
  to.test = _test;
  to.body = _body;
  return to;
}

export function generateJS3DoWhileStatementfromBaseNode(_test : JS3DoWhileStatement_test, _body : JS3DoWhileStatement_body, from: Node) : JS3DoWhileStatement {
  let to: JS3DoWhileStatement = generateBaseNodeFrom(from) as JS3DoWhileStatement;
  to.type = "DoWhileStatement";
  to.test = _test;
  to.body = _body;
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

export function generateJS3ForInStatement(_left : JS3ForInStatement_left, _right : JS3ForInStatement_right, _body : JS3ForInStatement_body, from: ForInStatement) : JS3ForInStatement {
  let to: JS3ForInStatement = generateBaseNodeFrom(from) as JS3ForInStatement;
  to.type = from.type;
  to.left = _left;
  to.right = _right;
  to.body = _body;
  return to;
}

export function generateJS3ForInStatementfromBaseNode(_left : JS3ForInStatement_left, _right : JS3ForInStatement_right, _body : JS3ForInStatement_body, from: Node) : JS3ForInStatement {
  let to: JS3ForInStatement = generateBaseNodeFrom(from) as JS3ForInStatement;
  to.type = "ForInStatement";
  to.left = _left;
  to.right = _right;
  to.body = _body;
  return to;
}

export function generateJS3ForStatement(_init : JS3ForStatement_init, _test : JS3ForStatement_test, _update : JS3ForStatement_update, _body : JS3ForStatement_body, from: ForStatement) : JS3ForStatement {
  let to: JS3ForStatement = generateBaseNodeFrom(from) as JS3ForStatement;
  to.type = from.type;
  to.init = _init;
  to.test = _test;
  to.update = _update;
  to.body = _body;
  return to;
}

export function generateJS3ForStatementfromBaseNode(_init : JS3ForStatement_init, _test : JS3ForStatement_test, _update : JS3ForStatement_update, _body : JS3ForStatement_body, from: Node) : JS3ForStatement {
  let to: JS3ForStatement = generateBaseNodeFrom(from) as JS3ForStatement;
  to.type = "ForStatement";
  to.init = _init;
  to.test = _test;
  to.update = _update;
  to.body = _body;
  return to;
}

export function generateJS3FunctionDeclaration(_id : JS3FunctionDeclaration_id, _params : JS3FunctionDeclaration_params, _body : JS3FunctionDeclaration_body, _predicate : JS3FunctionDeclaration_predicate, _returnType : JS3FunctionDeclaration_returnType, _typeParameters : JS3FunctionDeclaration_typeParameters, from: FunctionDeclaration) : JS3FunctionDeclaration {
  let to: JS3FunctionDeclaration = generateBaseNodeFrom(from) as JS3FunctionDeclaration;
  to.type = from.type;
  to.generator = from.generator;
  to.async = from.async;
  to.declare = from.declare;
  to.id = _id;
  to.params = _params;
  to.body = _body;
  to.predicate = _predicate;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3FunctionDeclarationfromBaseNode(_id : JS3FunctionDeclaration_id, _params : JS3FunctionDeclaration_params, _body : JS3FunctionDeclaration_body, _predicate : JS3FunctionDeclaration_predicate, _returnType : JS3FunctionDeclaration_returnType, _typeParameters : JS3FunctionDeclaration_typeParameters, _generator : boolean, _async : boolean, _declare : boolean | null, from: Node) : JS3FunctionDeclaration {
  let to: JS3FunctionDeclaration = generateBaseNodeFrom(from) as JS3FunctionDeclaration;
  to.type = "FunctionDeclaration";
  to.generator = _generator;
  to.async = _async;
  to.declare = _declare;
  to.id = _id;
  to.params = _params;
  to.body = _body;
  to.predicate = _predicate;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
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

export function generateJS3LabeledStatement(_body : JS3LabeledStatement_body, from: LabeledStatement) : JS3LabeledStatement {
  let to: JS3LabeledStatement = generateBaseNodeFrom(from) as JS3LabeledStatement;
  to.type = from.type;
  to.label = from.label;
  to.body = _body;
  return to;
}

export function generateJS3LabeledStatementfromBaseNode(_body : JS3LabeledStatement_body, _label : Identifier, from: Node) : JS3LabeledStatement {
  let to: JS3LabeledStatement = generateBaseNodeFrom(from) as JS3LabeledStatement;
  to.type = "LabeledStatement";
  to.label = _label;
  to.body = _body;
  return to;
}

export function generateJS3RegExpLiteral(from: RegExpLiteral) : JS3RegExpLiteral {
  let to: JS3RegExpLiteral = generateBaseNodeFrom(from) as JS3RegExpLiteral;
  to.type = from.type;
  to.pattern = from.pattern;
  to.flags = from.flags;
  return to;
}

export function generateJS3RegExpLiteralfromBaseNode(_pattern : string, _flags : string, from: Node) : JS3RegExpLiteral {
  let to: JS3RegExpLiteral = generateBaseNodeFrom(from) as JS3RegExpLiteral;
  to.type = "RegExpLiteral";
  to.pattern = _pattern;
  to.flags = _flags;
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

export function generateJS3ObjectMethod(_key : JS3ObjectMethod_key, _params : JS3ObjectMethod_params, _body : JS3ObjectMethod_body, _decorators : JS3ObjectMethod_decorators, _returnType : JS3ObjectMethod_returnType, _typeParameters : JS3ObjectMethod_typeParameters, from: ObjectMethod) : JS3ObjectMethod {
  let to: JS3ObjectMethod = generateBaseNodeFrom(from) as JS3ObjectMethod;
  to.type = from.type;
  to.kind = from.kind;
  to.computed = from.computed;
  to.generator = from.generator;
  to.async = from.async;
  to.key = _key;
  to.params = _params;
  to.body = _body;
  to.decorators = _decorators;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ObjectMethodfromBaseNode(_key : JS3ObjectMethod_key, _params : JS3ObjectMethod_params, _body : JS3ObjectMethod_body, _decorators : JS3ObjectMethod_decorators, _returnType : JS3ObjectMethod_returnType, _typeParameters : JS3ObjectMethod_typeParameters, _kind : "method" | "get" | "set", _computed : boolean, _generator : boolean, _async : boolean, from: Node) : JS3ObjectMethod {
  let to: JS3ObjectMethod = generateBaseNodeFrom(from) as JS3ObjectMethod;
  to.type = "ObjectMethod";
  to.kind = _kind;
  to.computed = _computed;
  to.generator = _generator;
  to.async = _async;
  to.key = _key;
  to.params = _params;
  to.body = _body;
  to.decorators = _decorators;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ObjectProperty(_key : JS3ObjectProperty_key, _value : JS3ObjectProperty_value, _decorators : JS3ObjectProperty_decorators, from: ObjectProperty) : JS3ObjectProperty {
  let to: JS3ObjectProperty = generateBaseNodeFrom(from) as JS3ObjectProperty;
  to.type = from.type;
  to.computed = from.computed;
  to.shorthand = from.shorthand;
  to.key = _key;
  to.value = _value;
  to.decorators = _decorators;
  return to;
}

export function generateJS3ObjectPropertyfromBaseNode(_key : JS3ObjectProperty_key, _value : JS3ObjectProperty_value, _decorators : JS3ObjectProperty_decorators, _computed : boolean, _shorthand : boolean, from: Node) : JS3ObjectProperty {
  let to: JS3ObjectProperty = generateBaseNodeFrom(from) as JS3ObjectProperty;
  to.type = "ObjectProperty";
  to.computed = _computed;
  to.shorthand = _shorthand;
  to.key = _key;
  to.value = _value;
  to.decorators = _decorators;
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

export function generateJS3SequenceExpression(_expressions : JS3SequenceExpression_expressions, from: SequenceExpression) : JS3SequenceExpression {
  let to: JS3SequenceExpression = generateBaseNodeFrom(from) as JS3SequenceExpression;
  to.type = from.type;
  to.expressions = _expressions;
  return to;
}

export function generateJS3SequenceExpressionfromBaseNode(_expressions : JS3SequenceExpression_expressions, from: Node) : JS3SequenceExpression {
  let to: JS3SequenceExpression = generateBaseNodeFrom(from) as JS3SequenceExpression;
  to.type = "SequenceExpression";
  to.expressions = _expressions;
  return to;
}

export function generateJS3SwitchCase(_test : JS3SwitchCase_test, _consequent : JS3SwitchCase_consequent, from: SwitchCase) : JS3SwitchCase {
  let to: JS3SwitchCase = generateBaseNodeFrom(from) as JS3SwitchCase;
  to.type = from.type;
  to.test = _test;
  to.consequent = _consequent;
  return to;
}

export function generateJS3SwitchCasefromBaseNode(_test : JS3SwitchCase_test, _consequent : JS3SwitchCase_consequent, from: Node) : JS3SwitchCase {
  let to: JS3SwitchCase = generateBaseNodeFrom(from) as JS3SwitchCase;
  to.type = "SwitchCase";
  to.test = _test;
  to.consequent = _consequent;
  return to;
}

export function generateJS3SwitchStatement(_discriminant : JS3SwitchStatement_discriminant, _cases : JS3SwitchStatement_cases, from: SwitchStatement) : JS3SwitchStatement {
  let to: JS3SwitchStatement = generateBaseNodeFrom(from) as JS3SwitchStatement;
  to.type = from.type;
  to.discriminant = _discriminant;
  to.cases = _cases;
  return to;
}

export function generateJS3SwitchStatementfromBaseNode(_discriminant : JS3SwitchStatement_discriminant, _cases : JS3SwitchStatement_cases, from: Node) : JS3SwitchStatement {
  let to: JS3SwitchStatement = generateBaseNodeFrom(from) as JS3SwitchStatement;
  to.type = "SwitchStatement";
  to.discriminant = _discriminant;
  to.cases = _cases;
  return to;
}

export function generateJS3ThrowStatement(_argument : JS3ThrowStatement_argument, from: ThrowStatement) : JS3ThrowStatement {
  let to: JS3ThrowStatement = generateBaseNodeFrom(from) as JS3ThrowStatement;
  to.type = from.type;
  to.argument = _argument;
  return to;
}

export function generateJS3ThrowStatementfromBaseNode(_argument : JS3ThrowStatement_argument, from: Node) : JS3ThrowStatement {
  let to: JS3ThrowStatement = generateBaseNodeFrom(from) as JS3ThrowStatement;
  to.type = "ThrowStatement";
  to.argument = _argument;
  return to;
}

export function generateJS3TryStatement(_block : JS3TryStatement_block, _handler : JS3TryStatement_handler, _finalizer : JS3TryStatement_finalizer, from: TryStatement) : JS3TryStatement {
  let to: JS3TryStatement = generateBaseNodeFrom(from) as JS3TryStatement;
  to.type = from.type;
  to.block = _block;
  to.handler = _handler;
  to.finalizer = _finalizer;
  return to;
}

export function generateJS3TryStatementfromBaseNode(_block : JS3TryStatement_block, _handler : JS3TryStatement_handler, _finalizer : JS3TryStatement_finalizer, from: Node) : JS3TryStatement {
  let to: JS3TryStatement = generateBaseNodeFrom(from) as JS3TryStatement;
  to.type = "TryStatement";
  to.block = _block;
  to.handler = _handler;
  to.finalizer = _finalizer;
  return to;
}

export function generateJS3UnaryExpression(_argument : JS3UnaryExpression_argument, from: UnaryExpression) : JS3UnaryExpression {
  let to: JS3UnaryExpression = generateBaseNodeFrom(from) as JS3UnaryExpression;
  to.type = from.type;
  to.operator = from.operator;
  to.prefix = from.prefix;
  to.argument = _argument;
  return to;
}

export function generateJS3UnaryExpressionfromBaseNode(_argument : JS3UnaryExpression_argument, _operator : "void" | "throw" | "delete" | "!" | "+" | "-" | "~" | "typeof", _prefix : boolean, from: Node) : JS3UnaryExpression {
  let to: JS3UnaryExpression = generateBaseNodeFrom(from) as JS3UnaryExpression;
  to.type = "UnaryExpression";
  to.operator = _operator;
  to.prefix = _prefix;
  to.argument = _argument;
  return to;
}

export function generateJS3UpdateExpression(_argument : JS3UpdateExpression_argument, from: UpdateExpression) : JS3UpdateExpression {
  let to: JS3UpdateExpression = generateBaseNodeFrom(from) as JS3UpdateExpression;
  to.type = from.type;
  to.operator = from.operator;
  to.prefix = from.prefix;
  to.argument = _argument;
  return to;
}

export function generateJS3UpdateExpressionfromBaseNode(_argument : JS3UpdateExpression_argument, _operator : "++" | "--", _prefix : boolean, from: Node) : JS3UpdateExpression {
  let to: JS3UpdateExpression = generateBaseNodeFrom(from) as JS3UpdateExpression;
  to.type = "UpdateExpression";
  to.operator = _operator;
  to.prefix = _prefix;
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

export function generateJS3VariableDeclarator(_id : JS3VariableDeclarator_id, _init : JS3VariableDeclarator_init, from: VariableDeclarator) : JS3VariableDeclarator {
  let to: JS3VariableDeclarator = generateBaseNodeFrom(from) as JS3VariableDeclarator;
  to.type = from.type;
  to.definite = from.definite;
  to.id = _id;
  to.init = _init;
  return to;
}

export function generateJS3VariableDeclaratorfromBaseNode(_id : JS3VariableDeclarator_id, _init : JS3VariableDeclarator_init, _definite : boolean | null, from: Node) : JS3VariableDeclarator {
  let to: JS3VariableDeclarator = generateBaseNodeFrom(from) as JS3VariableDeclarator;
  to.type = "VariableDeclarator";
  to.definite = _definite;
  to.id = _id;
  to.init = _init;
  return to;
}

export function generateJS3WhileStatement(_test : JS3WhileStatement_test, _body : JS3WhileStatement_body, from: WhileStatement) : JS3WhileStatement {
  let to: JS3WhileStatement = generateBaseNodeFrom(from) as JS3WhileStatement;
  to.type = from.type;
  to.test = _test;
  to.body = _body;
  return to;
}

export function generateJS3WhileStatementfromBaseNode(_test : JS3WhileStatement_test, _body : JS3WhileStatement_body, from: Node) : JS3WhileStatement {
  let to: JS3WhileStatement = generateBaseNodeFrom(from) as JS3WhileStatement;
  to.type = "WhileStatement";
  to.test = _test;
  to.body = _body;
  return to;
}

export function generateJS3WithStatement(_object : JS3WithStatement_object, _body : JS3WithStatement_body, from: WithStatement) : JS3WithStatement {
  let to: JS3WithStatement = generateBaseNodeFrom(from) as JS3WithStatement;
  to.type = from.type;
  to.object = _object;
  to.body = _body;
  return to;
}

export function generateJS3WithStatementfromBaseNode(_object : JS3WithStatement_object, _body : JS3WithStatement_body, from: Node) : JS3WithStatement {
  let to: JS3WithStatement = generateBaseNodeFrom(from) as JS3WithStatement;
  to.type = "WithStatement";
  to.object = _object;
  to.body = _body;
  return to;
}

export function generateJS3ArrowFunctionExpression(_params : JS3ArrowFunctionExpression_params, _body : JS3ArrowFunctionExpression_body, _predicate : JS3ArrowFunctionExpression_predicate, _returnType : JS3ArrowFunctionExpression_returnType, _typeParameters : JS3ArrowFunctionExpression_typeParameters, from: ArrowFunctionExpression) : JS3ArrowFunctionExpression {
  let to: JS3ArrowFunctionExpression = generateBaseNodeFrom(from) as JS3ArrowFunctionExpression;
  to.type = from.type;
  to.async = from.async;
  to.expression = from.expression;
  to.generator = from.generator;
  to.params = _params;
  to.body = _body;
  to.predicate = _predicate;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ArrowFunctionExpressionfromBaseNode(_params : JS3ArrowFunctionExpression_params, _body : JS3ArrowFunctionExpression_body, _predicate : JS3ArrowFunctionExpression_predicate, _returnType : JS3ArrowFunctionExpression_returnType, _typeParameters : JS3ArrowFunctionExpression_typeParameters, _async : boolean, _expression : boolean, _generator : boolean, from: Node) : JS3ArrowFunctionExpression {
  let to: JS3ArrowFunctionExpression = generateBaseNodeFrom(from) as JS3ArrowFunctionExpression;
  to.type = "ArrowFunctionExpression";
  to.async = _async;
  to.expression = _expression;
  to.generator = _generator;
  to.params = _params;
  to.body = _body;
  to.predicate = _predicate;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
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

export function generateJS3ClassExpression(_superClass : JS3ClassExpression_superClass, _body : JS3ClassExpression_body, _decorators : JS3ClassExpression_decorators, _implements : JS3ClassExpression_implements, _mixins : JS3ClassExpression_mixins, _superTypeParameters : JS3ClassExpression_superTypeParameters, _typeParameters : JS3ClassExpression_typeParameters, from: ClassExpression) : JS3ClassExpression {
  let to: JS3ClassExpression = generateBaseNodeFrom(from) as JS3ClassExpression;
  to.type = from.type;
  to.id = from.id;
  to.superClass = _superClass;
  to.body = _body;
  to.decorators = _decorators;
  to.implements = _implements;
  to.mixins = _mixins;
  to.superTypeParameters = _superTypeParameters;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ClassExpressionfromBaseNode(_superClass : JS3ClassExpression_superClass, _body : JS3ClassExpression_body, _decorators : JS3ClassExpression_decorators, _implements : JS3ClassExpression_implements, _mixins : JS3ClassExpression_mixins, _superTypeParameters : JS3ClassExpression_superTypeParameters, _typeParameters : JS3ClassExpression_typeParameters, _id : Identifier | null, from: Node) : JS3ClassExpression {
  let to: JS3ClassExpression = generateBaseNodeFrom(from) as JS3ClassExpression;
  to.type = "ClassExpression";
  to.id = _id;
  to.superClass = _superClass;
  to.body = _body;
  to.decorators = _decorators;
  to.implements = _implements;
  to.mixins = _mixins;
  to.superTypeParameters = _superTypeParameters;
  to.typeParameters = _typeParameters;
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

export function generateJS3ForOfStatement(_left : JS3ForOfStatement_left, _right : JS3ForOfStatement_right, _body : JS3ForOfStatement_body, from: ForOfStatement) : JS3ForOfStatement {
  let to: JS3ForOfStatement = generateBaseNodeFrom(from) as JS3ForOfStatement;
  to.type = from.type;
  to.await = from.await;
  to.left = _left;
  to.right = _right;
  to.body = _body;
  return to;
}

export function generateJS3ForOfStatementfromBaseNode(_left : JS3ForOfStatement_left, _right : JS3ForOfStatement_right, _body : JS3ForOfStatement_body, _await : boolean, from: Node) : JS3ForOfStatement {
  let to: JS3ForOfStatement = generateBaseNodeFrom(from) as JS3ForOfStatement;
  to.type = "ForOfStatement";
  to.await = _await;
  to.left = _left;
  to.right = _right;
  to.body = _body;
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

export function generateJS3ImportExpression(_source : JS3ImportExpression_source, _options : JS3ImportExpression_options, from: ImportExpression) : JS3ImportExpression {
  let to: JS3ImportExpression = generateBaseNodeFrom(from) as JS3ImportExpression;
  to.type = from.type;
  to.phase = from.phase;
  to.source = _source;
  to.options = _options;
  return to;
}

export function generateJS3ImportExpressionfromBaseNode(_source : JS3ImportExpression_source, _options : JS3ImportExpression_options, _phase : "source" | "defer" | null, from: Node) : JS3ImportExpression {
  let to: JS3ImportExpression = generateBaseNodeFrom(from) as JS3ImportExpression;
  to.type = "ImportExpression";
  to.phase = _phase;
  to.source = _source;
  to.options = _options;
  return to;
}

export function generateJS3MetaProperty(from: MetaProperty) : JS3MetaProperty {
  let to: JS3MetaProperty = generateBaseNodeFrom(from) as JS3MetaProperty;
  to.type = from.type;
  to.meta = from.meta;
  to.property = from.property;
  return to;
}

export function generateJS3MetaPropertyfromBaseNode(_meta : Identifier, _property : Identifier, from: Node) : JS3MetaProperty {
  let to: JS3MetaProperty = generateBaseNodeFrom(from) as JS3MetaProperty;
  to.type = "MetaProperty";
  to.meta = _meta;
  to.property = _property;
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

export function generateJS3SpreadElement(_argument : JS3SpreadElement_argument, from: SpreadElement) : JS3SpreadElement {
  let to: JS3SpreadElement = generateBaseNodeFrom(from) as JS3SpreadElement;
  to.type = from.type;
  to.argument = _argument;
  return to;
}

export function generateJS3SpreadElementfromBaseNode(_argument : JS3SpreadElement_argument, from: Node) : JS3SpreadElement {
  let to: JS3SpreadElement = generateBaseNodeFrom(from) as JS3SpreadElement;
  to.type = "SpreadElement";
  to.argument = _argument;
  return to;
}

export function generateJS3TaggedTemplateExpression(_tag : JS3TaggedTemplateExpression_tag, _quasi : JS3TaggedTemplateExpression_quasi, _typeParameters : JS3TaggedTemplateExpression_typeParameters, from: TaggedTemplateExpression) : JS3TaggedTemplateExpression {
  let to: JS3TaggedTemplateExpression = generateBaseNodeFrom(from) as JS3TaggedTemplateExpression;
  to.type = from.type;
  to.tag = _tag;
  to.quasi = _quasi;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3TaggedTemplateExpressionfromBaseNode(_tag : JS3TaggedTemplateExpression_tag, _quasi : JS3TaggedTemplateExpression_quasi, _typeParameters : JS3TaggedTemplateExpression_typeParameters, from: Node) : JS3TaggedTemplateExpression {
  let to: JS3TaggedTemplateExpression = generateBaseNodeFrom(from) as JS3TaggedTemplateExpression;
  to.type = "TaggedTemplateExpression";
  to.tag = _tag;
  to.quasi = _quasi;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3TemplateLiteral(_quasis : JS3TemplateLiteral_quasis, _expressions : JS3TemplateLiteral_expressions, from: TemplateLiteral) : JS3TemplateLiteral {
  let to: JS3TemplateLiteral = generateBaseNodeFrom(from) as JS3TemplateLiteral;
  to.type = from.type;
  to.quasis = _quasis;
  to.expressions = _expressions;
  return to;
}

export function generateJS3TemplateLiteralfromBaseNode(_quasis : JS3TemplateLiteral_quasis, _expressions : JS3TemplateLiteral_expressions, from: Node) : JS3TemplateLiteral {
  let to: JS3TemplateLiteral = generateBaseNodeFrom(from) as JS3TemplateLiteral;
  to.type = "TemplateLiteral";
  to.quasis = _quasis;
  to.expressions = _expressions;
  return to;
}

export function generateJS3YieldExpression(_argument : JS3YieldExpression_argument, from: YieldExpression) : JS3YieldExpression {
  let to: JS3YieldExpression = generateBaseNodeFrom(from) as JS3YieldExpression;
  to.type = from.type;
  to.delegate = from.delegate;
  to.argument = _argument;
  return to;
}

export function generateJS3YieldExpressionfromBaseNode(_argument : JS3YieldExpression_argument, _delegate : boolean, from: Node) : JS3YieldExpression {
  let to: JS3YieldExpression = generateBaseNodeFrom(from) as JS3YieldExpression;
  to.type = "YieldExpression";
  to.delegate = _delegate;
  to.argument = _argument;
  return to;
}

export function generateJS3AwaitExpression(_argument : JS3AwaitExpression_argument, from: AwaitExpression) : JS3AwaitExpression {
  let to: JS3AwaitExpression = generateBaseNodeFrom(from) as JS3AwaitExpression;
  to.type = from.type;
  to.argument = _argument;
  return to;
}

export function generateJS3AwaitExpressionfromBaseNode(_argument : JS3AwaitExpression_argument, from: Node) : JS3AwaitExpression {
  let to: JS3AwaitExpression = generateBaseNodeFrom(from) as JS3AwaitExpression;
  to.type = "AwaitExpression";
  to.argument = _argument;
  return to;
}

export function generateJS3Import(from: Import) : JS3Import {
  let to: JS3Import = generateBaseNodeFrom(from) as JS3Import;
  to.type = from.type;
  return to;
}

export function generateJS3ImportfromBaseNode(from: Node) : JS3Import {
  let to: JS3Import = generateBaseNodeFrom(from) as JS3Import;
  to.type = "Import";
  return to;
}

export function generateJS3OptionalMemberExpression(_object : JS3OptionalMemberExpression_object, _property : JS3OptionalMemberExpression_property, from: OptionalMemberExpression) : JS3OptionalMemberExpression {
  let to: JS3OptionalMemberExpression = generateBaseNodeFrom(from) as JS3OptionalMemberExpression;
  to.type = from.type;
  to.computed = from.computed;
  to.optional = from.optional;
  to.object = _object;
  to.property = _property;
  return to;
}

export function generateJS3OptionalMemberExpressionfromBaseNode(_object : JS3OptionalMemberExpression_object, _property : JS3OptionalMemberExpression_property, _computed : boolean, _optional : boolean, from: Node) : JS3OptionalMemberExpression {
  let to: JS3OptionalMemberExpression = generateBaseNodeFrom(from) as JS3OptionalMemberExpression;
  to.type = "OptionalMemberExpression";
  to.computed = _computed;
  to.optional = _optional;
  to.object = _object;
  to.property = _property;
  return to;
}

export function generateJS3OptionalCallExpression(_callee : JS3OptionalCallExpression_callee, _arguments : JS3OptionalCallExpression_arguments, _typeArguments : JS3OptionalCallExpression_typeArguments, _typeParameters : JS3OptionalCallExpression_typeParameters, from: OptionalCallExpression) : JS3OptionalCallExpression {
  let to: JS3OptionalCallExpression = generateBaseNodeFrom(from) as JS3OptionalCallExpression;
  to.type = from.type;
  to.optional = from.optional;
  to.callee = _callee;
  to.arguments = _arguments;
  to.typeArguments = _typeArguments;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3OptionalCallExpressionfromBaseNode(_callee : JS3OptionalCallExpression_callee, _arguments : JS3OptionalCallExpression_arguments, _typeArguments : JS3OptionalCallExpression_typeArguments, _typeParameters : JS3OptionalCallExpression_typeParameters, _optional : boolean, from: Node) : JS3OptionalCallExpression {
  let to: JS3OptionalCallExpression = generateBaseNodeFrom(from) as JS3OptionalCallExpression;
  to.type = "OptionalCallExpression";
  to.optional = _optional;
  to.callee = _callee;
  to.arguments = _arguments;
  to.typeArguments = _typeArguments;
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

export function generateJS3ClassPrivateProperty(_value : JS3ClassPrivateProperty_value, _decorators : JS3ClassPrivateProperty_decorators, _typeAnnotation : JS3ClassPrivateProperty_typeAnnotation, _variance : JS3ClassPrivateProperty_variance, from: ClassPrivateProperty) : JS3ClassPrivateProperty {
  let to: JS3ClassPrivateProperty = generateBaseNodeFrom(from) as JS3ClassPrivateProperty;
  to.type = from.type;
  to.key = from.key;
  to.static = from.static;
  to.definite = from.definite;
  to.readonly = from.readonly;
  to.value = _value;
  to.decorators = _decorators;
  to.typeAnnotation = _typeAnnotation;
  to.variance = _variance;
  return to;
}

export function generateJS3ClassPrivatePropertyfromBaseNode(_value : JS3ClassPrivateProperty_value, _decorators : JS3ClassPrivateProperty_decorators, _typeAnnotation : JS3ClassPrivateProperty_typeAnnotation, _variance : JS3ClassPrivateProperty_variance, _key : PrivateName, _static : boolean, _definite : boolean | null, _readonly : boolean | null, from: Node) : JS3ClassPrivateProperty {
  let to: JS3ClassPrivateProperty = generateBaseNodeFrom(from) as JS3ClassPrivateProperty;
  to.type = "ClassPrivateProperty";
  to.key = _key;
  to.static = _static;
  to.definite = _definite;
  to.readonly = _readonly;
  to.value = _value;
  to.decorators = _decorators;
  to.typeAnnotation = _typeAnnotation;
  to.variance = _variance;
  return to;
}

export function generateJS3ClassPrivateMethod(_params : JS3ClassPrivateMethod_params, _body : JS3ClassPrivateMethod_body, _decorators : JS3ClassPrivateMethod_decorators, _returnType : JS3ClassPrivateMethod_returnType, _typeParameters : JS3ClassPrivateMethod_typeParameters, from: ClassPrivateMethod) : JS3ClassPrivateMethod {
  let to: JS3ClassPrivateMethod = generateBaseNodeFrom(from) as JS3ClassPrivateMethod;
  to.type = from.type;
  to.kind = from.kind;
  to.key = from.key;
  to.static = from.static;
  to.abstract = from.abstract;
  to.access = from.access;
  to.accessibility = from.accessibility;
  to.async = from.async;
  to.computed = from.computed;
  to.generator = from.generator;
  to.optional = from.optional;
  to.override = from.override;
  to.params = _params;
  to.body = _body;
  to.decorators = _decorators;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3ClassPrivateMethodfromBaseNode(_params : JS3ClassPrivateMethod_params, _body : JS3ClassPrivateMethod_body, _decorators : JS3ClassPrivateMethod_decorators, _returnType : JS3ClassPrivateMethod_returnType, _typeParameters : JS3ClassPrivateMethod_typeParameters, _kind : "get" | "set" | "method", _key : PrivateName, _static : boolean, _abstract : boolean | null, _access : "public" | "private" | "protected" | null, _accessibility : "public" | "private" | "protected" | null, _async : boolean, _computed : boolean, _generator : boolean, _optional : boolean | null, _override : boolean, from: Node) : JS3ClassPrivateMethod {
  let to: JS3ClassPrivateMethod = generateBaseNodeFrom(from) as JS3ClassPrivateMethod;
  to.type = "ClassPrivateMethod";
  to.kind = _kind;
  to.key = _key;
  to.static = _static;
  to.abstract = _abstract;
  to.access = _access;
  to.accessibility = _accessibility;
  to.async = _async;
  to.computed = _computed;
  to.generator = _generator;
  to.optional = _optional;
  to.override = _override;
  to.params = _params;
  to.body = _body;
  to.decorators = _decorators;
  to.returnType = _returnType;
  to.typeParameters = _typeParameters;
  return to;
}

export function generateJS3PrivateName(from: PrivateName) : JS3PrivateName {
  let to: JS3PrivateName = generateBaseNodeFrom(from) as JS3PrivateName;
  to.type = from.type;
  to.id = from.id;
  return to;
}

export function generateJS3PrivateNamefromBaseNode(_id : Identifier, from: Node) : JS3PrivateName {
  let to: JS3PrivateName = generateBaseNodeFrom(from) as JS3PrivateName;
  to.type = "PrivateName";
  to.id = _id;
  return to;
}

export function generateJS3StaticBlock(_body : JS3StaticBlock_body, from: StaticBlock) : JS3StaticBlock {
  let to: JS3StaticBlock = generateBaseNodeFrom(from) as JS3StaticBlock;
  to.type = from.type;
  to.body = _body;
  return to;
}

export function generateJS3StaticBlockfromBaseNode(_body : JS3StaticBlock_body, from: Node) : JS3StaticBlock {
  let to: JS3StaticBlock = generateBaseNodeFrom(from) as JS3StaticBlock;
  to.type = "StaticBlock";
  to.body = _body;
  return to;
}

