"use client";
import { CardViewGallery } from "@/app/sol/components/card-view-gallery";
import { NFTCard } from "@/app/sol/components/collection-nfts";
import { NOMADS_SOCIETY_ID } from "@/app/sol/nomad-society/constants";
import { XNOMAD_ID } from "@/app/sol/xnomad/constants";
import { api } from "@/primitive/api";
import { NFT } from "@/types";
import { useRequest } from "ahooks";
import { useState } from "react";

export function Content({ address }: { address: string }) {
  const [tab, setTab] = useState<"xnomad" | "society">("xnomad");
  const [xnomads, setXnomads] = useState<NFT[]>([]);
  const [society, setSociety] = useState<NFT[]>([]);
  const { loading } = useRequest(async () => {
    const res = await api.v1.get<
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
    });
    if (res) {
      setXnomads(res[XNOMAD_ID]?.nfts ?? []);
    }
  });
  const { loading: societyLoading } = useRequest(async () => {
    const res = await api.v1.get<
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
    });
    if (res) {
      setSociety(res[NOMADS_SOCIETY_ID]?.nfts ?? []);
    }
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
          xNomad({xnomads?.length})
        </button>
        <button
          className={`text-size-20 font-bold ${
            tab === "society" ? "text-text1" : "text-white-60"
          }`}
          onClick={() => setTab("society")}
        >
          Society({society?.length})
        </button>
      </div>
      <CardViewGallery
        loading={loading}
        loadingMore={false}
        count={tab === "society" ? society?.length : xnomads?.length}
      >
        {(tab === "society" ? society : xnomads)?.map((nft) => (
          <NFTCard
            nft={nft}
            collectionName={nft.collectionName}
            total={tab === "xnomad" ? 5000 : Infinity}
          />
        ))}
      </CardViewGallery>
    </div>
  );
}
