import { JS3AssnInit } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../ALL_AMP/ALL_AMP.ts";
import { printScopedSpace } from "../IRIDIUM.ts";

type IRI_ASSN_TYPE = IV_Literals 
                   | IV_Regexp 
                   | IV_Templates 
                   | IV_Call
                   | IV_META
                   | IV_YIELD_AWAIT
                   | IV_THISEXPRESSION
                   | IV_BINOP
                   | IV_ASSN

type IV_Literals = "DecimalLiteral" | "BigIntLiteral" | "StringLiteral" | "NumericLiteral" | "NullLiteral" | "BooleanLiteral"
type IV_Regexp = "Regexp"
type IV_Templates = "TemplateLiteral" | "TaggedTemplateCall"
type IV_Call = "ImportCall" | "Call" | "SuperCall" | "V8IntrinsicCall" 

type IV_META = "ModuleMeta" | "NewTarget"
type IV_YIELD_AWAIT = "YieldExpression" | "AwaitExpression"
type IV_THISEXPRESSION = "ThisExpression"

type IV_BINOP = "ArtihOP" | "BitwiseOP" | "CheckOP" | "PropCheckOP" | "NarrowingOP" | "CompOP"
type IV_ASSN = "SimpleAssn" | "MemberAssn" | "ThisAssn" | "SuperAssn" | "ArrPatAssn" | "ObjPatAssn"

export class ALL_RVal {
  node : JS3AssnInit | undefined
  type : IRI_ASSN_TYPE
  constructor(node: JS3AssnInit | undefined, type: IRI_ASSN_TYPE) {
    this.node = node
    this.type = type
  }

  toString(space = 0) {
    if (this.node) {
      return `${printScopedSpace(space)}RVAL_TODO(${this.node.type})`; 
    }
    return `${printScopedSpace(space)}RVAL_TODO(UKN)`;
  }
}

export type IV_ASSIGNABLE = ALL_RVal 
                          | IV_Identifier 
                          | IV_MemberExpressionPA 
                          | IV_ThisLookupPA 
                          | IV_SuperLookupPA