export type TokenValue = {
  ca: string;
  ticker: string;
  logo: string;
};
export interface SearchToken {
  address?: string;
  buy_24h: number;
  buy_24h_change_percent: number;
  decimals: number;
  fdv: number;
  last_trade_human_time: string;
  last_trade_unix_time: number;
  liquidity: number;
  logo_uri: string;
  market_cap: number;
  name: string;
  network: string;
  price: number;
  price_change_24h_percent: number;
  sell_24h: number;
  sell_24h_change_percent: number;
  symbol: string;
  trade_24h: number;
  trade_24h_change_percent: number;
  unique_view_24h_change_percent: number;
  unique_wallet_24h: number;
  verified: boolean;
  volume_24h_change_percent: number;
  volume_24h_usd: number;
}
export { TokenInputBuy } from "./buy";
export { TokenInputSell } from "./sell";
