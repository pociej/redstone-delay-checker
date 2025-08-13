import manifestMainnet from "./manifest.mainnet.json" assert { type: "json" };
import manifestBsc from "./manifest.bsc.json" assert { type: "json" };

const defaultDeviationPercentage = {
  mainnet: manifestMainnet.updateTriggers.deviationPercentage,
  bsc: manifestBsc.updateTriggers.deviationPercentage,
};

type Manifest = {
  updateTriggers: { deviationPercentage: number };
  priceFeeds: Record<
    string,
    { updateTriggersOverrides?: { deviationPercentage?: number } }
  >;
};
const getBaseDeviations = (manifest: Manifest) => {
  return Object.keys(manifest.priceFeeds).reduce((acc, key) => {
    acc[key] =
      manifest.priceFeeds?.[key]?.updateTriggersOverrides
        ?.deviationPercentage || manifest.updateTriggers.deviationPercentage;
    return acc;
  }, {} as Record<string, number>);
};

const baseDeviations = {
  mainnet: getBaseDeviations(manifestMainnet as Manifest),
  bsc: getBaseDeviations(manifestBsc as Manifest),
};

export function getDeviationPercentage(
  chain: "mainnet" | "bsc",
  dataFeedId: string
) {
  return baseDeviations[chain][dataFeedId] || defaultDeviationPercentage[chain];
}
