import { rpcConfig } from "../env";
import type { ChainSettings, ChainId } from "./types";

export const ESTIMATED_SECONDS_PER_BLOCK = 12n;
export const CHUNK_SIZE = 1000n;

export const CHAINS: Record<ChainId, ChainSettings> = {
  mainnet: {
    rpcUrl: rpcConfig.ethereum,
    contractAddress: "0xd72a6BA4a87DDB33e801b3f1c7750b2d0911fC6C",
    contractCreationBlockNumber: 20419584n,
  },
  bsc: {
    rpcUrl: rpcConfig.bsc,
    contractAddress: "0x97c19d3Ae8e4d74e25EF3AFf3a277fB614ed76D4",
    contractCreationBlockNumber: 41180511n,
  },
};
