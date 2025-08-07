import { args } from "./parseArgs";
import chalk from "chalk";

export const logger = {
  info: (...infoArgs: any[]) => {
    if (args.verbose) {
      console.log(chalk.blue(...infoArgs));
    }
  },
  error: (...errorArgs: any[]) => {
    console.error(chalk.red(...errorArgs));
  },
  debug: (...debugArgs: any[]) => {
    if (args.verbose) {
      console.log(chalk.green(...debugArgs));
    }
  },
  warn: (...warnArgs: any[]) => {
    console.warn(chalk.yellow(...warnArgs));
  },
};
