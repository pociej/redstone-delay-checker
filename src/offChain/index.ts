import type { TimestampIteratorConfig } from "./types";
import type { ValueUpdateData } from "../onChain/types";
import { writeJsonToFile } from "../writeJsonToFile";
import progress from "./progress";
import { processDataItem } from "./processDataItem";
import { mergeTriggers } from "./mergeTriggers";
import type { Trigger, DataFeedId } from "../types";
import {
  fetchOffchainDataAtTimestamp,
  ApiFetchError,
} from "./fetchOffchainDataAtTimestamp";
import {
  logOffChainProcessingStart,
  logOffChainProcessingSummary,
} from "./loggers";
import dayjs from "dayjs";
import { logger } from "../logger";
import { BASE_URL } from "./constants";

export async function getTriggersFromOffchainApi(
  onChainFeed: Record<string, ValueUpdateData[]>,
  config: TimestampIteratorConfig
) {
  const supportedFeeds = Object.keys(onChainFeed);

  // round timestamps to nearest 10 seconds to align with server interval
  const intervalMs = config.intervalMs ?? 10000;
  const startTime = Math.floor(config.startTime / intervalMs) * intervalMs;
  const endTime = Math.floor(config.endTime / intervalMs) * intervalMs;
  const numCalls = Math.floor((endTime - startTime) / intervalMs);
  const perTimestampTriggers: Record<DataFeedId, Trigger>[] = [];

  logOffChainProcessingStart({
    from: dayjs(startTime),
    to: dayjs(endTime),
  });

  progress.start(numCalls, 0);

  // process data for each timestamp, due to server fragility
  // for now its done one by one

  for (let i = 0; i < numCalls; i++) {
    const timestamp = startTime + i * intervalMs;
    const dataItem = await fetchOffchainDataAtTimestamp(timestamp).catch(
      (error) => {
        if (error instanceof ApiFetchError) {
          handleApiError();
        }
      }
    );

    progress.update(i);

    if (dataItem) {
      perTimestampTriggers.push(
        processDataItem({
          dataItem,
          onChainFeed,
          timestamp,
          supportedFeeds,
        })
      );
    }
  }

  progress.stop();

  // merge all trigger dictionaries into one

  const allTriggers = mergeTriggers(perTimestampTriggers);

  logOffChainProcessingSummary();

  // write triggers to file

  await writeJsonToFile(allTriggers, "offChainData.json");

  return allTriggers;
}

const handleApiError = () => {
  logger.error("=============================================");
  logger.error("Failed to fetch data from offchain api");
  logger.error(`Please check if the server at ${BASE_URL} is running`);
  logger.error("=============================================");
  process.exit(1);
};
