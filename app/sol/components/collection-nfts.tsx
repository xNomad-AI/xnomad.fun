"use client";

import { useEffect } from "react";
import { useCollectionStore } from "./store";
import { Collection, NFT } from "@/types";
import { useInfiniteScroll } from "ahooks";
import { api, ApiListData } from "@/primitive/api";
import { getPageViewElement } from "@/lib/page-view";
import { CardViewGallery } from "./card-view-gallery";
import Image from "next/image";
import { bungee, bungeeInline } from "@/app/layout/font";

export function CollectionNFTs({ collection }: { collection: Collection }) {
  const { setCollection, nftSearchParams } = useCollectionStore();
  useEffect(() => {
    setCollection(collection);
  }, [collection]);
  // fetch nfts
  const { data, loading, loadingMore } = useInfiniteScroll(
    async (currentData?: ApiListData<NFT>) => {
      const response = await api.v1.get<NFT[]>(
        `/nft/solana/collection/${collection.contracts[0]}/nfts`,
        {
          offset: currentData?.list.length ?? 0,
          limit: currentData ? 10 : 60,
          ...nftSearchParams,
        }
      );
      return {
        list: response,
        total: collection.total,
      };
    },
    {
      target: getPageViewElement(),
      reloadDeps: [nftSearchParams, collection.id],
      isNoMore(data) {
        if (data) {
          return data.list.length >= data.total;
        }
        return false;
      },
    }
  );
  return (
    <CardViewGallery
      loading={loading}
      loadingMore={loadingMore}
      count={data?.list.length ?? 0}
    >
      {data?.list.map((nft) => (
        <div
          key={nft.id}
          className='flex-col flex gap-12 min-w-[180px] max-w-[240px]'
        >
          <Image
            src={nft.image}
            width={240}
            height={240}
            alt={nft.name}
            className='w-full aspect-square rounded-12'
          />
          <div className='flex flex-col w-full items-center'>
            <span style={bungeeInline.style} className='text-size-12'>
              {collection.name}
            </span>
            <span style={bungee.style}>No.{nft.nftId}</span>
            <div className='mt-4 px-4 h-18 border border-white-40 flex items-center text-white-40 text-size-12'>
              #{nft.rarity.rank}
            </div>
          </div>
        </div>
      ))}
    </CardViewGallery>
  );
}
