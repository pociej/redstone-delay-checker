import {
  fetchDataForTimestamp,
  getFeedPriceMedian,
  calculateDeviationPercentage,
} from "../offChain";

import { logger } from "../logger";
import dayjs from "dayjs";
import { indexOnChainData } from "../onChain";

const logsPerFeed = await indexOnChainData();

const data = await Promise.all([
  fetchDataForTimestamp(1754521130000),
  fetchDataForTimestamp(1754521140000),
]);

const [prevMedian, currentMedian] = data.map((item) =>
  getFeedPriceMedian(item["XRD"])
);

const deviationPercentage = calculateDeviationPercentage(
  prevMedian,
  currentMedian
);

logger.warn(
  "Deviation percentage for XRD at:",
  dayjs(1754521140000).format("YYYY-MM-DD HH:mm:ss"),
  deviationPercentage
);

logger.warn("XRD events in last 24hrs:", logsPerFeed["XRD"] || []);
