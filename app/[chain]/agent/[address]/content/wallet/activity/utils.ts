import { Activity } from "./network";
import { ActionType } from "./types";
export function isBasicToken(symbol: string) {
  return (
    symbol.toLowerCase() === "sol" ||
    symbol.toLowerCase() === "usdc" ||
    symbol.toLowerCase() === "usdt"
  );
}
export function getActionType({
  data,
  agentAccount,
}: {
  data: Activity;
  agentAccount: string;
}): ActionType {
  if (data.tx_type.includes("transfer")) {
    if (data.address === agentAccount) {
      return "receive";
    } else if (data.owner === agentAccount) {
      return "transfer";
    } else {
      return "transfer";
    }
  }
  const isBaseBasicToken = isBasicToken(data.base.symbol);
  const isQuoteBasicToken = isBasicToken(data.quote.symbol);
  switch (data.tx_type) {
    case "swap":
      if (isBaseBasicToken) {
        if (data.base.change_amount > 0) {
          return "sell";
        } else {
          return "buy";
        }
      }
      if (isQuoteBasicToken) {
        if (data.quote.change_amount > 0) {
          return "sell";
        } else {
          return "buy";
        }
      }
    default:
      return (data.tx_type ?? "transfer") as ActionType;
  }
}
