import {
  Modal,
  ModalTitleWithBorder,
  ModalContent,
  Spin,
} from "@/primitive/components";
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base";
import { useWallet, Wallet } from "@solana/wallet-adapter-react";
import { useMemoizedFn } from "ahooks";

import { useEffect, useMemo } from "react";
import { useConnectModalStore } from "./store";
import Image from "next/image";

export function ConnectModal() {
  const { visible, setVisible } = useConnectModalStore();
  const {
    connecting,
    connect,
    wallet,

    select,
    wallets,
  } = useWallet();

  const onClose = useMemoizedFn(() => {
    setVisible(false);
  });
  useEffect(() => {
    if (wallet) {
      connect().then(() => {
        setVisible(false);
      });
    }
  }, [wallet]);
  return (
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
