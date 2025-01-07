"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  Spin,
} from "@/primitive/components";
import { useWallet, Wallet } from "@solana/wallet-adapter-react";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { useMemoizedFn } from "ahooks";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Address } from "@/components/address";

export function ConnectButton() {
  const [visible, setVisible] = useState(false);
  const {
    connected,
    connecting,
    connect,
    wallet,
    disconnect,
    select,
    publicKey,
    wallets,
  } = useWallet();
  const handleClick = useMemoizedFn(() => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  });
  const onClose = useMemoizedFn(() => {
    setVisible(false);
    select(null);
  });
  useEffect(() => {
    if (wallet) {
      connect().then(() => {
        setVisible(false);
      });
    }
  }, [wallet]);
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
        className='!w-[400px] !bg-white !text-black'
        size='l'
      >
        {buttonText}
      </Button>
      <Modal open={visible} onMaskClick={onClose} size='s'>
        <ModalTitleWithBorder>Connect Wallet</ModalTitleWithBorder>
        <ModalContent className='gap-8'>
          {wallets.map((w: Wallet) => (
            <WalletButton
              key={w.adapter.name}
              loading={connecting && wallet?.adapter.name === w.adapter.name}
              select={select}
              wallet={w}
            />
          ))}
        </ModalContent>
      </Modal>
    </>
  );
}

function WalletButton({
  wallet,
  loading,
  select,
}: {
  wallet: Wallet;
  loading: boolean;
  select: (walletName: WalletName | null) => void;
}) {
  const suffix = useMemo(() => {
    if (loading) {
      return <Spin className='text-size-16' />;
    } else if (wallet.readyState === WalletReadyState.Installed) {
      return "Detected";
    } else if (wallet.readyState === WalletReadyState.NotDetected) {
      return (
        <a href={wallet.adapter.url} target='_blank'>
          Download
        </a>
      );
    } else {
      return "";
    }
  }, [loading, wallet.readyState, wallet.adapter.url]);
  return (
    <button
      key={wallet.adapter.name}
      onClick={() => {
        select(wallet.adapter.name);
      }}
      className='h-48 rounded-8 p-12 hover:bg-surface flex items-center justify-between group'
    >
      <div className='flex items-center gap-8'>
        <Image
          src={wallet.adapter.icon}
          height={32}
          width={32}
          className='rounded-full'
          alt={wallet.adapter.name}
        />
        <p className='text-size-16 font-semibold'>{wallet.adapter.name}</p>
      </div>
      {suffix}
    </button>
  );
}
