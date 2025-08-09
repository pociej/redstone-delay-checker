import { config } from "../config";
import { BASE_URL } from "./constants";
import { logger } from "../logger";

export class ApiFetchError extends Error {
  constructor() {
    super();
    this.name = "ApiFetchError";
  }
}

export async function fetchOffchainDataAtTimestamp(timestamp: number) {
  let attempts = 0;
  let response: Response | null = null;
  // maybe some fancier retry strategy could be useful in future

  while (attempts < config.RETRY_COUNT && !response?.ok) {
    try {
      response = await fetch(`${BASE_URL}/${timestamp}`);
      if (!response.ok) {
        logger.error(`Failed to fetch data for timestamp ${timestamp}`);
        attempts++;
        continue;
      }
    } catch {
      logger.error(`Failed to fetch data for timestamp ${timestamp}`);
      attempts++;
    }
  }
  if (!response?.ok) {
    throw new ApiFetchError();
  }
  return response.json();
}
