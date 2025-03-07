"use client";
import { Address } from "@/components/address";
import { RateNum } from "@/components/rate-number";
import { TokenNumber } from "@/components/token-number";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import {
  IconDownFilled,
  Spin,
  IconTwitterX,
  IconTelegram,
  IconWebsite,
} from "@/primitive/components";
import { useRequest } from "ahooks";
import clsx from "clsx";
import { PropsWithChildren, useEffect, useState } from "react";
import {
  TokenInfo,
  getAgentTokenList,
} from "../agent/[address]/content/agent-token/token-list/network";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { use100vh } from "react-div-100vh";
const sortByList = ["volume24h", "deployedTime", "marketcap"] as const;
type SortBy = (typeof sortByList)[number];
const sortMap = {
  marketcap: "Marketcap",
  volume24h: "Hot",
  deployedTime: "New",
};
export function Content() {
  const [sortBy, setSortBy] = useState<SortBy>("volume24h");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

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
          <div className='flex w-[120px] justify-end text-text2'>Price</div>
          <div
            className={clsx(
              "flex w-[120px] justify-end items-center gap-4 text-text2",
              {
                "!text-text1": sortBy === "marketcap",
              }
            )}
          >
            Marketcap <IconDownFilled className='text-size-16' />
          </div>
          <div
            className={clsx(
              "flex w-[120px] justify-end items-center gap-4 text-text2",
              {
                "!text-text1": sortBy === "volume24h",
              }
            )}
          >
            24h Volume <IconDownFilled className='text-size-16' />
          </div>
          <div className='flex w-[120px] justify-end text-text2'>Liquidity</div>
          <div className='flex w-[120px] justify-end text-text2'>Holders</div>
          <div
            className={clsx(
              "flex w-[120px] justify-end items-center gap-4 text-text2",
              {
                "!text-text1": sortBy === "deployedTime",
              }
            )}
          >
            Age <IconDownFilled className='text-size-16' />
          </div>
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
                <div
                  key={item.symbol}
                  className='h-64 flex items-center justify-between w-full border-b border-white-20 gap-8'
                >
                  <div className='flex w-[240px] items-center'>
                    <div className='text-text2 w-40'>{index + 1}</div>
                    <div className='flex w-[200px] gap-4 items-center'>
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
                          {item.twitter && (
                            <a href={item.twitter} target='_blank'>
                              <IconTwitterX className='text-size-12 text-text2' />
                            </a>
                          )}
                          {item.telegram && (
                            <a href={item.telegram} target='_blank'>
                              <IconTelegram className='text-size-12 text-text2' />
                            </a>
                          )}
                          {item.website && (
                            <a href={item.website} target='_blank'>
                              <IconWebsite className='text-size-12 text-text2' />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
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
                    {beautifyTimeV2(
                      new Date(item.deployedTime).getTime(),
                      true,
                      false,
                      ""
                    )}
                  </div>
                </div>
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
