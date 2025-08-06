import { printIriSpace } from "#utils";
import { ResolveEnvBindingSEXP } from "../AbstractOperations";
import { EnvReadSEXP } from "../Environment";
import { IridiumSEXP } from "../General";

// (Extension) JSForInStart
export class JSForInStartSEXP extends IridiumSEXP {
  constructor(obj: string, target: string) {
    super("JSForInStart");
    this.args.push(new EnvReadSEXP(obj));
    this.args.push(new ResolveEnvBindingSEXP(target));
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// (Extension) JSForInNext
export class JSForInNextSEXP extends IridiumSEXP {
  constructor(iterator: string, stackTop: string, stackTopNext: string) {
    super("JSForInNext");
    this.args.push(new EnvReadSEXP(iterator));
    this.args.push(new ResolveEnvBindingSEXP(stackTop));
    this.args.push(new ResolveEnvBindingSEXP(stackTopNext));
  }
}

// (Extension) JSForOfStart
export class JSForOfStartSEXP extends IridiumSEXP {
  constructor(obj: string | IridiumSEXP) {
    super("JSForOfStart");
    if (typeof (obj) === "string") {
      this.args.push(new EnvReadSEXP(obj));
    } else {
      this.args.push(obj);
    }
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }
}

// (Extension) JSForOfNext
export class JSForOfNextSEXP extends IridiumSEXP {
  constructor(stackTop: string, stackTopNext: string) {
    super("JSForOfNext");
    this.args.push(new ResolveEnvBindingSEXP(stackTop));
    this.args.push(new ResolveEnvBindingSEXP(stackTopNext));
  }

  toString(space?: number): string {
    const res = [];
    res.push(`${printIriSpace(space)}${this.tag}`);
    for (let s of this.args) {
      res.push(`${printIriSpace(10)}${s.toString(0)}`);
    }
    return res.join("\n");
  }

}

// (Extension) JSIteratorClose
export class JSIteratorCloseSEXP extends IridiumSEXP {
  constructor() {
    super("JSIteratorClose");
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}${this.tag}`;
  }
}