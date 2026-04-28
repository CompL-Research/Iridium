import pino from "pino";

export const logger = pino();

const config: {
  operationMode: "js3" | "iri";
  sourceType: "unambiguous" | "module" | "script";
  rac: boolean;
  dump: {
    out: string;
    js3: boolean;
    irix: boolean;
    iri: boolean;
    irio: boolean;
  };
  versionNumber: string;
} = {
  operationMode: "js3",
  sourceType: "unambiguous",
  rac: false,
  dump: {
    out: "./",
    js3: false,
    irix: false,
    iri: false,
    irio: false,
  },
  versionNumber: ""
};


export default config;
