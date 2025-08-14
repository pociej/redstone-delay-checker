import {
  getDeviationPercentage,
  getTimeSinceLastUpdateInMilliseconds,
} from "../triggerRules";
import { getMedianPrices } from "./getMedianPrices";
import type { DataFeed } from "./types";
import type { CurrentOnChainPricesManager } from "../onChain/currentOnChainPrice";
import { logger } from "../logger";
import { onlyUnique } from "./helpers";
import { NO_VALUE } from "../onChain/currentOnChainPrice";

export function getDeviationBasedTriggers(
  onChainPrices: Record<string, number | typeof NO_VALUE>,
  currentFeedValues: Record<string, number>,
  timestamp: number
) {
  const triggers: string[] = [];

  Object.keys(currentFeedValues).forEach((feedId) => {
    if (onChainPrices[feedId] === NO_VALUE) {
      logger.info("Skipping as no current onchain price found");
      return;
    }
    const previousValue = onChainPrices[feedId];
    // convert to 8 decimal places
    const currentValue = currentFeedValues[feedId] * 100000000;

    const deviation =
      Math.abs((currentValue - previousValue) / previousValue) * 100;

    if (deviation > getDeviationPercentage(feedId)) {
      logger.info(
        `Deviation based trigger detected for ${feedId} at ${timestamp} with deviation ${deviation}. Required deviation ${getDeviationPercentage(
          feedId
        )}`
      );
      triggers.push(feedId);
    }
  });

  return triggers;
}

export function getTimeBasedTriggers(
  onChainEventTimestamps: Record<string, number | typeof NO_VALUE>,
  timestamp: number
) {
  const triggers: string[] = [];

  Object.keys(onChainEventTimestamps).forEach((feedId) => {
    if (onChainEventTimestamps[feedId] === NO_VALUE) {
      logger.info("Skipping as no current onchain price found");
      return;
    }
    const latestEventTimestamp = onChainEventTimestamps[feedId];

    const timeSinceLastEvent = timestamp - latestEventTimestamp;

    if (feedId === "BNB") {
      logger.info(
        `Time since last event for ${feedId} at ${timestamp} is ${timeSinceLastEvent}. Required time since last event ${getTimeSinceLastUpdateInMilliseconds(
          feedId
        )}`
      );
    }
    if (timeSinceLastEvent > getTimeSinceLastUpdateInMilliseconds(feedId)) {
      logger.info(
        `Time based trigger detected for ${feedId} at ${timestamp} with time since last event ${timeSinceLastEvent}. Required time since last event ${getTimeSinceLastUpdateInMilliseconds(
          feedId
        )}`
      );
      triggers.push(feedId);
    }
  });

  return triggers;
}

export function getTriggers(
  dataItem: DataFeed,
  onChainFeedManager: CurrentOnChainPricesManager,
  timestamp: number,
  supportedFeeds: string[]
) {
  onChainFeedManager.setTimestamp(timestamp);

  const medianPrices = getMedianPrices(dataItem, supportedFeeds);

  const deviationBasedTriggers = getDeviationBasedTriggers(
    onChainFeedManager.getCurrentPrices(),
    medianPrices,
    timestamp
  );

  // for now time based triggers are ignored as need to be clarified with Redstone
  // based on what I see in onchain data almost sure that relayer do not calculate time
  // from the last event on-chain rather caches trigger time
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const timeBasedTriggers = getTimeBasedTriggers(
    onChainFeedManager.getLatestEventTimestamps(),
    timestamp
  );

  return [...deviationBasedTriggers].filter(onlyUnique);
}
