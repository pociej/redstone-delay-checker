import { indexOnChainData } from "./onChain";
import { chain, start_offset, allEvents } from "./parseArgs";
import { CHAINS } from "./onChain/constants";
import { getIndexingStartBlock } from "./onChain/indexingStrategy";
import { parseOffChainData } from "./offChain";
import { getStatistics } from "./process.statistics";
import { writeJsonToFile } from "./writeJsonToFile";
import { start, end } from "./dates";

const startBlockNumber = await getIndexingStartBlock({
  chainName: chain as keyof typeof CHAINS,
  useAllEvents: allEvents,
  offsetHours: start_offset,
});
// index on chain data for longer period to have as many "currentPrices" as possible
// on start processing offchain data

const onChainFeed = await indexOnChainData({
  startBlockNumber,
  chainName: chain as keyof typeof CHAINS,
});

// const offChainFeed = await parseOffChainData(onChainFeed, {
//   startTime: start.valueOf(),
//   endTime: end.valueOf(),
// });

// writeJsonToFile(
//   getStatistics({ onChainFeed, offChainFeed }),
//   "statistics.json"
// );
