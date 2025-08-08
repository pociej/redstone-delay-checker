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
  .option("allEvents", {
    alias: "a",
    describe: "Index all events from contract creation block",
    type: "boolean",
    default: false,
  })
  .check((argv) => {
    if (!CHAINS[argv.chain]) {
      throw new Error(
        "Only " + Object.keys(CHAINS).join(", ") + " are supported"
      );
    }
    return argv;
  })
  .help().argv;

export const { datafeeds, verbose, start_offset, chain, allEvents } = argv;
