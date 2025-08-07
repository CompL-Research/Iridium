import { printFlagString, printIriSpace } from "#utils";

/**
 * Primitives which can be stored inside an Iridium Flag.
 * */
export type IridiumPrimitives = number | boolean | string | null;

/**
 * Parentmost Iridium Class, all Iridium nodes derive from this.
*/
export class IridiumSEXP {
  /**
   * Tag specifics the S-Expression Type.
  */
  tag: string = "IridiumSEXP";
  /**
   * Args are the children nodes to the current node.
  */
  args: Array<IridiumSEXP> = [];
  /**
   * Flags store metadata/primitive data in an Iridium node. These nodes cannot store other Iridium S-Expressions.
   */
  flags: Array<[string, IridiumPrimitives]> = [];

  /**
   * Each Iridium S-Expression must have a unique tag.
   * @param tag 
   */
  constructor(tag: string) {
    this.tag = tag;
  }

  /**
   * This method is used to squish the Iridium Code into an array which can be easily stored on disk.
   * @returns Nested Array of Iridium S-Expressions.
   */
  serialize(): Array<any> {
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
    if (this.hasFlag(flag)) {
      this.removeFlag(flag);
    }
    this.flags.push([flag, val])
  }

  getFlag(flag: string): IridiumPrimitives {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      return currFlag[0][1];
    }
    throw new Error(`Failed to get flag: ${flag}`)
  }

  getFlagNumber(flag: string): number {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "number") return res;
      throw new Error("Expected scope to be a number");
    }
    throw new Error(`Failed to get flag: ${flag}`)
  }

  getFlagString(flag: string): string {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "string") return res;
      throw new Error("Expected scope to be a number");
    }
    throw new Error(`Failed to get flag: ${flag}`)
  }

  getFlagBoolean(flag: string): boolean {
    const currFlag = this.flags.filter(e => e[0] === flag);
    if (this.flags.filter(e => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "boolean") return res;
      throw new Error("Expected scope to be a number");
    }
    throw new Error(`Failed to get flag: ${flag}`)
  }

  toString(space = 0): string {
    let res: Array<string> = []
    res.push(`${printIriSpace(space)}${this.tag}${printFlagString(this.flags)}`);
    res = [...res, ...this.args.map(e => e.toString(space + 2))];
    return res.join("\n");
  }

}