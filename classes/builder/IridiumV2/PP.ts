import { BBSEXP, EnvRead, FileSEXP, IridiumPrimitives, IridiumSEXP, JSEnvWrite, ListSEXP, ResolveEnvBinding, StringSEXP } from "./Types.ts";
import debugConfig from "#debugConfig";

const printSpace = (space: number) => " ".repeat(space);

export const dumpSEXP = (sexp: IridiumSEXP | IridiumPrimitives, space = 0, target = []) => {
  if (sexp === null) return "🙅";
  if (typeof sexp === "number") return sexp;
  if (typeof sexp === "boolean") return sexp;
  if (typeof sexp === "string") return sexp;
  
  if (sexp instanceof FileSEXP) {
    target.push(`${printSpace(space)}File(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else if (sexp instanceof BBSEXP) {
    target.push(`${printSpace(space)}BB(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else if (sexp instanceof JSEnvWrite) {
    target.push(`${printSpace(space)}JSEnvWrite(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else if (sexp instanceof StringSEXP) {
    target.push(`${printSpace(space)}String(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else if (sexp instanceof ListSEXP) {
    target.push(`${printSpace(space)}List(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else if (sexp instanceof EnvRead) {
    target.push(`${printSpace(space)}EnvRead(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else if (sexp instanceof ResolveEnvBinding) {
    target.push(`${printSpace(space)}ResolveEnvBinding(flags -> ${sexp.flags.map(e => `${e[0]} : ${dumpSEXP(e[1], space, target)}`).join(", ")})`);
    sexp.args.forEach(a => dumpSEXP(a, space + 2, target));
  } else {
    debugConfig.logger.throwIriError(`dumpSEXP unhandled!! ${JSON.stringify(sexp)}`);
  }
  return target.join("\n");
}