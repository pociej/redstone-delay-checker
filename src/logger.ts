import { verbose } from "./parseArgs";
import chalk from "chalk";

export const logger = {
  info: (...infoArgs: unknown[]) => {
    if (verbose) {
      console.log(chalk.green(...infoArgs));
    }
  },
  error: (...errorArgs: unknown[]) => {
    console.error(chalk.red(...errorArgs));
  },
  debug: (...debugArgs: unknown[]) => {
    if (verbose) {
      console.log(chalk.blue(...debugArgs));
    }
  },
  warn: (...warnArgs: unknown[]) => {
    console.warn(chalk.yellow(...warnArgs));
  },
};
