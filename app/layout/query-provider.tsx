"use client";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({});
export function QueryProvider({ children }: PropsWithChildren<object>) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
