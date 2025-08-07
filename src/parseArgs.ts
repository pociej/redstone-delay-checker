import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { CHAINS } from "./onChain/constants";
import * as chains from "viem/chains";
const ALL_DATA_FEEDS = "all";

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
  .option("delay", {
    alias: "l",
    describe: "Delay in seconds (works only if verbose is enabled)",
    type: "number",
    default: 0,
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
    default: "Ethereum",
  })
  .check((argv) => {
    if (argv.delay < 0) {
      throw new Error("Delay must be greater than 0");
    }
    if (argv.delay && !argv.verbose) {
      throw new Error("The --delay option can only be used with --verbose.");
    }
    if (!CHAINS[argv.chain]) {
      throw new Error(
        "Only " + Object.keys(CHAINS).join(", ") + " are supported"
      );
    }
    return argv;
  })
  .help().argv;

const { datafeeds, verbose, delay, start_offset, start_offset_unit, chain } =
  argv;

const chainName = chain === "Ethereum" ? "mainnet" : chain;

export const args = {
  datafeeds: datafeeds || ALL_DATA_FEEDS,
  verbose,
  chain: chains[chainName],
  delay,
  start_offset,
  start_offset_unit,
};
