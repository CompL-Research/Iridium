// Generated on 28/8/2024, 8:02:51 pm, extended 62 interfaces 

import { ExportSpecifier, ExportDefaultSpecifier, ExportNamespaceSpecifier, OptionalMemberExpression, TemplateElement, RestElement, ArrayPattern, ObjectPattern, AssignmentPattern, ArgumentPlaceholder, ThisExpression, TSParameterProperty, DecimalLiteral, ObjectMethod, ObjectProperty, SpreadElement, Pattern, BigIntLiteral, Super, V8IntrinsicIdentifier, TSDeclareFunction, FunctionDeclaration, ClassProperty, StringLiteral, NumericLiteral, NullLiteral, BooleanLiteral, CallExpression, Identifier, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, EmptyStatement, Expression, ExpressionStatement, ArrayExpression, AssignmentExpression, BinaryExpression, BlockStatement, BreakStatement, CatchClause, ConditionalExpression, ContinueStatement, DoWhileStatement, ForInStatement, ForStatement, FunctionExpression, IfStatement, LabeledStatement, RegExpLiteral, LogicalExpression, MemberExpression, NewExpression, Program, ObjectExpression, ReturnStatement, SequenceExpression, SwitchCase, SwitchStatement, ThrowStatement, TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator, WhileStatement, WithStatement, ArrowFunctionExpression, ClassBody, ClassExpression, ClassDeclaration, ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ForOfStatement, ImportDeclaration, ImportExpression, MetaProperty, ClassMethod, TaggedTemplateExpression, TemplateLiteral, YieldExpression, AwaitExpression, Import, OptionalCallExpression, ClassPrivateProperty, ClassPrivateMethod, PrivateName, StaticBlock, } from "@babel/types";

export type JS3AllowedBlockStatement = JS3ExportAllDeclaration | JS3WhileStatement | JS3VariableDeclaration | JS3ReturnStatement | JS3ExpressionStatement | JS3IfStatement | JS3TryStatement | JS3ThrowStatement | JS3FunctionDeclaration | JS3AssignmentExpression | JS3ClassDeclaration | EmptyStatement | JS3WhileStatement | JS3BreakStatement | JS3ContinueStatement | JS3BlockStatement | JS3ForInStatement | JS3LabeledStatement | JS3ForStatement | JS3DoWhileStatement | JS3SwitchStatement | JS3ForOfStatement | JS3WithStatement;
export type JS3Literals = DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral;
export type JS3ContainedExprKey = Identifier | JS3YieldExpression | JS3CallExpression | JS3Literals | JS3AwaitExpression;
export type JS3AllowedFunctionArgs = Identifier | Pattern | RestElement;
export type JS3LVal = Identifier | JS3MemberExpression | RestElement | AssignmentPattern | ArrayPattern | ObjectPattern;
export type JS3AssnInit = JS3RegExpLiteral | JS3ImportExpression | JS3TaggedTemplateExpression | JS3MetaProperty | Super | JS3YieldExpression | JS3SequenceExpression | ThisExpression | JS3FunctionExpression | Identifier | BigIntLiteral | DecimalLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | JS3MemberExpression | JS3CallExpression | JS3ObjectExpression | JS3NewExpression | JS3BinaryExpression | JS3LogicalExpression | JS3AssignmentExpression | JS3UnaryExpression | JS3ArrowFunctionExpression | JS3ClassExpression | JS3ArrayExpression | JS3ObjectMethod | JS3UpdateExpression | JS3TemplateLiteral | JS3ConditionalExpression | JS3AwaitExpression | JS3OptionalMemberExpression | JS3OptionalCallExpression;

/// CUSTOM INTERFACES START

// @ts-ignore
export interface JS3AnonMemberExpression extends MemberExpression {
  object: JS3AnonArrayExpression;
  property: NumericLiteral;
}

// @ts-ignore
export interface JS3AnonArrayExpression extends ArrayExpression {
  elements: Array<JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression>; // Assert that this is always of size 1
}

/// CUSTOM INTERFACES END
export type JS3ArrayExpression_elements = Array<null | JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression | Identifier | JS3SpreadElement>;
export type JS3AssignmentExpression_left = JS3LVal | JS3OptionalMemberExpression;
export type JS3AssignmentExpression_right = JS3AssnInit;
export type JS3BinaryExpression_left = Identifier | JS3PrivateName;
export type JS3BinaryExpression_right = Identifier;
export type JS3BlockStatement_body = Array<JS3AllowedBlockStatement>;
export type JS3BreakStatement_label = Identifier | null;
export type JS3CallExpression_callee = JS3OptionalMemberExpression | JS3Import | JS3MemberExpression | Identifier | Super | V8IntrinsicIdentifier | JS3FunctionExpression | JS3ArrowFunctionExpression;
export type JS3CallExpression_arguments = Array < JS3AnonMemberExpression | JS3ContainedExprKey | JS3CallExpression | JS3SpreadElement >;
export type JS3CallExpression_typeArguments = null;
export type JS3CallExpression_typeParameters = null;
export type JS3CatchClause_body = JS3BlockStatement;
export type JS3ConditionalExpression_test = Identifier;
export type JS3ConditionalExpression_consequent = JS3ContainedExprKey;
export type JS3ConditionalExpression_alternate = JS3ContainedExprKey;
export type JS3ContinueStatement_label = Identifier | null;
export type JS3DoWhileStatement_test = JS3ContainedExprKey;
export type JS3DoWhileStatement_body = JS3BlockStatement;
export type JS3ExpressionStatement_expression = JS3AssignmentExpression | JS3CallExpression | Identifier;
export type JS3ForInStatement_left = VariableDeclaration | JS3LVal;
export type JS3ForInStatement_right = Identifier;
export type JS3ForInStatement_body = JS3BlockStatement;
export type JS3ForStatement_init = VariableDeclaration | JS3ContainedExprKey | null;
export type JS3ForStatement_test = JS3ContainedExprKey | null;
export type JS3ForStatement_update = JS3ContainedExprKey | null;
export type JS3ForStatement_body = JS3BlockStatement;
export type JS3FunctionDeclaration_id = null | undefined | Identifier;
export type JS3FunctionDeclaration_params = Array<JS3AllowedFunctionArgs>;
export type JS3FunctionDeclaration_body = JS3BlockStatement;
export type JS3FunctionDeclaration_predicate = null;
export type JS3FunctionDeclaration_returnType = null;
export type JS3FunctionDeclaration_typeParameters = null;
export type JS3FunctionExpression_id = null | Identifier | undefined;
export type JS3FunctionExpression_params = Array<JS3AllowedFunctionArgs>;
export type JS3FunctionExpression_body = JS3BlockStatement;
export type JS3FunctionExpression_predicate = undefined | null;
export type JS3FunctionExpression_returnType = undefined | null;
export type JS3FunctionExpression_typeParameters = undefined | null;
export type JS3IfStatement_test = JS3CallExpression_callee;
export type JS3IfStatement_consequent = JS3BlockStatement;
export type JS3IfStatement_alternate = null | undefined | JS3BlockStatement;
export type JS3LabeledStatement_body = JS3AllowedBlockStatement;
export type JS3LogicalExpression_left = Identifier;
export type JS3LogicalExpression_right = Identifier;
export type JS3MemberExpression_object = Identifier | ThisExpression | Super;
export type JS3MemberExpression_property = Identifier | JS3PrivateName;
export type JS3NewExpression_callee = Identifier | Super | V8IntrinsicIdentifier;
export type JS3NewExpression_arguments = Array<Identifier | SpreadElement | ArgumentPlaceholder>;
export type JS3NewExpression_typeArguments = null;
export type JS3NewExpression_typeParameters = null;
export type JS3Program_body = Array< JS3ImportDeclaration | JS3ExportDefaultDeclaration | JS3ExportNamedDeclaration | JS3AllowedBlockStatement >;
export type JS3ObjectExpression_properties = Array<JS3ObjectMethod | JS3ObjectProperty | JS3SpreadElement>;
export type JS3ObjectMethod_key = Identifier | StringLiteral | NumericLiteral | BigIntLiteral;
export type JS3ObjectMethod_params = Array<JS3AllowedFunctionArgs>;
export type JS3ObjectMethod_body = JS3BlockStatement;
export type JS3ObjectMethod_decorators = null;
export type JS3ObjectMethod_returnType = null;
export type JS3ObjectMethod_typeParameters = null;
export type JS3ObjectProperty_key = Identifier | StringLiteral | NumericLiteral | BigIntLiteral | DecimalLiteral | JS3PrivateName;
export type JS3ObjectProperty_value = Identifier | JS3ClassExpression | JS3Literals | JS3ArrowFunctionExpression | JS3FunctionExpression;
export type JS3ObjectProperty_decorators = null;
export type JS3ReturnStatement_argument = undefined | null | Identifier | DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral;
export type JS3SequenceExpression_expressions = Array<Identifier>;
export type JS3SwitchCase_test = JS3ContainedExprKey | null;
export type JS3SwitchCase_consequent = Array<JS3AllowedBlockStatement>;
export type JS3SwitchStatement_discriminant = JS3ContainedExprKey;
export type JS3SwitchStatement_cases = Array<JS3SwitchCase>;
export type JS3ThrowStatement_argument = Identifier;
export type JS3TryStatement_block = JS3BlockStatement;
export type JS3TryStatement_handler = null | undefined | JS3CatchClause;
export type JS3TryStatement_finalizer = null | undefined | JS3BlockStatement;
export type JS3UnaryExpression_argument = Identifier | JS3MemberExpression | JS3CallExpression | NumericLiteral | ThisExpression;
export type JS3UpdateExpression_argument = Identifier | JS3MemberExpression;
export type JS3VariableDeclaration_declarations = Array<JS3VariableDeclarator>;
export type JS3VariableDeclarator_id = JS3LVal;
export type JS3VariableDeclarator_init = JS3AssnInit;
export type JS3WhileStatement_test = JS3ContainedExprKey;
export type JS3WhileStatement_body = JS3BlockStatement;
export type JS3WithStatement_object = Identifier;
export type JS3WithStatement_body = JS3BlockStatement;
export type JS3ArrowFunctionExpression_params = Array<JS3AllowedFunctionArgs>;
export type JS3ArrowFunctionExpression_body = JS3BlockStatement;
export type JS3ArrowFunctionExpression_predicate = null;
export type JS3ArrowFunctionExpression_returnType = null;
export type JS3ArrowFunctionExpression_typeParameters = null;
export type JS3ClassBody_body = Array<JS3StaticBlock | JS3ClassProperty | JS3ClassMethod | JS3ClassPrivateProperty | JS3ClassPrivateMethod>;
export type JS3ClassExpression_superClass = null | undefined | JS3ContainedExprKey;
export type JS3ClassExpression_body = JS3ClassBody;
export type JS3ClassExpression_decorators = null;
export type JS3ClassExpression_implements = null;
export type JS3ClassExpression_mixins = null;
export type JS3ClassExpression_superTypeParameters = null;
export type JS3ClassExpression_typeParameters = null;
export type JS3ClassDeclaration_superClass = null | undefined | JS3ContainedExprKey | JS3CallExpression;
export type JS3ClassDeclaration_body = JS3ClassBody;
export type JS3ClassDeclaration_decorators = null;
export type JS3ClassDeclaration_implements = null;
export type JS3ClassDeclaration_mixins = null;
export type JS3ClassDeclaration_superTypeParameters = null;
export type JS3ClassDeclaration_typeParameters = null;
export type JS3ExportAllDeclaration_assertions = null;
export type JS3ExportAllDeclaration_attributes = null;
export type JS3ExportDefaultDeclaration_declaration = TSDeclareFunction | JS3FunctionDeclaration | JS3ClassDeclaration | Identifier | JS3FunctionDeclaration;
export type JS3ExportNamedDeclaration_declaration = JS3VariableDeclaration | null;
export type JS3ExportNamedDeclaration_specifiers = Array<ExportSpecifier | ExportDefaultSpecifier | ExportNamespaceSpecifier>;
export type JS3ExportNamedDeclaration_assertions = null;
export type JS3ExportNamedDeclaration_attributes = null;
export type JS3ForOfStatement_left = VariableDeclaration | JS3LVal;
export type JS3ForOfStatement_right = Identifier;
export type JS3ForOfStatement_body = JS3BlockStatement;
export type JS3ImportDeclaration_specifiers = Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
export type JS3ImportDeclaration_assertions = undefined | null;
export type JS3ImportDeclaration_attributes = undefined | null;
export type JS3ImportExpression_source = Identifier;
export type JS3ImportExpression_options = Identifier | null;
export type JS3ClassMethod_key = JS3ContainedExprKey;
export type JS3ClassMethod_params = Array<JS3AllowedFunctionArgs>;
export type JS3ClassMethod_body = JS3BlockStatement;
export type JS3ClassMethod_decorators = null;
export type JS3ClassMethod_returnType = null;
export type JS3ClassMethod_typeParameters = null;
export type JS3SpreadElement_argument = Identifier;
export type JS3TaggedTemplateExpression_tag = JS3MemberExpression | Identifier;
export type JS3TaggedTemplateExpression_quasi = JS3TemplateLiteral;
export type JS3TaggedTemplateExpression_typeParameters = null;
export type JS3TemplateLiteral_quasis = Array<TemplateElement>;
export type JS3TemplateLiteral_expressions = Array<Identifier>;
export type JS3YieldExpression_argument = JS3ContainedExprKey | Identifier | null;
export type JS3AwaitExpression_argument = JS3RegExpLiteral | JS3ContainedExprKey | Identifier;
export type JS3OptionalMemberExpression_object = Expression;
export type JS3OptionalMemberExpression_property = Expression | Identifier;
export type JS3OptionalCallExpression_callee = Expression;
export type JS3OptionalCallExpression_arguments = Array<Expression | SpreadElement | ArgumentPlaceholder>;
export type JS3OptionalCallExpression_typeArguments = null;
export type JS3OptionalCallExpression_typeParameters = null;
export type JS3ClassProperty_key = JS3ContainedExprKey;
export type JS3ClassProperty_value = JS3ClassExpression | JS3Literals | JS3ArrowFunctionExpression | JS3FunctionExpression | JS3ContainedExprKey | null;
export type JS3ClassProperty_typeAnnotation = null;
export type JS3ClassProperty_decorators = null;
export type JS3ClassProperty_variance = null;
export type JS3ClassPrivateProperty_value = JS3ClassExpression | JS3Literals | JS3ArrowFunctionExpression | JS3FunctionExpression | JS3ContainedExprKey | null;
export type JS3ClassPrivateProperty_decorators = null;
export type JS3ClassPrivateProperty_typeAnnotation = null;
export type JS3ClassPrivateProperty_variance = null;
export type JS3ClassPrivateMethod_params = Array<JS3AllowedFunctionArgs>;
export type JS3ClassPrivateMethod_body = JS3BlockStatement;
export type JS3ClassPrivateMethod_decorators = null;
export type JS3ClassPrivateMethod_returnType = null;
export type JS3ClassPrivateMethod_typeParameters = null;
export type JS3StaticBlock_body = Array<JS3AllowedBlockStatement>;


// @ts-ignore
export interface JS3ArrayExpression extends ArrayExpression {
  elements: JS3ArrayExpression_elements;
}

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
export interface JS3BreakStatement extends BreakStatement {
  label: JS3BreakStatement_label;
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
export interface JS3ConditionalExpression extends ConditionalExpression {
  test: JS3ConditionalExpression_test;
  consequent: JS3ConditionalExpression_consequent;
  alternate: JS3ConditionalExpression_alternate;
}

// @ts-ignore
export interface JS3ContinueStatement extends ContinueStatement {
  label: JS3ContinueStatement_label;
}

// @ts-ignore
export interface JS3DoWhileStatement extends DoWhileStatement {
  test: JS3DoWhileStatement_test;
  body: JS3DoWhileStatement_body;
}

// @ts-ignore
export interface JS3ExpressionStatement extends ExpressionStatement {
  expression: JS3ExpressionStatement_expression;
}

// @ts-ignore
export interface JS3ForInStatement extends ForInStatement {
  left: JS3ForInStatement_left;
  right: JS3ForInStatement_right;
  body: JS3ForInStatement_body;
}

// @ts-ignore
export interface JS3ForStatement extends ForStatement {
  init: JS3ForStatement_init;
  test: JS3ForStatement_test;
  update: JS3ForStatement_update;
  body: JS3ForStatement_body;
}

// @ts-ignore
export interface JS3FunctionDeclaration extends FunctionDeclaration {
  id: JS3FunctionDeclaration_id;
  params: JS3FunctionDeclaration_params;
  body: JS3FunctionDeclaration_body;
  predicate: JS3FunctionDeclaration_predicate;
  returnType: JS3FunctionDeclaration_returnType;
  typeParameters: JS3FunctionDeclaration_typeParameters;
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
export interface JS3LabeledStatement extends LabeledStatement {
  body: JS3LabeledStatement_body;
}

// @ts-ignore
export interface JS3RegExpLiteral extends RegExpLiteral {
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
export interface JS3ObjectMethod extends ObjectMethod {
  key: JS3ObjectMethod_key;
  params: JS3ObjectMethod_params;
  body: JS3ObjectMethod_body;
  decorators: JS3ObjectMethod_decorators;
  returnType: JS3ObjectMethod_returnType;
  typeParameters: JS3ObjectMethod_typeParameters;
}

// @ts-ignore
export interface JS3ObjectProperty extends ObjectProperty {
  key: JS3ObjectProperty_key;
  value: JS3ObjectProperty_value;
  decorators: JS3ObjectProperty_decorators;
}

// @ts-ignore
export interface JS3ReturnStatement extends ReturnStatement {
  argument: JS3ReturnStatement_argument;
}

// @ts-ignore
export interface JS3SequenceExpression extends SequenceExpression {
  expressions: JS3SequenceExpression_expressions;
}

// @ts-ignore
export interface JS3SwitchCase extends SwitchCase {
  test: JS3SwitchCase_test;
  consequent: JS3SwitchCase_consequent;
}

// @ts-ignore
export interface JS3SwitchStatement extends SwitchStatement {
  discriminant: JS3SwitchStatement_discriminant;
  cases: JS3SwitchStatement_cases;
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
export interface JS3UnaryExpression extends UnaryExpression {
  argument: JS3UnaryExpression_argument;
}

// @ts-ignore
export interface JS3UpdateExpression extends UpdateExpression {
  argument: JS3UpdateExpression_argument;
}

// @ts-ignore
export interface JS3VariableDeclaration extends VariableDeclaration {
  declarations: JS3VariableDeclaration_declarations;
}

// @ts-ignore
export interface JS3VariableDeclarator extends VariableDeclarator {
  id: JS3VariableDeclarator_id;
  init: JS3VariableDeclarator_init;
}

// @ts-ignore
export interface JS3WhileStatement extends WhileStatement {
  test: JS3WhileStatement_test;
  body: JS3WhileStatement_body;
}

// @ts-ignore
export interface JS3WithStatement extends WithStatement {
  object: JS3WithStatement_object;
  body: JS3WithStatement_body;
}

// @ts-ignore
export interface JS3ArrowFunctionExpression extends ArrowFunctionExpression {
  params: JS3ArrowFunctionExpression_params;
  body: JS3ArrowFunctionExpression_body;
  predicate: JS3ArrowFunctionExpression_predicate;
  returnType: JS3ArrowFunctionExpression_returnType;
  typeParameters: JS3ArrowFunctionExpression_typeParameters;
}

// @ts-ignore
export interface JS3ClassBody extends ClassBody {
  body: JS3ClassBody_body;
}

// @ts-ignore
export interface JS3ClassExpression extends ClassExpression {
  superClass: JS3ClassExpression_superClass;
  body: JS3ClassExpression_body;
  decorators: JS3ClassExpression_decorators;
  implements: JS3ClassExpression_implements;
  mixins: JS3ClassExpression_mixins;
  superTypeParameters: JS3ClassExpression_superTypeParameters;
  typeParameters: JS3ClassExpression_typeParameters;
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
export interface JS3ExportAllDeclaration extends ExportAllDeclaration {
  assertions: JS3ExportAllDeclaration_assertions;
  attributes: JS3ExportAllDeclaration_attributes;
}

// @ts-ignore
export interface JS3ExportDefaultDeclaration extends ExportDefaultDeclaration {
  declaration: JS3ExportDefaultDeclaration_declaration;
}

// @ts-ignore
export interface JS3ExportNamedDeclaration extends ExportNamedDeclaration {
  declaration: JS3ExportNamedDeclaration_declaration;
  specifiers: JS3ExportNamedDeclaration_specifiers;
  assertions: JS3ExportNamedDeclaration_assertions;
  attributes: JS3ExportNamedDeclaration_attributes;
}

// @ts-ignore
export interface JS3ForOfStatement extends ForOfStatement {
  left: JS3ForOfStatement_left;
  right: JS3ForOfStatement_right;
  body: JS3ForOfStatement_body;
}

// @ts-ignore
export interface JS3ImportDeclaration extends ImportDeclaration {
  specifiers: JS3ImportDeclaration_specifiers;
  assertions: JS3ImportDeclaration_assertions;
  attributes: JS3ImportDeclaration_attributes;
}

// @ts-ignore
export interface JS3ImportExpression extends ImportExpression {
  source: JS3ImportExpression_source;
  options: JS3ImportExpression_options;
}

// @ts-ignore
export interface JS3MetaProperty extends MetaProperty {
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
export interface JS3SpreadElement extends SpreadElement {
  argument: JS3SpreadElement_argument;
}

// @ts-ignore
export interface JS3TaggedTemplateExpression extends TaggedTemplateExpression {
  tag: JS3TaggedTemplateExpression_tag;
  quasi: JS3TaggedTemplateExpression_quasi;
  typeParameters: JS3TaggedTemplateExpression_typeParameters;
}

// @ts-ignore
export interface JS3TemplateLiteral extends TemplateLiteral {
  quasis: JS3TemplateLiteral_quasis;
  expressions: JS3TemplateLiteral_expressions;
}

// @ts-ignore
export interface JS3YieldExpression extends YieldExpression {
  argument: JS3YieldExpression_argument;
}

// @ts-ignore
export interface JS3AwaitExpression extends AwaitExpression {
  argument: JS3AwaitExpression_argument;
}

// @ts-ignore
export interface JS3Import extends Import {
}

// @ts-ignore
export interface JS3OptionalMemberExpression extends OptionalMemberExpression {
  object: JS3OptionalMemberExpression_object;
  property: JS3OptionalMemberExpression_property;
}

// @ts-ignore
export interface JS3OptionalCallExpression extends OptionalCallExpression {
  callee: JS3OptionalCallExpression_callee;
  arguments: JS3OptionalCallExpression_arguments;
  typeArguments: JS3OptionalCallExpression_typeArguments;
  typeParameters: JS3OptionalCallExpression_typeParameters;
}

// @ts-ignore
export interface JS3ClassProperty extends ClassProperty {
  key: JS3ClassProperty_key;
  value: JS3ClassProperty_value;
  typeAnnotation: JS3ClassProperty_typeAnnotation;
  decorators: JS3ClassProperty_decorators;
  variance: JS3ClassProperty_variance;
}

// @ts-ignore
export interface JS3ClassPrivateProperty extends ClassPrivateProperty {
  value: JS3ClassPrivateProperty_value;
  decorators: JS3ClassPrivateProperty_decorators;
  typeAnnotation: JS3ClassPrivateProperty_typeAnnotation;
  variance: JS3ClassPrivateProperty_variance;
}

// @ts-ignore
export interface JS3ClassPrivateMethod extends ClassPrivateMethod {
  params: JS3ClassPrivateMethod_params;
  body: JS3ClassPrivateMethod_body;
  decorators: JS3ClassPrivateMethod_decorators;
  returnType: JS3ClassPrivateMethod_returnType;
  typeParameters: JS3ClassPrivateMethod_typeParameters;
}

// @ts-ignore
export interface JS3PrivateName extends PrivateName {
}

// @ts-ignore
export interface JS3StaticBlock extends StaticBlock {
  body: JS3StaticBlock_body;
}

