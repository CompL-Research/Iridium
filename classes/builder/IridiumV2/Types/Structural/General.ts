import { printFlagString, printIriSpace } from "#utils";
import { IriTag, IriFlag } from "../TSTypes";

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

  serializeFlat(res: Array<any> = []): Array<any> {
    res.push(IriTag[this.tag as keyof typeof IriTag]);
    res.push(this.args.length);
    res.push(this.flags.length);
    for (let [flagName, e] of this.flags) {
      res.push(IriFlag[flagName as keyof typeof IriFlag]);
      res.push(e);
    }
    for (let a of this.args) {
      a.serializeFlat(res);
    }
    return res;
  }

  checkIntegrity(): boolean {
    // 1. Check if the Tag exists in the IriTag enum
    if (!(this.tag in IriTag)) {
      console.error(`Integrity Error: Invalid tag "${this.tag}"`);
      return false;
    }

    // 2. Ensure flags is a valid Map or Iterable (matching your for...of loop)
    if (!(this.flags instanceof Map) && !Array.isArray(this.flags)) {
      console.error("Integrity Error: flags is not an iterable collection");
      return false;
    }

    // 3. Check if all flags are recognized
    for (let [flagName] of this.flags) {
      if (!(flagName in IriFlag)) {
        console.error(`Integrity Error: Unknown flag name "${flagName}"`);
        return false;
      }
    }

    // 4. Ensure args is an array
    if (!Array.isArray(this.args)) {
      console.error("Integrity Error: args is not an array");
      return false;
    }

    // 5. Recursive check: Ensure all children are valid
    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];

      // Check if the argument exists and has the checkIntegrity method
      if (!arg || typeof arg.checkIntegrity !== 'function') {
        console.error(`Integrity Error: Argument at index ${i} is null or lacks checkIntegrity()`);
        return false;
      }

      // Run the recursive check
      if (!arg.checkIntegrity()) {
        return false;
      }
    }

    return true;
  }

  /**
   * Given a serialized array of Iridium code, pretty prints it for debugging
   * @param data The array produced by serialize()
   * @param depth Indicating the traversal depth
   * @param state An object to track the current index during recursion
   */
  static dumpFlat(
    data: any[],
    depth: number = 0,
    state = { index: 0, result: Array<string>() },
  ): Array<string> {
    const indent = " ".repeat(depth);

    // Get the numeric value from the array first
    const tagValue = data[state.index++];
    // Then look up the string name from the Enum
    const tagName = IriTag[tagValue] ?? `unknown_tag(${tagValue})`;

    const numArgs = data[state.index++];
    const numFlags = data[state.index++];

    // 2. Handle Flags
    let flags: Array<string> = [];
    for (let i = 0; i < numFlags; i++) {
      const flagEnumVal = data[state.index++]; // The numeric value
      const flagData = data[state.index++];
      const flagName = IriFlag[flagEnumVal] ?? `unknown_flag(${flagEnumVal})`;
      if (flagData === null) {
        flags.push(`${flagName}`);
      } else if (typeof flagData === "string") {
        flags.push(`${flagName}: "${flagData}"`);
      } else {
        flags.push(`${flagName}: ${flagData}`);
      }

    }

    // 3. Format the current line
    const flagsStr = flags.length > 0 ? ` [${flags.join(", ")}]` : "";
    state.result.push(`${indent}${tagName}${flagsStr}`);

    // 4. Handle Args (Children)
    for (let i = 0; i < numArgs; i++) {
      // Recursive call handles its own incrementing of state.index
      IridiumSEXP.dumpFlat(data, depth + 2, state);
    }

    return state.result;
  }

  hasFlag(flag: string) {
    return this.flags.filter((e) => e[0] === flag).length === 1;
  }

  removeFlag(flag: string) {
    this.flags = this.flags.filter((e) => e[0] !== flag);
  }

  setFlag(flag: string, val: IridiumPrimitives = null) {
    if (this.hasFlag(flag)) {
      this.removeFlag(flag);
    }
    this.flags.push([flag, val]);
  }

  getFlag(flag: string): IridiumPrimitives {
    const currFlag = this.flags.filter((e) => e[0] === flag);
    if (this.flags.filter((e) => e[0] === flag).length === 1) {
      return currFlag[0][1];
    }
    throw new Error(`Failed to get flag: ${flag}`);
  }

  getFlagNumber(flag: string): number {
    const currFlag = this.flags.filter((e) => e[0] === flag);
    if (this.flags.filter((e) => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "number") return res;
      throw new Error("Expected scope to be a number");
    }
    throw new Error(`Failed to get flag: ${flag}`);
  }

  getFlagString(flag: string): string {
    const currFlag = this.flags.filter((e) => e[0] === flag);
    if (this.flags.filter((e) => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "string") return res;
      throw new Error("Expected scope to be a number");
    }
    throw new Error(`Failed to get flag: ${flag}`);
  }

  getFlagBoolean(flag: string): boolean {
    const currFlag = this.flags.filter((e) => e[0] === flag);
    if (this.flags.filter((e) => e[0] === flag).length === 1) {
      let res = currFlag[0][1];
      if (typeof res === "boolean") return res;
      throw new Error("Expected scope to be a number");
    }
    throw new Error(`Failed to get flag: ${flag}`);
  }

  toString(space = 0): string {
    let res: Array<string> = [];
    res.push(
      `${printIriSpace(space)}${this.tag}${printFlagString(this.flags)}`,
    );
    res = [...res, ...this.args.map((e) => e.toString(space + 2))];
    return res.join("\n");
  }
}
