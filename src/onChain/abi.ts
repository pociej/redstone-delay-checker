import { parseAbiItem } from "viem";

export const valueUpdateEvent = parseAbiItem(
  "event ValueUpdate(uint256 value, bytes32 dataFeedId, uint256 updatedAt)"
);
