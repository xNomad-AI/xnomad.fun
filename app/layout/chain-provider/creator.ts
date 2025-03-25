import { api } from "@/primitive/api";
import { SupportedChain } from "@/types/preference";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";

export const createChainStore = ({ chain }: { chain: SupportedChain }) =>
  createStore(
    immer<{
      chain: SupportedChain;
      setChain: (chain: SupportedChain) => void;
    }>((set) => ({
      chain,
      setChain: (chain) => {
        set((s) => {
          s.chain = chain;
        });
        api.server.post("/preferences", { chain });
      },
    }))
  );
