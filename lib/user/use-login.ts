import { useMemoizedFn } from "ahooks";

import { onError } from "@/lib/utils/error";

import { useUserInfoStore } from "./user-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/primitive/api";
import bs58 from "bs58";
import { useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useChainStore } from "@/app/layout/chain-provider";
import { useLogout } from "./use-logout";

export function useLogin() {
  const { chain } = useChainStore();
  const { publicKey, signMessage: signMessageSOL } = useWallet();
  const { address } = useAccount();
  const { setUserInfo } = useUserInfoStore();
  const isLoginRef = useRef(false);
  const { signMessageAsync: signMessageEVM } = useSignMessage();
  const logout = useLogout();
  const login = useMemoizedFn(async (onSuccess?: (token?: string) => void) => {
    if (chain === "solana") {
      if (!publicKey) {
        return;
      }
    } else {
      if (!address) {
        return;
      }
    }
    const userAddress = (
      chain === "solana" ? publicKey?.toBase58() : address
    ) as string;
    if (isLoginRef.current) {
      return;
    }
    isLoginRef.current = true;
    try {
      const nonce = await api.v1.get<{
        message: string;
      }>("/address/nonce", {
        address: userAddress,
        chain: chain,
        type: "login",
      });
      let signature;
      if (chain === "solana" && signMessageSOL) {
        signature = await signMessageSOL(
          new TextEncoder().encode(nonce.message)
        );
      } else {
        signature = await signMessageEVM({
          message: nonce.message,
        });
      }
      const token = await api.v1.post<{
        accessToken: string;
        expiresIn: number;
      }>("/address/login", {
        address: userAddress,
        chain: chain,
        signature:
          chain === "solana" ? bs58.encode(signature as any) : signature,
      });
      setUserInfo({
        address: userAddress,
        jwt: token.accessToken,
        expires: token.expiresIn ?? Date.now() + 60 * 60 * 24 * 1000,
      });
      onSuccess?.(token.accessToken);
      isLoginRef.current = false;
    } catch (e) {
      onError(e);
      logout();
      isLoginRef.current = false;
    }
  });
  return login;
}
