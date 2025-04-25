import debugConfig from "#debugConfig";

export type IridiumPrimitives = number | boolean | string | null;
export class IridiumSEXP {
    tag: string = "IridiumSEXP";
    args: Array<IridiumSEXP> = [];
    flags: Array<[string, IridiumPrimitives]> = [];

    constructor(tag: string) {
        this.tag = tag;
    }

    serialize() {
        return [
            this.tag, 
            this.args.map((e) => e instanceof IridiumSEXP ? e.serialize() : e), 
            this.flags.map(([flagName, e]) => [flagName, e])
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

    getScope(): number {
        let res = this.flags.filter(e => e[0] === "Scope")[0][1];
        if (typeof res === "number") return res;
        debugConfig.logger.throwIriError("Expected scope to be a number");
    }

    isTopLevel() {
        return this.flags.filter(e => e[0] === "TopLevel").length > 0
    }

    isClosureBoundary() {
        return this.flags.filter(e => e[0] === "ClosureBoundary").length > 0
    }

    isLexical() {
        return this.flags.filter(e => e[0] === "Lexical").length > 0
    }
}

// @ts-ignore
export function isBBSEXP(o: any): o is BBSEXP {
  // @ts-ignore
  return o.tag === "BB";
}

// =============== RVals ===============
// Literals

// (Primitive) NumberSEXP
export class NumberSEXP extends IridiumSEXP {
    constructor(number: number) {
        super("NumberSEXP");
        this.flags.push(["IridiumPrimitive", number]);
    }

    getVal(): number {
        const res = this.flags[0][1];
        if (typeof res === "number") return res;
        debugConfig.logger.throwIriError("Non number found inside NumberSEXP")
    }
}

// @ts-ignore
export function isNumberSEXP(o: any): o is NumberSEXP {
    // @ts-ignore
    return o.tag === "NumberSEXP";
  }



// (Primitive) StringSEXP
export class StringSEXP extends IridiumSEXP {
    constructor(str: string) {
        super("StringSEXP");
        this.flags.push(["IridiumPrimitive", str]);
    }

    getVal(): string {
        const res = this.flags[0][1];
        if (typeof res === "string") return res;
        debugConfig.logger.throwIriError("Non string found inside StringSEXP")
    }
}
// @ts-ignore
export function isStringSEXP(o: any): o is StringSEXP {
    // @ts-ignore
    return o.tag === "StringSEXP";
}

// (Primitive) ListSEXP
export class ListSEXP extends IridiumSEXP {
    constructor(elems: Array<IridiumSEXP>) {
        super("ListSEXP");
        elems.forEach(e => this.args.push(e));
    }
}
// @ts-ignore
export function isListSEXP(o: any): o is ListSEXP {
    // @ts-ignore
    return o.tag === "ListSEXP";
  }
  


// (Primitive) BooleanSEXP
export class BooleanSEXP extends IridiumSEXP {
  constructor(value: boolean) {
      super("BooleanSEXP");
      this.flags.push(["IridiumPrimitive", value]);
  }
}

type JSBINOPS = "+" | "-" | "/" | "%" | "*" | "**" | "&" | "|" | ">>" | ">>>" | "<<" | "^" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | ">" | "<" | ">=" | "<=" | "|>";
// (Primitive) Binop
export class BinopSEXP extends IridiumSEXP {
    constructor(op: JSBINOPS, lBinop: IridiumSEXP, rBinop: IridiumSEXP) {
        super("BinopSEXP");
        this.args.push(new StringSEXP(op));
        this.args.push(lBinop);
        this.args.push(rBinop);
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
    constructor(flag: LambdaSEXPFlags, bbIdx: number, jsFlags: Array<[JSLambdaSEXPFlags, IridiumPrimitives]>) {
        super(flag, bbIdx);
        this.tag = "JSLambda";
        jsFlags.forEach((jsFlag) => this.flags.push(jsFlag));
    }
}

export class EnvBinding extends IridiumSEXP {
    constructor(scope: number, id: string) {
        super("EnvBinding");
        this.flags.push(["scope", scope]);
        this.flags.push(["id", id]);
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

// (Primitive) EnvDeclare
export class EnvDeclare extends IridiumSEXP {
    static DECLARATION_IDX = 0;
    constructor(b: string, kind: "let" | "var" | "const") {
        super("EnvDeclare");
        this.args.push(new StringSEXP(b));
        this.args.push(new StringSEXP(kind));
        this.args.push(new NumberSEXP(EnvDeclare.DECLARATION_IDX++));
    }

    getDeclaration(): string {
        if (isStringSEXP(this.args[0])) return this.args[0].getVal();
        debugConfig.logger.throwIriError("Expected Env Declaration to declare a string");
    }

    getKind(): string {
        if (isStringSEXP(this.args[1])) return this.args[1].getVal();
        debugConfig.logger.throwIriError("Expected Env Declaration kind to declare a string");
    }

    getID(): number {
        if (isNumberSEXP(this.args[2])) return this.args[2].getVal();
        debugConfig.logger.throwIriError("Expected Env Declaration id to declare a number");
    }

    toString() {
        return `${this.tag}((#${this.getID()}:${this.getDeclaration()}))`
    }
}

// @ts-ignore
export function isEnvDeclare(o: any): o is EnvDeclare {
    // @ts-ignore
    return o.tag === "EnvDeclare";
}


// (Primitive) EnvWrite
export type EnvWriteFlags = "Assignment";
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
        if (rval) this.args.push(rval);
        if (flag) this.flags.push([flag, null]);
    }

    isSimpleDecl() {
        return isStringSEXP(this.args[0])
    }

    isArrayDecl() {
        return (!this.isSimpleDecl()) && isStringSEXP(this.args[0].args[0])
    }

    isObjDecl() {
        return (!this.isSimpleDecl()) && (!this.isArrayDecl())
    }

    hasRVal() {
        return this.args.length > 1
    }

    isJSDecl() {
        return this.isLetDecl() || this.isConstDecl() || this.isVarDecl();  
    }

    isLetDecl() {
        return this.flags.filter(e => e[0] === "let").length > 0
    }

    isConstDecl() {
        return this.flags.filter(e => e[0] === "const").length > 0
    }

    isVarDecl() {
        return this.flags.filter(e => e[0] === "var").length > 0
    }

    reduceJSDecl() {
        if (this.isSimpleDecl()) this.tag = "EnvWrite";
        this.flags = this.flags.filter(e => e[0] !== "let" && e[0] !== "const" && e[0] !== "var")
        this.flags.push(["Assignment", null])
    }

    hasRest() {
        return this.flags.filter(e => e[0] === "rest").length > 0
    }

    getDeclaredBindings() {
        let lVal = this.args[0];
        const res: Array<string> = [];
        if (isResolveEnvBinding(lVal)) {
            res.push(lVal.getBindingName());
        } else if (this.isArrayDecl()) {
            for (let l of lVal.args) {
                if (isStringSEXP(l)) {
                    res.push(l.getVal());
                } else debugConfig.logger.throwIriError("In Arr Decl, only expected StringSEXP");
            }
        } else if (this.isObjDecl()) {
            for (let p of lVal.args) {
                if (isStringSEXP(p)) { // Rest case
                    res.push(p.getVal());
                } else if (isListSEXP(p)) {
                    if (isStringSEXP(p.args[1])) res.push(p.args[1].getVal());
                    else debugConfig.logger.throwIriError("In Obj Decl, expected the created binding to be a StringSEXP");
                }
            }
        }

        return res;
    }
}
// @ts-ignore
export function isJSEnvWrite(o: any): o is JSEnvWrite {
    // @ts-ignore
    return o.tag === "JSEnvWrite";
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
        this.args.push(new StringSEXP(id));
    }

    getBindingName(): string {
        let res = this.args[0]
        if (isStringSEXP(res)) return res.getVal()
        debugConfig.logger.throwIriError("Cant get binding for resolveEnvBinding")
    }

}

// @ts-ignore
export function isResolveEnvBinding(o: any): o is ResolveEnvBinding {
    // @ts-ignore
    return o.tag === "ResolveEnvBinding";
}
