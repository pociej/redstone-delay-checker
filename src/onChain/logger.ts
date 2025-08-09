import { logger } from "../logger";

const logIndexingStart = ({
  startBlockNumber,
  latestBlockNumber,
}: {
  startBlockNumber: bigint;
  latestBlockNumber: bigint;
}) => {
  logger.info(`\n=== Indexing ValueUpdate events ===`);

  logger.info(`From block: ${startBlockNumber}`);
  logger.info(`To block: ${latestBlockNumber}`);
  logger.info(`=============================================\n`);
};

const logIndexingSummary = ({
  completedChunksCount,
  failedChunksCount,
  totalEventsCount,
  totalDataFeedsCount,
}: {
  completedChunksCount: number;
  failedChunksCount: number;
  totalEventsCount: number;
  totalDataFeedsCount: number;
}) => {
  logger.info(`\n=== Indexing completed ===`);
  logger.info(`Total events: ${totalEventsCount}`);
  logger.info(`Completed: ${completedChunksCount}`);
  logger.info(`Failed: ${failedChunksCount}`);
  logger.info(`Total data feeds: ${totalDataFeedsCount}`);
  logger.info(`=============================================\n`);
};

export { logIndexingStart, logIndexingSummary };
