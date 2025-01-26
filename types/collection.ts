export interface Collection {
  _id: string;
  id: string;
  categories: string[];
  chain: string;
  contracts: string[];
  createdAt: string;
  description: string;
  logo: string;
  name: string;
  updatedAt: string;
}
export interface Price {
  value: number;
  raw_value: number;
  usd: number | null;
  payment_token: {
    address: string;
    symbol: string;
    decimals: number;
  };
}
export interface TraderNum {
  "24h": number;
  "7d": number;
  "30d": number;
}
export interface CollectionMetrics {
  collection_id: string;
  collection_name: string;
  circulating_supply: number;
  market_cap: {
    value: number;
    raw_value: number;
    usd: number;
    payment_token: {
      address: string;
      symbol: string;
      decimals: number;
    };
  };
  volume: {
    "24h": Price;
    "7d": Price;
    "30d": Price;
    all: Price;
  };
  buyer_num: TraderNum;
  seller_num: TraderNum;
  trader_num: TraderNum;
  transfer_num: TraderNum;
  holder_num: number;
  floor_price: Price;
}
