import t, { BooleanLiteral, CallExpression, Identifier, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, NullLiteral, NumericLiteral, StringLiteral, VariableDeclaration, VariableDeclarator } from "@babel/types";

export const JS3_VERSION = "0.1"


// https://stackoverflow.com/questions/41139763/how-to-declare-a-fixed-length-array-in-typescript
type LengthArray<
  T,
  N extends number,
  R extends T[] = []
> = number extends N
  ? T[]
  : R['length'] extends N
  ? R
  : LengthArray<T, N, [T, ...R]>;

// Dummies to help with programming, can also contain more data if we wish to add something laters
export interface JS3ImportDefaultSpecifier extends ImportDefaultSpecifier {}
export interface JS3ImportNamespaceSpecifier extends ImportNamespaceSpecifier {}
export interface JS3ImportSpecifier extends ImportSpecifier {}

type JS3ImportSpecifiers = JS3ImportDefaultSpecifier | JS3ImportNamespaceSpecifier | JS3ImportSpecifier

export interface JS3ImportDeclaration extends ImportDeclaration {
  // There is always just one specifier in JS3. Will try to enforce using the type system in the future...
  specifiers: Array<JS3ImportSpecifiers>, // I wanted to use the fancy, size one check type but it is making my life harder ;(
  js3version: string,
  resolvedPath: string | null
}

export type JS3Statement = JS3ImportDeclaration | JS3VariableDeclaration
// type Statement = BlockStatement | BreakStatement | ContinueStatement | DebuggerStatement | DoWhileStatement | EmptyStatement | ExpressionStatement | ForInStatement | ForStatement | FunctionDeclaration | IfStatement | LabeledStatement | ReturnStatement | SwitchStatement | ThrowStatement | TryStatement | VariableDeclaration | WhileStatement | WithStatement | ClassDeclaration | ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration | ForOfStatement | ImportDeclaration | DeclareClass | DeclareFunction | DeclareInterface | DeclareModule | DeclareModuleExports | DeclareTypeAlias | DeclareOpaqueType | DeclareVariable | DeclareExportDeclaration | DeclareExportAllDeclaration | InterfaceDeclaration | OpaqueType | TypeAlias | EnumDeclaration | TSDeclareFunction | TSInterfaceDeclaration | TSTypeAliasDeclaration | TSEnumDeclaration | TSModuleDeclaration | TSImportEqualsDeclaration | TSExportAssignment | TSNamespaceExportDeclaration;

// 
// Handled Expressions: Identifier | StringLiteral | NumericLiteral | NullLiteral | BooleanLiteral | CallExpression
// 
// type Expression = ArrayExpression | AssignmentExpression | BinaryExpression |  | ConditionalExpression | FunctionExpression |  |  |  |  |  | RegExpLiteral | LogicalExpression | MemberExpression | NewExpression | ObjectExpression | SequenceExpression | ParenthesizedExpression | ThisExpression | UnaryExpression | UpdateExpression | ArrowFunctionExpression | ClassExpression | ImportExpression | MetaProperty | Super | TaggedTemplateExpression | TemplateLiteral | YieldExpression | AwaitExpression | Import | BigIntLiteral | OptionalMemberExpression | OptionalCallExpression | TypeCastExpression | JSXElement | JSXFragment | BindExpression | DoExpression | RecordExpression | TupleExpression | DecimalLiteral | ModuleExpression | TopicReference | PipelineTopicExpression | PipelineBareFunction | PipelinePrimaryTopicReference | TSInstantiationExpression | TSAsExpression | TSSatisfiesExpression | TSTypeAssertion | TSNonNullExpression;

export interface JS3CallExpression extends CallExpression {
  callee: Identifier;
  arguments: Array<Identifier>;
}

export interface JS3Program extends t.Program {
  body: Array<JS3Statement>;
  js3version: string
}

export type JS3RVal = JS3CallExpression | Identifier | NumericLiteral | StringLiteral | NullLiteral | BooleanLiteral | null
// type LVal = Identifier | MemberExpression | RestElement | AssignmentPattern | ArrayPattern | ObjectPattern | TSParameterProperty | TSAsExpression | TSSatisfiesExpression | TSTypeAssertion | TSNonNullExpression;

export interface JS3VariableDeclarator extends VariableDeclarator {
  // id: LVal;
  // init?: Expression | null; --> We compact the grammar here, so a declarator is always just an identifier
  init?: JS3RVal
}

export interface JS3VariableDeclaration extends VariableDeclaration {
  // declarations: Array<VariableDeclarator>; --> We enforce 
  declarations: Array<JS3VariableDeclarator>; // This must be an array of length 1...
}
