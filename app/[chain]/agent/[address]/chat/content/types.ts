export const actions = ["airdrop", "trade", "analyze", "issue-token"] as const;
export type Action = (typeof actions)[number];
export const tradeActions = [
  "buy",
  "sell",
  "swap",
  "transfer",
  "limit-order",
  "copy-trade",
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
  "copy-trade": {
    title: "Copy Trade",
  },
} as { [key in TradeAction]: { title: string; disabled?: boolean } };
