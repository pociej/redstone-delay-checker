import { now, from } from "../dates";
import { z } from "zod";
import cliProgress from "cli-progress";
import colors from "ansi-colors";
import { args } from "../parseArgs";
const baseUrl =
  "https://oracle-gateway-2.a.redstone.finance/data-packages/historical/redstone-primary-prod";

interface TimestampIteratorConfig {
  startTime?: number;
  endTime?: number;
  intervalMs?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
const allDataFeedsCount = (args.start_offset * 60 * 60 * 1000) / 10000 + 1;
fetchProgress.start(allDataFeedsCount, 0);
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

async function fetchDataForTimestamp(timestamp: number) {
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

export async function fetchHistoricalData() {
  const results = [];

  for await (const { timestamp, data } of redstoneDataIterator()) {
    if (data) {
      processData(data);
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

const processData = (data: any) => {
  const result: Record<string, number> = {};
  Object.keys(data).forEach((key) => {
    const validationResult = dataFeedSchema.safeParse(data[key]);

    if (validationResult.success) {
      const values = validationResult.data.map((item) =>
        item.dataPoints.map((dp) => dp.value)
      );
      const median = getMedian(values.flat());
      result[key] = median;
    } else {
      console.log(
        `Error validating data for key ${key}:`,
        validationResult.error
      );
    }
  });
  return result;
};

const getMedian = (values: number[]) => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  } else {
    return sortedValues[middleIndex];
  }
};
