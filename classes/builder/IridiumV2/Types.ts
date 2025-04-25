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
            this.args.map((e) => e.serialize()),
            this.flags.map(([flagName, e]) => [flagName, e])
        ];
    }

    hasFlag(flag: string) {
        return this.flags.filter(e => e[0] === flag).length === 1
    }

    getFlag(flag: string): IridiumPrimitives {
        const currFlag = this.flags.filter(e => e[0] === flag);
        if (this.flags.filter(e => e[0] === flag).length === 1) {
            return currFlag[0][1];
        }
        debugConfig.logger.throwIriError(`Failed to get flag: ${flag}`)
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
// (Primitive) BB
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

// (Primitive) Number
export class NumberSEXP extends IridiumSEXP {
    constructor(number: number) {
        super("Number");
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
    return o.tag === "Number";
}

// (Primitive) String
export class StringSEXP extends IridiumSEXP {
    constructor(str: string) {
        super("String");
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
    return o.tag === "String";
}

// (Primitive) List
export class ListSEXP extends IridiumSEXP {
    constructor(elems: Array<IridiumSEXP>) {
        super("List");
        elems.forEach(e => this.args.push(e));
    }
}

// @ts-ignore
export function isListSEXP(o: any): o is ListSEXP {
    // @ts-ignore
    return o.tag === "List";
}

// (Primitive) Boolean
export class BooleanSEXP extends IridiumSEXP {
    constructor(value: boolean) {
        super("Boolean");
        this.flags.push(["IridiumPrimitive", value]);
    }
}

// @ts-ignore
export function isBooleanSEXP(o: any): o is BooleanSEXP {
    // @ts-ignore
    return o.tag === "Boolean";
}


// type JSBINOPS =  "**" | ">>>" | "==" | "===" | "!=" | "!==" | "in" | "instanceof" | "|>";
const PrimitiveArithOP = ["+", "-", "/", "%", "*"];
const PrimitiveBitwiseOP = ["&", "|", "^", "<<", ">>"];
const PrimitiveComparisonOP = [">", "<", ">=", "<="];

const isPrimitiveBinop = (b: string) => {
    return PrimitiveArithOP.includes(b) || PrimitiveBitwiseOP.includes(b) || PrimitiveComparisonOP.includes(b)
}

// (Primitive) Binop
export type BinopSEXPFlags = "Primitive" | "JSBINOP";
export class BinopSEXP extends IridiumSEXP {
    constructor(op: string, lBinop: IridiumSEXP, rBinop: IridiumSEXP) {
        super("Binop");
        this.args.push(new StringSEXP(op));
        this.args.push(lBinop);
        this.args.push(rBinop);
        if (isPrimitiveBinop(op)) this.flags.push(["Primitive", null]);
        else this.flags.push(["JSBINOP", null]);
    }
}
// @ts-ignore
export function isBinopSEXP(o: any): o is BinopSEXP {
    // @ts-ignore
    return o.tag === "Binop";
}

// (Extension) JSArray
export class JSArraySEXP extends IridiumSEXP {
    constructor(vals: Array<IridiumSEXP>) {
        super("JSArray");
        vals.forEach(e => this.args.push(e));
    }
}

// (Extension) JSObject
export class JSObjectSEXP extends IridiumSEXP {
    constructor(vals: Array<IridiumSEXP>) {
        super("JSObject");
        vals.forEach(e => this.args.push(e));
    }
}

// Abstraction
// (Primitive) Lambda
export type JSLambdaFlags = "InferredName" | "StaticName" | "Strict";
export type LambdaSEXPFlags = "Pure" | "Fable" | "GFable" | "LexRO" | "LexRW" | JSLambdaFlags;

export class LambdaSEXP extends IridiumSEXP {
    constructor(bbIdx: number, closureFlag: [LambdaSEXPFlags, IridiumPrimitives][]) {
        super("Lambda");
        this.flags.push(["IDX", bbIdx]);
        closureFlag.forEach(flag => this.flags.push(flag));
    }
}

// (Primitive) GetClosArg
export type GetClosArgSEXPFlags = "JSREST";
export class GetClosArgSEXP extends IridiumSEXP {
    constructor(argIDX: number) {
        super("GetClosArg");
        // if (argIDX >= 0) this.args.push(new NumberSEXP(argIDX));
        this.flags.push(["IDX", argIDX]); 
    }
}


// Environment Operations
// (Primitive) EnvRead
export class EnvReadSEXP extends IridiumSEXP {
    constructor(id: string) {
        super("EnvRead");
        this.args.push(new ResolveEnvBindingSEXP(id));
    }
}

// (Primitive) EnvDeclare
export type JSEnvDeclareFlags = "JSLET" | "JSCONST" | "JSVAR"; 
export type EnvDeclareFlags = "IDX" | JSEnvDeclareFlags;
export class EnvDeclareSEXP extends IridiumSEXP {
    static DECLARATION_IDX = 0;
    constructor(b: string, flags: [JSEnvDeclareFlags, null][]) {
        super("EnvDeclare");
        this.args.push(new StringSEXP(b));
        flags.forEach(flag => this.flags.push(flag));
        this.flags.push(["IDX", EnvDeclareSEXP.DECLARATION_IDX++])
    }

    getDeclaration(): string {
        if (isStringSEXP(this.args[0])) return this.args[0].getVal();
        debugConfig.logger.throwIriError("Expected Env Declaration to declare a string");
    }

    getKind(): string {
        if (this.hasFlag("JSLET")) return "JSLET";
        if (this.hasFlag("JSCONST")) return "JSCONST";
        if (this.hasFlag("JSVAR")) return "JSVAR";
        debugConfig.logger.throwIriError("EnvDeclareSEXP, unknown kind");
    }

    getID(): number {
        const res = this.getFlag("IDX");
        if (typeof res === "number") return res;
        debugConfig.logger.throwIriError("Expected Env Declaration id to declare a number");
    }

    toString() {
        return `${this.tag}((#${this.getID()}:${this.getDeclaration()}))`
    }
}

// @ts-ignore
export function isEnvDeclareSEXP(o: any): o is EnvDeclareSEXP {
    // @ts-ignore
    return o.tag === "EnvDeclare";
}


// (Primitive) EnvWrite
export class EnvWriteSEXP extends IridiumSEXP {
    constructor(lval: string, rval: IridiumSEXP) {
        super("EnvWrite");
        this.args.push(new ResolveEnvBindingSEXP(lval));
        this.args.push(rval);
    }
}

// (Extension) JSEnvWrite
export type JSEnvWriteFlags = "JSLET" | "JSCONST" | "JSVAR" | "JSREST" | "JSARRDES" | "JSOBJDES";
export class JSEnvWriteSEXP extends IridiumSEXP {
    constructor(lval: IridiumSEXP, rval: IridiumSEXP, flag: JSEnvWriteFlags = undefined) {
        super("JSEnvWrite");
        this.args.push(lval);
        if (rval) this.args.push(rval);
        if (flag) this.flags.push([flag, null]);
    }

    isSimpleDecl() {
        return !(this.isArrayDecl() || this.isObjDecl());
    }

    isArrayDecl() {
        return this.hasFlag("JSARRDES")
    }

    isObjDecl() {
        return this.hasFlag("JSOBJDES")
    }

    hasRVal() {
        return this.args.length > 1
    }

    isDecl() {
        return this.isLetDecl() || this.isConstDecl() || this.isVarDecl()
    }

    isLetDecl() {
        return this.hasFlag("JSLET")
    }

    isConstDecl() {
        return this.hasFlag("JSCONST")
    }

    isVarDecl() {
        return this.hasFlag("JSVAR")
    }

    reduceJSDecl() {
        if (this.isSimpleDecl()) {
            this.tag = "EnvWrite";
            Object.setPrototypeOf(this, new EnvWriteSEXP("", null))
        }
        this.flags = this.flags.filter(e => e[0] !== "JSLET" && e[0] !== "JSCONST" && e[0] !== "JSVAR")
    }

    hasRest() {
        return this.flags.filter(e => e[0] === "JSREST").length > 0
    }

    getDeclaredBindings() {
        let lVal = this.args[0];
        const res: Array<string> = [];
        if (isResolveEnvBindingSEXP(lVal)) {
            res.push(lVal.getBindingName());
        } else if (this.isArrayDecl()) {
            for (let l of lVal.args) {
                if (isResolveEnvBindingSEXP(l)) {
                    res.push(l.getBindingName());
                } else debugConfig.logger.throwIriError("In Arr Decl, only expected StringSEXP");
            }
        } else if (this.isObjDecl()) {
            for (let p of lVal.args) {
                if (isResolveEnvBindingSEXP(p)) { // Rest case
                    res.push(p.getBindingName());
                } else if (isListSEXP(p)) {
                    if (isResolveEnvBindingSEXP(p.args[1])) res.push(p.args[1].getBindingName());
                    else {
                        debugConfig.logger.throwIriError("In Obj Decl, expected the created binding to be a StringSEXP");
                    } 
                    
                }
            }
        }
        return res;
    }
}
// @ts-ignore
export function isJSEnvWrite(o: any): o is JSEnvWriteSEXP {
    // @ts-ignore
    return o.tag === "JSEnvWrite";
}


// Control Flow

// (Primitive) Goto
export class GotoSEXP extends IridiumSEXP {
    constructor(target: number) {
        super("Goto");
        this.flags.push(["IDX", target]);
    }
}

// (Primitive) IfElseJump
export class IfElseJumpSEXP extends IridiumSEXP {
    constructor(test: IridiumSEXP, trueTarget: number, falseTarget: number) {
        super("IfElseJump");
        this.args.push(test);
        this.flags.push(["TRUE", trueTarget]);
        this.flags.push(["FALSE", falseTarget]);
    }
}

// (Primitive) IfJumpSEXP
export class IfJumpSEXP extends IridiumSEXP {
    constructor(test: IridiumSEXP, target: number) {
        super("IfJump");
        this.args.push(test);
        this.flags.push(["IDX", target]);

    }
}

// Abstract Operations
// (Primitive) ResolveEnvBindingSEXP
export class ResolveEnvBindingSEXP extends IridiumSEXP {
    constructor(id: string) {
        super("ResolveEnvBindingSEXP");
        this.args.push(new StringSEXP(id));
    }

    getBindingName(): string {
        let res = this.args[0]
        if (isStringSEXP(res)) return res.getVal()
        debugConfig.logger.throwIriError("Cant get binding for ResolveEnvBindingSEXP")
    }

}

// @ts-ignore
export function isResolveEnvBindingSEXP(o: any): o is ResolveEnvBindingSEXP {
    // @ts-ignore
    return o.tag === "ResolveEnvBindingSEXP";
}
