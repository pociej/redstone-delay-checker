import { ESTIMATED_SECONDS_PER_BLOCK } from "./constants";

function estimateBlocksInOffset(offsetHours: number) {
  const secondsInOffset = BigInt(offsetHours) * 60n * 60n;
  return secondsInOffset / ESTIMATED_SECONDS_PER_BLOCK;
}

export { estimateBlocksInOffset };
