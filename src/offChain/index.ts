import { CurrentOnChainPricesManager } from "../onChain/currentOnChainPrice";
import type { TimestampIteratorConfig, DataFeed } from "./types";
import type { ValueUpdateData } from "../onChain";
import { writeJsonToFile } from "../writeJsonToFile";
import { BASE_URL } from "./constants";
import { dataFeedSchema } from "./types";
import progress from "./progress";
import { comparePricesDeviation, getMedianPrices } from "./helpers";
import { logger } from "../logger";

export async function fetchDataForTimestamp(timestamp: number) {
  let attempts = 0;
  let response: Response | null = null;
  while (attempts < 3 && !response?.ok) {
    try {
      response = await fetch(`${BASE_URL}/${timestamp}`);
      if (!response.ok) {
        logger.error(`Failed to fetch data for timestamp ${timestamp}`);
        attempts++;
        continue;
      }
    } catch (error) {
      logger.error(`Failed to fetch data for timestamp ${timestamp}`);
      attempts++;
    }
  }
  if (!response?.ok) {
    logger.error(
      `Failed to fetch data for timestamp ${timestamp} after 3 attempts`
    );
    return null;
  }
  return response.json();
}

export async function parseOffChainData(
  onChainFeed: Record<string, ValueUpdateData[]>,
  config: TimestampIteratorConfig
) {
  const supportedFeeds = Object.keys(onChainFeed);
  const startTime = Math.floor(config.startTime / 10000) * 10000;
  const endTime = Math.floor(config.endTime / 10000) * 10000;
  const intervalMs = config.intervalMs ?? 10000;
  const numCalls = Math.floor((endTime - startTime) / intervalMs);
  const data: Record<
    string,
    { changeTimestamp: number; propagationTimestamp: number }
  >[] = [];

  progress.start(numCalls, 0);

  for (let i = 0; i < numCalls; i++) {
    const timestamp = startTime + i * intervalMs;
    const dataItem = await fetchDataForTimestamp(timestamp);

    progress.update(i);

    if (dataItem) {
      data.push(
        processDataItem({
          dataItem,
          onChainFeed,
          timestamp,
          supportedFeeds,
        })
      );
    }
  }

  progress.stop();

  const result = data.reduce((acc, item) => {
    Object.keys(item).forEach((key) => {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item[key]);
    });
    return acc;
  }, {} as Record<string, { changeTimestamp: number; propagationTimestamp: number }[]>);

  await writeJsonToFile(result, "offChainData.json");

  return result;
}

/**
 * Process data received from offchain API for given timestamp
 * @param {DataFeed} data - data received from offchain API
 * @param {Record<string, ValueUpdateData[]>} onChainFeed - indexed onchain events
 * @param {number} timestamp - timestamp of data
 * @param {string[]} supportedFeeds - supported data feeds
 * @returns processed data
 */
const processDataItem = ({
  dataItem,
  onChainFeed,
  timestamp,
  supportedFeeds,
}: {
  dataItem: DataFeed;
  onChainFeed: Record<string, ValueUpdateData[]>;
  timestamp: number;
  supportedFeeds: string[];
}) => {
  const onChainFeedManager = new CurrentOnChainPricesManager(onChainFeed);
  onChainFeedManager.setTimestamp(timestamp);

  const medianPrices: Record<string, number> = {};

  // Calculate median prices
  Object.keys(dataItem).forEach((key) => {
    if (!supportedFeeds.includes(key)) {
      return;
    }
    const validationResult = dataFeedSchema.safeParse(dataItem[key]);
    if (validationResult.success) {
      medianPrices[key] = getMedianPrices(validationResult.data);
    } else {
      console.log(
        `Error validating data for key ${key}:`,
        validationResult.error
      );
    }
  });

  // Create triggers object
  // Compare prices deviation
  const triggers = comparePricesDeviation(
    onChainFeedManager.getCurrentPrices(),
    medianPrices,
    timestamp
  );

  return Object.keys(triggers).reduce((acc, key) => {
    const nextEventTimestamp = onChainFeedManager.getNextTimestamp(key);
    if (!nextEventTimestamp) {
      return acc;
    }
    acc[key] = {
      changeTimestamp: timestamp,
      propagationTimestamp: nextEventTimestamp * 1000,
    };
    return acc;
  }, {} as Record<string, { changeTimestamp: number; propagationTimestamp: number }>);
};
