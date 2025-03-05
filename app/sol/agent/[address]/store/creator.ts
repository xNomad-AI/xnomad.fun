import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AgentPortfolio } from "../content/deposit-container/network";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
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
    }))
  );
}
