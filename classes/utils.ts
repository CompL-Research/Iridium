import { CommentBlock, CommentLine } from "@babel/types";
import fs from "fs";
import path from "path";
import {
  BinopSEXP,
  IridiumPrimitives,
  IridiumSEXP,
  JSBinopSEXP,
  JSUnopSEXP,
  UnopSEXP,
} from "./builder/IridiumV2/Types";

const PrimitiveUnOP = ["!", "+", "-", "~"];

export const getIridiumUnop = (op: string, val: IridiumSEXP) => {
  if (PrimitiveUnOP.includes(op)) {
    return new UnopSEXP(op, val);
  } else {
    return new JSUnopSEXP(op, val);
  }
};

//
// JSBinops: "==" | "===" | "!=" | "!==" | "in" | "instanceof" | "|>";
//
// Traditional Binops have been mapped to the following in Prakriti:
//   1. NAC_HandleBinop: "**", "*",  "/", "%", "+", "-", "<<", ">>", ">>>", "&", "^", "|"
//   2. NAC_HandleRelop: "<", ">", "<=", ">="
//
const PrimitiveArithOP = ["+", "-", "/", "%", "*", "**"];
const PrimitiveBitwiseOP = ["&", "|", "^", "<<", ">>", ">>>"];
const PrimitiveComparisonOP = [">", "<", ">=", "<="];

const isPrimitiveBinop = (b: string) => {
  return (
    PrimitiveArithOP.includes(b) ||
    PrimitiveBitwiseOP.includes(b) ||
    PrimitiveComparisonOP.includes(b)
  );
};

export const getIridiumBinop = (
  op: string,
  lBinop: IridiumSEXP,
  rBinop: IridiumSEXP,
) => {
  if (isPrimitiveBinop(op)) {
    return new BinopSEXP(op, lBinop, rBinop);
  } else {
    return new JSBinopSEXP(op, lBinop, rBinop);
  }
};

export const printIriSpace = (times: number | undefined = 0) => {
  if (!times) times = 0;
  let res: Array<string> = [];
  for (let i = 0; i < times; i++) {
    if (i % 2 == 0) {
      res.push("░");
    } else {
      res.push(" ");
    }
  }
  return res.join("");
};

export const printFlagString = (flags: Array<[string, IridiumPrimitives]>) => {
  if (flags.length === 0) return "";
  return `[${flags.map((e) => (e[1] !== null ? `${e[0]} : ${e[1]}` : `${e[0]}`)).join(", ")}]`;
};

export const hasPackageJson = (folderPath: string) => {
  return fs.existsSync(path.join(folderPath, "package.json"));
};

export function untilFirstMatch<T>(
  arr: T[],
  predicate: (item: T, index: number, array: T[]) => boolean,
): T[] {
  const index = arr.findIndex(predicate);
  return index === -1 ? arr.slice() : arr.slice(0, index);
}

export const ensurePathExists = (path: string) => {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }
  fs.mkdirSync(path);
};

export function generateCommentLine(comment: string): CommentLine {
  return {
    type: "CommentLine",
    value: comment,
  } as CommentLine;
}

export function generateCommentBlock(comment: string): CommentBlock {
  return {
    type: "CommentBlock",
    value: comment,
  } as CommentBlock;
}

