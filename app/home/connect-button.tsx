"use client";
import { Button } from "@/primitive/components";
import { useWalletModal, WalletModal } from "@solana/wallet-adapter-react-ui";

export function ConnectButton() {
  const { setVisible } = useWalletModal();
  return (
    <>
      <WalletModal />
      <Button
        onClick={() => {
          setVisible(true);
        }}
        className='!w-[400px] !bg-white !text-black'
        size='l'
      >
        Connect Wallet
      </Button>
    </>
  );
}
