"use client";

import { createZustandStore } from "@/primitive/utils/zustand";
import { createChainStore } from "./creator";

export const [ChainProvider, useChainStore, useChainStoreSelector] =
  createZustandStore(createChainStore);
