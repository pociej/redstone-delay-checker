import * as fs from "fs";
import * as path from "path";
import { outputConfig } from "./env";
import type { ValueUpdateData } from "./onChain/types";

export type BnbTimeDiffsResult = {
  feedKey: string | null;
  diffs: number[]; // seconds between consecutive events
  average: number | null; // average seconds or null when not computable
};

function loadLogsPerFeed(): Record<string, ValueUpdateData[]> {
  const resultsDir = `./${outputConfig.resultsDir}`;
  const filePath = path.join(resultsDir, outputConfig.logsPerFeedFilename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`logsPerFeed file not found at ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as Record<string, ValueUpdateData[]>;
}

function findBnbFeedKey(logsPerFeed: Record<string, ValueUpdateData[]>): string | null {
  if (logsPerFeed["BNB"]) return "BNB";
  // fallback: case-insensitive search for an exact key match ignoring case
  const exact = Object.keys(logsPerFeed).find((k) => k.toLowerCase() === "bnb");
  if (exact) return exact;
  // last resort: any key containing "bnb"
  const partial = Object.keys(logsPerFeed).find((k) => k.toLowerCase().includes("bnb"));
  return partial ?? null;
}

export function computeBnbEventTimeDiffs(): BnbTimeDiffsResult {
  const logsPerFeed = loadLogsPerFeed();
  const feedKey = findBnbFeedKey(logsPerFeed);
  if (!feedKey) {
    return { feedKey: null, diffs: [], average: null };
  }
  const entries = [...(logsPerFeed[feedKey] ?? [])];
  if (entries.length === 0) {
    return { feedKey, diffs: [], average: null };
  }
  // ensure sorted by timestamp just in case
  entries.sort((a, b) => a.blockTimestamp - b.blockTimestamp);

  const diffs: number[] = [];
  for (let i = 1; i < entries.length; i++) {
    const delta = entries[i].blockTimestamp - entries[i - 1].blockTimestamp;
    // Only accept non-negative sane deltas
    if (Number.isFinite(delta) && delta >= 0) {
      diffs.push(delta);
    }
  }

  const average = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : null;

  return { feedKey, diffs, average };
}
