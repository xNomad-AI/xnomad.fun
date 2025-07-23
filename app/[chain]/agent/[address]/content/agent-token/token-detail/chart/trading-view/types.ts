export interface TradingViewGraphProps {
  pairAddress: string;
  baseToken: string;
  quoteToken: string;
  chartType: "usd" | "token";
  precision?: number;
}

export type TokenPriceChart = {
  address: string;
  c: number;
  h: number;
  l: number;
  o: number;
  type: string;
  unixTime: number;
  v: number;
};

export type TokenPriceChartResponse = {
  items: TokenPriceChart[];
};
