"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { PropsWithChildren } from "react";
import { fallback, http } from "viem";
import { bsc, bscTestnet } from "viem/chains";
// import { useChainStore } from "./chain-provider";
const baseConfig = {
  appName: "xNomad",
  projectId: "c42058cba84625a895bf933bf77af4ee",
  ssr: true,
};
const bscConfig = {
  transports: {
    [bsc.id]: fallback([
      http(
        "https://radial-late-seed.bsc.quiknode.pro/3064c664f114cf9061a993e9cb859cc54b779b05"
      ),
    ]),
  },
};
export function EVMProvider({ children }: PropsWithChildren<object>) {
  // const { chain } = useChainStore();
  const config = getDefaultConfig({
    ...baseConfig,
    ...bscConfig,
    chains: [bsc],
  });
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
    </WagmiProvider>
  );
}
