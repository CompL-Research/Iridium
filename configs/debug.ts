import pino from "pino";
import {
  DEFAULT_PASS_FLAGS,
  PassFlags,
} from "../classes/builder/IridiumV2/ForgePasses";

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
  passFlags: Required<PassFlags>;
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
  versionNumber: "",
  passFlags: { ...DEFAULT_PASS_FLAGS },
};


export default config;
