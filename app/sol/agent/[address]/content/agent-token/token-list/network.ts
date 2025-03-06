import { api } from "@/primitive/api";

// only creatorAddress take effect, other params are not used
export interface Params {
  creatorAddress: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}
export interface TokenInfo {
  address: string;
  chain: string;
  createdAt: string;
  creatorAddress: string;
  deployedTime: string;
  holdersCount: number;
  liquidity: number;
  logo: string;
  marketCap: number;
  name: string;
  price: number;
  priceChange24h: number;
  symbol: string;
  telegram?: string;
  twitter?: string;
  updatedAt: string;
  volume24h: number;
  website?: string;
}
export function getAgentTokenList({
  creatorAddress,
  limit = 1000,
  offset = 0,
  sortBy = "deployedTime",
  sortOrder = "desc",
}: Params) {
  return api.v1.get<{ list: TokenInfo[] }>("/launchpad/agent-created-tokens", {
    creatorAddress,
    limit,
    offset,
    sortBy,
    sortOrder,
  });
}
