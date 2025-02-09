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
export function CollectionNFTs({
  collection,
  isSociety,
}: {
  collection: Collection;
  isSociety?: boolean;
}) {
  const { setCollection, nftSearchParams, resetAll } = useCollectionStore();
  const elementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setCollection(collection);
    // reset search params
    return () => {
      resetAll();
    };
  }, [collection]);
  // fetch nfts
  const { data, loading, loadingMore } = useInfiniteScroll(
    async (currentData?: ApiListData<NFT>) => {
      const response = await api.v1.get<NFT[]>(
        `/nft/solana/collection/${collection.id}/nfts`,
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
        total: collection.nftsCount,
      };
    },
    {
      target: elementRef.current,
      reloadDeps: [collection.id, nftSearchParams],
      isNoMore(data) {
        if (data) {
          return (
            (!nftSearchParams.keyword &&
              data.list.length >= collection.nftsCount) ||
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
            collectionName={collection.name}
            total={collection.nftsCount}
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
}: {
  nft: NFT;
  collectionName: string;
  total: number;
  isSociety?: boolean;
}) {
  const style = useRarity({
    rank: nft.rarity.rank,
    total,
  });
  return (
    <Link
      href={`/sol/agent/${nft.id}`}
      key={nft.id}
      className='flex-col group rounded-12 flex gap-12 min-w-[180px] mobile:min-w-[unset] max-w-[240px]'
    >
      <img
        src={nft.image}
        width={240}
        height={240}
        alt={nft.name}
        loading='lazy'
        className='w-full group-hover:scale-110 transition-all duration-300 ease-in-out aspect-square object-contain bg-surface rounded-12'
      />
      <div className='flex flex-col w-full items-center'>
        <span
          style={bungeeInline.style}
          className='text-size-12 text-text2 scale-90'
        >
          {collectionName}
        </span>
        <span style={bungee.style}>{nft.name}</span>
        {/* {!isSociety && (
          <div
            className={clsx(
              "mt-4 rounded-4 px-4 h-18 border border-white-40 flex items-center text-white-40 text-size-12",
              style.className
            )}
          >
            #{nft.rarity.rank}
          </div>
        )} */}
      </div>
    </Link>
  );
}
