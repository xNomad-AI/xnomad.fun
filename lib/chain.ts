import { SupportedChain } from "@/types/preference";

export function ensureChain(_chain: string) {
  const chainInUrl = _chain?.toLowerCase();
  const chain = (
    chainInUrl === "sol" ? "solana" : chainInUrl ?? "solana"
  ) as SupportedChain;
  return chain;
}
