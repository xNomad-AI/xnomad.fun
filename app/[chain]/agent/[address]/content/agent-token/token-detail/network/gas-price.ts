import { api } from "@/primitive/api";
import { SupportedChain } from "@/types/preference";
export type GetGasPriceResponse = {
  last_block: number;
  high: string;
  average: string;
  low: string;
  suggest_base_fee: string;
  high_prio_fee: string;
  average_prio_fee: string;
  low_prio_fee: string;
  high_prio_fee_mixed: string;
  average_prio_fee_mixed: string;
  low_prio_fee_mixed: string;
  native_token_usd_price: number;
  eth_usd_price: number;
  high_estimate_time: number;
  average_estimate_time: number;
  low_estimate_time: number;
  high_orign: string;
  average_orign: string;
  low_orign: string;
};
export function getGasPrice(chain: SupportedChain) {
  return api.tsForward.get<GetGasPriceResponse>(
    `/api/v1/gas_price/${chain === "solana" ? "sol" : chain}`
  );
}
