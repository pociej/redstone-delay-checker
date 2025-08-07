import { createPublicClient as viemCreatePublicClient, http } from "viem";
import { CHAINS } from "./constants";
import type { Chain } from "viem";
let _clients = {};

function createPublicClient(chain: Chain) {
  if (!_clients[chain.name]) {
    _clients[chain.name] = viemCreatePublicClient({
      chain,
      transport: http(CHAINS[chain.name].rpcUrl),
    });
  }
  return _clients[chain.name];
}

export { createPublicClient };
