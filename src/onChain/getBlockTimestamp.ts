import { createPublicClient } from "./client";
import type { Chain } from "viem";
const blockTimestampCache: Map<bigint, bigint> = new Map();

async function getBlockTimestamp(blockNumber: bigint, chain: Chain) {
  if (blockTimestampCache.has(blockNumber)) {
    return blockTimestampCache.get(blockNumber)!;
  }
  const client = createPublicClient(chain);
  const block = await client.getBlock({ blockNumber });
  blockTimestampCache.set(blockNumber, block.timestamp);
  return block.timestamp;
}

export { getBlockTimestamp };
