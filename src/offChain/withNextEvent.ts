import { CurrentOnChainPricesManager } from "../onChain/currentOnChainPrice";

export const withNextEvent = (
  triggers: string[],
  onChainFeedManager: CurrentOnChainPricesManager,
  timestamp: number
) => {
  return triggers.reduce((acc, key) => {
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
