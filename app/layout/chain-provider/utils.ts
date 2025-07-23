import { SupportedChain } from "@/types/preference";

export function getCurrencySymbol(chain: SupportedChain) {
  switch (chain) {
    case "solana":
      return "SOL";
    case "bsc":
      return "BNB";
    default:
      return "SOL";
  }
}
