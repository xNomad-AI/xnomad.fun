import { api } from "@/primitive/api";
import { TokenInfo } from "../../token-list/network";
export interface EditInfoConfig {
  recipient: string;
  solAmount: number;
}
export function getEditInfoConfig(id: string) {
  return api.v1.get<EditInfoConfig>(
    `/nft/solana/${id}/payment-update-primary-coin`
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
  }
) {
  return api.v1.post<TokenInfo>(`/nft/solana/${id}/update-primary-coin-info`, {
    paymentTxId: txId,
    metadata,
  });
}
