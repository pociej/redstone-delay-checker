import type { DataFeed } from "./types";
import type { ValueUpdateData } from "../onChain/types";
import { CurrentOnChainPricesManager } from "../onChain/currentOnChainPrice";
import { withNextEvent } from "./withNextEvent";
import { getTriggers } from "./getTriggers";

/**
 * Process data received from offchain API for given timestamp
 * @param {DataFeed} data - data received from offchain API
 * @param {Record<string, ValueUpdateData[]>} onChainFeed - indexed onchain events
 * @param {number} timestamp - timestamp of data
 * @param {string[]} supportedFeeds - supported data feeds
 * @returns processed data
 */

export const processDataItem = ({
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

  // pair trigger with next event timestamp for further stats calculation

  const triggers = getTriggers(
    dataItem,
    onChainFeedManager,
    timestamp,
    supportedFeeds
  );
  return withNextEvent(triggers, onChainFeedManager, timestamp);
};
