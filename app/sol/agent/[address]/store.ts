import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AgentPortfolio } from "./content/container/network";

export const useAgentStore = create(
  immer<{
    portfolio?: AgentPortfolio;
    refreshCount: number;
    triggerRefresh: () => void;
    setPortfolio: (portfolio: AgentPortfolio) => void;
  }>((set) => ({
    setPortfolio: (portfolio) => {
      set((state) => {
        state.portfolio = portfolio;
      });
    },
    refreshCount: 0,
    triggerRefresh: () => {
      set((state) => {
        state.refreshCount++;
      });
    },
  }))
);
