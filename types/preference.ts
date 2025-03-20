export type UserPreferenceParams = {
  collectionSideFilterVisible?: "true" | "false";
  agentSideWalletVisible?: "true" | "false";
};

export const preferenceNameMap: Record<keyof UserPreferenceParams, string> = {
  collectionSideFilterVisible: "collectionSideFilterVisible",
  agentSideWalletVisible: "agentSideWalletVisible",
};
