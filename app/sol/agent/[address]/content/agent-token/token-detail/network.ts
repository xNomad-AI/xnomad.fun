import { api } from "@/primitive/api";
import { TokenInfo } from "../token-list/network";
export type TokenDetail = {
  address: string;
  name: string;
  symbol: string;
  creationTimestamp: number;
  creatorAddress: string;
  creatorTokenStatus: string;
  creatorTokenBalance: string;
  top10HolderRate: string;
  poolAddress: string;
  quoteAddress: string;
  quoteSymbol: string;
  liquidity: string;
  baseReserve: string;
  quoteReserve: string;
  initialLiquidity: string;
  initialBaseReserve: string;
  initialQuoteReserve: string;
  poolCreationTimestamp: number;
  baseReserveValue: string;
  quoteReserveValue: string;
  quoteVaultAddress: string;
  baseVaultAddress: string;
  price: string;
  price1m: string;
  price5m: string;
  price1h: string;
  price6h: string;
  price24h: string;
  buys1m: number;
  buys5m: number;
  buys1h: number;
  buys6h: number;
  buys24h: number;
  sells1m: number;
  sells5m: number;
  sells1h: number;
  sells6h: number;
  sells24h: number;
  volume1m: string;
  volume5m: string;
  volume1h: string;
  volume6h: string;
  volume24h: string;
  buyVolume1m: string;
  buyVolume5m: string;
  buyVolume1h: string;
  buyVolume6h: string;
  buyVolume24h: string;
  sellVolume1m: string;
  sellVolume5m: string;
  sellVolume1h: string;
  sellVolume6h: string;
  sellVolume24h: string;
  totalSupply: string;
  circulatingSupply: string;
  holderCount: number;
  launchpad?: "Pump.fun" | "Moonshot";
};

export function getTokenDetail(address: string) {
  return api.ts.get<TokenDetail>(`/addresses/token/detail/${address}`);
}

export function getPrimaryToken(agentId: string) {
  return api.v1.get<TokenInfo>(`/nft/solana/${agentId}/primary-coin`);
}
