import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { IridiumSEXP } from "../General";

// (Extension) JSTHISINIT
export class JSTHISINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSTHISINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[this -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSHOMEOBJ
export class JSHOMEOBJSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSHOMEOBJ");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<home_obj> -- ${this.args[0].toString(0)}]]`
  }

}

// (Extension) JSSUPERCTRINIT
export class JSSUPERCTRINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSSUPERCTRINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<super_ctr> -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSNEWTARGETINIT
export class JSNEWTARGETINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSNEWTARGETINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<new_target> -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSSUPEROBJINIT
export class JSSUPEROBJINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSSUPEROBJINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<super_obj> -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSThisContext
export class JSThisContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSThisContext");
  }
}

// (Extension) JSModuleMeta
export class JSModuleMetaSEXP extends IridiumSEXP {
  constructor() {
    super("JSModuleMeta");
  }
}

// (Extension) JSSuperObjContext
export class JSSuperObjContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSSuperObjContext");
  }
}

// (Extension) JSHomeObjContext
export class JSHomeObjContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSHomeObjContext");
  }
}

// (Extension) JSThisContextAlt
export class JSThisContextAltSEXP extends IridiumSEXP {
  constructor() {
    super("JSThisContextAlt");
  }
}

// (Extension) JSSuperContext
export class JSSuperContextSEXP extends IridiumSEXP {
  constructor() {
    super("JSSuperContext");
  }
}

// (Extension) JSMODULEMETAINIT
export class JSMODULEMETAINITSEXP extends IridiumSEXP {
  constructor(ref: IridiumSEXP) {
    super("JSMODULEMETAINIT");
    this.args.push(ref);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[<module_meta> -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSARGUMENTSINIT
export class JSARGUMENTSINITSEXP extends IridiumSEXP {
  constructor(loc: string) {
    super("JSARGUMENTSINIT");
    this.args.push(new ResolveEnvBindingSEXP(loc));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[arguments -- ${this.args[0].toString(0)}]`
  }
}

// (Extension) JSMARGUMENTSINIT
export class JSMARGUMENTSINITSEXP extends IridiumSEXP {
  constructor(loc: string) {
    super("JSMARGUMENTSINIT");
    this.args.push(new ResolveEnvBindingSEXP(loc));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}INIT[[m]arguments -- ${this.args[0].toString(0)}]`
  }
}

/**
 * @group TSHelper
 */
export function isJSThisContextSEXP(o: any): o is JSThisContextSEXP {
  // @ts-ignore
  return o.tag === "JSThisContext";
}

/**
 * @group TSHelper
 */
export function isJSModuleMetaSEXP(o: any): o is JSModuleMetaSEXP {
  // @ts-ignore
  return o.tag === "JSModuleMeta";
}

/**
 * @group TSHelper
 */
export function isJSSuperObjContextSEXP(o: any): o is JSSuperObjContextSEXP {
  // @ts-ignore
  return o.tag === "JSSuperObjContext";
}


/**
 * @group TSHelper
 */
export function isJSHomeObjContextSEXP(o: any): o is JSHomeObjContextSEXP {
  // @ts-ignore
  return o.tag === "JSHomeObjContext";
}

/**
 * @group TSHelper
 */
export function isJSThisContextAltSEXP(o: any): o is JSThisContextAltSEXP {
  // @ts-ignore
  return o.tag === "JSThisContextAlt";
}

/**
 * @group TSHelper
 */
export function isJSSuperContextSEXP(o: any): o is JSSuperContextSEXP {
  // @ts-ignore
  return o.tag === "JSSuperContext";
}

/**
 * @group TSHelper
 */
export function isJSARGUMENTSINITSEXP(o: any): o is JSARGUMENTSINITSEXP {
  // @ts-ignore
  return o.tag === "JSARGUMENTSINIT";
}

/**
 * @group TSHelper
 */
export function isJSMARGUMENTSINITSEXP(o: any): o is JSMARGUMENTSINITSEXP {
  // @ts-ignore
  return o.tag === "JSMARGUMENTSINIT";
}

/**
 * @group TSHelper
 */
export function isJSMODULEMETAINITSEXP(o: any): o is JSMODULEMETAINITSEXP {
  // @ts-ignore
  return o.tag === "JSMODULEMETAINIT";
}