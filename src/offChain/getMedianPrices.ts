import type { DataFeed } from "./types";
import { dataFeedSchema } from "./types";
import { getMedian } from "./helpers";

function getMedianPrice(data: DataFeed) {
  const values = data
    .map((item) => item.dataPoints.map((dp) => dp.value))
    .flat();
  return getMedian(values);
}

export function getMedianPrices(dataItem: DataFeed, supportedFeeds: string[]) {
  const medianPrices: Record<string, number> = {};

  // Calculate median prices

  Object.keys(dataItem).forEach((key) => {
    if (!supportedFeeds.includes(key)) {
      return;
    }
    const validationResult = dataFeedSchema.safeParse(dataItem[key]);
    if (validationResult.success) {
      medianPrices[key] = getMedianPrice(validationResult.data);
    } else {
      console.log(
        `Error validating data for key ${key}:`,
        validationResult.error
      );
    }
  });

  return medianPrices;
}
