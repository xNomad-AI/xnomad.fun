"use client";
import { CardViewGallery } from "@/app/sol/components/card-view-gallery";
import { NFTCard } from "@/app/sol/components/collection-nfts";
import { NOMADS_SOCIETY_ID } from "@/app/sol/ugc-agents/constants";
import { XNOMAD_ID } from "@/app/sol/xnomad/constants";
import { api } from "@/primitive/api";
import { Select } from "@/primitive/components";
import { NFT } from "@/types";
import { useRequest } from "ahooks";
import { useState } from "react";
const tabs = ["xnomad", "ugc-agents"] as const;
type Tab = (typeof tabs)[number];
const tabMap = {
  xnomad: "xNomad",
  "ugc-agents": "UGC Agents",
};
export function Content({ address }: { address: string }) {
  const [tab, setTab] = useState<Tab>("xnomad");
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
      <Select
        placement='start'
        onSelect={(value) => setTab(value as Tab)}
        value={tab}
        optionConfig={{
          data: [...tabs],
          renderer: (tab) => tabMap[tab],
        }}
      >
        {tabMap[tab]}
      </Select>
      <CardViewGallery
        loading={loading}
        loadingMore={false}
        count={tab === "ugc-agents" ? society?.length : xnomads?.length}
      >
        {(tab === "ugc-agents" ? society : xnomads)?.map((nft) => (
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
