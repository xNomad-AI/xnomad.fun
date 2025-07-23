import { Collection, NftSearchSortBy } from "@/types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
interface NftSearchParams {
  keyword?: string;
  sortBy?: NftSearchSortBy;
  traitsQuery: {
    traitValue: string;
    traitType: string;
  }[];
}
export const useCollectionStore = create(
  immer<{
    collection?: Collection | null;
    society?: Collection | null;
    setCollection: (collection: Collection | null) => void;
    setSociety: (society: Collection | null) => void;
    nftSearchParams: NftSearchParams;
    setNftSearchParams: (params: Partial<NftSearchParams>) => void;
    traitsFilterOpen: boolean;
    setTraitsFilterOpen: (open: boolean) => void;
    resetAll: () => void;
  }>((set) => ({
    collection: null,
    society: null,
    setCollection: (collection) =>
      set((state) => {
        state.collection = collection;
      }),
    setSociety: (society) =>
      set((state) => {
        state.society = society;
      }),
    nftSearchParams: {
      keyword: undefined,
      sortBy: "rarityDesc",
      traitsQuery: [],
    },
    setNftSearchParams: (params) =>
      set((state) => {
        state.nftSearchParams = {
          ...state.nftSearchParams,
          ...params,
        };
      }),
    traitsFilterOpen: false,
    setTraitsFilterOpen: (open) =>
      set((state) => {
        state.traitsFilterOpen = open;
      }),
    resetAll: () => {
      set((state) => {
        state.nftSearchParams = {
          keyword: undefined,
          sortBy: "rarityDesc",
          traitsQuery: [],
        };
        state.traitsFilterOpen = false;
      });
    },
  }))
);
