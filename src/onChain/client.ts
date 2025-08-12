import { createPublicClient as viemCreatePublicClient, http } from "viem";
import { CHAINS } from "./constants";
import * as chains from "viem/chains";
import { rpcConfig } from "../env";

const _clients = {};

function createPublicClient(chainName: keyof typeof CHAINS) {
  const chain = chains[chainName];
  if (!_clients[chainName]) {
    _clients[chainName] = viemCreatePublicClient({
      chain,
      transport: http(CHAINS[chainName].rpcUrl, {
        retryCount: rpcConfig.retryCount,
      }),
    });
  }
  return _clients[chainName];
}

export { createPublicClient };
