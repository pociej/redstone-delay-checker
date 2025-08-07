#!/usr/bin/env bun

import { parseAbiItem } from "viem";
import { start } from "../dates";
import { logger } from "../logger";
import { CHUNK_SIZE, CHAINS } from "./constants";
import type { Chain } from "viem";
import { getBlockTimestamp } from "./getBlockTimestamp";
import { getStartBlock } from "./getStartBlock";
import { createPublicClient } from "./client";
import { decodeDataFeedId } from "./decodeDataFeedId";
import { indexProgress } from "./progress";
import { estimateBlocksInOffset } from "./estimateBlocksInOffset";
import { writeJsonToFile } from "../writeJsonToFile";

export type ValueUpdateData = {
  value: number;
  blockNumber: number;
  blockTimestamp: number;
};

const valueUpdateEvent = parseAbiItem(
  "event ValueUpdate(uint256 value, bytes32 dataFeedId, uint256 updatedAt)"
);

async function getEventsInChunks({
  offsetHours,
  chain,
}: {
  offsetHours: number;
  chain: Chain;
}) {
  const logsPerFeed: Record<string, ValueUpdateData[]> = {};
  const estimatedBlocksInOffset = estimateBlocksInOffset(offsetHours);
  const client = createPublicClient(chain);
  const latestBlockNumber = await client.getBlockNumber();

  let { number: startBlockNumber } = await getStartBlock({
    latestBlockNumber,
    estimatedBlocksInOffset,
    timestamp: start.toDate().getTime(),
    chain,
  });

  try {
    logger.info(`\n=== Indexing last week ValueUpdate events ===`);

    logger.info(`From block: ${startBlockNumber}`);
    logger.info(`To block: ${latestBlockNumber}`);
    logger.info(`=============================================\n`);

    let toBlock;
    let chunkCount = 0;

    const allChunksCount = Math.ceil(
      Number(latestBlockNumber - startBlockNumber) / Number(CHUNK_SIZE)
    );
    indexProgress.start(Number(allChunksCount), 0);

    while (startBlockNumber < latestBlockNumber) {
      toBlock = startBlockNumber + CHUNK_SIZE;

      if (toBlock > latestBlockNumber) {
        toBlock = latestBlockNumber;
      }

      chunkCount++;

      const logs = await client.getLogs({
        address: CHAINS[chain.name].contractAddress,
        event: valueUpdateEvent,
        fromBlock: startBlockNumber,
        toBlock,
      });

      for (const log of logs) {
        const dataFeedId = log.args.dataFeedId;

        if (dataFeedId) {
          const decodedId = decodeDataFeedId(dataFeedId);
          const blockTimestamp = await getBlockTimestamp(
            log.blockNumber,
            chain
          );

          if (!logsPerFeed[decodedId]) {
            logsPerFeed[decodedId] = [];
          }

          logsPerFeed[decodedId].push({
            value: Number(log.args.value),
            blockNumber: Number(log.blockNumber),
            blockTimestamp: Number(blockTimestamp),
          });
        } else {
          logger.error(`Invalid dataFeedId: ${dataFeedId}`);
        }
      }

      startBlockNumber = toBlock + 1n;
      indexProgress.update(chunkCount);
    }

    indexProgress.stop();

    logger.info(`\n=== Completed processing ${chunkCount} chunks ===`);
    logger.info(`Total data feeds: ${Object.values(logsPerFeed).length}`);
    logger.info(`Total events: ${Object.values(logsPerFeed).flat().length}`);
    await writeJsonToFile(logsPerFeed, "logsPerFeed.json");
    return logsPerFeed;
  } catch (error) {
    console.error("Error fetching data in chunks:", error);
    throw error;
  }
}

export async function indexOnChainData({
  offsetHours,
  chain,
}: {
  offsetHours: number;
  chain: Chain;
}) {
  try {
    return await getEventsInChunks({
      offsetHours,
      chain,
    });
  } catch (error) {
    logger.error("Error:", error);
    throw error;
  }
}
