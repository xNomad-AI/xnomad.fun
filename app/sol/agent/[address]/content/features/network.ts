import { api } from "@/primitive/api";
import { Config } from "./types";

export function getAgentConfig(id: string) {
  return api.v1.get<{ characterConfig: Config }>(`/nft/solana/${id}/config`);
}

export function editAgentConfig(id: string, characterConfig: Partial<Config>) {
  return api.v1.post<{ characterConfig: Config }>(`/nft/solana/${id}/config`, {
    characterConfig,
  });
}
