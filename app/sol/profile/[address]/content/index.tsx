"use client";
import { bungee, bungeeInline } from "@/app/layout/font";
import { CardViewGallery } from "@/app/sol/components/card-view-gallery";
import { NOMADS_SOCIETY_ID } from "@/app/sol/nomads-society/constants";
import { XNOMAD_ID } from "@/app/sol/xnomad/constants";
import { api } from "@/primitive/api";
import { NFT } from "@/types";
import { useRequest } from "ahooks";
import Link from "next/link";
import { useState } from "react";

export function Content({ address }: { address: string }) {
  const [tab, setTab] = useState<"xnomad" | "society">("society");
  const [xnomads, setXnomads] = useState<NFT[]>([]);
  const [society, setSociety] = useState<NFT[]>([]);
  const { loading } = useRequest(async () => {
    api.v1
      .get<
        Record<
          string,
          {
            collectionId: string;
            collectionName: string;
            nfts: NFT[];
          }
        >
      >(`/nft/solana/address/${address}/nfts`, {
        collectionId: XNOMAD_ID,
      })
      .then((res) => {
        res && setXnomads(res[XNOMAD_ID].nfts);
      });
  });
  const { loading: societyLoading } = useRequest(async () => {
    api.v1
      .get<
        Record<
          string,
          {
            collectionId: string;
            collectionName: string;
            nfts: NFT[];
          }
        >
      >(`/nft/solana/address/${address}/nfts`, {
        collectionId: NOMADS_SOCIETY_ID,
      })
      .then((res) => {
        res && setSociety(res[NOMADS_SOCIETY_ID].nfts);
      });
  });
  return (
    <div className='w-full flex flex-col gap-32'>
      <div className='flex gap-32'>
        <button
          className={`text-size-20 font-bold ${
            tab === "xnomad" ? "text-text1" : "text-white-60"
          }`}
          onClick={() => setTab("xnomad")}
        >
          Xnomad({xnomads.length})
        </button>
        <button
          className={`text-size-20 font-bold ${
            tab === "society" ? "text-text1" : "text-white-60"
          }`}
          onClick={() => setTab("society")}
        >
          Society({society.length})
        </button>
      </div>
      <CardViewGallery
        loading={loading || societyLoading}
        loadingMore={false}
        count={tab === "society" ? society.length : xnomads.length}
      >
        {(tab === "society" ? society : xnomads)?.map((nft) => (
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
              className='w-full aspect-square object-contain bg-surface rounded-12'
            />
            <div className='flex flex-col w-full items-center'>
              <span style={bungeeInline.style} className='text-size-12'>
                {nft.collectionName}
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
