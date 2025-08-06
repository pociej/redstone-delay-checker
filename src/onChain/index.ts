#!/usr/bin/env bun

import { createPublicClient, http, parseAbiItem } from "viem";
import { mainnet } from "viem/chains";
import { sevenDaysAgo } from "../dates";
import { logger } from "../logger";
import cliProgress from "cli-progress";
import colors from "ansi-colors";

const SECONDS_PER_BLOCK = 12n;
const SECONDS_PER_WEEK = 7n * 24n * 60n * 60n;
const BLOCKS_PER_WEEK = SECONDS_PER_WEEK / SECONDS_PER_BLOCK;
const CHUNK_SIZE = 2000n;

type ValueUpdateDate = {
  value: bigint;
  blockNumber: bigint;
  blockTimestamp: bigint;
};
const CONTRACT_ADDRESS = "0xd72a6BA4a87DDB33e801b3f1c7750b2d0911fC6C";

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://ethereum-rpc.publicnode.com"),
});

const indexProgress = new cliProgress.SingleBar(
  {
    format:
      "Indexing blocks |" +
      colors.blue("{bar}") +
      "| {percentage}% || {value}/{total} Chunks" +
      `(Chunk size: ${CHUNK_SIZE})`,
    barCompleteChar: "\u2588",
    barIncompleteChar: "\u2591",
    hideCursor: true,
    stream: process.stdout,
  },
  cliProgress.Presets.shades_classic
);

const valueUpdateEvent = parseAbiItem(
  "event ValueUpdate(uint256 value, bytes32 dataFeedId, uint256 updatedAt)"
);

const blockTimestampCache: Map<bigint, bigint> = new Map();

const getBlockTimestamp = async (blockNumber: bigint) => {
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber)!;
  }
  const block = await client.getBlock({ blockNumber });
  blockTimestampCache.set(blockNumber, block.timestamp);
  return block.timestamp;
};

function decodeDataFeedId(dataFeedId: string): string {
  const hex = dataFeedId.slice(2);
  const decoded = Buffer.from(hex, "hex").toString("utf8").replace(/\0/g, "");
  return decoded;
}

const indexedEventsPerFeed: Record<string, number> = {};

async function getFromBlock(
  latestBlockNumber: bigint,
  approximateBlocksCountInPeriod: bigint,
  timestamp: number
) {
  let fromBlockNumber = latestBlockNumber - approximateBlocksCountInPeriod;
  let fromBlock = await client.getBlock({ blockNumber: fromBlockNumber });

  while (fromBlock.timestamp > timestamp) {
    fromBlockNumber--;
    fromBlock = await client.getBlock({ blockNumber: fromBlockNumber });
  }

  return fromBlock;
}

async function getLastWeekDataInChunks() {
  try {
    const latestBlockNumber = await client.getBlockNumber();
    logger.info(`\n=== Indexing last week ValueUpdate events ===`);
    let { number: fromBlockNumber } = await getFromBlock(
      latestBlockNumber,
      BLOCKS_PER_WEEK,
      sevenDaysAgo.toDate().getTime()
    );
    logger.info(`From block: ${fromBlockNumber}`);
    logger.info(`To block: ${latestBlockNumber}`);
    logger.info(`=============================================\n`);
    const logsPerFeed: Record<string, ValueUpdateDate[]> = {};
    let toBlock;
    let chunkCount = 0;
    const allChunksCount = BLOCKS_PER_WEEK / CHUNK_SIZE;
    indexProgress.start(Number(allChunksCount), 0);
    while (fromBlockNumber < latestBlockNumber) {
      toBlock = fromBlockNumber + CHUNK_SIZE;
      if (toBlock > latestBlockNumber) {
        toBlock = latestBlockNumber;
      }
      chunkCount++;
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS,
        event: valueUpdateEvent,
        fromBlock: fromBlockNumber,
        toBlock,
      });

      let logCount = 0;
      for (const log of logs) {
        logCount++;

        const dataFeedId = log.args.dataFeedId;
        if (dataFeedId) {
          const decodedId = decodeDataFeedId(dataFeedId);
          const blockTimestamp = await getBlockTimestamp(log.blockNumber);

          if (!logsPerFeed[decodedId]) {
            logsPerFeed[decodedId] = [];
          }

          logsPerFeed[decodedId].push({
            value: log.args.value,
            blockNumber: log.blockNumber,
            blockTimestamp,
          });
        }
      }

      fromBlockNumber = toBlock + 1n;
      indexProgress.update(chunkCount);
    }

    indexProgress.stop();
    logger.info(`\n=== Completed processing ${chunkCount} chunks ===`);
    logger.info(`Total data feeds: ${Object.values(logsPerFeed).length}`);
    logger.info(`Total events: ${Object.values(logsPerFeed).flat().length}`);

    return logsPerFeed;
  } catch (error) {
    console.error("Error fetching data in chunks:", error);
    throw error;
  }
}

export async function indexOnChainData() {
  try {
    await getLastWeekDataInChunks();
    logger.info("Indexing completed successfully");
  } catch (error) {
    logger.error("Error:", error);
  }
}
