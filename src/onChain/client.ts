import { createPublicClient as viemCreatePublicClient, http } from "viem";
import { CHAINS } from "./constants";
import * as chains from "viem/chains";
import { config } from "../config";

const _clients = {};

function createPublicClient(chainName: keyof typeof CHAINS) {
  const chain = chains[chainName];
  if (!_clients[chainName]) {
    _clients[chainName] = viemCreatePublicClient({
      chain,
      transport: http(CHAINS[chainName].rpcUrl, {
        retryCount: config.RETRY_COUNT,
      }),
    });
  }
  return _clients[chainName];
}

export { createPublicClient };
