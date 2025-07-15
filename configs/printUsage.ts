/* eslint-disable @typescript-eslint/no-explicit-any */
import debugConfig from "#debugConfig";
import chalk from "chalk";
import path from "path";
// @ts-ignore
import commandLineArgs from "command-line-args";
// @ts-ignore
import commandLineUsage from "command-line-usage";
import { projectStats } from "./projectStats";

const directories = ["./classes", "./configs", "./docs", "./playground/src"];

// 
// Utility
// 
export const getFirstCommand = [{ name: "command", defaultOption: true }];

export const getNextCommand = (argv: Array<string> | undefined = undefined) : [string, Array<string>] => {
  const mainOptions = commandLineArgs(getFirstCommand, {
    argv: argv ? argv : undefined,
    stopAtFirstUnknown: true,
  });

  return [mainOptions.command, mainOptions._unknown || []];
}

export const handleOptionsFromArgv = (argv: Array<string>, optionList: any) : Array<string> => {
  const options = commandLineArgs(optionList, { argv, stopAtFirstUnknown: true });
  handleOptions(options);
  return options._unknown || [];
}


type UsageSectionObject = {
  content?: any;
  raw?: boolean;
  header?: string;
  optionList?: any;
};

//
// General Usage Info
//
const defaultUsageInfo: UsageSectionsArray = [
  {
    header: "=== Iridium ===",
    content: [
      "Iridium is a static analysis framework for JavaScript Programs 📈.",
      "$ ./iridium <command>",
      "$ ./iridium js3",
      "$ ./iridium pika",
      "$ ./iridium iri",
      "$ ./iridium stats",
      "$ ./iridium help",
    ],
  },
  {
    header: "Command List",
    content: [
      { name: "help", summary: "Display this information." },
      { name: "js3", summary: "Generate JS3 file and print to stdout" },
      {
        name: "pika",
        summary: "Generate Iridium Pika-ge (package).",
      },
      {
        name: "iri",
        summary: "Generate Iridium file (.iri)",
      },
    ],
  },
];

const projectStatsInfo: UsageSectionsArray = [
  {
    header: "=== Iridium ===",
    content: [
      ...projectStats(directories)
    ],
  }
];

type UsageSectionsArray = Array<UsageSectionObject>;

//
// === JS3 Related ===
//

const JS3_OPTIONS = [
  {
    name: "outputs-path",
    description:
      "Path to outputs directory (For JS3 this must be an file path).",
    alias: "o",
    type: String,
    typeLabel: "{underline path} ...",
  },
  {
    name: "comments",
    description:
      "Preserves comments when translating to JS3 (needed for test262 tests to run).",
    alias: "c",
    type: Boolean,
  },
  {
    name: "tout",
    description:
      "Print the output directly to the terminal.",
    alias: "t",
    type: Boolean,
  },
  {
    name: "source-type",
    description: 'Source Type ("module" | "script" | "unambigious" (default)).',
    alias: "s",
    type: String,
  }
];

export const js3UsageInfo: UsageSectionsArray = [
  {
    header: "=== JS3 ===",
    content: [`$ ./iridium js3 [OPTIONS] {bold <path-to-js-file>}`],
  },
  {
    header: "JS3 Options",
    optionList: [...JS3_OPTIONS],
  },
];

//
// === IRIDIUM Related ===
//

const IRI_OPTIONS = [
  {
    name: "outputs-path",
    description:
      "Path to outputs directory (For JS3 this must be an file path).",
    alias: "o",
    type: String,
    typeLabel: "{underline path} ...",
  },
  {
    name: "comments",
    description:
      "Preserves comments when translating to JS3 (needed for test262 tests to run).",
    alias: "c",
    type: Boolean,
  },
  {
    name: "pp",
    description:
      "Pretty Print.",
    type: Boolean,
  },
  {
    name: "tout",
    description:
      "Print the output directly to the terminal.",
    alias: "t",
    type: Boolean,
  },
  {
    name: "source-type",
    description: 'Source Type ("module" | "script" | "unambigious" (default)).',
    alias: "s",
    type: String,
  }
];

export const iriUsageInfo: UsageSectionsArray = [
  {
    header: "=== IRI ===",
    content: [
      `$ ./iridium iri [OPTIONS] {bold <project-base-path>} {bold <source-js-file>}`,
    ],
  },
  {
    header: "Iridium Options",
    optionList: [...IRI_OPTIONS],
  },
];

//
// === IRIDIUM Related ===
//

const PIKA_OPTIONS = [
  {
    name: "outputs-path",
    description:
      "Path to outputs directory (For JS3 this must be an file path).",
    alias: "o",
    type: String,
    typeLabel: "{underline path} ...",
  },
  {
    name: "comments",
    description:
      "Preserves comments when translating to JS3 (needed for test262 tests to run).",
    alias: "c",
    type: Boolean,
  },
  {
    name: "pp",
    description:
      "Pretty Print.",
    type: Boolean,
  },
  {
    name: "tout",
    description:
      "Print the output directly to the terminal.",
    alias: "t",
    type: Boolean,
  },
  {
    name: "source-type",
    description: 'Source Type ("module" | "script" | "unambigious" (default)).',
    alias: "s",
    type: String,
  },
];

export const pikaUsageInfo: UsageSectionsArray = [
  {
    header: "=== Pika ===",
    content: [
      `$ ./iridium pika [OPTIONS] {bold <project-base-path>} {bold <main-file>} {bold <other-file>...}`,
    ],
  },
  {
    header: "Pika Options",
    optionList: [...PIKA_OPTIONS],
  },
];

//
// General Exports
//
export const handleOutputsPath = (options: any) => {
  if (options["outputs-path"] === null) {
    console.log(chalk.red("Outputs path not provided"));
    process.exit(1);
  }
  debugConfig.cli.outputsPath = path.resolve("./" + options["outputs-path"]);
};

export const handleComments = () => {
  debugConfig.cli.comments = true;
};

export const handleTout = () => {
  debugConfig.cli.tout = true;
}

export const handleIridiumPP = () => {
  debugConfig.cli.iridiumPP = true;
}

export const handleSourceType = (options: any) => {
  if (options["source-type"] === null) {
    console.log(chalk.red("JS3 mode is not provided"));
    process.exit(1);
  }
  debugConfig.cli.sourceType = options["source-type"];
};

// export const handleLangWithSupport = () =>
//   (debugConfig.cli.allowLangWithSupport = true);
// export const handleSavePTAGraph = () => (debugConfig.cli.savePTAGraph = true);
// export const handleSaveFlowGraph = () => (debugConfig.cli.saveFlowGraph = true);
// export const handleSaveDepGraph = () => (debugConfig.cli.saveDepGraph = true);

export const handleOptions = (options: any) => {
  if ("outputs-path" in options) handleOutputsPath(options);
  if ("comments" in options) handleComments();
  if ("tout" in options) handleTout();
  if ("pp" in options) handleIridiumPP();
  if ("source-type" in options) handleSourceType(options);
}

export function printDefaultUsage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...defaultUsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}

export function printProjectStats(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...projectStatsInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}

export function printJS3Usage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...js3UsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}

export function printPikaUsage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...pikaUsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}


export function printIRIUsage(header: string) {
  const sections: UsageSectionsArray = [
    // Sometimes the type system is just annoying
    {
      content: chalk.red(header),
      raw: true,
    },

    ...iriUsageInfo,
  ];
  const usage = commandLineUsage(sections);
  console.log(usage);
}
