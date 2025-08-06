import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dayjs from "dayjs";

const now = dayjs();
const sevenDaysAgo = now.subtract(7, "day");

const ALL_DATA_FEEDS = "all";

const argv = await yargs(hideBin(process.argv))
  .option("from", {
    alias: "f",
    describe: "Start date",
    type: "number",
    default: sevenDaysAgo.unix(),
  })
  .option("to", {
    alias: "t",
    describe: "End date",
    type: "number",
    default: now.unix(),
  })
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

const { from, to, datafeeds, verbose, delay } = argv;

export const args = {
  from,
  to,
  datafeeds: datafeeds || ALL_DATA_FEEDS,
  verbose,
  delay,
};
