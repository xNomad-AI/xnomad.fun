import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { WalletProvider } from "./layout/wallet-provider";
import {
  FloatLayerProvider,
  GlobalMessageContainer,
} from "@/primitive/components";
import { ThemeProvider } from "../lib/theme";
import { Header } from "./layout/header";
import { Portal } from "./layout/portal";
import { PAGE_VIEW_ID } from "@/lib/page-view";
import { InitStore } from "./layout/init-store";

const ibm = IBM_Plex_Mono({
  variable: "--ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "xNomad",
  description: "xNomad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html data-theme={"dark"} className='text-size-16 max:text-[0.625vw]'>
      <meta name='author' content='Byterum' />
      <meta name='og:site_name' content='xNomad.ai' />
      <meta name='og:image:type' content='image/png' />
      <meta name='og:type' content='website' />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='og:url' content='https://xNomad.ai' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      />
      <link rel='icon' href='/logo.svg' type='image/x-icon' />
      <ThemeProvider defaultTheme={"dark"}>
        <body
          id={PAGE_VIEW_ID}
          className={`${ibm.className} bg-background text-text1 text-size-14 bg-[url('/background.webp')] bg-repeat bg-contain`}
        >
          <FloatLayerProvider>
            <WalletProvider>
              <Header />
              <Portal />
              <InitStore />
              {children}
            </WalletProvider>
            <GlobalMessageContainer />
          </FloatLayerProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}
