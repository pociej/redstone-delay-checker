import { now, from } from "../dates";
import { z } from "zod";
import cliProgress from "cli-progress";
import colors from "ansi-colors";
import { args } from "../parseArgs";
import { deviationPercentage } from "../deviationPercentage";
import type { ValueUpdateDate } from "../onChain";
import { todo } from "../todo";

const baseUrl =
  "https://oracle-gateway-2.a.redstone.finance/data-packages/historical/redstone-primary-prod";

interface TimestampIteratorConfig {
  startTime?: number;
  endTime?: number;
  intervalMs?: number;
}

const allDataFeedsCount = (args.start_offset * 60 * 60 * 1000) / 10000 + 1;

let cachedData: Record<string, number> = {};

const fetchProgress = new cliProgress.SingleBar(
  {
    format:
      "Fetching data |" +
      colors.blue("{bar}") +
      "| {percentage}% || {value}/{total} Data feeds || ETA: {eta}s",
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    stream: process.stdout,
  },
  cliProgress.Presets.shades_classic
);
let dataFeedCount = 0;

function* timestampGenerator(config: TimestampIteratorConfig = {}) {
  const startTime =
    Math.floor((config.startTime ?? from.valueOf()) / 10000) * 10000;
  const endTime = Math.floor((config.endTime ?? now.valueOf()) / 10000) * 10000;
  const intervalMs = config.intervalMs ?? 10000;

  let currentTime = startTime;
  while (currentTime <= endTime) {
    yield currentTime;
    currentTime += intervalMs;
  }
}

export async function fetchDataForTimestamp(timestamp: number) {
  try {
    const response = await fetch(`${baseUrl}/${timestamp}`);
    return response.json();
  } catch (error) {
    console.error(`Error fetching data for timestamp ${timestamp}:`, error);
    return null;
  }
}

async function* redstoneDataIterator(config: TimestampIteratorConfig = {}) {
  for (const timestamp of timestampGenerator(config)) {
    const data = await fetchDataForTimestamp(timestamp);

    yield { timestamp, data };
  }
}

export async function fetchHistoricalData(
  logsPerFeed: Record<string, ValueUpdateDate[]>
) {
  fetchProgress.start(allDataFeedsCount, 0);

  const results = [];

  for await (const { timestamp, data } of redstoneDataIterator()) {
    if (data) {
      processData(data, logsPerFeed, timestamp);
      results.push({ timestamp, data });
      dataFeedCount++;
      fetchProgress.update(dataFeedCount);
    }
  }
  return results;
}

const dataFeedSchema = z.array(
  z.object({
    timestampMilliseconds: z.number().int(),
    signature: z.string(),
    dataPoints: z
      .array(z.object({ dataFeedId: z.string(), value: z.number() }))
      .min(1),
    dataServiceId: z.string(),
    dataPackageId: z.string(),
    isSignatureValid: z.boolean(),
    signerAddress: z.string(),
    dataFeedId: z.string(),
  })
);

type DataFeed = z.infer<typeof dataFeedSchema>;

export function getFeedPriceMedian(data: DataFeed) {
  const values = data
    .map((item) => item.dataPoints.map((dp) => dp.value))
    .flat();
  return getMedian(values);
}

const processData = (
  data: any,
  logsPerFeed: Record<string, ValueUpdateDate[]>,
  timestamp: number
) => {
  const medianPrices: Record<string, number> = {};
  Object.keys(data).forEach((key) => {
    const validationResult = dataFeedSchema.safeParse(data[key]);
    if (validationResult.success) {
      medianPrices[key] = getFeedPriceMedian(validationResult.data);
    } else {
      console.log(
        `Error validating data for key ${key}:`,
        validationResult.error
      );
    }
  });

  if (!cachedData) {
    cachedData = medianPrices;
    return { medianPrices, triggers: {} };
  }

  const triggers = comparePricesDeviation(cachedData, medianPrices);
  Object.keys(triggers).forEach((key) => {
    const log: ValueUpdateDate | null = getNextEvent(
      { dataFeedId: key, timestamp },
      logsPerFeed
    );
    if (!log) {
      return;
    }
    todo("Write results to file and maybe report suspicious data");
  });

  cachedData = medianPrices;
  return { medianPrices, triggers };
};

export const getMedian = (values: number[]) => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  } else {
    return sortedValues[middleIndex];
  }
};

function getDeviationPercentage(dataFeedId: string) {
  return deviationPercentage[dataFeedId];
}

export function calculateDeviationPercentage(
  previousValue: number,
  currentValue: number
) {
  return Math.abs((currentValue - previousValue) / previousValue) * 100;
}

function comparePricesDeviation(
  previousFeedValues: Record<string, number>,
  currentFeedValues: Record<string, number>
) {
  const triggers: Record<string, boolean> = {};

  Object.keys(currentFeedValues).forEach((key) => {
    const previousValue = previousFeedValues[key];
    const currentValue = currentFeedValues[key];
    const deviation =
      Math.abs((currentValue - previousValue) / previousValue) * 100;
    if (deviation > getDeviationPercentage(key)) {
      triggers[key] = true;
    }
  });

  return triggers;
}

export function getNextEvent(
  trigger: {
    dataFeedId: string;
    timestamp: number;
  },
  logsPerFeed: Record<string, ValueUpdateDate[]>
): ValueUpdateDate | null {
  const feedLogs = logsPerFeed[trigger.dataFeedId];
  if (!feedLogs) {
    return null;
  }
  const logIndex = feedLogs.findIndex((log) => {
    return log.blockTimestamp * 1000n > BigInt(trigger.timestamp);
  });

  if (logIndex === -1) {
    return null;
  }

  return feedLogs[logIndex];
}
