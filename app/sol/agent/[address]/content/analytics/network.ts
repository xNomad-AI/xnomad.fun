import { api } from "@/primitive/api";
export interface Token {
  symbol: string;
  decimals: number;
  address: string;
  amount: number;
  type: string;
  type_swap: string;
  ui_amount: number;
  price: number;
  nearest_price: number;
  change_amount: number;
  ui_change_amount: number;
}
export interface Activity {
  quote: Token;
  base: Token;
  base_price: number | null;
  quote_price: number | null;
  tx_hash: string;
  source: string;
  block_unix_time: number;
  tx_type: string;
  address: string;
  owner: string;
}
export function getActivities({
  chain = "solana",
  address,
  offset = 0,
  limit = 10,
  afterTime,
}: {
  chain?: string;
  address: string;
  offset?: number;
  limit?: number;
  afterTime?: number;
}) {
  return api.v1.get<{
    items: Activity[];
    has_next: boolean;
  }>("/agent-account/defi/txs", {
    chain,
    address,
    offset,
    limit,
    afterTime,
  });
}
