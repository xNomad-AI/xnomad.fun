"use client";
import { Button } from "@/primitive/components";
import Link from "next/link";
import { useChainStore } from "../layout/chain-provider";

export function LaunchNFTButton() {
  const { chain } = useChainStore();
  return (
    <Link href={`/${chain}/launch/nft`} className='mt-24'>
      <Button className='w-[20rem]'>Create Your Crypto AI Agent</Button>
    </Link>
  );
}
