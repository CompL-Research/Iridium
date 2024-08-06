import t, { Decorator, ClassMethod, ClassPrivateMethod, ClassProperty, ClassPrivateProperty, ClassAccessorProperty, TSDeclareMethod, TSIndexSignature, StaticBlock, ClassBody, TSDeclareFunction, FunctionDeclaration, ClassDeclaration, Expression, BooleanLiteral, CallExpression, ExportDefaultDeclaration, Identifier, ImportDeclaration, ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier, NullLiteral, NumericLiteral, StringLiteral, VariableDeclaration, VariableDeclarator, BigIntLiteral } from "@babel/types";

export const JS3_VERSION = "0.1"




export type JS3Statement = JS3ImportDeclaration | JS3VariableDeclaration | JS3ExportDefaultDeclaration

// 
// The Root of all eval ;O
// 

export interface JS3Program extends t.Program {
  body: Array<JS3Statement>;
  js3version: string
}

// 
// ClassDeclaration related
// 

export interface JS3ClassProperty extends ClassProperty {
  // key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral | Expression; // TODO: Incomplete
  key: Identifier | StringLiteral | NumericLiteral | BigIntLiteral;
  // value?: Expression | null; // TODO: Incomplete
  value: Identifier | null
  // typeAnnotation?: TypeAnnotation | TSTypeAnnotation | Noop | null; // TODO: Incomplete
  typeAnnotation?: null;
  // decorators?: Array<Decorator> | null; // TODO: Incomplete
  decorators?: null;
  // variance?: Variance | null;
  variance?: null;
}

export interface JS3ClassBody extends ClassBody {
  //   body: Array<ClassMethod | ClassPrivateMethod | ClassProperty | ClassPrivateProperty | ClassAccessorProperty | TSDeclareMethod | TSIndexSignature | StaticBlock>; // TODO: Incomplete
  body: Array<JS3ClassProperty>;
}


export interface JS3Decorator extends Decorator {
  expression: Identifier;
}

export interface JS3ClassDeclaration extends ClassDeclaration {
  superClass?: Identifier | null;
  body: JS3ClassBody;
  decorators?: Array<JS3Decorator> | null;
  // implements?: Array<TSExpressionWithTypeArguments | ClassImplements> | null; // TODO: Incomplete
  implements?: null
  // mixins?: InterfaceExtends | null; // TODO: Incomplete
  mixins?: null
  // superTypeParameters?: TypeParameterInstantiation | TSTypeParameterInstantiation | null; // TODO: Incomplete
  superTypeParameters?: null
  // typeParameters?: TypeParameterDeclaration | TSTypeParameterDeclaration | Noop | null; // TODO: Incomplete
  typeParameters?: null
}

// 
// ExportDefaultDeclaration related
// 

export interface JS3ExportDefaultDeclaration extends ExportDefaultDeclaration {
  // declaration: TSDeclareFunction | FunctionDeclaration | ClassDeclaration | Expression; // TODO: Incomplete
  declaration: JS3ClassDeclaration | Identifier;
}

// 
// CallExpression related
// 

export interface JS3CallExpression extends CallExpression {
  callee: Identifier;
  arguments: Array<Identifier>;
}

// 
// VariableDeclaration related
// 
export type JS3RVal = JS3CallExpression | Identifier | NumericLiteral | StringLiteral | NullLiteral | BooleanLiteral | null

export interface JS3VariableDeclarator extends VariableDeclarator {
  // init?: Expression | null; --> We compact the grammar here, so a declarator is always just an identifier
  init?: JS3RVal
}

export interface JS3VariableDeclaration extends VariableDeclaration {
  // declarations: Array<VariableDeclarator>;
  declarations: Array<JS3VariableDeclarator>; // This must be an array of length 1...
}


// 
// Imports related
// 

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