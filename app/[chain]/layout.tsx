import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../globals.css";
import { SOLProvider } from "../layout/sol-provider";
import {
  FloatLayerProvider,
  GlobalMessageContainer,
} from "@/primitive/components";
import { ThemeProvider } from "../../lib/theme";
import { Header } from "../layout/header";
import { Portal } from "../layout/portal";
import { InitStore } from "../layout/init-store";
import { PageLoadingProgressBar } from "../layout/page-loading-progress";
import { Suspense } from "react";
import { SUPPORTED_CHAINS } from "@/types/preference";
import { redirect } from "next/navigation";
import { ChainProvider } from "../layout/chain-provider";
import { EVMProvider } from "../layout/evm-providers";
import { ensureChain } from "@/lib/chain";
import { QueryProvider } from "../layout/query-provider";

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: {
    chain: string;
  };
}>) {
  const chain = ensureChain(params.chain);
  if (!SUPPORTED_CHAINS.includes(chain)) {
    redirect("/solana");
  }
  return (
    <ThemeProvider defaultTheme={"dark"}>
      <FloatLayerProvider>
        <QueryProvider>
          <ChainProvider chain={chain}>
            <EVMProvider>
              <SOLProvider>
                <Suspense>
                  <PageLoadingProgressBar />
                </Suspense>
                <Header />
                <Portal />
                <InitStore />
                {children}
              </SOLProvider>
            </EVMProvider>
          </ChainProvider>
        </QueryProvider>
        <GlobalMessageContainer />
      </FloatLayerProvider>
    </ThemeProvider>
  );
}
