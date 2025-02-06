import debugConfig from '#debugConfig';
import { printScopedSpace } from "#utils";
import { JS3AssnInit, JS3ForInStatement, JS3ForOfStatement } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../ALL_AMP/ALL_AMP.ts";
import { IRIDIUM_FG } from "../IRIDIUM.ts";

type IRI_ASSN_TYPE = t_IV_Literals 
                   | t_IV_Regexp 
                   | t_IV_Templates 
                   | t_IV_Call
                   | t_IV_META
                   | t_IV_YIELD_AWAIT
                   | t_IV_THISEXPRESSION
                   | t_IV_BINOP
                   | t_IV_ASSN
                   | t_IV_NonLang
                   | t_IV_ObjectExpression
                   | t_IV_ArrayExpression
                   | t_IV_ConditionalExpression
                   | t_IV_FunctionExpression
                   | t_IV_ArrowFunctionExpression
                   | t_IV_NewExpression
                   | t_IV_UnaryExpression
                   | t_IV_UpdateExpression
                   | t_IV_ClassExpression
                   | t_IV_ForIterators
                   | t_IV_JSX


type t_IV_Literals = "DecimalLiteral" | "BigIntLiteral" | "StringLiteral" | "NumericLiteral" | "NullLiteral" | "BooleanLiteral"
type t_IV_Regexp = "Regexp"
type t_IV_Templates = "TemplateLiteral" | "TaggedTemplateCall"
type t_IV_Call = "ImportCall" | "Call" | "SuperCall" | "V8IntrinsicCall" 

type t_IV_META = "ModuleMeta" | "NewTarget"
type t_IV_YIELD_AWAIT = "YieldExpression" | "AwaitExpression"
type t_IV_THISEXPRESSION = "ThisExpression"

type t_IV_BINOP = "ArtihOP" | "BitwiseOP" | "CheckOP" | "PropCheckOP" | "NarrowingOP" | "CompOP"
type t_IV_ASSN = "SimpleAssn" | "MemberAssn" | "ThisAssn" | "SuperAssn" | "ArrPatAssn" | "ObjPatAssn"

type t_IV_ObjectExpression = "ObjectExpression"
type t_IV_ArrayExpression = "ArrayExpression"

type t_IV_NonLang = "NUBD" | "CTHIS" | "STHIS"

type t_IV_ConditionalExpression = "ConditionalExpression"
type t_IV_FunctionExpression = "FunctionExpression"
type t_IV_ArrowFunctionExpression = "ArrowFunctionExpression"

type t_IV_NewExpression = "NewExpression"

type t_IV_UnaryExpression = "UArtihOP" | "UVoidOP" | "UTypeOP" | "UDelOP"

type t_IV_UpdateExpression = "UpdateExpression"

type t_IV_ClassExpression = "ClassExpression"

type t_IV_ForIterators = "ForInIterator" | "ForOfIterator" | "LoopNext" | "HasLoopNext"

type t_IV_JSX = "PJSX" | "JSX" | "FJSX"

export class ALL_RVal {
  node : JS3AssnInit | JS3ForInStatement | JS3ForOfStatement | undefined
  type : IRI_ASSN_TYPE
  constructor(node: JS3AssnInit | JS3ForInStatement | JS3ForOfStatement | undefined, type: IRI_ASSN_TYPE) {
    this.node = node
    this.type = type
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return undefined }

  definedIdentifiers() : Set<string> { return new Set() }
  usedIdentifiers() : Set<string> { return new Set() }

  toString(space = 0) {
    if (this.node) {
      return `${printScopedSpace(space)}RVAL_TODO(${this.node.type})`; 
    }
    return `${printScopedSpace(space)}RVAL_TODO(UKN)`;
  }

  toDOT(space = 0) {
    debugConfig.logger.throwIriError("ALL_RVal: toDOT not implemented")
  }
}

export type IV_ASSIGNABLE = ALL_RVal 
                          | IV_Identifier 
                          | IV_MemberExpressionPA 
                          | IV_ThisLookupPA 
                          | IV_SuperLookupPA