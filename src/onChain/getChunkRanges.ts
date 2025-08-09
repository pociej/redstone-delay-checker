import { CHUNK_SIZE } from "./constants";
import { indexProgress } from "./progress";

export const getChunkRanges = ({
  startBlockNumber,
  latestBlockNumber,
}: {
  startBlockNumber: bigint;
  latestBlockNumber: bigint;
}) => {
  const allChunksCount = Math.ceil(
    Number(latestBlockNumber - startBlockNumber) / Number(CHUNK_SIZE)
  );

  indexProgress.start(Number(allChunksCount), 0);

  const chunkRanges: Array<{ from: bigint; to: bigint }> = [];
  let start = startBlockNumber;

  while (start < latestBlockNumber) {
    let end = start + CHUNK_SIZE - 1n;
    if (end > latestBlockNumber) end = latestBlockNumber;
    chunkRanges.push({ from: start, to: end });
    start = end + 1n;
  }

  return chunkRanges;
};
