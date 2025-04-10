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
}
export interface Portfolio {
  wallet: string;
  totalUsd: number;
  items: Token[];
  nft: NFT;
}
