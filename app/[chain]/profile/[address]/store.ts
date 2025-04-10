import { NFT } from "@/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Portfolio } from "./content/token/type";

export interface TokenState {
  searchKeyword: string;
  selectedPortfolio: Portfolio[];
  filterOpen: boolean;
  onlyAgentToken: boolean;
  setOnlyAgentToken: (onlyAgentToken: boolean) => void;
  setFilterOpen: (open: boolean) => void;
  setSelectedPortfolio: (item: Portfolio[]) => void;
  removeSelectedPortfolio: (item: Portfolio) => void;
  addSelectedPortfolio: (item: Portfolio) => void;
  setSearchKeyword: (keyword: string) => void;
  clearAll: () => void;
}

export const useTokenStore = create(
  immer<TokenState>((set) => ({
    searchKeyword: "",
    nftList: [],
    selectedPortfolio: [],
    filterOpen: false,
    onlyAgentToken: false,
    setOnlyAgentToken: (onlyAgentToken) => {
      set((state) => {
        state.onlyAgentToken = onlyAgentToken;
      });
    },
    setFilterOpen: (open) => {
      set((state) => {
        state.filterOpen = open;
      });
    },
    addSelectedPortfolio: (item) => {
      set((state) => {
        state.selectedPortfolio.push(item);
      });
    },
    setSelectedPortfolio: (items) => {
      set((state) => {
        state.selectedPortfolio = items;
      });
    },

    removeSelectedPortfolio: (item) => {
      set((state) => {
        state.selectedPortfolio = state.selectedPortfolio.filter(
          (n) => n.wallet !== item.wallet
        );
      });
    },
    setSearchKeyword: (keyword) => {
      set((state) => {
        state.searchKeyword = keyword;
      });
    },
    clearAll: () => {
      set((state) => {
        state.searchKeyword = "";
        state.selectedPortfolio = [];
      });
    },
  }))
);
