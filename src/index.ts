import { indexOnChainData } from "./onChain";
import { chain, start_offset, allEvents } from "./parseArgs";
import { CHAINS } from "./onChain/constants";
import { getIndexingStartBlock } from "./onChain/indexingStrategy";
import { getTriggersFromOffchainApi } from "./offChain";
import { getStatistics } from "./process.statistics";
import { writeJsonToFile } from "./writeJsonToFile";
import { start, end } from "./dates";
import { outputConfig } from "./env";

const startBlockNumber = await getIndexingStartBlock({
  chainName: chain as keyof typeof CHAINS,
  useAllEvents: allEvents,
  offsetHours: start_offset,
});

// NOTE : this could be otimised by taking onchain and offchain data in parallel
// and then process them together when ready however we still get offchain sequentially
// due to server fragility so its not a priority for now

// index onchain data

const onChainEvents = await indexOnChainData({
  startBlockNumber,
  chainName: chain as keyof typeof CHAINS,
});

// get offchain data

const offChainTriggers = await getTriggersFromOffchainApi(onChainEvents, {
  startTime: start.valueOf(),
  endTime: end.valueOf(),
});

writeJsonToFile(
  getStatistics({ onChainEvents, offChainTriggers }),
  outputConfig.statisticsFilename
);
