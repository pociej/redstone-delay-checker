import type { PublicClient } from "viem";
import { CHAINS } from "./constants";
import { valueUpdateEvent } from "./abi";
import { decodeDataFeedId } from "./decodeDataFeedId";
import { getBlockTimestamp } from "./getBlockTimestamp";
import { logger } from "../logger";
import type { ValueUpdateData } from "./types";

export async function processChunk({
  from,
  to,
  client,
  chainName,
  onFinished,
  onError,
}: {
  from: bigint;
  to: bigint;
  client: PublicClient;
  chainName: keyof typeof CHAINS;
  onFinished: () => void;
  onError: (error: Error) => void;
}): Promise<Record<string, ValueUpdateData[]>> {
  return (async () => {
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
  })()
    .catch((error) => {
      console.error("Error processing chunk:", error);
      onError(error);
      return {};
    })
    .then((result) => {
      return result;
    })
    .finally(() => {
      onFinished();
    });
}
