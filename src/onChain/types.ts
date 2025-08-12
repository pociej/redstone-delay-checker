export type ValueUpdateData = {
  value: number;
  blockNumber: number;
  blockTimestamp: number;
};

export type ChainSettings = {
  rpcUrl: string;
  contractAddress: `0x${string}`;
  contractCreationBlockNumber: bigint;
  manifestPath: string;
  estimatedSecondsPerBlock: number;
};

export enum ChainId {
  Mainnet = "mainnet",
  Bsc = "bsc",
}
