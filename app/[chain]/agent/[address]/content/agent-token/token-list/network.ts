import { api } from "@/primitive/api";
import { NFT } from "@/types";
import { SupportedChain } from "@/types/preference";

// only creatorAddress take effect, other params are not used
export interface Params {
  creatorAddress?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
  onlyBound?: 0 | 1;
  chain: SupportedChain;
}
export interface TokenInfo {
  address: string;
  description: string;
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
  nft: NFT;
}
export function getAgentTokenList({
  creatorAddress,
  limit = 1000,
  offset = 0,
  sortBy = "deployedTime",
  sortOrder = "desc",
  onlyBound = 1,
  chain,
}: Params) {
  return api.v1.get<{ list: TokenInfo[] }>("/nft/agent-created-tokens", {
    creatorAddress,
    limit,
    offset,
    sortBy,
    sortOrder,
    chain,
    onlyBound: onlyBound === 0 ? undefined : onlyBound,
  });
}
