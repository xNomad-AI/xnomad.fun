import { useMemoizedFn } from "ahooks";

import { onError } from "@/lib/utils/error";

import { useUserInfoStore } from "./user-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/primitive/api";
export function useLogin() {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { setUserInfo } = useUserInfoStore();
  const login = useMemoizedFn(async (onSuccess?: (token?: string) => void) => {
    if (!publicKey || !signMessage) {
      return;
    }
    try {
      const nonce = await api.v1.get<{
        message: string;
      }>("/address/nonce", {
        address: publicKey.toBase58(),
        chain: "solana",
        type: "login",
      });
      const signature = await signMessage(
        new TextEncoder().encode(nonce.message)
      );
      const token = await api.v1.post<{
        accessToken: string;
        expiresIn: number;
      }>("/address/login", {
        address: publicKey.toBase58(),
        chain: "solana",
        signature: Buffer.from(signature).toString("base64"),
      });
      setUserInfo({
        address: publicKey.toBase58(),
        jwt: token.accessToken,
        expires: token.expiresIn ?? 60 * 60 * 24,
      });
      onSuccess?.(token.accessToken);
    } catch (e) {
      onError(e);
      disconnect();
    }
  });
  return login;
}
