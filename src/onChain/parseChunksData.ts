import type { ValueUpdateData } from "./types";

export function mergeChunksData({
  chunkResults,
}: {
  chunkResults: Record<string, ValueUpdateData[]>[];
}) {
  const logsPerFeed: Record<string, ValueUpdateData[]> = {};

  // Merge chunk results into logsPerFeed
  for (const chunkMap of chunkResults) {
    for (const [feedId, entries] of Object.entries(chunkMap)) {
      if (!logsPerFeed[feedId]) logsPerFeed[feedId] = [];
      logsPerFeed[feedId].push(...entries);
    }
  }

  // Sort all feeds by block timestamp
  for (const [feedId, entries] of Object.entries(logsPerFeed)) {
    entries.sort((a, b) => a.blockTimestamp - b.blockTimestamp);
    logsPerFeed[feedId] = entries;
  }

  return logsPerFeed;
}
