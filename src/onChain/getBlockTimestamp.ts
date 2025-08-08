import { createPublicClient } from "./client";
import { CHAINS } from "./constants";
const blockTimestampCache: Map<bigint, bigint> = new Map();

async function getBlockTimestamp(
  blockNumber: bigint,
  chainName: keyof typeof CHAINS
) {
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber)!;
  }
  const client = createPublicClient(chainName);
  const block = await client.getBlock({ blockNumber });
  blockTimestampCache.set(blockNumber, block.timestamp);
  return block.timestamp;
}

export { getBlockTimestamp };
