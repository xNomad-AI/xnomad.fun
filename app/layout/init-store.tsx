"use client";
import { useTimeStore } from "@/primitive/hooks/time";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { useUserInfoStore } from "@/lib/user/user-store";
import { useLogin } from "@/lib/user/use-login";
import { useChainStore } from "./chain-provider";
import { useAccount } from "wagmi";

export function InitStore() {
  const { chain } = useChainStore();
  const { publicKey } = useWallet();
  const { address } = useAccount();
  const { initUserInfo } = useUserInfoStore();
  const { startTick } = useTimeStore();
  const login = useLogin();
  useEffect(() => {
    startTick();
  }, [startTick]);
  useEffect(() => {
    if (chain === "solana") {
      if (publicKey) {
        const hasToken = initUserInfo(publicKey.toBase58());
        if (!hasToken) {
          login();
        }
      }
    } else {
      if (address) {
        const hasToken = initUserInfo(address);
        if (!hasToken) {
          login();
        }
      }
    }
  }, [publicKey, address, chain]);
  return <></>;
}
