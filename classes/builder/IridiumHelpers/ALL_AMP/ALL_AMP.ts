import { JS3MemberExpression, JS3PrivateName } from "classes/builder/JS3Helpers/JS3Types.ts";

import { Identifier } from "@babel/types";
import { printScopedSpace } from "../IRIDIUM.ts";

type AmphibiousNodes = JS3MemberExpression 
                     | Identifier
                     | JS3PrivateName

type IRI_AMP_TYPE =  "Identifier" 
                  | "PrivateName"
                  | "MemberExpression"
                  | "ThisLookup"
                  | "SuperLookup"


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
}

export class IV_Identifier extends ALL_AMP {
  name: string
  constructor(node: Identifier | undefined = undefined, name: string) {
    super(node, "Identifier");
    this.name = name
  }

  toString() {
    return `${this.name}`
  }
}

export class IV_PrivateName extends ALL_AMP {
  id: IV_Identifier
  constructor(node: JS3PrivateName | undefined = undefined, id: IV_Identifier) {
    super(node, "PrivateName");
    this.id = id
  }

  toString() {
    return `#${this.id.name}`
  }
}

export class IV_MemberExpression extends ALL_AMP {
  object: IV_Identifier
  property: IV_Identifier | IV_PrivateName

  constructor(node: JS3MemberExpression | undefined = undefined, object: IV_Identifier, property: IV_Identifier | IV_PrivateName) {
    super(node, "MemberExpression");
    this.object = object
    this.property = property
  }

  toString() {
    return `<> ${this.object.name}.${this.property.toString()}`
  }
}

export class IV_ThisLookup extends ALL_AMP {
  property: IV_Identifier | IV_PrivateName

  constructor(node: JS3MemberExpression | undefined = undefined, property: IV_Identifier | IV_PrivateName) {
    super(node, "ThisLookup");
    this.property = property
  }

  toString() {
    return `<> THIS.${this.property.toString()}`
  }
}

export class IV_SuperLookup extends ALL_AMP {
  property: IV_Identifier | IV_PrivateName

  constructor(node: JS3MemberExpression | undefined = undefined, property: IV_Identifier | IV_PrivateName) {
    super(node, "SuperLookup");
    this.property = property
  }

  toString() {
    return `<> SUPER.${this.property.toString()}`
  }
}