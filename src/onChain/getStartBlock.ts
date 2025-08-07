import { createPublicClient } from "./client";
import type { Chain } from "viem";

export async function getStartBlock({
  latestBlockNumber,
  estimatedBlocksInOffset,
  timestamp,
  chain,
}: {
  latestBlockNumber: bigint;
  estimatedBlocksInOffset: bigint;
  timestamp: number;
  chain: Chain;
}) {
  const client = createPublicClient(chain);
  let startBlockNumber = latestBlockNumber - estimatedBlocksInOffset;
  let startBlock = await client.getBlock({ blockNumber: startBlockNumber });

  while (startBlock.timestamp > timestamp) {
    startBlockNumber--;
    startBlock = await client.getBlock({ blockNumber: startBlockNumber });
  }

  return startBlock;
}
