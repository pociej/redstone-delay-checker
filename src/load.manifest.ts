import { manifest_path } from "./parseArgs";
import { z } from "zod";
export let manifest;

const manifestSchema = z.object({
  updateTriggers: z.object({
    deviationPercentage: z.number().min(0),
    timeSinceLastUpdateInMilliseconds: z.number().min(0),
  }),
  priceFeeds: z.record(
    z.string(),
    z.object({
      updateTriggersOverrides: z
        .object({
          deviationPercentage: z.number().optional(),
          timeSinceLastUpdateInMilliseconds: z.number().optional(),
        })
        .optional(),
    })
  ),
});

const loadManifest = async () => {
  if (!manifest) {
    manifest = await import(manifest_path);
  }
  const validationResult = manifestSchema.safeParse(manifest);
  if (!validationResult.success) {
    throw new Error(`Invalid manifest file: ${validationResult.error.message}`);
  }
  return validationResult.data;
};

await loadManifest();
