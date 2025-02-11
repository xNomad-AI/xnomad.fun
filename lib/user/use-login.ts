import { useMemoizedFn } from "ahooks";

import { onError } from "@/lib/utils/error";

import { useUserInfoStore } from "./user-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/primitive/api";
import bs58 from "bs58";
import { useRef } from "react";

export function useLogin() {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { setUserInfo } = useUserInfoStore();
  const isLoginRef = useRef(false);
  const login = useMemoizedFn(async (onSuccess?: (token?: string) => void) => {
    if (!publicKey || !signMessage) {
      return;
    }
    if (isLoginRef.current) {
      return;
    }
    isLoginRef.current = true;
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
        signature: bs58.encode(signature),
      });
      setUserInfo({
        address: publicKey.toBase58(),
        jwt: token.accessToken,
        expires: token.expiresIn ?? Date.now() + 60 * 60 * 24 * 1000,
      });
      onSuccess?.(token.accessToken);
      isLoginRef.current = false;
    } catch (e) {
      onError(e);
      disconnect();
      isLoginRef.current = false;
    }
  });
  return login;
}
