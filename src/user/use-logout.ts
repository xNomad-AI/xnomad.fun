import { useMemoizedFn } from "ahooks";

import { onError } from "@/lib/utils/error";

import { useUserInfoStore } from "./user-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/primitive/api";
export function useLogout() {
  const { publicKey, disconnect } = useWallet();
  const { removeUserInfo } = useUserInfoStore();
  const login = useMemoizedFn(async () => {
    if (!publicKey) {
      return;
    }
    removeUserInfo(publicKey.toBase58());
    await disconnect();
  });
  return login;
}
