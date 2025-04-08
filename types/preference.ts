export type UserPreferenceParams = {
  collectionSideFilterVisible?: "true" | "false";
  agentSideWalletVisible?: "true" | "false";
  chain?: string;
};

export const preferenceNameMap: Record<keyof UserPreferenceParams, string> = {
  collectionSideFilterVisible: "collectionSideFilterVisible",
  agentSideWalletVisible: "agentSideWalletVisible",
  chain: "chain",
};

export const SUPPORTED_CHAINS = process.env.BSC_ENABLED
  ? ["bsc", "solana"]
  : ["solana"];
export type SupportedChain = (typeof SUPPORTED_CHAINS)[number];
