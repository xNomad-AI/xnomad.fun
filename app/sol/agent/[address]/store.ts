import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { AgentPortfolio } from "./content/container/network";

export const useAgentStore = create(
  immer<{
    portfolio?: AgentPortfolio;
    setPortfolio: (portfolio: AgentPortfolio) => void;
  }>((set) => ({
    setPortfolio: (portfolio) => {
      set((state) => {
        state.portfolio = portfolio;
      });
    },
  }))
);
