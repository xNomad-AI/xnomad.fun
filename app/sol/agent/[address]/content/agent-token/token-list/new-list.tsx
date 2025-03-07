"use client";
import { useRequest } from "ahooks";
import { getAgentTokenList, TokenInfo } from "./network";
import { Address } from "@/components/address";
import { Spin } from "@/primitive/components";
import { useState } from "react";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";

export function NewAgentTokens() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const { loading } = useRequest(async () => {
    const res = await getAgentTokenList({
      sortBy: "deployedTime",
      limit: 5,
    });
    setTokens(res.list);
  });
  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40'>
        <div className='flex w-[140px]'>Agent Token</div>

        <div className='flex w-[120px] justify-end'>AI-NFT</div>
        <div className='flex w-[120px] justify-end'>Age</div>
      </div>
      {loading ? (
        <div className='h-[100px] w-full flex items-center justify-center'>
          <Spin />
        </div>
      ) : (tokens?.length ?? 0) > 0 ? (
        tokens?.map((item) => (
          <div
            key={item.symbol}
            className='h-64 flex items-center justify-between w-full border-b border-white-20 gap-8'
          >
            <div className='flex w-[140px] gap-4 items-center'>
              <img
                height={32}
                width={32}
                className='w-32 h-32 aspect-square rounded-full flex-shrink-0 mobile:hidden'
                src={item.logo}
                alt=''
              />
              <div className='flex flex-col gap-4'>
                <div className='flex items-end gap-4'>
                  <span className='font-bold'>{item.name}</span>
                  <span className='text-text2'>${item.symbol}</span>
                </div>
                <div className='flex items-center gap-4'>
                  <Address
                    address={item.address}
                    enableCopy
                    className='text-size-12 text-text2'
                  />
                </div>
              </div>
            </div>

            <div className='flex w-[120px] justify-end'>--</div>
            <div className='flex w-[120px] justify-end'>
              {beautifyTimeV2(
                new Date(item.deployedTime).getTime(),
                true,
                false,
                ""
              )}
            </div>
          </div>
        ))
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No Tokens
        </div>
      )}
    </div>
  );
}
