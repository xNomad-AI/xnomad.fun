"use client";
import { useTimeStore } from "@/primitive/hooks/time";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useUserInfoStore } from "@/src/user/user-store";
import { useLogin } from "@/src/user/use-login";

export function InitStore() {
  const { publicKey } = useWallet();
  const { initUserInfo } = useUserInfoStore();
  const { startTick } = useTimeStore();
  const login = useLogin();
  useEffect(() => {
    startTick();
  }, [startTick]);
  useEffect(() => {
    if (publicKey) {
      const hasToken = initUserInfo(publicKey.toBase58());
      if (!hasToken) {
        login();
      }
    }
  }, [publicKey]);
  return <></>;
}
