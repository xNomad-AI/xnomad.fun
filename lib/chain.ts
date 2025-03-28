import { SupportedChain } from "@/types/preference";

export function ensureChain(_chain: string) {
  const chainInUrl = _chain?.toLowerCase();
  const chain = (
    chainInUrl === "sol" ? "solana" : chainInUrl ?? "solana"
  ) as SupportedChain;
  return chain;
}

export function getTxExploreUrl(chain: string, txid: string) {
  switch (chain) {
    case "solana":
      return `https://solscan.io/tx/${txid}`;
    case "bsc":
      return `https://bscscan.com/tx/${txid}`;
    default:
      return "";
  }
}
