export type IridiumPrimitives = number | boolean | string | null;
export class IridiumSEXP {
    tag: string = "IridiumSEXP";
    args: Array<IridiumSEXP> = [];
    flags: Array<[string, IridiumSEXP | IridiumPrimitives]> = [];

    constructor(tag: string) {
        this.tag = tag;
    }

    serialize() {
        return [
            this.tag, 
            this.args.map((e) => e instanceof IridiumSEXP ? e.serialize() : e), 
            this.flags.map(([flagName, e]) => [flagName, e instanceof IridiumSEXP ? e.serialize() : e ])
        ];
    }
}

// =============== TopLevel ===============
// (Primitive) File
export type FileSEXPFlags = "JSScript" | "JSModule";
export class FileSEXP extends IridiumSEXP {
    constructor(flag: FileSEXPFlags = undefined) {
        super("File");
        if (flag) this.flags.push([flag, null]);
    }
};

// =============== BBs ===============
// (Primitive) File
export type BBSEXPFlags = "TopLevel" | "ClosureBoundary" | "Lexical";
export class BBSEXP extends IridiumSEXP {
    static bbIdx: number = 0;
    idx: number
    constructor(scopeIdx: number, flag: BBSEXPFlags = undefined) {
        super("BB");
        this.idx = BBSEXP.bbIdx++;
        this.flags.push(["IDX", this.idx]);
        this.flags.push(["Scope", scopeIdx]);
        if (flag) this.flags.push([flag, null]);
    }
}

// =============== RVals ===============
// Literals

// (Primitive) NumberSEXP
export class NumberSEXP extends IridiumSEXP {
    constructor(number: number) {
        super("NumberSEXP");
        this.flags.push(["IridiumPrimitive", number]);
    }
}

// (Primitive) StringSEXP
export class StringSEXP extends IridiumSEXP {
    constructor(str: string) {
        super("StringSEXP");
        this.flags.push(["IridiumPrimitive", str]);
    }
}

// (Primitive) ListSEXP
export class ListSEXP extends IridiumSEXP {
    constructor(elems: Array<IridiumSEXP>) {
        super("ListSEXP");
        elems.forEach(e => this.args.push(e));
    }
}

// (Primitive) BooleanSEXP
export class BooleanSEXP extends IridiumSEXP {
  constructor(value: boolean) {
      super("BooleanSEXP");
      this.flags.push(["IridiumPrimitive", value]);
  }
}

// (Primitive) JSArraySEXP
export class JSArraySEXP extends IridiumSEXP {
  constructor(vals: Array<IridiumSEXP>) {
      super("JSArraySEXP");
      vals.forEach(e => this.args.push(e));
  }
}

// (Primitive) JSObjectSEXP
export class JSObjectSEXP extends IridiumSEXP {
  constructor(vals: Array<IridiumSEXP>) {
      super("JSObjectSEXP");
      vals.forEach(e => this.args.push(e));
  }
}

// Abstraction
// (Primitive) Lambda
export type LambdaSEXPFlags = "Pure" | "Fable" | "GFable" | "LexRO" | "LexRW";
export class LambdaSEXP extends IridiumSEXP {
    constructor(closureFlag: LambdaSEXPFlags, bbIdx: number) {
        super("Lambda");
        this.flags.push([closureFlag, null]);
        this.flags.push(["IDX", bbIdx]);
    }
}

// (Primitive) GetClosArg
export type GetClosArgSEXPFlags = "rest";
export class GetClosArgSEXP extends IridiumSEXP {
    constructor(argIDX: number) {
        super("GetClosArg");
        if (argIDX >= 0) this.args.push(new NumberSEXP(argIDX));
        else this.flags.push(["rest", null]);
    }
}

// (Extension) JSLambda
export type JSLambdaSEXPFlags = "InferredName" | "StaticName" | "Strict";
export class JSLambdaSEXP extends LambdaSEXP {
    constructor(flag: LambdaSEXPFlags, bbIdx: number, jsFlags: Array<[JSLambdaSEXPFlags, IridiumSEXP | IridiumPrimitives]>) {
        super(flag, bbIdx);
        this.tag = "JSLambda";
        jsFlags.forEach((jsFlag) => this.flags.push(jsFlag));
    }
}

// Environment Operations
// (Primitive) EnvRead
export class EnvRead extends IridiumSEXP {
    constructor(id: string) {
        super("EnvRead");
        this.args.push(new ResolveEnvBinding(id));
    }
}

// (Primitive) EnvWrite
export type EnvWriteFlags = "Assignment" | "Declaration";
export class EnvWrite extends IridiumSEXP {
    constructor(lval: string, rval: IridiumSEXP, flag: EnvWriteFlags = undefined) {
        super("EnvWrite");
        this.args.push(new ResolveEnvBinding(lval));
        this.args.push(rval);
        if (flag) this.flags.push([flag, null]);
    }
}

// (Extension) EnvWrite
export type JSEnvWriteFlags = EnvWriteFlags | "let" | "const" | "var" | "rest";
export class JSEnvWrite extends IridiumSEXP {
    constructor(lval: IridiumSEXP, rval: IridiumSEXP, flag: JSEnvWriteFlags = undefined) {
        super("JSEnvWrite");
        this.args.push(lval);
        this.args.push(rval);
        if (flag) this.flags.push([flag, null]);
    }
}

// (Extension) JSArrEnvWrite
export class JSArrEnvWrite extends IridiumSEXP {
    constructor(lvals: Array<string>, rval: IridiumSEXP, flag: JSEnvWriteFlags = undefined) {
        super("JSArrEnvWrite");
        this.args.push(new ListSEXP(lvals.map((e) => new ResolveEnvBinding(e))));
        this.args.push(rval);
        if (flag) this.flags.push([flag, null]);
    }
}

// (Extension) JSObjEnvWrite
export class JSObjEnvWrite extends IridiumSEXP {
    constructor(lvals: Array<[string, string]>, rval: IridiumSEXP, flag: JSEnvWriteFlags = undefined) {
        super("JSObjEnvWrite");
        this.args.push(new ListSEXP(lvals.map(([field, binding]) => new ListSEXP([new StringSEXP(field), new ResolveEnvBinding(binding)]))));
        this.args.push(rval);
        if (flag) this.flags.push([flag, null]);
    }
}

// Control Flow

// (Primitive) Goto
export class Goto extends IridiumSEXP {
    constructor(target: number) {
        super("Goto");
        if (target !== -1)
            this.flags.push(["ResolvedTarget", target]);
        else
            this.flags.push(["UnresolvedTarget", null]);
    }
}


// (Primitive) IfElseJump
export class IfElseJump extends IridiumSEXP {
    constructor(test: IridiumSEXP, trueTarget: number, falseTarget: number) {
        super("IfElseJump");
        this.args.push(test);
        if (trueTarget !== -1)
            this.flags.push(["ResolvedTarget", trueTarget]);
        else
            this.flags.push(["UnresolvedTarget", null]);
        if (falseTarget !== -1)
            this.flags.push(["ResolvedTarget", falseTarget]);
        else
            this.flags.push(["UnresolvedTarget", null]);
    }
}


// (Primitive) IfJump
export class IfJump extends IridiumSEXP {
    constructor(test: IridiumSEXP, target: number) {
        super("IfJump");
        this.args.push(test);
        if (target !== -1)
            this.flags.push(["ResolvedTarget", target]);
        else
            this.flags.push(["UnresolvedTarget", null]);
    }
}

// Abstract Operations
// (Primitive) ResolveEnvBinding
export class ResolveEnvBinding extends IridiumSEXP {
    constructor(id: string) {
        super("ResolveEnvBinding");
        this.flags.push(["IridiumPrimitive", id]);
    }
}

