import { manifest } from "./load.manifest";

export function getDeviationPercentage(dataFeedId: string) {
  return (
    manifest.priceFeeds[dataFeedId]?.updateTriggersOverrides
      ?.deviationPercentage || manifest.updateTriggers.deviationPercentage
  );
}

export function getTimeSinceLastUpdateInMilliseconds(dataFeedId: string) {
  return (
    manifest.priceFeeds[dataFeedId]?.updateTriggersOverrides
      ?.timeSinceLastUpdateInMilliseconds ||
    manifest.updateTriggers.timeSinceLastUpdateInMilliseconds
  );
}
