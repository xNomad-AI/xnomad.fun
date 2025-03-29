import { api } from "@/primitive/api";
import { CharacterConfig, Config } from "./types";
import { SupportedChain } from "@/types/preference";

export function getAgentConfig(id: string, chain: SupportedChain) {
  return api.v1.get<Config>(`/nft/${chain}/${id}/config`);
}

export function editAgentConfig(
  id: string,
  characterConfig: Partial<CharacterConfig>,
  chain: SupportedChain
) {
  return api.v1.post<{ characterConfig: CharacterConfig }>(
    `/nft/${chain}/${id}/config`,
    {
      characterConfig,
    }
  );
}
