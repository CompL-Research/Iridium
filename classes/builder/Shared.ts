let varIdx: number = 0;

export const newTemp = (prefix: string | undefined) =>
  `${prefix ? "iritmp$" + prefix : "iritmp"}$${++varIdx}`;
