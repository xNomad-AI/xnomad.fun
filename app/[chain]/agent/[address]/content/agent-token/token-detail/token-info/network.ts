import { api } from "@/primitive/api";
import { TokenInfo } from "../../token-list/network";
import { SupportedChain } from "@/types/preference";
export interface EditInfoConfig {
  recipient: string;
  solAmount: number;
}
export function getEditInfoConfig(id: string, chain: SupportedChain) {
  return api.v1.get<EditInfoConfig>(
    `/nft/${chain}/${id}/payment-update-primary-coin`
  );
}

export function editTokenInfo(
  id: string,
  txId: string,
  metadata: {
    description: string;
    twitter: string;
    telegram: string;
    website: string;
  },
  chain: SupportedChain
) {
  return api.v1.post<TokenInfo>(
    `/nft/${chain}/${id}/update-primary-coin-info`,
    {
      paymentTxId: txId,
      metadata,
    }
  );
}
