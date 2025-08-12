import { getDeviationPercentage } from "../deviationPercentage";
import { chain } from "../parseArgs";
import { logger } from "../logger";

const getMedian = (values: number[]) => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  } else {
    return sortedValues[middleIndex];
  }
};

function calculateDeviationPercentage(
  previousValue: number,
  currentValue: number
) {
  return Math.abs((currentValue - previousValue) / previousValue) * 100;
}

function comparePricesDeviation(
  onChainPrices: Record<string, number>,
  currentFeedValues: Record<string, number>,
  timestamp: number
) {
  const triggers: string[] = [];

  Object.keys(currentFeedValues).forEach((key) => {
    const previousValue = onChainPrices[key];
    // convert to 8 decimal places
    const currentValue = currentFeedValues[key] * 100000000;

    const deviation =
      Math.abs((currentValue - previousValue) / previousValue) * 100;

    if (deviation === Infinity) {
      logger.info("Skipping as no current onchain price found");
    } else {
      if (deviation > getDeviationPercentage(chain, key)) {
        logger.info(
          `Trigger detected for ${key} at ${timestamp} with deviation ${deviation}. Required deviation ${getDeviationPercentage(
            chain,
            key
          )}`
        );
        triggers.push(key);
      }
    }
  });

  return triggers;
}

export {
  getMedian,
  getDeviationPercentage,
  calculateDeviationPercentage,
  comparePricesDeviation,
};
