"use client";

import { useEffect, useRef } from "react";
import { useCollectionStore } from "./store";
import { Collection, NFT } from "@/types";
import { useInfiniteScroll } from "ahooks";
import { api, ApiListData } from "@/primitive/api";
import { CardViewGallery } from "./card-view-gallery";
import { bungee, bungeeInline } from "@/app/layout/font";
import Link from "next/link";
import { useRarity } from "@/lib/utils/rarity/use-rarity";
import clsx from "clsx";
import { useTimeStore } from "@/primitive/hooks/time";
import { AgeCell } from "../agent/[address]/content/agent-token/token-list/age-cell";
import { useChainStore } from "@/app/layout/chain-provider";
export function CollectionNFTs({
  collection: initCollection,
  isSociety,
}: {
  collection: Collection;
  isSociety?: boolean;
}) {
  const { chain } = useChainStore();
  const { setCollection, nftSearchParams, resetAll, collection } =
    useCollectionStore();
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setCollection(initCollection);
    // reset search params
    return () => {
      resetAll();
    };
  }, [initCollection]);
  // fetch nfts
  const { data, loading, loadingMore } = useInfiniteScroll(
    async (currentData?: ApiListData<NFT>) => {
      const response = await api.v1.get<NFT[]>(
        `/nft/${chain}/collection/${collection?.id}/nfts`,
        {
          offset: currentData?.list.length ?? 0,
          limit: currentData ? 10 : 60,
          ...nftSearchParams,
          traitsQuery:
            nftSearchParams.traitsQuery.length > 0
              ? JSON.stringify(
                  nftSearchParams.traitsQuery.map((t) => {
                    return {
                      traitType: encodeURIComponent(t.traitType),
                      traitValue: encodeURIComponent(t.traitValue),
                    };
                  })
                )
              : undefined,
        }
      );
      return {
        list: response,
        total: collection?.nftsCount ?? 100,
      };
    },
    {
      target: elementRef.current,
      reloadDeps: [collection, nftSearchParams, chain],
      isNoMore(data) {
        if (data) {
          return (
            (!nftSearchParams.keyword &&
              data.list.length >= (collection?.nftsCount ?? 0)) ||
            Boolean(nftSearchParams.keyword)
          );
        }
        return false;
      },
    }
  );
  return (
    <div
      ref={elementRef}
      className='w-full h-[calc(100vh-372px)] overflow-auto'
    >
      <CardViewGallery
        loading={loading}
        loadingMore={loadingMore}
        count={data?.list.length ?? 0}
      >
        {data?.list.map((nft) => (
          <NFTCard
            isSociety={isSociety}
            nft={nft}
            collectionName={collection?.name}
            total={collection?.nftsCount}
          />
        ))}
      </CardViewGallery>
    </div>
  );
}

export function NFTCard({
  nft,
  collectionName,
  total,
  isSociety,
  isHome,
  className,
}: {
  nft: NFT;
  collectionName?: string;
  total?: number;
  isSociety?: boolean;
  isHome?: boolean;
  className?: string;
}) {
  const style = useRarity({
    rank: nft.rarity.rank,
    total: total ?? 1,
  });
  return (
    <Link
      prefetch
      href={`/${nft.chain}/agent/${nft.id}`}
      key={nft.id}
      className={clsx(
        "flex-col relative group rounded-12 flex gap-12 min-w-[180px] mobile:min-w-[unset] max-w-[240px]",
        className
      )}
    >
      {nft.primaryCoin && (
        <div className='absolute top-8 right-8 z-1 p-4 rounded-4 bg-yellow text-black flex items-center gap-4'>
          {nft.primaryCoin.image && (
            <img
              src={nft.primaryCoin.image}
              className='size-16 rounded-full object-contain'
            />
          )}
          <span>${nft.primaryCoin.symbol}</span>
        </div>
      )}
      <img
        src={nft.image}
        width={240}
        height={240}
        key={nft.image}
        alt={nft.name}
        loading='lazy'
        className='w-full group-hover:scale-110 transition-all duration-300 ease-in-out aspect-square object-contain bg-surface rounded-12'
      />
      <div className='flex flex-col w-full items-center'>
        {!isHome && (
          <span
            style={bungeeInline.style}
            className='text-size-12 text-text2 scale-90'
          >
            {collectionName}
          </span>
        )}
        <span style={bungee.style}>{nft.name}</span>
        {!isSociety && !isHome && (
          <div
            className={clsx(
              "mt-4 rounded-4 px-4 h-18 border border-white-40 flex items-center text-white-40 text-size-12",
              style.className
            )}
          >
            #{nft.rarity.rank}
          </div>
        )}
        {isHome && (
          <Age time={new Date((nft.mint?.timestamp ?? 0) * 1000).getTime()} />
        )}
      </div>
    </Link>
  );
}

function Age({ time }: { time: number }) {
  useTimeStore();
  return (
    <span className='text-text2'>
      Age: <AgeCell time={time} />
    </span>
  );
}
