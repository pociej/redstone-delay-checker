export type ValueUpdateData = {
  blockTimestamp: number;
  blockNumber: number;
  value: number;
};

export type Trigger = {
  changeTimestamp: number;
  propagationTimestamp: number;
};

export type OnChainFeed = Record<string, ValueUpdateData[]>;
export type OffChainFeed = Record<string, Trigger[]>;
