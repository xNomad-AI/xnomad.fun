import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

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
    <html lang='en'>
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
      <body
        className={`${ibm.variable} antialiased bg-[url('/background.png')]`}
      >
        {children}
      </body>
    </html>
  );
}
