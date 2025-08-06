import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "./AbstractOperations";
import { EnvReadSEXP } from "./Environment";
import { IridiumSEXP } from "./General";

export class YieldSEXP extends IridiumSEXP {
  constructor(arg: string, yieldReturnIndicator: string, yieldReturnResultHolder: string) {
    super("Yield");
    this.args.push(new EnvReadSEXP(arg));
    this.args.push(new ResolveEnvBindingSEXP(yieldReturnIndicator));
    this.args.push(new ResolveEnvBindingSEXP(yieldReturnResultHolder));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}YIELD [${this.args[0].toString(0)}] ↝ ${this.args[1].toString(0)}, ${this.args[2].toString(0)}`;
  }
}

export class ReturnAsyncSEXP extends IridiumSEXP {
  constructor(val: IridiumSEXP) {
    super("ReturnAsync");
    this.args.push(val);
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}return[async] ${this.args[0].toString(0)}`
  }
}

// (Extension) JSInitialYield
export class JSInitialYieldSEXP extends IridiumSEXP {
  constructor() {
    super("JSInitialYield");
  }
}