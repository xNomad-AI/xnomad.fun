import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AgentPortfolio } from "./content/deposit-container/network";

export const useAgentStore = create(
  immer<{
    portfolio?: AgentPortfolio;
    refreshCount: number;
    isRefreshing: boolean;
    setIsRefreshing: (isRefreshing: boolean) => void;
    triggerRefresh: () => void;
    setPortfolio: (portfolio: AgentPortfolio) => void;
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
  }))
);
