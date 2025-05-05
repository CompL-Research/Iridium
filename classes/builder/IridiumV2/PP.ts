import { IridiumPrimitives, IridiumSEXP, isEnvBindingSEXP, isEnvWriteSEXP, isGlobalBindingSEXP } from "./Types.ts";

const printSpace = (space: number) => " ".repeat(space);

const getFlagString = (flags: Array<[string, IridiumPrimitives]>) => {
  if (flags.length === 0) return "";
  return `(${flags.map(e => e[1] !== null ? `${e[0]} => ${e[1]}` : `${e[0]}`).join(", ")})`
}

export const dumpSEXP = (sexp: IridiumSEXP | IridiumPrimitives, space = 0, target = []) => {
  if (sexp === null) return "🙅";
  if (typeof sexp === "number") return sexp;
  if (typeof sexp === "boolean") return sexp;
  if (typeof sexp === "string") return sexp;

  if (isEnvBindingSEXP(sexp)) {
    const toStringRes = sexp.toString()
    target.push(`${printSpace(space)}${toStringRes}`);
    return;
  }

  if (isGlobalBindingSEXP(sexp)) {
    const toStringRes = sexp.toString()
    target.push(`${printSpace(space)}${toStringRes}`);
    return;
  }

  target.push(`${printSpace(space)}${sexp.tag}${getFlagString(sexp.flags)}`);
  sexp.args.forEach(a => dumpSEXP(a, space + 2, target));

  return target.join("\n");
}