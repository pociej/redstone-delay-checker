import { rpcConfig } from "../env";
import type { ChainSettings, ChainId } from "./types";

export const CHUNK_SIZE = 1000n;

export const CHAINS: Record<ChainId, ChainSettings> = {
  mainnet: {
    rpcUrl: rpcConfig.ethereum,
    contractAddress: "0xd72a6BA4a87DDB33e801b3f1c7750b2d0911fC6C",
    contractCreationBlockNumber: 20419584n,
    manifestPath: "./manifest.mainnet.json",
    estimatedSecondsPerBlock: 12,
  },
  bsc: {
    rpcUrl: rpcConfig.bsc,
    contractAddress: "0x97c19d3Ae8e4d74e25EF3AFf3a277fB614ed76D4",
    contractCreationBlockNumber: 41180511n,
    manifestPath: "./manifest.bsc.json",
    estimatedSecondsPerBlock: 0.75,
  },
};
