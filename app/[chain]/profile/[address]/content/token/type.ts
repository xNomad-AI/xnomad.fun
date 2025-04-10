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
}
export interface Portfolio {
  wallet: string;
  totalUsd: number;
  items: Token[];
}
