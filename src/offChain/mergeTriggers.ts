import type { DataFeedId, Trigger } from "../types";

// take array of objects represeting trigers at timestamp and merge them into one object
// where each key is datafeed id and value is array of triggers

export function mergeTriggers(triggers: Record<DataFeedId, Trigger>[]) {
  return triggers.reduce((acc, item) => {
    Object.keys(item).forEach((key) => {
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item[key]);
    });
    return acc;
  }, {} as Record<DataFeedId, Trigger[]>);
}
