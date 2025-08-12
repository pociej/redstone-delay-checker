import dotenv from "dotenv";
import { z } from "zod";

// Load .env file
dotenv.config();

// Define environment variable schema with validation
const envSchema = z.object({
  // RPC Configuration
  ETHEREUM_RPC_URL: z
    .string()
    .url()
    .default("https://ethereum-rpc.publicnode.com"),
  BSC_RPC_URL: z.string().url().default("https://bsc-rpc.publicnode.com"),
  RPC_RETRY_COUNT: z.coerce.number().int().default(3),

  // API Configuration
  REDSTONE_API_BASE_URL: z
    .string()
    .url()
    .default(
      "https://oracle-gateway-2.a.redstone.finance/data-packages/historical/redstone-primary-prod"
    ),
  API_RETRY_COUNT: z.coerce.number().int().default(3),

  // Processing Configuration
  INDEXING_OFFSET_MULTIPLIER: z.coerce.number().default(4),

  // Output Configuration
  RESULTS_DIR: z.string().min(1).default("results"),
  LOGS_PER_FEED_FILENAME: z.string().default("logsPerFeed.json"),
  OFFCHAIN_DATA_FILENAME: z.string().default("offChainData.json"),
  STATISTICS_FILENAME: z.string().default("statistics.json"),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment configuration:");
      error.issues.forEach((issue) => {
        console.error(`  • ${issue.path.join(".")}: ${issue.message}`);
      });
      console.error("\n💡 Check your .env file or environment variables");
      console.error("💡 See .env.example for reference");
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

export const rpcConfig = {
  ethereum: env.ETHEREUM_RPC_URL,
  bsc: env.BSC_RPC_URL,
  retryCount: env.RPC_RETRY_COUNT,
} as const;

export const apiConfig = {
  baseUrl: env.REDSTONE_API_BASE_URL,
  retryCount: env.API_RETRY_COUNT,
} as const;

export const processingConfig = {
  indexingOffsetMultiplier: env.INDEXING_OFFSET_MULTIPLIER,
} as const;

export const outputConfig = {
  resultsDir: env.RESULTS_DIR,
  logsPerFeedFilename: env.LOGS_PER_FEED_FILENAME,
  offchainDataFilename: env.OFFCHAIN_DATA_FILENAME,
  statisticsFilename: env.STATISTICS_FILENAME,
} as const;
