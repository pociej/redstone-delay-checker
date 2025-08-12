import { CHAINS } from "./constants";

function estimateBlocksInOffset(
  offsetHours: number,
  chain: keyof typeof CHAINS
) {
  const secondsInOffset = offsetHours * 60 * 60;
  return secondsInOffset / CHAINS[chain].estimatedSecondsPerBlock;
}

export { estimateBlocksInOffset };
