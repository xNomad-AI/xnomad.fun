"use client";
import { Button } from "@/primitive/components";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemoizedFn } from "ahooks";
import { useMemo } from "react";
import { Address } from "@/components/address";
import clsx from "clsx";
import { useConnectModalStore } from "@/components/connect-modal/store";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useChainStore } from "../layout/chain-provider";

export function ConnectButton({
  className,
  size = "m",
}: {
  className?: string;
  size?: "m" | "s" | "l";
}) {
  const { setVisible } = useConnectModalStore();
  const { publicKey, connecting } = useWallet();
  const { chain } = useChainStore();
  const { openConnectModal } = useConnectModal();
  const handleClick = useMemoizedFn(async () => {
    if (chain === "solana") {
      setVisible(true);
    } else {
      openConnectModal?.();
    }
  });
  const { address, isConnecting } = useAccount();
  const buttonText = useMemo(() => {
    if (chain === "solana") {
      if (publicKey) {
        return <Address address={publicKey.toBase58()} enableCopy />;
      } else if (connecting) {
        return "Connecting";
      } else {
        return "Connect Wallet";
      }
    } else {
      if (address) {
        return <Address address={address} enableCopy />;
      } else if (isConnecting) {
        return "Connecting";
      } else {
        return "Connect Wallet";
      }
    }
  }, [connecting, publicKey]);
  return (
    <>
      <Button
        onClick={handleClick}
        className={clsx(" !bg-white !text-black", className, {
          "!w-[400px]": size === "l",
        })}
        size={size}
      >
        {buttonText}
      </Button>
    </>
  );
}
