import { printFlagString, printIriSpace } from "#utils";
import { IridiumSEXP } from "../Structural/General";

/**
 *
 * @group TSHelper
 *
 */
/**
 *
 * @extends {IridiumSEXP}
 *
 * @group RVAL
 *
 * @remarks
 *
 * `[[Call]](callee, this, args)`: calls a closure with an explicit `this`. A plain call `f(a)` passes
 * `undefined` as `this`; a method call `o.f(a)` passes `o`.
 *
 * #### Structure
 *
 * - `ARG(callee)`: The closure to call.
 *
 * - `ARG(this)`: The `this` value.
 *
 * - `...ARG(args)`: The arguments.
 *
 * A plain `eval(a)` call is turned into a JSEval node by Forge (pass 16).
 *
 */
export class CallSiteSEXP extends IridiumSEXP {
  constructor(callee: IridiumSEXP, thisArg: IridiumSEXP, args: Array<IridiumSEXP>) {
    super("CallSite");
    this.args.push(callee, thisArg, ...args);
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
  constructor(callee: IridiumSEXP, context: IridiumSEXP, argList: IridiumSEXP) {
    super("Apply");

    this.setCallee(callee);
    this.setContext(context);
    this.setArgList(argList);
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


}

/**
 * @hidden
 */
export function isCallSiteSEXP(o: any): o is CallSiteSEXP {
  // @ts-ignore
  return o.tag === "CallSite";
}

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group AMP
 *
 * @remarks
 *
 * `[[Construct]](callee, args, newTarget)`. `new F(a)` passes `F` as new.target; `super(a)` passes the
 * parent constructor as callee and the caller's `new.target`.
 *
 * #### Structure
 *
 * - `ARG(callee)`: The constructor.
 *
 * - `ARG(newTarget)`: Whose `prototype` the new object gets.
 *
 * - `...ARG(args)`: The arguments.
 *
 * - `FLAG(Super?)`: A `super(...)` call; pass 6 binds `this` and runs the field initializers after it.
 *
 */
export class JSConstructSEXP extends IridiumSEXP {
  constructor(callee: IridiumSEXP, newTarget: IridiumSEXP, args: Array<IridiumSEXP>, isSuper: boolean = false) {
    super("JSConstruct");
    this.args.push(callee, newTarget, ...args);
    if (isSuper) this.setFlag("Super");
  }
}

/**
 *
 * @extends {IridiumSEXP}
 *
 * @group AMP
 *
 * @remarks
 *
 * {@link JSConstructSEXP} with a dynamic argument list (spread).
 *
 * #### Structure
 *
 * - `ARG(callee)`, `ARG(newTarget)`: As in {@link JSConstructSEXP}.
 *
 * - `ARG(argList)`: A JSArray holding the arguments.
 *
 * - `FLAG(Super?)`: A `super(...)` call.
 *
 */
export class JSConstructApplySEXP extends IridiumSEXP {
  constructor(callee: IridiumSEXP, newTarget: IridiumSEXP, argList: IridiumSEXP, isSuper: boolean = false) {
    super("JSConstructApply");
    this.args.push(callee, newTarget, argList);
    if (isSuper) this.setFlag("Super");
  }
}
