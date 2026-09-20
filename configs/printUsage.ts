import debugConfig from "#debugConfig";
import chalk from "chalk";
import path from "path";
// @ts-expect-error
import commandLineArgs from "command-line-args";
// @ts-expect-error
import commandLineUsage from "command-line-usage";

import authors from "../Authors";
import { PASS_FLAGS_SPEC } from "../classes/builder/IridiumV2/ForgePasses";

//
// Utility
//
export const getFirstCommand = [{ name: "command", defaultOption: true }];

export const getNextCommand = (
  argv: Array<string> | undefined = undefined,
): [string, Array<string>] => {
  const mainOptions = commandLineArgs(getFirstCommand, {
    argv: argv ? argv : undefined,
    stopAtFirstUnknown: true,
  });

  return [mainOptions.command, mainOptions._unknown || []];
};

export const handleOptionsFromArgv = (
  argv: Array<string>,
  optionList: any,
): Array<string> => {
  const options = commandLineArgs(optionList, {
    argv,
    stopAtFirstUnknown: true,
  });
  handleOptions(options);
  return options._unknown || [];
};

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
      "$ ./iridium iri",
      "$ ./iridium author",
      "$ ./iridium help",
    ],
  },
  {
    header: "Command List",
    content: [
      { name: "help", summary: "Display this information." },
      { name: "js3", summary: "Generate JS3 file (.js3.js)" },
      {
        name: "iri",
        summary: "Generate Iridium file (.iri)",
      },
    ],
  },
];

type UsageSectionsArray = Array<UsageSectionObject>;

const OPT_OUT = {
  name: "out",
  description: "Output folder (default = cwd).",
  alias: "o",
  type: String,
  typeLabel: "{underline path} ...",
  defaultValue: "./",
};

const OPT_SRC_TYPE = {
  name: "source-type",
  description: 'Source Type ("module" | "script" | "unambiguous" (default)).',
  alias: "s",
  type: String,
  defaultValue: "unambiguous",
};

const OPT_RUN_AFTER_COMPILE = (defVal: boolean) => ({
  name: "rac",
  description: "Run after compilation.",
  alias: "r",
  type: Boolean,
  defaultValue: defVal,
});

const OPT_DUMP_JS3 = (defVal: boolean) => ({
  name: "dump-js3",
  description: "Dump js3 pass outputs ( *.3js.js ).",
  type: Boolean,
  defaultValue: defVal,
});

const OPT_DUMP_IRI_X = (defVal: boolean) => ({
  name: "dump-iri-x",
  description: "Dump iri after Structural Reduction pass ( *.iri.x ).",
  type: Boolean,
  defaultValue: defVal,
});

const OPT_DUMP_IRI = (defVal: boolean) => ({
  name: "dump-iri",
  description: "Dump iri after Forge ( *.iri ).",
  type: Boolean,
  defaultValue: defVal,
});

//
// === JS3 Related ===
//

const JS3_OPTIONS = [
  OPT_OUT,
  OPT_SRC_TYPE,
  OPT_RUN_AFTER_COMPILE(false),
  OPT_DUMP_JS3(false),
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

const kebabCase = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

const PASS_FLAG_OPTIONS = PASS_FLAGS_SPEC.flatMap((f) => {
  const flagName = kebabCase(f.name);
  return [
    {
      name: flagName,
      description: `${f.desc} (default: ${f.default}).`,
      type: Boolean,
    },
    {
      name: `no-${flagName}`,
      description: `Disable: ${f.desc}.`,
      type: Boolean,
    },
  ];
});

const IRI_OPTIONS = [
  OPT_OUT,
  OPT_SRC_TYPE,
  OPT_RUN_AFTER_COMPILE(false),
  OPT_DUMP_JS3(false),
  OPT_DUMP_IRI_X(false),
  OPT_DUMP_IRI(false),
  ...PASS_FLAG_OPTIONS,
];

export const iriUsageInfo: UsageSectionsArray = [
  {
    header: "=== IRI ===",
    content: [`$ ./iridium iri [OPTIONS] {bold <source-js-file>}`],
  },
  {
    header: "Iridium Options",
    optionList: [...IRI_OPTIONS],
  },
];

export const handleOptions = (options: any) => {
  if (OPT_OUT.name in options) {
    debugConfig.dump.out = path.resolve(options[OPT_OUT.name]);
  }
  if (OPT_SRC_TYPE.name in options) {
    debugConfig.sourceType = options[OPT_SRC_TYPE.name];
    if (
      debugConfig.sourceType !== "unambiguous" &&
      debugConfig.sourceType !== "script" &&
      debugConfig.sourceType !== "module"
    ) {
      throw new Error("Supplied source type is invalid");
    }
  }
  if (OPT_RUN_AFTER_COMPILE(false).name in options) {
    debugConfig.rac = options[OPT_RUN_AFTER_COMPILE(false).name];
  }

  if (OPT_DUMP_JS3(false).name in options) {
    debugConfig.dump.js3 = options[OPT_DUMP_JS3(false).name];
  }
  if (OPT_DUMP_IRI_X(false).name in options) {
    debugConfig.dump.irix = options[OPT_DUMP_IRI_X(false).name];
  }
  if (OPT_DUMP_IRI(false).name in options) {
    debugConfig.dump.iri = options[OPT_DUMP_IRI(false).name];
  }

  for (const f of PASS_FLAGS_SPEC) {
    const flagName = kebabCase(f.name);
    if (options[`no-${flagName}`]) {
      debugConfig.passFlags[f.name] = false;
    } else if (options[flagName]) {
      debugConfig.passFlags[f.name] = true;
    }
  }
};

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

export function printAuthorInfo() {
  const IndiaFlag =
    // --- SAFFRON (Top 10 lines) ---
    "\x1B[38;5;208m" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⡤⠤⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⣏⡀⠀⠀⠀⢳⣀⣀⣤⠤⠢⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣨⠷⠀⠀⠀⠀⠀⠀⠀⣠⠼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⠀⠀⠀⠀⠀⠀⠀⠸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠣⣄⣀⠀⠀⠀⠀⣰⣾⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡏⠉⠀⠀⠀⠀⠘⢦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⠃⠀⠀⠀⠀⠀⠀⠀⠙⠲⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠏⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡞⠉⠁⠈⣆⣀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠦⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⢤⠀⠀⠀⠀⣤⡞⠁⠀⠀⠀⢀⡴⠯⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡴⠋⠦⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠒⠤⠤⣤⡀⠀⠀⠀⠀⢇⠸⢤⣤⠤⠤⠼⠃⠀⠀⠀⠰⡉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    // --- WHITE (Middle 10 lines) ---
    "\x1B[38;5;255m" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠛⠛⠒⠚⣾⡶⢤⠀⠀⠀⠀⠀⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠛⠘⠒⠈⢉⣩⠇⢀⡀⣽⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣄⡠⠤⠧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⡆⠀⠀⠀⡞⣵⢦⢸⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⢿⡉⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠙⠟⢸⣀⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⣿⡿⠃⠀⠀⡠⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⢀⡧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⣄⠀⠀⢀⠷⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠁⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡴⠚⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠖⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    // --- GREEN (Bottom 10 lines) ---
    "\x1B[38;5;34m" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣴⠒⠚⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠏⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢣⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⠀⠀⡾⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⡆⠀⠀⠀⠀⠀⠀⣵⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⡀⠀⠀⠀⢠⡟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢧⠀⠀⡜⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n" +
    // --- RESET terminal colors ---
    "\x1B[0m";
  console.log(IndiaFlag);

  console.log(
    chalk.bold.hex("#00ff41")("⬡ IRIDIUM ") +
      chalk.gray("| ") +
      chalk.white("Static Analysis Framework"),
  );
  console.log(
    chalk.hex("#00ff41")("└── ") +
      chalk.dim("Origin:   ") +
      chalk.bold.blue("IIT Bombay"),
  );
  console.log(
    chalk.hex("#00ff41")("└── ") +
      chalk.dim("Lead:     ") +
      chalk.magenta("Meetesh Kalpesh Mehta"),
  );

  console.log(
    chalk.hex("#00ff41")("└── ") +
      chalk.dim("Advisor:  ") +
      chalk.magenta("Dr Manas Thakur"),
  );
  console.log(
    `\n${chalk.bgWhite.black.bold(" CORE CONCEPT ")} ${chalk.italic("Sounder Static Analysis/Optimization for JavaScript Programs.")}`,
  );

  interface AuthorInfo {
    Role: string;
    Affiliation: string;
    Email: string;
  }

  const tableData: Record<string, AuthorInfo> = {};

  authors.forEach(([name, affiliation, email], index) => {
    const role = index === 0 ? "Maintainer" : "Contributor";
    // We use the name as the key for the object
    tableData[name] = {
      Role: role,
      Affiliation: affiliation,
      Email: email ?? "N/A",
    };
  });
  console.table(tableData);
  console.log(`\nTotal Contributors: ${authors.length}`);
  console.log(`Primary Contact: ${authors[0][0]} <${authors[0][2]}>\n`);
}
