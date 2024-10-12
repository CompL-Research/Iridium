// Generated on 12/10/2024, 12:28:31 pm, extended 65 interfaces 

import { ExportSpecifier, ExportNamespaceSpecifier, OptionalMemberExpression, TemplateElement, RestElement, ArrayPattern, ObjectPattern, ArgumentPlaceholder, ThisExpression, TSParameterProperty, DecimalLiteral, ObjectMethod, ObjectProperty, SpreadElement, Pattern, BigIntLiteral, Super, V8IntrinsicIdentifier, TSDeclareFunction, FunctionDeclaration, ClassProperty, StringLiteral, NumericLiteral, NullLiteral, BooleanLiteral, CallExpression, Identifier, ImportSpecifier, ImportDefaultSpecifier, ImportNamespaceSpecifier, EmptyStatement, Expression, ExpressionStatement, Node, ArrayExpression, AssignmentExpression, BinaryExpression, BlockStatement, BreakStatement, CatchClause, ContinueStatement, DoWhileStatement, File, ForInStatement, ForStatement, FunctionExpression, IfStatement, LabeledStatement, RegExpLiteral, LogicalExpression, MemberExpression, NewExpression, Program, ObjectExpression, ReturnStatement, SequenceExpression, SwitchCase, SwitchStatement, ThrowStatement, TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator, WhileStatement, WithStatement, ArrowFunctionExpression, ClassBody, ClassExpression, ClassDeclaration, ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, ForOfStatement, ImportDeclaration, ImportExpression, MetaProperty, ClassMethod, TaggedTemplateExpression, TemplateLiteral, YieldExpression, AwaitExpression, Import, OptionalCallExpression, ClassPrivateProperty, ClassPrivateMethod, PrivateName, StaticBlock, } from "@babel/types";

export type JS3AllowedBlockStatement = JS3WithStatement | JS3WhileStatement | JS3VariableDeclaration | JS3ReturnStatement | JS3ExpressionStatement | JS3IfStatement | JS3TryStatement | JS3ThrowStatement | JS3FunctionDeclaration | JS3AssignmentExpression | JS3ClassDeclaration | JS3EmptyStatement | JS3WhileStatement | JS3BreakStatement | JS3ContinueStatement | JS3BlockStatement | JS3ForInStatement | JS3LabeledStatement | JS3ForStatement | JS3DoWhileStatement | JS3SwitchStatement | JS3ForOfStatement;
export type JS3Literals = DecimalLiteral | BigIntLiteral | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral;
export type JS3ContainedExprKey = Identifier | JS3YieldExpression | JS3CallExpression | JS3Literals | JS3AwaitExpression;
export type JS3AllowedFunctionArgs = Identifier | Pattern | RestElement;
export type JS3VarDeclLVal = Identifier | ArrayPattern | ObjectPattern;
export type JS3LVal = Identifier | JS3MemberExpression | RestElement | Pattern;
export type JS3AssnInit = JS3Literals | JS3RegExpLiteral | JS3ImportExpression | JS3TaggedTemplateExpression | JS3MetaProperty | JS3YieldExpression | JS3SequenceExpression | ThisExpression | JS3FunctionExpression | Identifier | JS3MemberExpression | JS3CallExpression | JS3ObjectExpression | JS3NewExpression | JS3BinaryExpression | JS3LogicalExpression | JS3AssignmentExpression | JS3UnaryExpression | JS3ArrowFunctionExpression | JS3ClassExpression | JS3ArrayExpression | JS3UpdateExpression | JS3TemplateLiteral | JS3AwaitExpression | JS3OptionalMemberExpression | JS3OptionalCallExpression | JS3AnonMemberExpression;
export type JS3AllowedProgStatement = JS3ImportDeclaration | JS3ExportDefaultDeclaration | JS3ExportNamedDeclaration | JS3ExportAllDeclaration | JS3AllowedBlockStatement;

/// CUSTOM INTERFACES START

// @ts-ignore
export interface JS3AnonMemberExpression extends MemberExpression {
  object: JS3AnonArrayExpression;
  property: NumericLiteral;
  js3type: "JS3AnonMemberExpression";
}

// @ts-ignore
export function isJS3AnonMemberExpression(node: any): node is JS3AnonMemberExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3AnonMemberExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3AnonArrayExpression extends ArrayExpression {
  elements: Array<JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression>; // Assert that this is always of size 1
  js3type: "JS3AnonArrayExpression";
}

// @ts-ignore
export function isJS3AnonArrayExpression(node: any): node is JS3AnonArrayExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3AnonArrayExpression") return true;
  return false;
}

/// CUSTOM INTERFACES END
export type JS3ArrayExpression_elements = Array<null | JS3FunctionExpression | JS3ClassExpression | JS3ArrowFunctionExpression | Identifier | JS3SpreadElement>;
export type JS3AssignmentExpression_left = JS3LVal | JS3OptionalMemberExpression;
export type JS3AssignmentExpression_right = JS3AssnInit;
export type JS3BinaryExpression_left = Identifier | JS3PrivateName;
export type JS3BinaryExpression_right = Identifier;
export type JS3BlockStatement_body = Array<JS3AllowedBlockStatement>;
export type JS3BreakStatement_label = Identifier | null;
export type JS3CallExpression_callee = JS3OptionalMemberExpression | JS3Import | JS3MemberExpression | Identifier | Super | V8IntrinsicIdentifier | JS3FunctionExpression | JS3ArrowFunctionExpression | JS3AwaitExpression;
export type JS3CallExpression_arguments = Array < JS3ContainedExprKey | JS3CallExpression | JS3SpreadElement >;
export type JS3CallExpression_typeArguments = null;
export type JS3CallExpression_typeParameters = null;
export type JS3CatchClause_body = JS3BlockStatement;
export type JS3ContinueStatement_label = Identifier | null;
export type JS3DoWhileStatement_test = JS3ContainedExprKey;
export type JS3DoWhileStatement_body = JS3BlockStatement;
export type JS3ExpressionStatement_expression = JS3AssignmentExpression | JS3CallExpression | Identifier;
export type JS3File_program = JS3Program;
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
export type JS3FunctionDeclaration_predicate = undefined | null;
export type JS3FunctionDeclaration_returnType = undefined | null;
export type JS3FunctionDeclaration_typeParameters = undefined | null;
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
export type JS3Program_body = Array< JS3AllowedProgStatement >;
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
export type JS3VariableDeclarator_id = JS3VarDeclLVal;
export type JS3VariableDeclarator_init = null | undefined | JS3AssnInit;
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
export type JS3ExportDefaultDeclaration_declaration = Identifier;
export type JS3ExportNamedDeclaration_declaration = JS3VariableDeclaration | null;
export type JS3ExportNamedDeclaration_specifiers = Array<JS3ExportSpecifier | JS3ExportNamespaceSpecifier>;
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
export type JS3AwaitExpression_argument = JS3RegExpLiteral | JS3ContainedExprKey | JS3ArrowFunctionExpression | Identifier;
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
  js3type: "JS3ArrayExpression";
}

// @ts-ignore
export function isJS3ArrayExpression(node: any): node is JS3ArrayExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3ArrayExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3AssignmentExpression extends AssignmentExpression {
  left: JS3AssignmentExpression_left;
  right: JS3AssignmentExpression_right;
  js3type: "JS3AssignmentExpression";
}

// @ts-ignore
export function isJS3AssignmentExpression(node: any): node is JS3AssignmentExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3AssignmentExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3BinaryExpression extends BinaryExpression {
  left: JS3BinaryExpression_left;
  right: JS3BinaryExpression_right;
  js3type: "JS3BinaryExpression";
}

// @ts-ignore
export function isJS3BinaryExpression(node: any): node is JS3BinaryExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3BinaryExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3BlockStatement extends BlockStatement {
  body: JS3BlockStatement_body;
  js3type: "JS3BlockStatement";
}

// @ts-ignore
export function isJS3BlockStatement(node: any): node is JS3BlockStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3BlockStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3BreakStatement extends BreakStatement {
  label: JS3BreakStatement_label;
  js3type: "JS3BreakStatement";
}

// @ts-ignore
export function isJS3BreakStatement(node: any): node is JS3BreakStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3BreakStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3CallExpression extends CallExpression {
  callee: JS3CallExpression_callee;
  arguments: JS3CallExpression_arguments;
  typeArguments: JS3CallExpression_typeArguments;
  typeParameters: JS3CallExpression_typeParameters;
  js3type: "JS3CallExpression";
}

// @ts-ignore
export function isJS3CallExpression(node: any): node is JS3CallExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3CallExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3CatchClause extends CatchClause {
  body: JS3CatchClause_body;
  js3type: "JS3CatchClause";
}

// @ts-ignore
export function isJS3CatchClause(node: any): node is JS3CatchClause {
  // @ts-ignore
  if (node && node.js3type === "JS3CatchClause") return true;
  return false;
}

// @ts-ignore
export interface JS3ContinueStatement extends ContinueStatement {
  label: JS3ContinueStatement_label;
  js3type: "JS3ContinueStatement";
}

// @ts-ignore
export function isJS3ContinueStatement(node: any): node is JS3ContinueStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ContinueStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3DoWhileStatement extends DoWhileStatement {
  test: JS3DoWhileStatement_test;
  body: JS3DoWhileStatement_body;
  js3type: "JS3DoWhileStatement";
}

// @ts-ignore
export function isJS3DoWhileStatement(node: any): node is JS3DoWhileStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3DoWhileStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3EmptyStatement extends EmptyStatement {
  js3type: "JS3EmptyStatement";
}

// @ts-ignore
export function isJS3EmptyStatement(node: any): node is JS3EmptyStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3EmptyStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3ExpressionStatement extends ExpressionStatement {
  expression: JS3ExpressionStatement_expression;
  js3type: "JS3ExpressionStatement";
}

// @ts-ignore
export function isJS3ExpressionStatement(node: any): node is JS3ExpressionStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ExpressionStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3File extends File {
  program: JS3File_program;
  js3type: "JS3File";
}

// @ts-ignore
export function isJS3File(node: any): node is JS3File {
  // @ts-ignore
  if (node && node.js3type === "JS3File") return true;
  return false;
}

// @ts-ignore
export interface JS3ForInStatement extends ForInStatement {
  left: JS3ForInStatement_left;
  right: JS3ForInStatement_right;
  body: JS3ForInStatement_body;
  js3type: "JS3ForInStatement";
}

// @ts-ignore
export function isJS3ForInStatement(node: any): node is JS3ForInStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ForInStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3ForStatement extends ForStatement {
  init: JS3ForStatement_init;
  test: JS3ForStatement_test;
  update: JS3ForStatement_update;
  body: JS3ForStatement_body;
  js3type: "JS3ForStatement";
}

// @ts-ignore
export function isJS3ForStatement(node: any): node is JS3ForStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ForStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3FunctionDeclaration extends FunctionDeclaration {
  id: JS3FunctionDeclaration_id;
  params: JS3FunctionDeclaration_params;
  body: JS3FunctionDeclaration_body;
  predicate: JS3FunctionDeclaration_predicate;
  returnType: JS3FunctionDeclaration_returnType;
  typeParameters: JS3FunctionDeclaration_typeParameters;
  js3type: "JS3FunctionDeclaration";
}

// @ts-ignore
export function isJS3FunctionDeclaration(node: any): node is JS3FunctionDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3FunctionDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3FunctionExpression extends FunctionExpression {
  id: JS3FunctionExpression_id;
  params: JS3FunctionExpression_params;
  body: JS3FunctionExpression_body;
  predicate: JS3FunctionExpression_predicate;
  returnType: JS3FunctionExpression_returnType;
  typeParameters: JS3FunctionExpression_typeParameters;
  js3type: "JS3FunctionExpression";
}

// @ts-ignore
export function isJS3FunctionExpression(node: any): node is JS3FunctionExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3FunctionExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3IfStatement extends IfStatement {
  test: JS3IfStatement_test;
  consequent: JS3IfStatement_consequent;
  alternate: JS3IfStatement_alternate;
  js3type: "JS3IfStatement";
}

// @ts-ignore
export function isJS3IfStatement(node: any): node is JS3IfStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3IfStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3LabeledStatement extends LabeledStatement {
  body: JS3LabeledStatement_body;
  js3type: "JS3LabeledStatement";
}

// @ts-ignore
export function isJS3LabeledStatement(node: any): node is JS3LabeledStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3LabeledStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3RegExpLiteral extends RegExpLiteral {
  js3type: "JS3RegExpLiteral";
}

// @ts-ignore
export function isJS3RegExpLiteral(node: any): node is JS3RegExpLiteral {
  // @ts-ignore
  if (node && node.js3type === "JS3RegExpLiteral") return true;
  return false;
}

// @ts-ignore
export interface JS3LogicalExpression extends LogicalExpression {
  left: JS3LogicalExpression_left;
  right: JS3LogicalExpression_right;
  js3type: "JS3LogicalExpression";
}

// @ts-ignore
export function isJS3LogicalExpression(node: any): node is JS3LogicalExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3LogicalExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3MemberExpression extends MemberExpression {
  object: JS3MemberExpression_object;
  property: JS3MemberExpression_property;
  js3type: "JS3MemberExpression";
}

// @ts-ignore
export function isJS3MemberExpression(node: any): node is JS3MemberExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3MemberExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3NewExpression extends NewExpression {
  callee: JS3NewExpression_callee;
  arguments: JS3NewExpression_arguments;
  typeArguments: JS3NewExpression_typeArguments;
  typeParameters: JS3NewExpression_typeParameters;
  js3type: "JS3NewExpression";
}

// @ts-ignore
export function isJS3NewExpression(node: any): node is JS3NewExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3NewExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3Program extends Program {
  body: JS3Program_body;
  js3type: "JS3Program";
}

// @ts-ignore
export function isJS3Program(node: any): node is JS3Program {
  // @ts-ignore
  if (node && node.js3type === "JS3Program") return true;
  return false;
}

// @ts-ignore
export interface JS3ObjectExpression extends ObjectExpression {
  properties: JS3ObjectExpression_properties;
  js3type: "JS3ObjectExpression";
}

// @ts-ignore
export function isJS3ObjectExpression(node: any): node is JS3ObjectExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3ObjectExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3ObjectMethod extends ObjectMethod {
  key: JS3ObjectMethod_key;
  params: JS3ObjectMethod_params;
  body: JS3ObjectMethod_body;
  decorators: JS3ObjectMethod_decorators;
  returnType: JS3ObjectMethod_returnType;
  typeParameters: JS3ObjectMethod_typeParameters;
  js3type: "JS3ObjectMethod";
}

// @ts-ignore
export function isJS3ObjectMethod(node: any): node is JS3ObjectMethod {
  // @ts-ignore
  if (node && node.js3type === "JS3ObjectMethod") return true;
  return false;
}

// @ts-ignore
export interface JS3ObjectProperty extends ObjectProperty {
  key: JS3ObjectProperty_key;
  value: JS3ObjectProperty_value;
  decorators: JS3ObjectProperty_decorators;
  js3type: "JS3ObjectProperty";
}

// @ts-ignore
export function isJS3ObjectProperty(node: any): node is JS3ObjectProperty {
  // @ts-ignore
  if (node && node.js3type === "JS3ObjectProperty") return true;
  return false;
}

// @ts-ignore
export interface JS3ReturnStatement extends ReturnStatement {
  argument: JS3ReturnStatement_argument;
  js3type: "JS3ReturnStatement";
}

// @ts-ignore
export function isJS3ReturnStatement(node: any): node is JS3ReturnStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ReturnStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3SequenceExpression extends SequenceExpression {
  expressions: JS3SequenceExpression_expressions;
  js3type: "JS3SequenceExpression";
}

// @ts-ignore
export function isJS3SequenceExpression(node: any): node is JS3SequenceExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3SequenceExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3SwitchCase extends SwitchCase {
  test: JS3SwitchCase_test;
  consequent: JS3SwitchCase_consequent;
  js3type: "JS3SwitchCase";
}

// @ts-ignore
export function isJS3SwitchCase(node: any): node is JS3SwitchCase {
  // @ts-ignore
  if (node && node.js3type === "JS3SwitchCase") return true;
  return false;
}

// @ts-ignore
export interface JS3SwitchStatement extends SwitchStatement {
  discriminant: JS3SwitchStatement_discriminant;
  cases: JS3SwitchStatement_cases;
  js3type: "JS3SwitchStatement";
}

// @ts-ignore
export function isJS3SwitchStatement(node: any): node is JS3SwitchStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3SwitchStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3ThrowStatement extends ThrowStatement {
  argument: JS3ThrowStatement_argument;
  js3type: "JS3ThrowStatement";
}

// @ts-ignore
export function isJS3ThrowStatement(node: any): node is JS3ThrowStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ThrowStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3TryStatement extends TryStatement {
  block: JS3TryStatement_block;
  handler: JS3TryStatement_handler;
  finalizer: JS3TryStatement_finalizer;
  js3type: "JS3TryStatement";
}

// @ts-ignore
export function isJS3TryStatement(node: any): node is JS3TryStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3TryStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3UnaryExpression extends UnaryExpression {
  argument: JS3UnaryExpression_argument;
  js3type: "JS3UnaryExpression";
}

// @ts-ignore
export function isJS3UnaryExpression(node: any): node is JS3UnaryExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3UnaryExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3UpdateExpression extends UpdateExpression {
  argument: JS3UpdateExpression_argument;
  js3type: "JS3UpdateExpression";
}

// @ts-ignore
export function isJS3UpdateExpression(node: any): node is JS3UpdateExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3UpdateExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3VariableDeclaration extends VariableDeclaration {
  declarations: JS3VariableDeclaration_declarations;
  js3type: "JS3VariableDeclaration";
}

// @ts-ignore
export function isJS3VariableDeclaration(node: any): node is JS3VariableDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3VariableDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3VariableDeclarator extends VariableDeclarator {
  id: JS3VariableDeclarator_id;
  init: JS3VariableDeclarator_init;
  js3type: "JS3VariableDeclarator";
}

// @ts-ignore
export function isJS3VariableDeclarator(node: any): node is JS3VariableDeclarator {
  // @ts-ignore
  if (node && node.js3type === "JS3VariableDeclarator") return true;
  return false;
}

// @ts-ignore
export interface JS3WhileStatement extends WhileStatement {
  test: JS3WhileStatement_test;
  body: JS3WhileStatement_body;
  js3type: "JS3WhileStatement";
}

// @ts-ignore
export function isJS3WhileStatement(node: any): node is JS3WhileStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3WhileStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3WithStatement extends WithStatement {
  object: JS3WithStatement_object;
  body: JS3WithStatement_body;
  js3type: "JS3WithStatement";
}

// @ts-ignore
export function isJS3WithStatement(node: any): node is JS3WithStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3WithStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3ArrowFunctionExpression extends ArrowFunctionExpression {
  params: JS3ArrowFunctionExpression_params;
  body: JS3ArrowFunctionExpression_body;
  predicate: JS3ArrowFunctionExpression_predicate;
  returnType: JS3ArrowFunctionExpression_returnType;
  typeParameters: JS3ArrowFunctionExpression_typeParameters;
  js3type: "JS3ArrowFunctionExpression";
}

// @ts-ignore
export function isJS3ArrowFunctionExpression(node: any): node is JS3ArrowFunctionExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3ArrowFunctionExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3ClassBody extends ClassBody {
  body: JS3ClassBody_body;
  js3type: "JS3ClassBody";
}

// @ts-ignore
export function isJS3ClassBody(node: any): node is JS3ClassBody {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassBody") return true;
  return false;
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
  js3type: "JS3ClassExpression";
}

// @ts-ignore
export function isJS3ClassExpression(node: any): node is JS3ClassExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassExpression") return true;
  return false;
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
  js3type: "JS3ClassDeclaration";
}

// @ts-ignore
export function isJS3ClassDeclaration(node: any): node is JS3ClassDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3ExportAllDeclaration extends ExportAllDeclaration {
  assertions: JS3ExportAllDeclaration_assertions;
  attributes: JS3ExportAllDeclaration_attributes;
  js3type: "JS3ExportAllDeclaration";
}

// @ts-ignore
export function isJS3ExportAllDeclaration(node: any): node is JS3ExportAllDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3ExportAllDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3ExportDefaultDeclaration extends ExportDefaultDeclaration {
  declaration: JS3ExportDefaultDeclaration_declaration;
  js3type: "JS3ExportDefaultDeclaration";
}

// @ts-ignore
export function isJS3ExportDefaultDeclaration(node: any): node is JS3ExportDefaultDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3ExportDefaultDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3ExportNamedDeclaration extends ExportNamedDeclaration {
  declaration: JS3ExportNamedDeclaration_declaration;
  specifiers: JS3ExportNamedDeclaration_specifiers;
  assertions: JS3ExportNamedDeclaration_assertions;
  attributes: JS3ExportNamedDeclaration_attributes;
  js3type: "JS3ExportNamedDeclaration";
}

// @ts-ignore
export function isJS3ExportNamedDeclaration(node: any): node is JS3ExportNamedDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3ExportNamedDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3ExportSpecifier extends ExportSpecifier {
  js3type: "JS3ExportSpecifier";
}

// @ts-ignore
export function isJS3ExportSpecifier(node: any): node is JS3ExportSpecifier {
  // @ts-ignore
  if (node && node.js3type === "JS3ExportSpecifier") return true;
  return false;
}

// @ts-ignore
export interface JS3ForOfStatement extends ForOfStatement {
  left: JS3ForOfStatement_left;
  right: JS3ForOfStatement_right;
  body: JS3ForOfStatement_body;
  js3type: "JS3ForOfStatement";
}

// @ts-ignore
export function isJS3ForOfStatement(node: any): node is JS3ForOfStatement {
  // @ts-ignore
  if (node && node.js3type === "JS3ForOfStatement") return true;
  return false;
}

// @ts-ignore
export interface JS3ImportDeclaration extends ImportDeclaration {
  specifiers: JS3ImportDeclaration_specifiers;
  assertions: JS3ImportDeclaration_assertions;
  attributes: JS3ImportDeclaration_attributes;
  js3type: "JS3ImportDeclaration";
}

// @ts-ignore
export function isJS3ImportDeclaration(node: any): node is JS3ImportDeclaration {
  // @ts-ignore
  if (node && node.js3type === "JS3ImportDeclaration") return true;
  return false;
}

// @ts-ignore
export interface JS3ImportExpression extends ImportExpression {
  source: JS3ImportExpression_source;
  options: JS3ImportExpression_options;
  js3type: "JS3ImportExpression";
}

// @ts-ignore
export function isJS3ImportExpression(node: any): node is JS3ImportExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3ImportExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3MetaProperty extends MetaProperty {
  js3type: "JS3MetaProperty";
}

// @ts-ignore
export function isJS3MetaProperty(node: any): node is JS3MetaProperty {
  // @ts-ignore
  if (node && node.js3type === "JS3MetaProperty") return true;
  return false;
}

// @ts-ignore
export interface JS3ClassMethod extends ClassMethod {
  key: JS3ClassMethod_key;
  params: JS3ClassMethod_params;
  body: JS3ClassMethod_body;
  decorators: JS3ClassMethod_decorators;
  returnType: JS3ClassMethod_returnType;
  typeParameters: JS3ClassMethod_typeParameters;
  js3type: "JS3ClassMethod";
}

// @ts-ignore
export function isJS3ClassMethod(node: any): node is JS3ClassMethod {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassMethod") return true;
  return false;
}

// @ts-ignore
export interface JS3SpreadElement extends SpreadElement {
  argument: JS3SpreadElement_argument;
  js3type: "JS3SpreadElement";
}

// @ts-ignore
export function isJS3SpreadElement(node: any): node is JS3SpreadElement {
  // @ts-ignore
  if (node && node.js3type === "JS3SpreadElement") return true;
  return false;
}

// @ts-ignore
export interface JS3TaggedTemplateExpression extends TaggedTemplateExpression {
  tag: JS3TaggedTemplateExpression_tag;
  quasi: JS3TaggedTemplateExpression_quasi;
  typeParameters: JS3TaggedTemplateExpression_typeParameters;
  js3type: "JS3TaggedTemplateExpression";
}

// @ts-ignore
export function isJS3TaggedTemplateExpression(node: any): node is JS3TaggedTemplateExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3TaggedTemplateExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3TemplateLiteral extends TemplateLiteral {
  quasis: JS3TemplateLiteral_quasis;
  expressions: JS3TemplateLiteral_expressions;
  js3type: "JS3TemplateLiteral";
}

// @ts-ignore
export function isJS3TemplateLiteral(node: any): node is JS3TemplateLiteral {
  // @ts-ignore
  if (node && node.js3type === "JS3TemplateLiteral") return true;
  return false;
}

// @ts-ignore
export interface JS3YieldExpression extends YieldExpression {
  argument: JS3YieldExpression_argument;
  js3type: "JS3YieldExpression";
}

// @ts-ignore
export function isJS3YieldExpression(node: any): node is JS3YieldExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3YieldExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3AwaitExpression extends AwaitExpression {
  argument: JS3AwaitExpression_argument;
  js3type: "JS3AwaitExpression";
}

// @ts-ignore
export function isJS3AwaitExpression(node: any): node is JS3AwaitExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3AwaitExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3Import extends Import {
  js3type: "JS3Import";
}

// @ts-ignore
export function isJS3Import(node: any): node is JS3Import {
  // @ts-ignore
  if (node && node.js3type === "JS3Import") return true;
  return false;
}

// @ts-ignore
export interface JS3ExportNamespaceSpecifier extends ExportNamespaceSpecifier {
  js3type: "JS3ExportNamespaceSpecifier";
}

// @ts-ignore
export function isJS3ExportNamespaceSpecifier(node: any): node is JS3ExportNamespaceSpecifier {
  // @ts-ignore
  if (node && node.js3type === "JS3ExportNamespaceSpecifier") return true;
  return false;
}

// @ts-ignore
export interface JS3OptionalMemberExpression extends OptionalMemberExpression {
  object: JS3OptionalMemberExpression_object;
  property: JS3OptionalMemberExpression_property;
  js3type: "JS3OptionalMemberExpression";
}

// @ts-ignore
export function isJS3OptionalMemberExpression(node: any): node is JS3OptionalMemberExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3OptionalMemberExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3OptionalCallExpression extends OptionalCallExpression {
  callee: JS3OptionalCallExpression_callee;
  arguments: JS3OptionalCallExpression_arguments;
  typeArguments: JS3OptionalCallExpression_typeArguments;
  typeParameters: JS3OptionalCallExpression_typeParameters;
  js3type: "JS3OptionalCallExpression";
}

// @ts-ignore
export function isJS3OptionalCallExpression(node: any): node is JS3OptionalCallExpression {
  // @ts-ignore
  if (node && node.js3type === "JS3OptionalCallExpression") return true;
  return false;
}

// @ts-ignore
export interface JS3ClassProperty extends ClassProperty {
  key: JS3ClassProperty_key;
  value: JS3ClassProperty_value;
  typeAnnotation: JS3ClassProperty_typeAnnotation;
  decorators: JS3ClassProperty_decorators;
  variance: JS3ClassProperty_variance;
  js3type: "JS3ClassProperty";
}

// @ts-ignore
export function isJS3ClassProperty(node: any): node is JS3ClassProperty {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassProperty") return true;
  return false;
}

// @ts-ignore
export interface JS3ClassPrivateProperty extends ClassPrivateProperty {
  value: JS3ClassPrivateProperty_value;
  decorators: JS3ClassPrivateProperty_decorators;
  typeAnnotation: JS3ClassPrivateProperty_typeAnnotation;
  variance: JS3ClassPrivateProperty_variance;
  js3type: "JS3ClassPrivateProperty";
}

// @ts-ignore
export function isJS3ClassPrivateProperty(node: any): node is JS3ClassPrivateProperty {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassPrivateProperty") return true;
  return false;
}

// @ts-ignore
export interface JS3ClassPrivateMethod extends ClassPrivateMethod {
  params: JS3ClassPrivateMethod_params;
  body: JS3ClassPrivateMethod_body;
  decorators: JS3ClassPrivateMethod_decorators;
  returnType: JS3ClassPrivateMethod_returnType;
  typeParameters: JS3ClassPrivateMethod_typeParameters;
  js3type: "JS3ClassPrivateMethod";
}

// @ts-ignore
export function isJS3ClassPrivateMethod(node: any): node is JS3ClassPrivateMethod {
  // @ts-ignore
  if (node && node.js3type === "JS3ClassPrivateMethod") return true;
  return false;
}

// @ts-ignore
export interface JS3PrivateName extends PrivateName {
  js3type: "JS3PrivateName";
}

// @ts-ignore
export function isJS3PrivateName(node: any): node is JS3PrivateName {
  // @ts-ignore
  if (node && node.js3type === "JS3PrivateName") return true;
  return false;
}

// @ts-ignore
export interface JS3StaticBlock extends StaticBlock {
  body: JS3StaticBlock_body;
  js3type: "JS3StaticBlock";
}

// @ts-ignore
export function isJS3StaticBlock(node: any): node is JS3StaticBlock {
  // @ts-ignore
  if (node && node.js3type === "JS3StaticBlock") return true;
  return false;
}

