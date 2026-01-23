import { printFlagString, printIriSpace } from "#utils";
import { JSArraySEXP } from "../RVAL";
import { IridiumPrimitives, IridiumSEXP } from "../Structural/General";

/**
 * 
 * @group TSHelper
 * 
 */
export type CallSiteSEXPFlags = "Import" | "Super" | "V8Intrinsic" | "CCall" | "ConstructorCall" | "PrivateCall" | "JSDirectEval";

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * Represents a call made to a closure. First `N` arguments are used to form the calling context, the value of N is 1 by default.
 * Depending on the marked flag (see {@link CallSiteSEXPFlags}) different values of `N` are selected.
 * Also, when calling a closure, different calling conventions might apply, these are broadly classified into the following three categories:
 * 
 * 1. **Basic Closure Application**: 
 * 
 * - No flag set, N = 1 by default i.e. the first argument is the callee object. The rest of the args are passed as arguments to the callee. 
 * 
 * 2. **Contextual Closure Application**: 
 * 
 * - `CCall`: N = 2, the first two args form the calling context (first arg is mapped to the `this` object and the second arg is callee). The rest of the args are passed as arguments to the callee.
 * 
 * - `PrivateCall`: N = 2, same as `CCall` but an additional brand check is needed before actual execution.
 * 
 * 3. **Constructor Special Closure Application**: This kind of call expects two objects to form the calling context, the callee object and a new_target special object.
 * 
 * - `ConstructorCall`: N = 1, (even though N = 1, the first argument is duplicated before the actual call). The rest of the args are passed as arguments to the closure. 
 * 
 * - `super`: N = 2. The rest of the args are passed as arguments to the closure. 
 * 
 * 4. **TODOs**: Import and V8Intrinsic.
 * 
 * #### Structure
 * 
 * - `...ARG(...callContext, ...args)`: The first N args are used form the calling context while the rest are mapped to formals.
 * 
 * - `FLAG(CCall)`: Contextual Call where `this` binding is provided by the call site.
 * 
 * - `FLAG(ConstructorCall)`: Contextual Call where `this` binding is provided by the call site.
 * 
 * - `FLAG(PrivateCall)`: Contextual Call with added brand check.
 * 
 * - `FLAG(Import)`: Dynamic import call.
 * 
 * - `FLAG(Super)`: Call to the parent class constructor.
 * 
 * - `FLAG(V8Intrinsic)`: Call to a V8 Intrinsic.
 * 
 * - `FLAG(JSDirectEval)`: Marks the call as direct eval, i.e. in sloppy mode the evaled code **can** modify the enclosing environment.
 * 
 */
export class CallSiteSEXP extends IridiumSEXP {
  constructor(args: Array<IridiumSEXP>, closureFlag: CallSiteSEXPFlags | undefined = undefined) {
    super("CallSite");
    args.forEach(a => this.args.push(a));
    if (closureFlag) this.setCallFlag(closureFlag);
  }

  // Flags
  setCallFlag(closureFlag: CallSiteSEXPFlags) {
    this.setFlag(closureFlag);
  }

  getCallFlag(): CallSiteSEXPFlags | undefined {
    if (this.hasFlag("Import")) return "Import";
    else if (this.hasFlag("Super")) return "Super";
    else if (this.hasFlag("V8Intrinsic")) return "V8Intrinsic";
    else if (this.hasFlag("CCall")) return "CCall";
    else if (this.hasFlag("ConstructorCall")) return "ConstructorCall";
    else if (this.hasFlag("PrivateCall")) return "PrivateCall";
    else if (this.hasFlag("JSDirectEval")) return "JSDirectEval";
    else return undefined; 
  }

  setJSDirectEval(refIdx: number) {
    this.setFlag("JSDirectEval", refIdx)
  }

  getJSDirectEval(): number {
    if (!this.hasFlag("JSDirectEval")) throw new Error("Expected JSDirectEval to be set before this function is called");
    return this.getFlagNumber("JSDirectEval");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}CallSite[${printFlagString(this.flags)}](${this.args.map(e => e.toString(0)).join(", ")})`
  }
}

/**
 * 
 * @extends {IridiumSEXP}
 * 
 * @group RVAL
 * 
 * @remarks
 * 
 * For calls that pass a dynamic number of arguments
 * 
 * 1. **ConstructorCall**: Note that callee is duplicated, ctx is never used
 * 
 * 2. **JSDirectEval**: Note that the ctx object is ignored as it is not required by eval.
 * 
 * #### Structure
 * 
 * - `ARG(Callee)`: The method to be called.
 * 
 * - `ARG(Context)`: The `this` context to be provided.
 * 
 * - `ARG(ArgList)`: A JSArray containing the arguments to be passed.
 * 
 * - `FLAG(ConstructorCall?)`: Contextual Call where `this` binding is provided by the call site.
 * 
 * - `FLAG(Super?)`: Call to the super constructor, is is used by the decorator to identify the call to the constructor...
 * 
 * - `FLAG(JSDirectEval?: double)`: Marks the call as direct eval, i.e. in sloppy mode the evaled code **can** modify the enclosing environment.
 * 
 */
export class ApplySEXP extends IridiumSEXP {
  constructor(callee: IridiumSEXP, context: IridiumSEXP, argList: IridiumSEXP, isConstructorCall: boolean = false) {
    super("Apply");

    this.setCallee(callee);
    this.setContext(context);
    this.setArgList(argList);

    if (isConstructorCall) this.setConstructorCall();    
  }

  // Args
  setCallee(obj: IridiumSEXP) {
    this.args[0] = obj;
  }

  getCallee(): IridiumSEXP {
    return this.args[0];
  }

  setContext(obj: IridiumSEXP) {
    this.args[1] = obj;
  }

  getContext(): IridiumSEXP {
    return this.args[1];
  }

  setArgList(obj: IridiumSEXP) {
    this.args[2] = obj;
  }

  getArgList(): IridiumSEXP {
    return this.args[2];
  }

  // Flags
  setConstructorCall() {
    this.setFlag("ConstructorCall");
  }

  hasConstructorCall(): boolean {
    return this.hasFlag("ConstructorCall");
  }

  setSuper() {
    this.setFlag("Super");
  }

  hasSuper(): boolean {
    return this.hasFlag("Super");
  }

  setJSDirectEval(refIdx: number) {
    this.setFlag("JSDirectEval", refIdx);
  }

  getJSDirectEval(): number {
    if (!this.hasFlag("JSDirectEval")) throw new Error("Expected JSDirectEval to be set before this function is called");
    return this.getFlagNumber("JSDirectEval");
  }

}

/**
 * @hidden
 */
export function isCallSiteSEXP(o: any): o is CallSiteSEXP {
  // @ts-ignore
  return o.tag === "CallSite";
}