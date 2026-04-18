
const config: {
  operationMode: "js3" | "iri" | "pika";
  cli: {
    allowLangWithSupport: boolean;
    outputsPath: string | undefined;
    comments: boolean;
    debugIri: boolean;
    tout: boolean;
    ljson: boolean;
    iridiumPP: boolean;
    sourceType: string;
    projectBase: string | undefined;
  };
  versionNumber: string;
} = {
  operationMode: "js3",
  cli: {
    allowLangWithSupport: false,
    outputsPath: undefined,
    comments: false,
    debugIri: false,
    tout: false,
    ljson: false,
    iridiumPP: false,
    sourceType: "unambiguous",
    projectBase: undefined,
  },
  versionNumber: ""
};

export default config;
