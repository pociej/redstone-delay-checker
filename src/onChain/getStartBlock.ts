import { createPublicClient } from "./client";
import { CHAINS } from "./constants";

export async function getStartBlock({
  latestBlockNumber,
  estimatedBlocksInOffset,
  timestamp,
  chainName,
}: {
  latestBlockNumber: bigint;
  estimatedBlocksInOffset: bigint;
  timestamp: number;
  chainName: keyof typeof CHAINS;
}) {
  const client = createPublicClient(chainName);
  let startBlockNumber = latestBlockNumber - estimatedBlocksInOffset;
  let startBlock = await client.getBlock({ blockNumber: startBlockNumber });

  while (startBlock.timestamp > timestamp) {
    startBlockNumber--;
    startBlock = await client.getBlock({ blockNumber: startBlockNumber });
  }

  return startBlock;
}
