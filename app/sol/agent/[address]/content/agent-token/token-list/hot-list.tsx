"use client";
import { useRequest } from "ahooks";
import { getAgentTokenList, TokenInfo } from "./network";
import { TokenNumber } from "@/components/token-number";
import { Spin } from "@/primitive/components";
import { useState } from "react";
import Link from "next/link";
import { TokenCell } from "./token-cell";

export function HotAgentTokens() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const { loading } = useRequest(async () => {
    const res = await getAgentTokenList({
      sortBy: "volume24h",
      limit: 5,
    });
    setTokens(res.list);
  });
  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40 text-white-40 text-size-12'>
        <div className='flex w-[200px]'>Agent Token</div>

        <div className='flex w-[100px] justify-end'>Marketcap</div>
        <div className='flex w-[100px] justify-end'>24h Volume</div>
      </div>
      {loading ? (
        <div className='h-[100px] w-full flex items-center justify-center'>
          <Spin />
        </div>
      ) : (tokens?.length ?? 0) > 0 ? (
        tokens?.map((item) => (
          <Link
            href={`/sol/agent/${item.nft?.id}?tab=agent-token`}
            key={item.symbol}
            className='h-64 flex items-center justify-between w-full border-b border-white-20 gap-8 hover:opacity-80'
          >
            <div className='flex w-[200px] gap-4 items-center'>
              <TokenCell item={item} variant='simple' />
            </div>

            <div className='flex w-[100px] justify-end'>
              <TokenNumber number={item.marketCap} prefix={"$"} />
            </div>
            <div className='flex w-[100px] justify-end'>
              <TokenNumber prefix={"$"} number={item.volume24h} />
            </div>
          </Link>
        ))
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No Tokens
        </div>
      )}
    </div>
  );
}
