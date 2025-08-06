import { printIriSpace } from "#utils";
import { EnvReadSEXP } from "./Environment";
import { IridiumSEXP } from "./General";

export class AwaitSEXP extends IridiumSEXP {
  constructor(arg: string) {
    super("Await");
    this.args.push(new EnvReadSEXP(arg));
  }

  toString(space?: number): string {
    return `${printIriSpace(space)}AWAIT ${this.args[0].toString(0)}`;
  }
}