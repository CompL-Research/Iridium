import { JS3AssnInit } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpression, IV_SuperLookup, IV_ThisLookup } from "../ALL_AMP/ALL_AMP.ts";
import { printScopedSpace } from "../IRIDIUM.ts";

type IRI_ASSN_TYPE = IV_Literals 
                   | IV_Regexp 
                   | IV_Templates 

type IV_Literals = "DecimalLiteral" | "BigIntLiteral" | "StringLiteral" | "NumericLiteral" | "NullLiteral" | "BooleanLiteral"
type IV_Regexp = "Regexp"
type IV_Templates = "TemplateLiteral" | "TaggedTemplateCall"



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
                          | IV_MemberExpression 
                          | IV_ThisLookup 
                          | IV_SuperLookup