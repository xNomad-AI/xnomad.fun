import { TokenInfo } from "@/app/[chain]/agent/[address]/content/agent-token/token-list/network";
import { NFT } from "@/types";

export interface Token {
  name: string;
  address: string;
  symbol: string;
  balance: string;
  priceUsd: number;
  valueUsd: number;
  logoURI: string;
  decimals: number;
  uiAmount: string;
  usdPrice24hrPercenChange: number;
  agentCoin?: {
    address: string;
    chain: string;
    nftId: string;
    creatorAddress: string;
    decimals: number;
    deployedTime: string;
    description: string;
    holdersCount: number;
    liquidity: number;
    logo: string;
    marketCap: number;
    name: string;
    price: number;
    priceChange24h: number;
    symbol: string;
    telegram: string;
    twitter: string;
    volume24h: number;
    website: string;
    bound: boolean;
    override: {
      description: string;
      twitter: string;
      telegram: string;
      website: string;
    };
  };
}
export interface Portfolio {
  wallet: string;
  totalUsd: number;
  items: Token[];
  nft?: NFT;
}
