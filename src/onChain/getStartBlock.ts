import { createPublicClient } from "./client";
import { CHAINS } from "./constants";

export async function getStartBlock({
  latestBlockNumber,
  estimatedBlocksInOffset,
  expectedStartTime,
  chainName,
}: {
  latestBlockNumber: bigint;
  estimatedBlocksInOffset: bigint;
  expectedStartTime: number;
  chainName: keyof typeof CHAINS;
}) {
  const client = createPublicClient(chainName);
  let startBlockNumber = latestBlockNumber - estimatedBlocksInOffset;
  let startBlock = await client.getBlock({ blockNumber: startBlockNumber });
  while (startBlock.timestamp * 1000n > expectedStartTime) {
    startBlockNumber--;
    startBlock = await client.getBlock({ blockNumber: startBlockNumber });
  }
  return startBlock;
}
