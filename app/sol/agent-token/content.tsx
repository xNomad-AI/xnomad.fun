"use client";
import { RateNum } from "@/components/rate-number";
import { TokenNumber } from "@/components/token-number";
import { IconDownFilled, Spin } from "@/primitive/components";
import { useMount, useRequest } from "ahooks";
import clsx from "clsx";
import { PropsWithChildren, useState } from "react";
import {
  TokenInfo,
  getAgentTokenList,
} from "../agent/[address]/content/agent-token/token-list/network";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { use100vh } from "react-div-100vh";
import Link from "next/link";
import { TokenCell } from "../agent/[address]/content/agent-token/token-list/token-cell";
import { NFTCell } from "../agent/[address]/content/agent-token/token-list/nft-cell";
import { useSearchParams } from "next/navigation";
import { AgeCell } from "../agent/[address]/content/agent-token/token-list/age-cell";
const sortByList = ["volume24h", "deployedTime", "marketCap"] as const;
type SortBy = (typeof sortByList)[number];
const sortMap = {
  marketCap: "Marketcap",
  volume24h: "Hot",
  deployedTime: "New",
};
export function Content() {
  const [sortBy, setSortBy] = useState<SortBy>("volume24h");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const searchParams = useSearchParams();
  useMount(() => {
    const sortBy = searchParams.get("sortBy") as SortBy;
    if (sortByList.includes(sortBy)) {
      setSortBy(sortBy);
    }
  });
  const { loading } = useRequest(
    async () => {
      const res = await getAgentTokenList({
        sortBy,
      });
      setTokens(res.list);
    },
    {
      refreshDeps: [sortBy],
    }
  );
  useRequest(
    async () => {
      const res = await getAgentTokenList({
        sortBy,
      });
      setTokens(res.list);
    },
    {
      pollingInterval: 1000 * 5,
      ready: !loading,
    }
  );
  const height = use100vh();
  return (
    <>
      <div className='flex items-center gap-8 mt-16'>
        {sortByList.map((item) => (
          <SortByItem
            key={item}
            value={item}
            current={sortBy}
            onClick={setSortBy}
          >
            {sortMap[item]}
          </SortByItem>
        ))}
      </div>
      <div className='flex flex-col w-full'>
        <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40'>
          <div className='flex w-[240px] text-text2 items-center'>
            <div className='w-40'>#</div>
            Agent Token
          </div>
          <div className='flex min-w-[120px] max-w-[200px] flex-1 justify-end text-text2'>
            AI-NFT
          </div>
          <div className='flex w-[120px] justify-end text-text2'>Price</div>
          <button
            onClick={() => {
              setSortBy("marketcap");
            }}
            className={clsx(
              "flex w-[120px] justify-end items-center gap-4 text-text2",
              {
                "!text-text1": sortBy === "marketCap",
              }
            )}
          >
            Marketcap <IconDownFilled className='text-size-16' />
          </button>
          <button
            onClick={() => {
              setSortBy("volume24h");
            }}
            className={clsx(
              "flex w-[120px] justify-end items-center gap-4 text-text2",
              {
                "!text-text1": sortBy === "volume24h",
              }
            )}
          >
            24h Volume <IconDownFilled className='text-size-16' />
          </button>
          <div className='flex w-[120px] justify-end text-text2'>Liquidity</div>
          <div className='flex w-[120px] justify-end text-text2'>Holders</div>
          <button
            onClick={() => {
              setSortBy("deployedTime");
            }}
            className={clsx(
              "flex w-[120px] justify-end items-center gap-4 text-text2",
              {
                "!text-text1": sortBy === "deployedTime",
              }
            )}
          >
            Age <IconDownFilled className='text-size-16' />
          </button>
        </div>
        {loading ? (
          <div className='h-[100px] w-full flex items-center justify-center'>
            <Spin />
          </div>
        ) : (tokens?.length ?? 0) > 0 ? (
          <InfiniteScrollList
            items={tokens}
            itemSize={60}
            height={height ? height - 275 : 0}
            renderItem={(item: TokenInfo, index) => {
              return (
                <Link
                  href={`/sol/agent/${item.nft?.id}?tab=agent-token`}
                  key={item.symbol}
                  className='h-64 flex items-center justify-between w-full border-b border-white-20 gap-8 hover:opacity-80'
                >
                  <div className='flex w-[240px] items-center'>
                    <div className='text-text2 w-40'>{index + 1}</div>
                    <div className='flex w-[200px] gap-4 items-center'>
                      <TokenCell item={item} />
                    </div>
                  </div>
                  <div className='flex min-w-[120px] max-w-[200px] flex-1 justify-end items-center gap-4'>
                    <NFTCell item={item} />
                  </div>
                  <div className='flex w-[120px] flex-col items-end'>
                    <TokenNumber prefix={"$"} number={item.price} />
                    <RateNum num={item.priceChange24h} />
                  </div>
                  <div className='flex w-[120px] justify-end'>
                    <TokenNumber number={item.marketCap} prefix={"$"} />
                  </div>
                  <div className='flex w-[120px] justify-end'>
                    <TokenNumber prefix={"$"} number={item.volume24h} />
                  </div>
                  <div className='flex w-[120px] justify-end'>
                    <TokenNumber prefix={"$"} number={item.liquidity} />
                  </div>
                  <div className='flex w-[120px] justify-end'>
                    <TokenNumber number={item.holdersCount} />
                  </div>
                  <div className='flex w-[120px] justify-end'>
                    <AgeCell time={item.deployedTime} />
                  </div>
                </Link>
              );
            }}
            hasNextPage={false}
            isNextPageLoading={false}
            loadNextPage={() => {}}
          />
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
            No Tokens
          </div>
        )}
      </div>
    </>
  );
}
function SortByItem<T>({
  value,
  current,
  onClick,
  children,
}: PropsWithChildren<{
  value: T;
  onClick: (value: T) => void;
  current: T;
}>) {
  return (
    <button
      onClick={() => {
        onClick(value);
      }}
      className={clsx(
        "h-40 rounded-6 flex items-center justify-center px-16 border border-text2 text-text2",
        {
          "!border-text1 !text-text1": current === value,
        }
      )}
    >
      {children}
    </button>
  );
}
