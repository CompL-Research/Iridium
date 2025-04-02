export type IridiumPrimitives = number | string;
export class IridiumSEXP {
    tag: string = "IridiumSEXP";
    args: Array<IridiumSEXP | IridiumPrimitives> = [];
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
        if (flag) this.flags.push([flag, new ListEndRVal()]);
    }
};

// =============== BBs ===============

export class BBSEXP extends IridiumSEXP {
    constructor() {
        super("BB");
    }
}

// =============== RVals ===============
// Literals
// (Primitive) ListEndRVal
export class ListEndRVal extends IridiumSEXP {
    constructor() {
        super("ListEndRVal");
    }
}

// (Primitive) NumberSEXP
export class NumberSEXP extends IridiumSEXP {
    constructor(number: number) {
        super("NumberSEXP");
        this.args.push(number);
    }
}

// (Primitive) StringSEXP
export class StringSEXP extends IridiumSEXP {
    constructor(str: string) {
        super("StringSEXP");
        this.args.push(str);
    }
}

// (Primitive) ListSEXP
export class ListSEXP extends IridiumSEXP {
    constructor(elems: Array<IridiumSEXP>) {
        super("ListSEXP");
        elems.forEach(e => this.args.push(e));
    }
}

// Abstraction
// (Primitive) Lambda
export type LambdaSEXPFlags = "Pure" | "Fable" | "GFable" | "LexRO" | "LexRW";
export class LambdaSEXP extends IridiumSEXP {
    constructor(flag: LambdaSEXPFlags) {
        super("Lambda");
        this.flags.push([flag, new ListEndRVal()]);
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
        this.flags.push(...jsFlags.map((jsFlag): [string, IridiumSEXP] => [jsFlag, new ListEndRVal()]));
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
    constructor(lval: string, rval: string, declaration: boolean) {
        super("EnvWrite");
        this.args.push(new ResolveEnvBinding(lval));
        this.args.push(new ResolveEnvBinding(rval));
        if (declaration) this.flags.push(["Declaration", new ListEndRVal()]);
    }
}

// (Extension) EnvWrite
export type JSEnvWriteFlags = "Assignment" | "Let" | "Const" | "Var";
export class JSEnvWrite extends IridiumSEXP {
    constructor(lval: string, rval: string, declaration: JSEnvWriteFlags = undefined) {
        super("JSEnvWrite");
        this.args.push(new ResolveEnvBinding(lval));
        this.args.push(new ResolveEnvBinding(rval));
        if (declaration) this.flags.push([declaration, new ListEndRVal()]);
    }
}

// (Extension) JSArrEnvWrite
export class JSArrEnvWrite extends IridiumSEXP {
    constructor(lvals: Array<string>, rval: string, declaration: JSEnvWriteFlags = undefined) {
        super("JSArrEnvWrite");
        this.args.push(new ListSEXP(lvals.map((e) => new ResolveEnvBinding(e))));
        this.args.push(new ResolveEnvBinding(rval));
        if (declaration) this.flags.push([declaration, new ListEndRVal()]);
    }
}

// (Extension) JSObjEnvWrite
export class JSObjEnvWrite extends IridiumSEXP {
    constructor(lvals: Array<[string, string]>, rval: string, declaration: JSEnvWriteFlags = undefined) {
        super("JSObjEnvWrite");
        this.args.push(new ListSEXP(lvals.map(([field, binding]) => new ListSEXP([new StringSEXP(field), new ResolveEnvBinding(binding)]))));
        this.args.push(new ResolveEnvBinding(rval));
        if (declaration) this.flags.push([declaration, new ListEndRVal()]);
    }
}

// Abstract Operations
// (Primitive) ResolveEnvBinding
export class ResolveEnvBinding extends IridiumSEXP {
    constructor(id: string) {
        super("ResolveEnvBinding");
        this.args.push(id);
    }
}

