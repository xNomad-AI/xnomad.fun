import { PublicKey } from "@solana/web3.js";
import { isAddress } from "viem";

export function isValidSolanaAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function IsValidEVMAddress(address: string) {
  return isAddress(address);
}

export function isValidAddress(address: string, chain: string) {
  if (chain === "solana") {
    return isValidSolanaAddress(address);
  } else {
    return IsValidEVMAddress(address);
  }
}
