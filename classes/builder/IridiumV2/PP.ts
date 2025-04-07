import { IridiumPrimitives, IridiumSEXP } from "./Types.ts";

const printSpace = (space: number) => " ".repeat(space);

export const dumpSEXP = (sexp: IridiumSEXP | IridiumPrimitives, space = 0, target = []) => {
  if (sexp === null) return "🙅";
  if (typeof sexp === "number") return sexp;
  if (typeof sexp === "boolean") return sexp;
  if (typeof sexp === "string") return sexp;

  target.push(`${printSpace(space)}${sexp.tag}(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
  sexp.args.forEach(a => dumpSEXP(a, space + 2, target));

  return target.join("\n");
}