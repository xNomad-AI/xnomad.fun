import { api } from "@/primitive/api";
import { SupportedChain } from "@/types/preference";
export type TokenTopHolder = {
  address: string;
  maker_token_tags: string[];
  tags?: string[];
  is_suspicious?: boolean;
  amount: number;
  lastActiveTimestamp: number;
  usd_value: number;
  buy_amount_cur: number;
  buy_volume_cur: number;
  realized_profit: number;
  unrealized_profit: number;
  avg_cost: number;
  avg_sold: number;
  buy_tx_count_cur: number;
  sell_tx_count_cur: number;
  amount_percentage: number;
  profit_change: number;
};
export function getHolders({
  address,
  asc,
  walletAddress,
  chain,
}: {
  address: string;
  asc?: 0 | 1;
  walletAddress?: string;
  chain: SupportedChain;
}) {
  return api.ts.get<TokenTopHolder[]>(
    `/addresses/token/top_holders/${address}`,
    {
      asc,
      walletAddress,
      chain,
    }
  );
}
