"use client";
import { useChainStore } from "@/app/layout/chain-provider";
import { IconFourMeme, IconPump } from "./icons";

export function PoweredBy() {
  const { chain } = useChainStore();
  return (
    <div className='flex items-center gap-4'>
      <span className='text-size-12 text-text2'>
        Powered by {chain === "solana" ? "Pump.fun" : "Four.meme"}
      </span>
      {chain === "solana" ? (
        <IconPump className='text-size-16' />
      ) : (
        <IconFourMeme className='text-size-16' />
      )}
    </div>
  );
}
