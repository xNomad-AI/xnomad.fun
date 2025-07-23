import { api } from "@/primitive/api";
import { SupportedChain } from "@/types/preference";
export interface WalletItem {
  address: string;
  decimals: number;
  balance: number;
  uiAmount: number;
  chainId: string;
  name: string;
  symbol: string;
  logoURI: string;
  priceUsd: number;
  valueUsd: number;
}
export interface AgentPortfolio {
  wallet: string;
  totalUsd: number;
  items: WalletItem[];
}
export function getPortfolio({
  chain = "solana",
  address,
}: {
  chain?: SupportedChain;
  address: string;
}) {
  return api.v1.get<AgentPortfolio>(
    "/agent-account/defi/portfolio",
    {
      chain,
      address,
    },
    {
      cache: "no-cache",
    }
  );
}
