"use client";

import { createZustandStore } from "@/primitive/utils/zustand";

import { createAgentStore } from "./creator";
export const [AgentStoreProvider, useAgentStore, useAgentStoreSelector] =
  createZustandStore(createAgentStore);
