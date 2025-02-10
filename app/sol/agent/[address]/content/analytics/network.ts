import { api } from "@/primitive/api";
import BigNumber from "bignumber.js";
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
interface TransferActivity {
  type: string;
  source: string;
  destination: string;
  amount: string;
  tokenMint: string; // token address
  decimals: number;
  signature: string; // tx hash
  slot: number;
  time: number;
  symbol: string;
}
function transferToActivity(transfer: TransferActivity): Activity {
  return {
    quote: {
      symbol: transfer.symbol,
      decimals: transfer.decimals,
      address: transfer.tokenMint,
      amount: Number(transfer.amount),
      type: "token",
      type_swap: "token",
      ui_amount: BigNumber(transfer.amount)
        .dividedBy(10 ** transfer.decimals)
        .toNumber(),
      price: 0,
      nearest_price: 0,
      change_amount: 0,
      ui_change_amount: 0,
    },
    base: {
      symbol: "SOL",
      decimals: 9,
      address: "",
      amount: 0,
      type: "token",
      type_swap: "token",
      ui_amount: 0,
      price: 0,
      nearest_price: 0,
      change_amount: 0,
      ui_change_amount: 0,
    },
    base_price: 0,
    quote_price: 0,
    tx_hash: transfer.signature,
    source: transfer.source,
    block_unix_time: transfer.time,
    tx_type: transfer.type,
    address: transfer.destination,
    owner: transfer.source,
  };
}
export async function getTransferActivity({
  address,
  limit,
}: {
  address: string;
  limit: number;
}) {
  const res = await api.v1.get<{ items: TransferActivity[] }>(
    "/agent-account/defi/transfer-txs",
    {
      address,
      limit,
      chain: "solana",
    }
  );
  return res.items.map(transferToActivity);
}
