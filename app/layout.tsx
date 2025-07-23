import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { PAGE_VIEW_ID } from "@/lib/page-view";
import Script from "next/script";
import { SUPPORTED_CHAINS } from "@/types/preference";
import { redirect } from "next/navigation";

import { ensureChain } from "@/lib/chain";
const GA_ID = process.env.GA_ID;
const ibm = IBM_Plex_Mono({
  variable: "--ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "xNomad.fun | Your Ultimate AI Terminal for Crypto",
  description:
    "Discover xNomad.fun, the cutting-edge open-source platform designed to revolutionize AI agent interaction. Create, customize, and engage with AI-NFTs, powered by ElizaOS. Empower your journey in the world of decentralized AI assetization.",
};
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
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      ></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ID}');`,
        }}
      ></script>
      <Script
        type='text/javascript'
        defer
        src='/charting-library/charting_library/charting_library.js'
      />

      <body
        id={PAGE_VIEW_ID}
        className={`${ibm.className} bg-background text-text1 text-size-14 bg-[url('/background.webp')] bg-repeat bg-contain`}
      >
        {children}
      </body>
    </html>
  );
}
