import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AgentPortfolio } from "../content/deposit-container/network";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import { TokenInfo } from "../content/agent-token/token-list/network";
import { Config } from "../content/features/types";
import { SupportedChain } from "@/types/preference";
export function createAgentStore({
  nft,
  agentSideWalletVisible,
}: {
  nft: NFT;
  agentSideWalletVisible: boolean;
}) {
  return createStore(
    immer<{
      portfolio?: AgentPortfolio;
      refreshCount: number;
      isRefreshing: boolean;
      setIsRefreshing: (isRefreshing: boolean) => void;
      triggerRefresh: () => void;
      setPortfolio: (portfolio: AgentPortfolio) => void;
      nft: NFT;
      agentConfig?: Config;
      setAgentConfig: (config: Config) => void;
      refreshNFT: (chain: SupportedChain) => Promise<void>;
      primaryToken?: TokenInfo;
      setPrimaryToken: (token: TokenInfo) => void;
      sideWalletVisible: boolean;
      setSideWalletVisible: (visible: boolean) => void;
    }>((set) => ({
      setPortfolio: (portfolio) => {
        set((state) => {
          state.portfolio = portfolio;
        });
      },
      sideWalletVisible: agentSideWalletVisible,
      setSideWalletVisible: (visible) => {
        set((state) => {
          api.server.post("/preferences", {
            agentSideWalletVisible: visible ? "true" : "false",
          });
          state.sideWalletVisible = visible;
        });
      },
      refreshCount: 0,
      isRefreshing: false,
      setIsRefreshing: (isRefreshing) => {
        set((state) => {
          state.isRefreshing = isRefreshing;
        });
      },
      triggerRefresh: () => {
        set((state) => {
          state.refreshCount++;
        });
      },
      refreshNFT: async (chain) => {
        const newNFT = await api.v1.get<NFT>(`/nft/${chain}/nfts/${nft.id}`);
        set((state) => {
          state.nft = newNFT;
        });
      },
      nft,
      setPrimaryToken: (token) => {
        set((state) => {
          state.primaryToken = token;
        });
      },
      setAgentConfig: (config) => {
        set((state) => {
          state.agentConfig = config;
        });
      },
    }))
  );
}
