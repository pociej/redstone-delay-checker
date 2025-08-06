import yargs from "yargs";
import { hideBin } from "yargs/helpers";

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
  .check((argv) => {
    if (argv.delay < 0) {
      throw new Error("Delay must be greater than 0");
    }
    if (argv.delay && !argv.verbose) {
      throw new Error("The --delay option can only be used with --verbose.");
    }
    return argv;
  })
  .help().argv;

const { datafeeds, verbose, delay } = argv;

export const args = {
  datafeeds: datafeeds || ALL_DATA_FEEDS,
  verbose,
  delay,
};
