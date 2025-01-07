"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
  Spin,
} from "@/primitive/components";
import { useWallet, Wallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useMemoizedFn } from "ahooks";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  return (
    <>
      <Button
        onClick={handleClick}
        className='!w-[400px] !bg-white !text-black'
        size='l'
      >
        {publicKey ? (
          <Address address={publicKey.toBase58()} enableCopy />
        ) : connecting ? (
          "Connecting"
        ) : (
          "Connect Wallet"
        )}
      </Button>
      <Modal open={visible} onMaskClick={onClose} size='s'>
        <ModalTitleWithBorder>Connect Wallet</ModalTitleWithBorder>
        <ModalContent className='gap-8'>
          {wallets.map((w: Wallet) => (
            <button
              key={w.adapter.name}
              onClick={() => {
                select(w.adapter.name);
              }}
              className='h-48 rounded-8 p-12 hover:bg-surface flex items-center justify-between group'
            >
              <div className='flex items-center gap-8'>
                <Image
                  src={w.adapter.icon}
                  height={32}
                  width={32}
                  className='rounded-full'
                  alt={w.adapter.name}
                />
                <p className='text-size-16 font-semibold'>{w.adapter.name}</p>
              </div>
              {wallet?.adapter.name === w.adapter.name && connecting ? (
                <Spin className='text-size-16' />
              ) : w.readyState === WalletReadyState.Installed ? (
                "Detected"
              ) : w.readyState === WalletReadyState.NotDetected ? (
                <a href={w.adapter.url} target='_blank'>
                  Download
                </a>
              ) : (
                ""
              )}
            </button>
          ))}
        </ModalContent>
      </Modal>
    </>
  );
}
