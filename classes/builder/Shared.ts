import debugConfig from "#debugConfig";

let varIdx: number = 0;

export const newTemp = (prefix: string | undefined) =>
  `${debugConfig.emitRunnableJS3 ? "t" : "~"}${prefix ? "$" + prefix : ""}$${++varIdx}`;
