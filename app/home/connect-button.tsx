"use client";
import { Button } from "@/primitive/components";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemoizedFn } from "ahooks";
import { useMemo } from "react";
import { Address } from "@/components/address";
import clsx from "clsx";
import { useConnectModalStore } from "@/components/connect-modal/store";

export function ConnectButton({
  className,
  size = "m",
}: {
  className?: string;
  size?: "m" | "s" | "l";
}) {
  const { setVisible } = useConnectModalStore();
  const { publicKey, connecting } = useWallet();
  const handleClick = useMemoizedFn(async () => {
    setVisible(true);
  });
  const buttonText = useMemo(() => {
    if (publicKey) {
      return <Address address={publicKey.toBase58()} enableCopy />;
    } else if (connecting) {
      return "Connecting";
    } else {
      return "Connect Wallet";
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
