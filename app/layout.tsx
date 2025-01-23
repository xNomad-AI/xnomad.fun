import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { WalletProvider } from "./layout/wallet-provider";
import { FloatLayerProvider } from "@/primitive/components";
import { ThemeProvider } from "./layout/theme";
import { Header } from "./layout/header";
import { Portal } from "./layout/portal";

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
          className={`${ibm.variable} antialiased bg-[url('/background.png')]`}
        >
          <FloatLayerProvider>
            <WalletProvider>
              <Header />
              <Portal />
              
              {/* <PageLoadingProgressBar /> */}
              {children}
            </WalletProvider>
          </FloatLayerProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}
