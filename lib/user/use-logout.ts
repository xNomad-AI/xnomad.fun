import { useMemoizedFn } from "ahooks";

import { useUserInfoStore } from "./user-store";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAccount, useDisconnect } from "wagmi";
import { useChainStore } from "@/app/layout/chain-provider";

export function useLogout() {
  const { publicKey, disconnect } = useWallet();
  const { chain } = useChainStore();
  const { address } = useAccount();
  const { disconnectAsync } = useDisconnect();
  const { removeUserInfo } = useUserInfoStore();
  const logout = useMemoizedFn(async () => {
    if (chain === "solana") {
      if (!publicKey) {
        return;
      }
      removeUserInfo(publicKey.toBase58());
      await disconnect();
    } else {
      if (!address) {
        return;
      }
      removeUserInfo(address);
      await disconnectAsync();
    }
  });
  return logout;
}
