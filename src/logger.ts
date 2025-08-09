import { verbose } from "./parseArgs";
import chalk from "chalk";

export const logger = {
  info: (...infoArgs: any[]) => {
    if (verbose) {
      console.log(chalk.green(...infoArgs));
    }
  },
  error: (...errorArgs: any[]) => {
    console.error(chalk.red(...errorArgs));
  },
  debug: (...debugArgs: any[]) => {
    if (verbose) {
      console.log(chalk.blue(...debugArgs));
    }
  },
  warn: (...warnArgs: any[]) => {
    console.warn(chalk.yellow(...warnArgs));
  },
};
