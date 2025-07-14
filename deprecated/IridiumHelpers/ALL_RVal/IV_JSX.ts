import debugConfig from "#debugConfig";
import { JS3JSXCallExpression } from "classes/builder/JS3Helpers/JS3Types.ts";
import { IV_Identifier } from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal } from "./ALL_RVal.ts";
import { IV_StringLiteral } from "./IV_Literals.ts";
import { IRIDIUM_FG } from "../I_GENERAL/IRIDIUM_FG.ts";

export const PRIMITIVE_TAGS = [
  "!--...--", "!DOCTYPE", "a", "abbr", "acronym", "address", "applet", "area", "article", "aside", "audio",
  "b", "base", "basefont", "bdi", "bdo", "big", "blockquote", "body", "br", "button",
  "canvas", "caption", "center", "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del", "details", "dfn", "dialog", "dir", "div", "dl", "dt",
  "em", "embed",
  "fieldset", "figcaption", "figure", "font", "footer", "form", "frame", "frameset",
  "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html",
  "i", "iframe", "img", "input", "ins",
  "kbd", "keygen",
  "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter",
  "nav", "noframes", "noscript",
  "object", "ol", "optgroup", "option", "output",
  "p", "param", "picture", "pre", "progress",
  "q",
  "rp", "rt", "ruby",
  "s", "samp", "script", "section", "select", "small", "source", "span", "strike", "strong", "style", "sub", "summary", "sup",
  "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "tt",
  "u", "ul",
  "var", "video",
  "wbr"
];

export class IV_PJSX extends ALL_RVal {
  tag: IV_StringLiteral;
  props: IV_Identifier;
  children: Array<IV_Identifier>;

  constructor(
    node: JS3JSXCallExpression | undefined = undefined,
    tag: IV_StringLiteral,
    props: IV_Identifier,
    children: Array<IV_Identifier>,
  ) {
    super(node, "PJSX");
    if (!PRIMITIVE_TAGS.includes(tag.value))
      debugConfig.logger.throwIriError(
        `Non Primitive JSX String Literal tag: ${tag.value}`,
      );
    this.tag = tag;
    this.props = props;
    this.children = children;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toString(_space = 0) {
    return `<PJSX> ${this.tag.value} Props: [${this.props.toString()}] Children: [${this.children.map((p) => p.toString()).join(",")}]`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}

export class IV_JSX extends ALL_RVal {
  tag: IV_Identifier;
  props: IV_Identifier;
  children: Array<IV_Identifier>;

  constructor(
    node: JS3JSXCallExpression | undefined = undefined,
    tag: IV_Identifier | IV_StringLiteral,
    props: IV_Identifier,
    children: Array<IV_Identifier>,
  ) {
    super(node, "JSX");
    // if (tag instanceof IV_StringLiteral) debugConfig.logger.error(`Unexpected JSX tag ${tag.value}, casting to IV_Identifier and proceeding`);
    this.tag = tag instanceof IV_StringLiteral ? new IV_Identifier(undefined, tag.value) : tag;
    this.props = props;
    this.children = children;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toString(_space = 0) {
    return `<JSX> ${this.tag.toString()} Props: [${this.props.toString()}] Children: [${this.children.map((p) => p.toString()).join(",")}]`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}

export class IV_FJSX extends ALL_RVal {
  children: Array<IV_Identifier>;

  constructor(
    node: JS3JSXCallExpression | undefined = undefined,
    children: Array<IV_Identifier>,
  ) {
    super(node, "FJSX");
    this.children = children;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toString(_space = 0) {
    return `<FJSX> Children: [${this.children.map((p) => p.toString()).join(",")}]`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toDOT(_space = 0) {
    return this.toString();
  }
}
