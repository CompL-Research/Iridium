import { TemplateElement } from "@babel/types";
import { JS3TaggedTemplateExpression, JS3TemplateLiteral } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier, IV_MemberExpressionPA, IV_SuperLookupPA, IV_ThisLookupPA } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { ISP_Super } from "./ALL_ISP.ts";
import { IV_This } from "./IV_This.ts";

export class IV_TemplateLiteral extends ALL_RVal {
  quasis: Array<TemplateElement>
  expressions: Array<IV_Identifier>
  
  constructor(node: JS3TemplateLiteral | undefined = undefined, pattern: Array<TemplateElement>, flags: Array<IV_Identifier>) {
    super(node, "TemplateLiteral");
    this.quasis = pattern
    this.expressions   = flags
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    this.expressions.forEach(i => res.add(i.lookupName()))
    return res;
  }

  static from(node: JS3TemplateLiteral) {
    let quasis : Array<TemplateElement> = node.quasis
    let expressions : Array<IV_Identifier> = []

    for (let e of node.expressions) {
      expressions.push(new IV_Identifier(e, e.name))
    }

    return new IV_TemplateLiteral(node, quasis, expressions)
  }

  toString() {
    let quasis = []

    for(let q of this.quasis) {
      quasis.push(`"${q.value.raw}"`)
    }

    let expressions = []

    for(let e of this.expressions) {
      expressions.push(e.name)
    }

    return `<${this.type}> [${quasis.join(",")}] [${expressions.join(",")}]`
  }

  toDOT() {
    return this.toString()
  }
}

export class IV_TaggedTemplateCall extends ALL_RVal {
  tag: IV_Identifier | IV_MemberExpressionPA | IV_SuperLookupPA | IV_ThisLookupPA
  template: IV_TemplateLiteral
  
  constructor(node: JS3TaggedTemplateExpression | undefined = undefined, tag: IV_Identifier | IV_MemberExpressionPA | IV_SuperLookupPA | IV_ThisLookupPA, template: IV_TemplateLiteral) {
    super(node, "TaggedTemplateCall");
    this.tag = tag
    this.template = template
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = this.template.usedIdentifiers();
    if (this.tag instanceof IV_MemberExpressionPA) res.add(this.tag.object.lookupName())
    else if (this.tag instanceof IV_SuperLookupPA) res.add(ISP_Super.lookupName())
    else if (this.tag instanceof IV_ThisLookupPA) res.add(IV_This.lookupName())
    else res.add(this.tag.lookupName())
    return res;
  }

  toString() {
    return `<TaggedCall> ${this.tag.toString()}(${this.template.toString()})`
  }

  toDOT() {
    return this.toString()
  }
}
