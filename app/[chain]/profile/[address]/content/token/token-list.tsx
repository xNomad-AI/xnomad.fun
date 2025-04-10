"use client";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { IconDownFilled, Spin, Tooltip } from "@/primitive/components";
import { useTokenStore } from "../../store";
import { useMemo, useState } from "react";
import { TokenNumber } from "@/components/token-number";
import { Portfolio, Token } from "./type";
import { TokenCell } from "@/app/[chain]/agent/[address]/content/agent-token/token-list/token-cell";
import clsx from "clsx";
import BigNumber from "bignumber.js";
import { RateNum } from "@/components/rate-number";
import { NFT } from "@/types";
import { NFTCell } from "@/app/[chain]/agent/[address]/content/agent-token/token-list/nft-cell";
import Link from "next/link";
import { isOwner } from "@/lib/user/ownership";
import { useAccount } from "wagmi";
import { Address } from "@/components/address";

export function TokenList({
  data,
  loading,
}: {
  data: Portfolio[];
  loading: boolean;
}) {
  const { address } = useAccount();
  const { selectedPortfolio, onlyAgentToken } = useTokenStore();
  const tokens = useMemo(() => {
    return data
      .filter(
        (port) =>
          !selectedPortfolio.length ||
          selectedPortfolio.some((item) => item.wallet === port.wallet)
      )
      .flatMap((portfolio) =>
        portfolio.items
          .map((item) => ({
            ...item,
            nft: portfolio.nft,
            wallet: portfolio.wallet,
          }))
          .filter((item) => (onlyAgentToken ? Boolean(item.agentCoin) : true))
      );
  }, [data, selectedPortfolio, onlyAgentToken]);
  const [sortBy, setSortBy] = useState<keyof Token>("valueUsd");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const sortedTokens = useMemo(() => {
    return tokens.sort((a, b) => {
      let aValue =
        typeof a[sortBy] === "number"
          ? a[sortBy]
          : parseFloat(a[sortBy] as any);
      let bValue =
        typeof b[sortBy] === "number"
          ? b[sortBy]
          : parseFloat(b[sortBy] as any);
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [tokens, sortBy, sortDirection]);
  return (
    <div className='flex flex-col w-full'>
      <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40 text-text2 text-size-12'>
        <div className='w-[200px]'>Token</div>
        <div className='w-[120px] text-right'>Price</div>
        <div className='w-[120px] text-right'>Balance</div>
        <button
          onClick={() => {
            if (sortBy === "valueUsd") {
              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
            } else {
              setSortBy("valueUsd");
              setSortDirection("desc");
            }
          }}
          className={clsx("w-[120px] text-right flex justify-end gap-4", {
            "text-white": sortBy === "valueUsd",
          })}
        >
          Holding Value
          <IconDownFilled
            className={clsx(
              "text-size-16 transition-transform duration-300 ease-in-out",
              {
                "rotate-180": sortDirection === "asc",
              }
            )}
          />
        </button>
        <div className='w-[120px] text-right'>Owner</div>
      </div>

      {sortedTokens.length > 0 ? (
        <InfiniteScrollList
          items={sortedTokens}
          gutterSize={0}
          key={`${sortBy}-${sortDirection}`}
          itemSize={58}
          height={400}
          renderItem={(item: Token & { nft: NFT; wallet: string }) => {
            const isTokenOwner = isOwner(item.wallet, address);
            return (
              <Link
                onClick={(e) => {
                  if (isTokenOwner || !item.nft.id) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                href={`/${item.nft.chain}/agent/${item.nft.id}?tab=agent-token`}
                key={item.symbol}
                className={clsx(
                  "h-64 flex items-center justify-between w-full border-b border-white-20 gap-8",
                  {
                    "hover:bg-[#242424]": !isTokenOwner,
                  }
                )}
              >
                <div className='flex w-[200px] gap-4 items-center'>
                  <TokenCell
                    item={{
                      logo: item.logoURI,
                      symbol: item.symbol,
                      name: item.name,
                      address: item.address,
                    }}
                  />
                </div>
                <div className='flex w-[120px] flex-col items-end'>
                  <TokenNumber prefix={"$"} number={item.priceUsd} />
                  <RateNum
                    num={item.usdPrice24hrPercenChange}
                    className='text-size-12'
                  />
                </div>
                <div className='flex w-[120px] justify-end'>
                  <TokenNumber
                    number={BigNumber(item.balance)
                      .div(10 ** 18)
                      .toString()}
                  />
                </div>
                <div className='flex w-[120px] justify-end'>
                  <TokenNumber prefix={"$"} number={item.valueUsd} />
                </div>
                <div className='flex w-[120px] justify-end'>
                  {isTokenOwner ? (
                    <span>My Wallet</span>
                  ) : Boolean(item.nft.id) ? (
                    <Tooltip
                      content={item.wallet}
                      className='flex w-full items-center'
                    >
                      <NFTCell item={{ nft: item.nft }} />
                    </Tooltip>
                  ) : (
                    <Address address={item.wallet} />
                  )}
                </div>
              </Link>
            );
          }}
          hasNextPage={false}
          isNextPageLoading={false}
          loadNextPage={() => {}}
        />
      ) : loading ? (
        <div className='w-full flex h-[200px] items-center justify-center gap-16'>
          <Spin />
        </div>
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No tokens found
        </div>
      )}
    </div>
  );
}
