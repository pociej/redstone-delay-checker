import { CHAINS } from "./constants";
import { match } from "ts-pattern";
import { getStartBlock } from "./getStartBlock";
import { createPublicClient } from "./client";
import { estimateBlocksInOffset } from "./estimateBlocksInOffset";
import { start } from "../dates";

const INDEXING_OFFSET_MULTIPLIER = 2;

/*
  Generally to have guaranteed current onChain proces we need to index data 
  from the very first contract block 
  howver as we work with json files (in final solution it should use some database and indexer should be run in the background)
  for speedup things and avid dealing with huge JSON files the "good enough" strategy is to duplicate period of monitoring 
  e.g. we want monitor last week then we index last two weeks so at the moment 0 we have current prices for all data feeds that has at least 
  one update in the previous week which is realy good enough. 

  Getting back chunk by chunk till we have onchain prices for all data feeds is not the best solution as it requires 
  sequential requests and gonna be slow.
*/

export async function getIndexingStartBlock({
  chainName,
  useAllEvents,
  offsetHours,
}: {
  chainName: keyof typeof CHAINS;
  useAllEvents: boolean;
  offsetHours: number;
}) {
  return match(useAllEvents)
    .with(true, () => CHAINS[chainName].contractCreationBlockNumber)
    .with(false, async () => {
      const client = createPublicClient(chainName);
      const latestBlockNumber = await client.getBlockNumber();
      const estimatedBlocksInOffset = estimateBlocksInOffset(
        INDEXING_OFFSET_MULTIPLIER * offsetHours
      );

      let { number: startBlockNumber } = await getStartBlock({
        latestBlockNumber,
        estimatedBlocksInOffset,
        timestamp: start.toDate().getTime(),
        chainName,
      });
      return startBlockNumber;
    })
    .exhaustive();
}
