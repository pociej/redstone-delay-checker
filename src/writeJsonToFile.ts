import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger";
import { outputConfig } from "./env";

export async function writeJsonToFile(
  data: unknown,
  filename: string
): Promise<string> {
  try {
    const resultsDir = `./${outputConfig.resultsDir}`;
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
      logger.info(`Created directory: ${resultsDir}`);
    }

    const filePath = path.join(resultsDir, filename);

    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonData);

    logger.info(`Successfully wrote data to ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`Error writing JSON to file: ${error}`);
    throw error;
  }
}
