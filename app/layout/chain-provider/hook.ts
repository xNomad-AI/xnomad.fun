import { useConnectModalStore } from "@/components/connect-modal/store";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemoizedFn } from "ahooks";
import { useAccount } from "wagmi";
import { useChainStore } from ".";

export function useUserStore() {
  const { chain } = useChainStore();
  const { publicKey } = useWallet();
  const { address } = useAccount();
  const { openConnectModal: openModal } = useConnectModal();
  const { setVisible } = useConnectModalStore();
  const openConnectModal = useMemoizedFn(() => {
    if (chain === "solana") {
      setVisible(true);
    } else {
      openModal?.();
    }
  });
  return {
    userAddress: chain === "solana" ? publicKey?.toBase58() : address,
    openConnectModal,
  };
}
