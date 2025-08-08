#!/usr/bin/env bun

import { parseAbiItem } from "viem";
import { logger } from "../logger";
import { CHUNK_SIZE, CHAINS } from "./constants";
import { getBlockTimestamp } from "./getBlockTimestamp";
import { createPublicClient } from "./client";
import { decodeDataFeedId } from "./decodeDataFeedId";
import { indexProgress } from "./progress";
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
  startBlockNumber,
  chainName,
}: {
  startBlockNumber: bigint;
  chainName: keyof typeof CHAINS;
}) {
  const logsPerFeed: Record<string, ValueUpdateData[]> = {};
  const client = createPublicClient(chainName);
  const latestBlockNumber = await client.getBlockNumber();
  try {
    logger.info(`\n=== Indexing last week ValueUpdate events ===`);

    logger.info(`From block: ${startBlockNumber}`);
    logger.info(`To block: ${latestBlockNumber}`);
    logger.info(`=============================================\n`);

    let chunkCount = 0;

    const allChunksCount = Math.ceil(
      Number(latestBlockNumber - startBlockNumber) / Number(CHUNK_SIZE)
    );
    console.log("allChunksCount", allChunksCount);

    indexProgress.start(Number(allChunksCount), 0);

    const chunkRanges: Array<{ from: bigint; to: bigint }> = [];
    let start = startBlockNumber;

    while (start < latestBlockNumber) {
      let end = start + CHUNK_SIZE - 1n;
      if (end > latestBlockNumber) end = latestBlockNumber;
      chunkRanges.push({ from: start, to: end });
      start = end + 1n;
    }

    chunkCount = chunkRanges.length;

    let completed = 0;
    const chunkProcessors = chunkRanges.map(({ from, to }) =>
      (async () => {
        const logs = await client.getLogs({
          address: CHAINS[chainName].contractAddress,
          event: valueUpdateEvent,
          fromBlock: from,
          toBlock: to,
        });

        const chunkMap: Record<string, ValueUpdateData[]> = {};

        for (const log of logs) {
          const dataFeedId = log.args.dataFeedId;
          if (!dataFeedId) {
            logger.error(`Invalid dataFeedId: ${dataFeedId}`);
            continue;
          }

          const decodedId = decodeDataFeedId(dataFeedId);

          //TODO:  this could also be done in parallel to speed up the process

          const blockTimestamp = await getBlockTimestamp(
            log.blockNumber,
            chainName
          );

          if (!chunkMap[decodedId]) {
            chunkMap[decodedId] = [];
          }

          chunkMap[decodedId].push({
            value: Number(log.args.value),
            blockNumber: Number(log.blockNumber),
            blockTimestamp: Number(blockTimestamp),
          });
        }

        return chunkMap;
      })().finally(() => {
        completed += 1;
        indexProgress.update(completed);
      })
    );

    // Process all chunks in parallel

    const chunkResults = await Promise.all(chunkProcessors);

    // Merge chunk results into logsPerFeed
    for (const chunkMap of chunkResults) {
      for (const [feedId, entries] of Object.entries(chunkMap)) {
        if (!logsPerFeed[feedId]) logsPerFeed[feedId] = [];
        logsPerFeed[feedId].push(...entries);
      }
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
  startBlockNumber,
  chainName,
}: {
  startBlockNumber: bigint;
  chainName: keyof typeof CHAINS;
}) {
  try {
    return await getEventsInChunks({
      startBlockNumber,
      chainName,
    });
  } catch (error) {
    logger.error("Error:", error);
    throw error;
  }
}
