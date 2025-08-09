import type dayjs from "dayjs";
import { logger } from "../logger";

export const logOffChainProcessingStart = ({
  from,
  to,
}: {
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
}) => {
  logger.info(`\n=== Reading offchain data ===`);

  logger.info(`From Date: ${from.format("YYYY-MM-DD HH:mm:ss")}`);
  logger.info(`To Date: ${to.format("YYYY-MM-DD HH:mm:ss")}`);
  logger.info(`=============================================\n`);
};

export const logOffChainProcessingSummary = () => {
  logger.info(`\n=== Offchain processing completed ===`);
  logger.info(`=============================================\n`);
};
