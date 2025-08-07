import { indexOnChainData } from "./onChain";
import { fetchHistoricalData } from "./offChain";
import { fetchDataForTimestamp } from "./offChain";
const logsPerFeed = await indexOnChainData();
