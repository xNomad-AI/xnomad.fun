import { PublicKey } from "@solana/web3.js";

export function isValidSolanaAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}
