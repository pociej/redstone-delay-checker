import type { OffChainFeed, OnChainFeed } from "./types";
import { start, end } from "./dates";

enum DelayMode {
  // if there are many offchain triggers for the same onchain event, we count only very first one
  OnePerOnChainEvent,
  // if there are many events for the same feed, we count all of them
  All,
}

export const getDelayStatistics = ({
  delayMode,
  triggers,
}: {
  delayMode: DelayMode;
  triggers: OffChainFeed;
}) => {
  switch (delayMode) {
    case DelayMode.OnePerOnChainEvent:
      const filteredTriggers = filterTriggers(triggers);
      console.log("filteredTriggers", filteredTriggers);
      return calcDelayStatistics(filteredTriggers);
    case DelayMode.All:
      return calcDelayStatistics(triggers);
  }
};

const calcDelayStatistics = (triggers: OffChainFeed) => {
  return Object.keys(triggers).reduce((acc, key) => {
    acc[key] = {
      max: Number(
        (
          triggers[key].reduce(
            (max, trigger) =>
              Math.max(
                max,
                trigger.propagationTimestamp - trigger.changeTimestamp
              ),
            0
          ) / 1000
        ).toFixed(2)
      ),
      avg: Number(
        (
          triggers[key].reduce(
            (avg, trigger) =>
              avg +
              (trigger.propagationTimestamp - trigger.changeTimestamp) /
                triggers[key].length,
            0
          ) / 1000
        ).toFixed(2)
      ),
    };
    return acc;
  }, {} as Record<string, { max: number; avg: number }>);
};

const filterTriggers = (triggers: OffChainFeed) => {
  return Object.keys(triggers).reduce((acc, key) => {
    acc[key] = triggers[key].filter(
      (trigger, index) =>
        triggers[key].findIndex(
          (t) => t.propagationTimestamp === trigger.propagationTimestamp
        ) === index
    );
    return acc;
  }, {} as Record<string, { changeTimestamp: number; propagationTimestamp: number }[]>);
};

const countEventsPerFeed = (onChainFeed: OnChainFeed) => {
  const startUnix = start.unix();
  const sortedEntries = Object.entries(onChainFeed)
    // only onchain events newer than start time (as we are indexing from the past)
    .map(
      ([key, arr]) =>
        [
          key,
          arr.filter((evt) => evt.blockTimestamp >= startUnix).length,
        ] as const
    )
    // 0s are not interesting
    .filter(([, count]) => count > 0)
    // sort by count
    .sort((a, b) => b[1] - a[1]);

  return sortedEntries.reduce((acc, [key, count]) => {
    acc[key] = count;
    return acc;
  }, {} as Record<string, number>);
};

export const getStatistics = ({
  onChainFeed,
  offChainFeed,
}: {
  onChainFeed: OnChainFeed;
  offChainFeed: OffChainFeed;
}) => {
  return {
    from: start.format("YYYY-MM-DD HH:mm:ss"),
    to: end.format("YYYY-MM-DD HH:mm:ss"),
    delayStatistics: {
      onePerOnChainEvent: getDelayStatistics({
        delayMode: DelayMode.OnePerOnChainEvent,
        triggers: offChainFeed,
      }),
      all: getDelayStatistics({
        delayMode: DelayMode.All,
        triggers: offChainFeed,
      }),
    },
    updatesPerFeed: countEventsPerFeed(onChainFeed),
  };
};
