import { useMemoizedFn } from "ahooks";

import { useUserInfoStore } from "./user-store";
import { useWallet } from "@solana/wallet-adapter-react";

export function useLogout() {
  const { publicKey, disconnect } = useWallet();
  const { removeUserInfo } = useUserInfoStore();
  const logout = useMemoizedFn(async () => {
    if (!publicKey) {
      return;
    }
    removeUserInfo(publicKey.toBase58());
    await disconnect();
  });
  return logout;
}
