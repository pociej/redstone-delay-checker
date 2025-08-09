#!/usr/bin/env bun

import { logger } from "../logger";
import { createPublicClient } from "./client";
import { indexProgress } from "./progress";
import { writeJsonToFile } from "../writeJsonToFile";
import { processChunk } from "./processChunk";
import { mergeChunksData } from "./mergeChunksData";
import { getChunkRanges } from "./getChunkRanges";
import { CHAINS } from "./constants";
import { logIndexingStart, logIndexingSummary } from "./logger";

async function getEventsInChunks({
  startBlockNumber,
  chainName,
}: {
  startBlockNumber: bigint;
  chainName: keyof typeof CHAINS;
}) {
  const client = createPublicClient(chainName);

  const latestBlockNumber = await client.getBlockNumber();

  try {
    logIndexingStart({
      startBlockNumber,
      latestBlockNumber,
    });

    const chunkRanges = getChunkRanges({
      startBlockNumber,
      latestBlockNumber,
    });

    indexProgress.start(Number(chunkRanges.length), 0);

    const processingStats = {
      completed: 0,
      total: chunkRanges.length,
      failed: 0,
    };

    const chunkProcessors = chunkRanges.map(({ from, to }) =>
      processChunk({
        from,
        to,
        client,
        chainName,
        onFinished: () => {
          processingStats.completed += 1;
          indexProgress.update(processingStats.completed);
        },
        onError: (error) => {
          logger.error("Error processing chunk:", error);
          processingStats.failed += 1;
        },
      })
    );

    // Process all chunks in parallel

    const chunkResults = await Promise.all(chunkProcessors);

    // Merge chunk results into logsPerFeed

    const logsPerFeed = mergeChunksData({ chunkResults });

    indexProgress.stop();

    logIndexingSummary({
      completedChunksCount: processingStats.completed,
      failedChunksCount: processingStats.failed,
      totalEventsCount: Object.values(logsPerFeed).flat().length,
      totalDataFeedsCount: Object.values(logsPerFeed).length,
    });

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
