import type { ValueUpdateData } from ".";

type FeedState = {
  currentEvent: (ValueUpdateData & { index: number }) | null;
  nextEvent: (ValueUpdateData & { index: number }) | null;
};

export class CurrentOnChainPricesManager {
  private feedStates: Record<string, FeedState> = {};
  private logsPerFeed: Record<string, ValueUpdateData[]>;
  private timestamp: number;

  constructor(logsPerFeed: Record<string, ValueUpdateData[]>) {
    this.logsPerFeed = logsPerFeed;
  }

  setTimestamp(timestamp: number) {
    for (const [feedId, events] of Object.entries(this.logsPerFeed)) {
      const index = events.findLastIndex((event) => {
        return event.blockTimestamp * 1000 <= timestamp;
      });

      const nextEventAfterInit = index === -1 ? null : events[index + 1];
      const lastEventBeforeInit = events[index];

      this.feedStates[feedId] = {
        currentEvent: lastEventBeforeInit
          ? {
              ...lastEventBeforeInit,
              index,
            }
          : null,
        nextEvent: nextEventAfterInit
          ? {
              ...nextEventAfterInit,
              index: index + 1,
            }
          : null,
      };
    }
    this.timestamp = timestamp;
  }

  getCurrentPrice(feedId: string): number {
    return this.feedStates[feedId]?.currentEvent?.value || 0;
  }

  getNextPrice(feedId: string): number {
    return this.feedStates[feedId]?.nextEvent?.value || 0;
  }
  getNextTimestamp(feedId: string): number {
    return this.feedStates[feedId]?.nextEvent?.blockTimestamp || 0;
  }

  getCurrentPrices(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(this.feedStates).map(([feedId, state]) => [
        feedId,
        state.currentEvent?.value || 0,
      ])
    );
  }
}
