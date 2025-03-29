"use client";
import { createZustandStore } from "@/primitive/utils/zustand";
import { createSwarmStore } from "./creator";

export const [SwarmProvider, useSwarmStore, useSwarmProviderSelector] =
  createZustandStore(createSwarmStore);
