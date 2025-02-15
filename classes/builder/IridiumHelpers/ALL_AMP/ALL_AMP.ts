import { JS3MemberExpression, JS3PrivateName } from "classes/builder/JS3Helpers/JS3Types.ts";

import { printScopedSpace } from "#utils";
import { Identifier, V8IntrinsicIdentifier } from "@babel/types";
import { IRIDIUM_FG } from "../IRIDIUM.ts";
import { IV_This } from "../ALL_RVal/IV_This.ts";
import { ISP_Super } from "../ALL_RVal/ALL_ISP.ts";

type AmphibiousNodes = JS3MemberExpression 
                     | Identifier
                     | V8IntrinsicIdentifier
                     | JS3PrivateName

type IRI_AMP_TYPE = "Identifier"
                  | "V8IntrinsicIdentifier"
                  | "PrivateName"
                  | "MemberExpressionPA"
                  | "ThisPA"
                  | "SuperPA"


export class ALL_AMP {
  node : AmphibiousNodes | undefined
  type : IRI_AMP_TYPE
  constructor(node: AmphibiousNodes | undefined, type: IRI_AMP_TYPE) {
    this.node = node
    this.type = type
  }

  toString(space = 0) {
    if (this.node) {
      return `${printScopedSpace(space)}AMP_TODO(${this.node.type})`; 
    }
    return `${printScopedSpace(space)}AMP_TODO(UKN)`;
  }

  toDOT(space = 0) {
    return this.toString()
  }
}

export class IV_Identifier extends ALL_AMP {
  name: string
  isValue: boolean = false
  isChainedValue: boolean = false
  constructor(node: Identifier | undefined = undefined, name: string) {
    super(node, "Identifier");
    this.name = name;
  }

  static from(node: Identifier, isValue: boolean = false, isChainedValue: boolean = false) {
    let res = new IV_Identifier(node, node.name);
    res.isValue = isValue
    res.isChainedValue = isChainedValue
    return res
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return undefined }

  lookupName() { return `${this.name}` }

  toString() {
    if (this.isValue) return `<Value> ${this.lookupName()}`;
    if (this.isChainedValue) return `<ChainedValue> ${this.lookupName()}`;
    return `${this.lookupName()}`
  }
}

export class IV_PrivateName extends ALL_AMP {
  id: IV_Identifier
  constructor(node: JS3PrivateName | undefined = undefined, id: IV_Identifier) {
    super(node, "PrivateName");
    this.id = id
  }

  lookupName() {
    return `#${this.id.lookupName()}`
  }

  toString() {
    return `#${this.lookupName()}`
  }
}

export class IV_MemberExpressionPA extends ALL_AMP {
  object: IV_Identifier
  property: IV_Identifier | IV_PrivateName
  computed: boolean

  constructor(node: JS3MemberExpression | undefined = undefined, object: IV_Identifier, property: IV_Identifier | IV_PrivateName, computed: boolean) {
    super(node, "MemberExpressionPA");
    this.object = object
    this.property = property
    this.computed = computed
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return undefined }

  toString() {
    if (this.computed) return `<MemberExpressionPA> ${this.object.lookupName()}[${this.property.lookupName()}]`
    return `<MemberExpressionPA> ${this.object.lookupName()}.${this.property.lookupName()}`
  }
}

export class IV_ThisLookupPA extends ALL_AMP {
  property: IV_Identifier | IV_PrivateName
  computed: boolean

  constructor(node: JS3MemberExpression | undefined = undefined, property: IV_Identifier | IV_PrivateName, computed: boolean) {
    super(node, "ThisPA");
    this.property = property
    this.computed = computed
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return undefined }

  toString() {
    if (this.computed) return `<THISPA> ${IV_This.lookupName()}[${this.property.lookupName()}]`
    return `<THISPA> ${IV_This.lookupName()}.${this.property.lookupName()}`
  }
}

export class IV_SuperLookupPA extends ALL_AMP {
  property: IV_Identifier | IV_PrivateName
  computed: boolean

  constructor(node: JS3MemberExpression | undefined = undefined, property: IV_Identifier | IV_PrivateName, computed: boolean) {
    super(node, "SuperPA");
    this.property = property
    this.computed = computed
  }

  declaredClosure() : Array<IRIDIUM_FG> | undefined { return undefined }

  toString() {
    if (this.computed) return `<SuperPA> ${ISP_Super.lookupName()}[${this.property.lookupName()}]`
    return `<SuperPA> ${ISP_Super.lookupName()}.${this.property.lookupName()}`
  }
}