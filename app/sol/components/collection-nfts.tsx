"use client";

import { useEffect, useRef } from "react";
import { useCollectionStore } from "./store";
import { Collection, NFT } from "@/types";
import { useInfiniteScroll } from "ahooks";
import { api, ApiListData } from "@/primitive/api";
import { CardViewGallery } from "./card-view-gallery";
import { bungee, bungeeInline } from "@/app/layout/font";
import Link from "next/link";

export function CollectionNFTs({ collection }: { collection: Collection }) {
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
        total: collection.total,
      };
    },
    {
      target: elementRef.current,
      reloadDeps: [collection.id, nftSearchParams],
      isNoMore(data) {
        if (data) {
          return (
            (!nftSearchParams.keyword && data.list.length >= 5000) ||
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
          <Link
            href={`/sol/agent/${nft.id}`}
            key={nft.id}
            className='flex-col flex gap-12 min-w-[180px] max-w-[240px]'
          >
            <img
              src={nft.image}
              width={240}
              height={240}
              alt={nft.name}
              loading='lazy'
              className='w-full aspect-square rounded-12'
            />
            <div className='flex flex-col w-full items-center'>
              <span style={bungeeInline.style} className='text-size-12'>
                {collection.name}
              </span>
              <span style={bungee.style}>{nft.name}</span>
              <div className='mt-4 px-4 h-18 border border-white-40 flex items-center text-white-40 text-size-12'>
                #{nft.rarity.rank}
              </div>
            </div>
          </Link>
        ))}
      </CardViewGallery>
    </div>
  );
}
