import { api } from "@/primitive/api";
import { CharacterConfig, Config } from "./types";

export function getAgentConfig(id: string) {
  return api.v1.get<Config>(`/nft/solana/${id}/config`);
}

export function editAgentConfig(
  id: string,
  characterConfig: Partial<CharacterConfig>
) {
  return api.v1.post<{ characterConfig: CharacterConfig }>(
    `/nft/solana/${id}/config`,
    {
      characterConfig,
    }
  );
}
