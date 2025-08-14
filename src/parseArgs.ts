import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CHAINS } from "./onChain/constants";
import fs from "fs";
import path from "path";

const argv = await yargs(hideBin(process.argv))
  .option("datafeeds", {
    alias: "d",
    describe: "List of datafeeds",
    type: "string",
    array: true,
  })
  .option("verbose", {
    alias: "v",
    describe: "Enable verbose output",
    type: "boolean",
    default: false,
  })
  .option("start_offset", {
    alias: "s",
    describe: "Start offset in hours",
    type: "number",
    // 7 days ago
    default: 24 * 7,
  })
  .option("chain", {
    alias: "c",
    describe: "Chain to monitor",
    type: "string",
    default: "mainnet",
  })
  .option("manifest_path", {
    alias: "m",
    describe: "Manifest file",
    type: "string",
  })
  .option("allEvents", {
    alias: "a",
    describe: "Index all events from contract creation block",
    type: "boolean",
    default: false,
  })
  // Ensure manifest defaults to manifest.[chain].json when not provided
  .middleware((argv) => {
    if (!argv.manifest_path && typeof argv.chain === "string") {
      argv.manifest_path = `./src/manifest.${argv.chain}.json`;
    }
    if (argv.manifest_path) {
      argv.manifest_path = path.isAbsolute(argv.manifest_path)
        ? argv.manifest_path
        : path.resolve(process.cwd(), argv.manifest_path);
    }
  }, true)
  .check((argv) => {
    if (!fs.existsSync(argv.manifest_path)) {
      throw new Error(`Manifest file not found: ${argv.manifest_path}`);
    }
    return argv;
  })
  .check((argv) => {
    if (!CHAINS[argv.chain]) {
      throw new Error(
        "Wrong chain. Only " + Object.keys(CHAINS).join(", ") + " are supported"
      );
    }
    return argv;
  })
  .help().argv;

//TODO connect zod to avoid type assertions
export const {
  datafeeds,
  verbose,
  start_offset,
  chain,
  allEvents,
  manifest_path,
} = argv as {
  chain: "mainnet" | "bsc";
  datafeeds: string[];
  verbose: boolean;
  start_offset: number;
  allEvents: boolean;
  manifest_path: string;
};
