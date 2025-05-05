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

    removeFlag(flag: string) {
        this.flags = this.flags.filter(e => e[0] !== flag);
    }

    setFlag(flag: string, val: IridiumPrimitives = null) {
        this.flags.push([flag, val])
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

    setBBFlag(flag: BBSEXPFlags) {
        if (this.isTopLevel()) this.removeFlag("TopLevel");
        if (this.isClosureBoundary()) this.removeFlag("ClosureBoundary");
        if (this.isLexical()) this.removeFlag("Lexical");
        this.setFlag(flag);
    }

    getBBFlag() : BBSEXPFlags {
        if (this.isTopLevel()) return "TopLevel";
        if (this.isClosureBoundary()) return "ClosureBoundary";
        if (this.isLexical()) return "Lexical";
        debugConfig.logger.throwIriError("No BB Flag found...");
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

// (Primitive) ScopeDescriptor
export type ScopeDescriptorSEXPFlags = BBSEXPFlags | "ScopeIDX" | "ParentIDX" | "GlobalEnv";

export class ScopeDescriptorSEXP extends IridiumSEXP {
    constructor(scopeIDX: number, scopeFlag: BBSEXPFlags | "GlobalEnv") {
        super("ScopeDescriptor");
        this.setScopeIDX(scopeIDX);
        this.setFlag(scopeFlag);
        this.args.push(new ListSEXP([]));
        this.args.push(new ListSEXP([]));
    }

    isGlobalEnv() {
        return this.flags.filter(e => e[0] === "GlobalEnv").length > 0
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

    setScopeIDX(scopeIDX: number) {
        this.setFlag("ScopeIDX", scopeIDX);
    }

    getScopeIDX(): number {
        let res = this.getFlag("ScopeIDX");
        if (typeof res === "number") return res;
        debugConfig.logger.throwIriError("Expected parentIDX to be a number");
    }

    setParentIDX(scopeIDX: number) {
        this.setFlag("ParentIDX", scopeIDX);
    }

    getParentIDX(): number {
        if(this.hasFlag("ParentIDX")) {
            let res = this.getFlag("ParentIDX");
            if (typeof res === "number") return res;
            debugConfig.logger.throwIriError("Expected parentIDX to be a number");
        } else if (this.isGlobalEnv()) {
            return -1;
        } else {
            debugConfig.logger.throwIriError("Expected parentIDX or Global Env");
        }

    }

    hasBin(decls: IridiumSEXP, binding: string) {
        if (isListSEXP(decls)) {
            for (let d of decls.args) {
                if (isEnvBindingSEXP(d) || isGlobalBindingSEXP(d)) {
                    if (d.getDeclaration() === binding) return true;
                } else debugConfig.logger.throwIriError("Expected declarations to be EnvBindingSEXP | GlobalBindingSEXP")
            }
        } else debugConfig.logger.throwIriError("Declaration expected to be inside a ListSEXP");
        return false;
    }

    getBin(decls: IridiumSEXP, binding: string): EnvBindingSEXP | GlobalBindingSEXP {
        if (isListSEXP(decls)) {
            for (let d of decls.args) {
                if (isEnvBindingSEXP(d) || isGlobalBindingSEXP(d)) {
                    if (d.getDeclaration() === binding) return d;
                } else debugConfig.logger.throwIriError("Expected declarations to be EnvBindingSEXP | GlobalBindingSEXP")
            }
        } else debugConfig.logger.throwIriError("Declaration expected to be inside a ListSEXP");
        return null;
    }

    addBin(decls: IridiumSEXP, binding: EnvBindingSEXP | GlobalBindingSEXP) {
        if (isListSEXP(decls)) {
            if (this.hasBin(decls, binding.getDeclaration())) {
                let oldBinding = this.getBin(decls, binding.getDeclaration());
                if (oldBinding !== binding)                
                    debugConfig.logger.throwIriError(`Expected only bindings, found duplicate for ${binding.getDeclaration()}`);
            } else {
                decls.args.push(binding);
            }
        } else debugConfig.logger.throwIriError("Declaration expected to be inside a ListSEXP");
    }


    hasDeclaration(binding: string) {
        return this.hasBin(this.args[0], binding);
    }

    getDeclaration(binding: string) {
        return this.getBin(this.args[0], binding);
    }

    addDeclaration(binding: EnvBindingSEXP | GlobalBindingSEXP) {
        return this.addBin(this.args[0], binding);
    }

    hasLexicalRead(binding: string) {
        return this.hasBin(this.args[1], binding);
    }

    getLexicalRead(binding: string) {
        return this.getBin(this.args[1], binding);
    }

    addLexicalRead(binding: EnvBindingSEXP | GlobalBindingSEXP) {
        return this.addBin(this.args[1], binding);
    }
}

// @ts-ignore
export function isScopeDescriptorSEXP(o: any): o is ScopeDescriptorSEXP {
    // @ts-ignore
    return o.tag === "ScopeDescriptor";
}


export class ScopeDescriptorContainerSEXP extends IridiumSEXP {
    constructor(sds: Array<ScopeDescriptorSEXP>) {
        super("ScopeDescriptorContainer");
        sds.forEach(sd => this.addScopeDescriptor(sd));
    }

    addScopeDescriptor(bb: ScopeDescriptorSEXP) {
        this.args.push(bb);
    }
}

// @ts-ignore
export function isScopeDescriptorContainerSEXP(o: any): o is ScopeDescriptorContainerSEXP {
    // @ts-ignore
    return o.tag === "ScopeDescriptorContainer";
}


export class BBContainerSEXP extends IridiumSEXP {
    constructor(bbs: Array<BBSEXP>) {
        super("BBContainer");
        bbs.forEach(bb => this.addBB(bb));
    }

    addBB(bb: BBSEXP) {
        this.args.push(bb);
    }
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

// (Extension) JSSpread
export class JSSpreadSEXP extends IridiumSEXP {
    constructor(id: IridiumSEXP) {
        super("JSSpread");
        this.args.push(id);
    }
}

// (Extension) JSNUBD
export class JSNUBDSEXP extends IridiumSEXP {
    constructor() {
        super("JSNUBD");
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

// (Primitive) Call
export type CallSiteSEXPFlags = "Import" | "Super" | "V8Intrinsic" | "CCall";
export class CallSiteSEXP extends IridiumSEXP {
    constructor(callee: string, args: Array<IridiumSEXP>, closureFlag: [CallSiteSEXPFlags, IridiumPrimitives][]) {
        super("CallSiteSEXP");
        if (callee) this.args.push(new ResolveEnvBindingSEXP(callee));
        args.forEach(a => this.args.push(a));
        closureFlag.forEach(flag => this.flags.push(flag));
    }

    isImportCall() {
        return this.hasFlag("Import");
    }

    isSuperCall() {
        return this.hasFlag("Super");
    }

    isV8IntrinsicCall() {
        return this.hasFlag("V8Intrinsic");
    }

    isSimpleCall() {
        return !(this.isImportCall() || this.isSuperCall() || this.isV8IntrinsicCall());
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

// (Primitive) GlobalBinding
export class GlobalBindingSEXP extends IridiumSEXP {
    constructor(id: string) {
        super("GlobalBinding");
        this.args.push(new StringSEXP(id));
    }

    getDeclaration(): string {
        if (isStringSEXP(this.args[0])) return this.args[0].getVal();
        debugConfig.logger.throwIriError("Expected Env Declaration to declare a string");
    }

    toString() {
        return `${this.tag}((${this.getDeclaration()}))`
    }

}

// @ts-ignore
export function isGlobalBindingSEXP(o: any): o is GlobalBindingSEXP {
    // @ts-ignore
    return o.tag === "GlobalBinding";
}

// (Primitive) EnvBinding
export type JSEnvBindingFlags = "JSARG" | "JSLET" | "JSCONST" | "JSVAR"; 
export type EnvBindingFlags = "IDX" | JSEnvBindingFlags;
export class EnvBindingSEXP extends IridiumSEXP {
    static DECLARATION_IDX = 0;
    constructor(b: string, flags: [JSEnvBindingFlags, null][]) {
        super("EnvBinding");
        this.args.push(new StringSEXP(b));
        flags.forEach(flag => this.flags.push(flag));
        this.flags.push(["IDX", EnvBindingSEXP.DECLARATION_IDX++])
    }

    getDeclaration(): string {
        if (isStringSEXP(this.args[0])) return this.args[0].getVal();
        debugConfig.logger.throwIriError("Expected Env Declaration to declare a string");
    }

    getKind(): string {
        if (this.hasFlag("JSLET")) return "JSLET";
        if (this.hasFlag("JSCONST")) return "JSCONST";
        if (this.hasFlag("JSVAR")) return "JSVAR";
        if (this.hasFlag("JSARG")) return "JSARG";
        debugConfig.logger.throwIriError("EnvBindingSEXP, unknown kind");
    }

    getID(): number {
        const res = this.getFlag("IDX");
        if (typeof res === "number") return res;
        debugConfig.logger.throwIriError("Expected Env Declaration id to declare a number");
    }

    toString() {
        return `${this.tag}((#${this.getID()}:${this.getKind()}::${this.getDeclaration()}))`
    }
}

// @ts-ignore
export function isEnvBindingSEXP(o: any): o is EnvBindingSEXP {
    // @ts-ignore
    return o.tag === "EnvBinding";
}


// (Primitive) EnvWrite
export class EnvWriteSEXP extends IridiumSEXP {
    lval: string
    constructor(lval: string, rval: IridiumSEXP) {
        super("EnvWrite");
        this.lval = lval
        this.args.push(new ResolveEnvBindingSEXP(lval));
        this.args.push(rval);
    }
}

// @ts-ignore
export function isEnvWriteSEXP(o: any): o is EnvWriteSEXP {
    // @ts-ignore
    return o.tag === "EnvWrite";
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

// (Primitive) FieldRead
export class FieldReadSEXP extends IridiumSEXP {
    constructor(object: string, field: string) {
        super("FieldRead");
        this.args.push(new ResolveEnvBindingSEXP(object));
        this.args.push(new StringSEXP(field));
    }
}

// (Extended) JSComputedFieldRead
export class JSComputedFieldReadSEXP extends IridiumSEXP {
    constructor(object: string, field: string) {
        super("JSComputedFieldRead");
        this.args.push(new ResolveEnvBindingSEXP(object));
        this.args.push(new StringSEXP(field));
    }
}

// (Primitive) FieldWrite
export class FieldWriteSEXP extends IridiumSEXP {
    constructor(object: string, field: string) {
        super("FieldWrite");
        this.args.push(new ResolveEnvBindingSEXP(object));
        this.args.push(new StringSEXP(field));
    }
}

// (Extended) JSComputedFieldRead
export class JSComputedFieldWriteSEXP extends IridiumSEXP {
    constructor(object: string, field: string) {
        super("JSComputedFieldWrite");
        this.args.push(new ResolveEnvBindingSEXP(object));
        this.args.push(new StringSEXP(field));
    }
}

// Control Flow
// (Primitive) Goto
export class GotoSEXP extends IridiumSEXP {
    constructor(target: number) {
        super("Goto");
        this.flags.push(["IDX", target]);
    }
}

// (Primitive) Return
export class ReturnSEXP extends IridiumSEXP {
    constructor(val: IridiumSEXP) {
        super("Return");
        this.args.push(val);
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
