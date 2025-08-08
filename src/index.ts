import { indexOnChainData } from "./onChain";
import { args } from "./parseArgs";
import { parseOffChainData } from "./offChain";
import { getStatistics } from "./process.statistics";
import { writeJsonToFile } from "./writeJsonToFile";
import { start, end } from "./dates";
import { CHAINS } from "./onChain/constants";
// index on chain data for longer period to have as many "currentPrices" as possible
// on start processing offchain data

const onChainFeed = await indexOnChainData({
  offsetHours: 2 * args.start_offset,
  chainName: args.chain as keyof typeof CHAINS,
});

const offChainFeed = await parseOffChainData(onChainFeed, {
  startTime: start.valueOf(),
  endTime: end.valueOf(),
});

writeJsonToFile(
  getStatistics({ onChainFeed, offChainFeed }),
  "statistics.json"
);
