import { z } from "zod";

export interface TimestampIteratorConfig {
  startTime?: number;
  endTime?: number;
  intervalMs?: number;
}

export const dataFeedSchema = z.array(
  z.object({
    timestampMilliseconds: z.number().int(),
    signature: z.string(),
    dataPoints: z
      .array(z.object({ dataFeedId: z.string(), value: z.number() }))
      .min(1),
    dataServiceId: z.string(),
    dataPackageId: z.string(),
    isSignatureValid: z.boolean(),
    signerAddress: z.string(),
    dataFeedId: z.string(),
  })
);

export type DataFeed = z.infer<typeof dataFeedSchema>;
