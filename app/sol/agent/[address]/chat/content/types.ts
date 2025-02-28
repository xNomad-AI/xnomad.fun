export const actions = ["airdrop", "trade", "analyze", "issue-token"] as const;
export type Action = (typeof actions)[number];
export const tradeActions = [
  "buy",
  "sell",
  "swap",
  "transfer",
  "limit-order",
] as const;
export type TradeAction = (typeof tradeActions)[number];
export const actionConfigs = {
  airdrop: {
    title: "Airdrop",
  },
  trade: {
    title: "Trade",
  },
  analyze: {
    title: "Analyze",
  },
  "issue-token": {
    title: "Issue Token",
  },
} as { [key in Action]: { title: string; disabled?: boolean } };
export const tradeActionConfigs = {
  buy: {
    title: "Buy",
  },
  sell: {
    title: "Sell",
  },
  swap: {
    title: "Swap",
  },
  transfer: {
    title: "Transfer",
  },
  "limit-order": {
    title: "Limit Order",
  },
} as { [key in TradeAction]: { title: string; disabled?: boolean } };
