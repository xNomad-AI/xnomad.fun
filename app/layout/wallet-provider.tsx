"use client";
import {
  ConnectionProvider,
  WalletProvider as SolWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PropsWithChildren, useMemo } from "react";
export function WalletProvider({ children }: PropsWithChildren<object>) {
  const endpoint = clusterApiUrl(
    process.env.DEPLOY_ENV === "prod" ? "mainnet-beta" : "devnet"
  );
  const wallets = useMemo(() => [], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolWalletProvider wallets={wallets}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolWalletProvider>
    </ConnectionProvider>
  );
}
