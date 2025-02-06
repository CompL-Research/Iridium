import debugConfig from "#debugConfig"
import { printScopedSpace } from "#utils"
import { JS3FunctionExpression, JS3JSXCallExpression } from "classes/builder/JS3Helpers/JS3Types.ts"
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts"
import { I_Function } from "../I_GENERAL/I_Function.ts"
import { IRIDIUM_FG } from "../IRIDIUM.ts"
import { ISP_RestElement } from "./ALL_ISP.ts"
import { ALL_RVal } from "./ALL_RVal.ts"
import { IV_StringLiteral } from "./IV_Literals.ts"

export const PRIMITIVE_TAGS = [
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", 
  "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption", 
  "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", 
  "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", 
  "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", 
  "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", 
  "kbd", "label", "legend", "li", "link", "main", "map", "mark", "meta", 
  "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", 
  "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", 
  "samp", "script", "section", "select", "small", "source", "span", "strong", 
  "style", "sub", "summary", "sup", "table", "tbody", "td", "template", "textarea", 
  "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", 
  "video", "wbr"
];

export class IV_PJSX extends ALL_RVal {
  tag: IV_StringLiteral
  props: IV_Identifier
  children: Array<IV_Identifier>

  constructor(node: JS3JSXCallExpression | undefined = undefined, tag: IV_StringLiteral, props: IV_Identifier, children: Array<IV_Identifier>) {
    super(node, "PJSX");
    if (!PRIMITIVE_TAGS.includes(tag.value)) debugConfig.logger.throwIriError("Non Primitive JSX String Literal tag");
    this.tag = tag;
    this.props = props
    this.children = children    
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return [] }

  toString(space = 0) {
    return `<PJSX> ${this.tag.value} Props: [${this.props.toString()}] Children: [${this.children.map(p => p.toString()).join(",")}]`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_JSX extends ALL_RVal {
  tag: IV_Identifier
  props: IV_Identifier
  children: Array<IV_Identifier>

  constructor(node: JS3JSXCallExpression | undefined = undefined, tag: IV_Identifier, props: IV_Identifier, children: Array<IV_Identifier>) {
    super(node, "JSX");
    this.tag = tag;
    this.props = props
    this.children = children    
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return [] }

  toString(space = 0) {
    return `<JSX> ${this.tag.toString()} Props: [${this.props.toString()}] Children: [${this.children.map(p => p.toString()).join(",")}]`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_FJSX extends ALL_RVal {
  children: Array<IV_Identifier>

  constructor(node: JS3JSXCallExpression | undefined = undefined, children: Array<IV_Identifier>) {
    super(node, "FJSX");
    this.children = children    
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return [] }

  toString(space = 0) {
    return `<FJSX> Children: [${this.children.map(p => p.toString()).join(",")}]`
  }

  toDOT(space = 0) {
    return this.toString()
  }
}
