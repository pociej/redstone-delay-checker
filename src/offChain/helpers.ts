import { deviationPercentage } from "../deviationPercentage";
import type { DataFeed } from "./types";

const getMedian = (values: number[]) => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  } else {
    return sortedValues[middleIndex];
  }
};

function getDeviationPercentage(dataFeedId: string) {
  return deviationPercentage[dataFeedId];
}

function calculateDeviationPercentage(
  previousValue: number,
  currentValue: number
) {
  return Math.abs((currentValue - previousValue) / previousValue) * 100;
}

function comparePricesDeviation(
  previousFeedValues: Record<string, number>,
  currentFeedValues: Record<string, number>,
  timestamp: number
) {
  const triggers: Record<string, boolean> = {};

  Object.keys(currentFeedValues).forEach((key) => {
    const previousValue = previousFeedValues[key];
    const currentValue = currentFeedValues[key] * 100000000;

    const deviation =
      Math.abs((currentValue - previousValue) / previousValue) * 100;
    if (deviation > getDeviationPercentage(key)) {
      triggers[key] = true;
    }
  });

  return triggers;
}

function getMedianPrices(data: DataFeed) {
  const values = data
    .map((item) => item.dataPoints.map((dp) => dp.value))
    .flat();
  return getMedian(values);
}

export {
  getMedian,
  getDeviationPercentage,
  calculateDeviationPercentage,
  comparePricesDeviation,
  getMedianPrices,
};
