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

// Abstraction
// (Primitive) Lambda
export type LambdaSEXPFlags = "Pure" | "Fable" | "GFable" | "LexRO" | "LexRW";
export class LambdaSEXP extends IridiumSEXP {
    constructor(flag: LambdaSEXPFlags) {
        super("Lambda");
        this.flags.push([flag, null]);
    }
}

// (Primitive) GetClosArg
export class GetClosArgSEXP extends IridiumSEXP {
    constructor(argIDX: number) {
        super("GetClosArg");
        this.args.push(new NumberSEXP(argIDX));
    }
}

// (Extension) JSLambda
export type JSLambdaSEXPFlags = "InferredName" | "Strict";
export class JSLambdaSEXP extends LambdaSEXP {
    constructor(flag: LambdaSEXPFlags, jsFlags: Array<JSLambdaSEXPFlags>) {
        super(flag);
        this.tag = "JSLambda";
        this.flags.push(...jsFlags.map((jsFlag): [string, IridiumSEXP] => [jsFlag, null]));
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
export type EnvWriteFlags = "Declaration";
export class EnvWrite extends IridiumSEXP {
    constructor(lval: string, rval: IridiumSEXP, declaration: boolean) {
        super("EnvWrite");
        this.args.push(new ResolveEnvBinding(lval));
        this.args.push(rval);
        if (declaration) this.flags.push(["Declaration", null]);
    }
}

// (Extension) EnvWrite
export type JSEnvWriteFlags = "Assignment" | "let" | "const" | "var";
export class JSEnvWrite extends IridiumSEXP {
    constructor(lval: string, rval: IridiumSEXP, declaration: JSEnvWriteFlags = undefined) {
        super("JSEnvWrite");
        this.args.push(new ResolveEnvBinding(lval));
        this.args.push(rval);
        if (declaration) this.flags.push([declaration, null]);
    }
}

// (Extension) JSArrEnvWrite
export class JSArrEnvWrite extends IridiumSEXP {
    constructor(lvals: Array<string>, rval: IridiumSEXP, declaration: JSEnvWriteFlags = undefined) {
        super("JSArrEnvWrite");
        this.args.push(new ListSEXP(lvals.map((e) => new ResolveEnvBinding(e))));
        this.args.push(rval);
        if (declaration) this.flags.push([declaration, null]);
    }
}

// (Extension) JSObjEnvWrite
export class JSObjEnvWrite extends IridiumSEXP {
    constructor(lvals: Array<[string, string]>, rval: IridiumSEXP, declaration: JSEnvWriteFlags = undefined) {
        super("JSObjEnvWrite");
        this.args.push(new ListSEXP(lvals.map(([field, binding]) => new ListSEXP([new StringSEXP(field), new ResolveEnvBinding(binding)]))));
        this.args.push(rval);
        if (declaration) this.flags.push([declaration, null]);
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

