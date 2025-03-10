import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AgentPortfolio } from "../content/deposit-container/network";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import { TokenInfo } from "../content/agent-token/token-list/network";
export function createAgentStore({ nft }: { nft: NFT }) {
  return createStore(
    immer<{
      portfolio?: AgentPortfolio;
      refreshCount: number;
      isRefreshing: boolean;
      setIsRefreshing: (isRefreshing: boolean) => void;
      triggerRefresh: () => void;
      setPortfolio: (portfolio: AgentPortfolio) => void;
      nft: NFT;
      refreshNFT: () => Promise<void>;
      primaryToken?: TokenInfo;
      setPrimaryToken: (token: TokenInfo) => void;
    }>((set) => ({
      setPortfolio: (portfolio) => {
        set((state) => {
          state.portfolio = portfolio;
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
      refreshNFT: async () => {
        const newNFT = await api.v1.get<NFT>(`/nft/solana/nfts/${nft.agentId}`);
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
    }))
  );
}
