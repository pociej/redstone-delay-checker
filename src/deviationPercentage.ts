import manifest from "./manifest.json" assert { type: "json" };

const defaultDeviationPercentage = manifest.updateTriggers.deviationPercentage;

const baseDeviations = Object.keys(manifest.priceFeeds).reduce((acc, key) => {
  acc[key] =
    manifest.priceFeeds?.[key]?.updateTriggersOverrides?.deviationPercentage ||
    defaultDeviationPercentage;
  return acc;
}, {} as Record<string, number>);

export const deviationPercentage = new Proxy(baseDeviations, {
  get: (target, prop) => {
    return Reflect.has(target, prop)
      ? Reflect.get(target, prop)
      : defaultDeviationPercentage;
  },
});
