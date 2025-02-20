import {
  isBigIntLiteral,
  isDecimalLiteral,
  isIdentifier,
  isNumericLiteral,
  isRestElement,
  isStringLiteral,
} from "@babel/types";
import {
  isJS3AssnObjectProperty,
  JS3ArrayPattern,
  JS3AssignmentExpression,
  JS3AssnObjectProperty_key,
  JS3ObjectPattern,
} from "classes/builder/JS3Helpers/JS3Types.ts";
import {
  IV_Identifier,
  IV_MemberExpressionPA,
  IV_SuperLookupPA,
  IV_ThisLookupPA,
} from "../ALL_AMP/ALL_AMP.ts";
import { ALL_RVal, IV_ASSIGNABLE } from "../ALL_RVal/ALL_RVal.ts";
import { IV_This } from "./IV_This.ts";
import { ISP_Super } from "./ALL_ISP.ts";
import { IRIDIUM_FG } from "../Passes/PTA/IRIDIUM_FG.ts";

export class IV_SimpleAssn extends ALL_RVal {
  LVal: IV_Identifier;
  RVal: IV_ASSIGNABLE;

  constructor(
    node: JS3AssignmentExpression | undefined = undefined,
    ID: IV_Identifier,
    RVal: IV_ASSIGNABLE,
  ) {
    super(node, "SimpleAssn");
    this.LVal = ID;
    this.RVal = RVal;
  }

  definedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    res.add(this.LVal.lookupName());
    return res;
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.lookupName());
    } else if (this.RVal instanceof IV_ThisLookupPA) {
      res.add(IV_This.lookupName());
    } else if (this.RVal instanceof IV_SuperLookupPA) {
      res.add(ISP_Super.lookupName());
    } else {
      res = this.RVal.usedIdentifiers();
    }
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.RVal.declaredClosure();
  }

  toString(space = 0) {
    return `${this.LVal.lookupName()} = ${this.RVal.toString(space + 2)}`;
  }

  toDOT(space = 0) {
    return `${this.LVal.lookupName()} = ${this.RVal.toDOT(space + 2)}`;
  }
}

export class IV_MemberAssn extends ALL_RVal {
  LVal: IV_MemberExpressionPA;
  RVal: IV_ASSIGNABLE;

  constructor(
    node: JS3AssignmentExpression | undefined = undefined,
    LVal: IV_MemberExpressionPA,
    RVal: IV_ASSIGNABLE,
  ) {
    super(node, "MemberAssn");
    this.LVal = LVal;
    this.RVal = RVal;
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.lookupName());
    } else if (this.RVal instanceof IV_ThisLookupPA) {
      res.add(IV_This.lookupName());
    } else if (this.RVal instanceof IV_SuperLookupPA) {
      res.add(ISP_Super.lookupName());
    } else {
      res = this.RVal.usedIdentifiers();
    }
    res.add(this.LVal.object.lookupName());
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.RVal.declaredClosure();
  }

  toString(space = 0) {
    return `${this.LVal.toString()} = ${this.RVal.toString(space + 2)}`;
  }

  toDOT(space = 0) {
    return `${this.LVal.toDOT()} = ${this.RVal.toDOT(space + 2)}`;
  }
}

export class IV_ThisAssn extends ALL_RVal {
  LVal: IV_ThisLookupPA;
  RVal: IV_ASSIGNABLE;

  constructor(
    node: JS3AssignmentExpression | undefined = undefined,
    LVal: IV_ThisLookupPA,
    RVal: IV_ASSIGNABLE,
  ) {
    super(node, "ThisAssn");
    this.LVal = LVal;
    this.RVal = RVal;
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.lookupName());
    } else if (this.RVal instanceof IV_ThisLookupPA) {
      res.add(IV_This.lookupName());
    } else if (this.RVal instanceof IV_SuperLookupPA) {
      res.add(ISP_Super.lookupName());
    } else {
      res = this.RVal.usedIdentifiers();
    }
    res.add(IV_This.lookupName());
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.RVal.declaredClosure();
  }

  toString(space = 0) {
    return `${this.LVal.toString()} = ${this.RVal.toString(space + 2)}`;
  }

  toDOT(space = 0) {
    return `${this.LVal.toDOT()} = ${this.RVal.toDOT(space + 2)}`;
  }
}

export class IV_SuperAssn extends ALL_RVal {
  LVal: IV_SuperLookupPA;
  RVal: IV_ASSIGNABLE;

  constructor(
    node: JS3AssignmentExpression | undefined = undefined,
    LVal: IV_SuperLookupPA,
    RVal: IV_ASSIGNABLE,
  ) {
    super(node, "SuperAssn");
    this.LVal = LVal;
    this.RVal = RVal;
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.lookupName());
    } else if (this.RVal instanceof IV_ThisLookupPA) {
      res.add(IV_This.lookupName());
    } else if (this.RVal instanceof IV_SuperLookupPA) {
      res.add(ISP_Super.lookupName());
    } else {
      res = this.RVal.usedIdentifiers();
    }
    res.add(ISP_Super.lookupName());
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.RVal.declaredClosure();
  }

  toString(space = 0) {
    return `${this.LVal.toString()} = ${this.RVal.toString(space + 2)}`;
  }

  toDOT(space = 0) {
    return `${this.LVal.toDOT()} = ${this.RVal.toDOT(space + 2)}`;
  }
}

export class IV_ArrPatAssn extends ALL_RVal {
  LVal: JS3ArrayPattern;
  RVal: IV_ASSIGNABLE;

  constructor(
    node: JS3AssignmentExpression | undefined = undefined,
    LVal: JS3ArrayPattern,
    RVal: IV_ASSIGNABLE,
  ) {
    super(node, "ArrPatAssn");
    this.LVal = LVal;
    this.RVal = RVal;
  }

  definedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    for (const id of this.LVal.elements) {
      if (isIdentifier(id)) {
        res.add(id.name);
      } else {
        res.add(id.argument.name);
      }
    }
    return res;
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.lookupName());
    } else if (this.RVal instanceof IV_ThisLookupPA) {
      res.add(IV_This.lookupName());
    } else if (this.RVal instanceof IV_SuperLookupPA) {
      res.add(ISP_Super.lookupName());
    } else {
      res = this.RVal.usedIdentifiers();
    }
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.RVal.declaredClosure();
  }

  toString(space = 0) {
    let lval = "[ ";
    const len = this.LVal.elements.length;
    let i = 0;
    this.LVal.elements.forEach((e) => {
      i++;
      if (isRestElement(e)) {
        lval += `...${e.argument}`;
      } else {
        lval += `${e.name}`;
      }

      if (i !== len) {
        lval += `, `;
      } else {
        lval += ` `;
      }
    });
    lval += "]";

    return `${lval} = ${this.RVal.toString(space + 2)}`;
  }

  toDOT(space = 0) {
    let lval = "[ ";
    const len = this.LVal.elements.length;
    let i = 0;
    this.LVal.elements.forEach((e) => {
      i++;
      if (isRestElement(e)) {
        lval += `...${e.argument}`;
      } else {
        lval += `${e.name}`;
      }

      if (i !== len) {
        lval += `, `;
      } else {
        lval += ` `;
      }
    });
    lval += "]";

    return `${lval} = ${this.RVal.toDOT(space + 2)}`;
  }
}

export class IV_ObjPatAssn extends ALL_RVal {
  LVal: JS3ObjectPattern;
  RVal: IV_ASSIGNABLE;

  constructor(
    node: JS3AssignmentExpression | undefined = undefined,
    LVal: JS3ObjectPattern,
    RVal: IV_ASSIGNABLE,
  ) {
    super(node, "ObjPatAssn");
    this.LVal = LVal;
    this.RVal = RVal;
  }

  definedIdentifiers(): Set<string> {
    const res: Set<string> = new Set();
    for (const p of this.LVal.properties) {
      if (isJS3AssnObjectProperty(p)) {
        res.add(p.value.name);
      } else {
        res.add(p.argument.name);
      }
    }
    return res;
  }

  usedIdentifiers(): Set<string> {
    let res: Set<string> = new Set();
    if (this.RVal instanceof IV_Identifier) {
      res.add(this.RVal.lookupName());
    } else if (this.RVal instanceof IV_MemberExpressionPA) {
      res.add(this.RVal.object.lookupName());
    } else if (this.RVal instanceof IV_ThisLookupPA) {
      res.add(IV_This.lookupName());
    } else if (this.RVal instanceof IV_SuperLookupPA) {
      res.add(ISP_Super.lookupName());
    } else {
      res = this.RVal.usedIdentifiers();
    }
    return res;
  }

  declaredClosure(): Array<IRIDIUM_FG> | undefined {
    return this.RVal.declaredClosure();
  }

  toString(space = 0) {
    const keyToString = (p: JS3AssnObjectProperty_key) => {
      if (isIdentifier(p)) return p.name;
      else if (isStringLiteral(p)) return `"${p.value}"`;
      else if (isNumericLiteral(p)) return `${p.value}`;
      else if (isBigIntLiteral(p)) return `${p.value}`;
      else if (isDecimalLiteral(p)) return `${p.value}`;
      else return `#${p.id.name}`;
    };

    let lval = "{ ";
    const len = this.LVal.properties.length;
    let i = 0;
    this.LVal.properties.forEach((p) => {
      i++;
      if (isRestElement(p)) {
        lval += `...${p.argument.name}`;
      } else {
        lval += `${keyToString(p.key)} : ${p.value.name}`;
      }

      if (i !== len) {
        lval += `, `;
      } else {
        lval += ` `;
      }
    });
    lval += "}";

    return `${lval} = ${this.RVal.toString(space + 2)}`;
  }

  toDOT(space = 0) {
    const keyToString = (p: JS3AssnObjectProperty_key) => {
      if (isIdentifier(p)) return p.name;
      else if (isStringLiteral(p)) return `"${p.value}"`;
      else if (isNumericLiteral(p)) return `${p.value}`;
      else if (isBigIntLiteral(p)) return `${p.value}`;
      else if (isDecimalLiteral(p)) return `${p.value}`;
      else return `#${p.id.name}`;
    };

    let lval = "{ ";
    const len = this.LVal.properties.length;
    let i = 0;
    this.LVal.properties.forEach((p) => {
      i++;
      if (isRestElement(p)) {
        lval += `...${p.argument.name}`;
      } else {
        lval += `${keyToString(p.key)} : ${p.value.name}`;
      }

      if (i !== len) {
        lval += `, `;
      } else {
        lval += ` `;
      }
    });
    lval += "}";

    return `${lval} = ${this.RVal.toDOT(space + 2)}`;
  }
}
