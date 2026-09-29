import json from "@rollup/plugin-json";

import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import fs from "fs";
import path from "path";

const forgeDir = "external/Iridium-Forge";
const copyForge = {
  name: "copy-forge",
  writeBundle({ file }) {
    const outDir = path.dirname(file);
    const wrapper = fs.readFileSync(path.join(forgeDir, "forge.cjs"), "utf8");
    const match = wrapper.match(/require\(["'](.+\.node)["']\)/);
    if (!match) this.error(`Cannot find .node path in ${forgeDir}/forge.cjs`);
    const binary = path.join(forgeDir, match[1]);
    if (!fs.existsSync(binary)) {
      this.error(`${binary} not found; build Iridium-Forge first`);
    }
    const name = path.basename(binary);
    fs.copyFileSync(binary, path.join(outDir, name));
    fs.writeFileSync(
      path.join(outDir, "forge.cjs"),
      `module.exports = require("./${name}");\n`,
    );
  },
};

export default [
  // ESM JavaScript output
  {
    input: "iridium.ts",
    output: {
      file: "dist/iridium.js",
      format: "esm",
      sourcemap: true,
    },
    external: [
      "fs",
      "path",
      "os",
      "module", // REQUIRED: for createRequire in forge.ts
      /\.node$/, // REQUIRED: keeps the binary file external
    ],
    plugins: [
      copyForge,
      json(),
      resolve({
        exportConditions: ["node"], // Helps resolve the # imports
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: [
          "playground/**",
          "classes/builder/IridiumHelpers/**",
          "classes/worker/**",
        ],
      }),
    ],
  },

  // Type declarations
  {
    input: "iridium.ts",
    output: {
      file: "dist/iridium.d.ts",
      format: "es",
    },
    plugins: [
      dts({
        exclude: ["playground/**"],
      }),
    ],
  },
];
