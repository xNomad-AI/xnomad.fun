"use client";
import { CardViewGallery } from "@/app/[chain]/components/card-view-gallery";
import { NFTCard } from "@/app/[chain]/components/collection-nfts";
import { NOMADS_SOCIETY_ID } from "@/app/[chain]/ugc-agents/constants";
import { XNOMAD_ID } from "@/app/[chain]/xnomad/constants";
import { useChainStore } from "@/app/layout/chain-provider";
import { api } from "@/primitive/api";
import { Select } from "@/primitive/components";
import { NFT } from "@/types";
import { useRequest } from "ahooks";
import { useMemo, useState } from "react";
const tabs = ["xnomad", "ugc-agents", "all"] as const;
type Tab = (typeof tabs)[number];
const tabMap = {
  xnomad: "xNomad",
  "ugc-agents": "UGC Agents",
  all: "All",
};
export function Content({ address }: { address: string }) {
  const { chain } = useChainStore();
  const [tab, setTab] = useState<Tab>("all");
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
    >(`/nft/${chain}/address/${address}/nfts`, {
      collectionId: NOMADS_SOCIETY_ID[chain],
    });
    if (res) {
      setSociety(res[NOMADS_SOCIETY_ID[chain]]?.nfts ?? []);
    }
  });
  const count = useMemo(() => {
    switch (tab) {
      case "all":
        return xnomads.length + society.length;
      case "xnomad":
        return xnomads.length;
      case "ugc-agents":
        return society.length;

      default:
        return xnomads.length;
    }
  }, [tab, xnomads, society]);
  const data = useMemo(() => {
    switch (tab) {
      case "all":
        return [...xnomads, ...society];
      case "xnomad":
        return xnomads;
      case "ugc-agents":
        return society;

      default:
        return xnomads;
    }
  }, [tab, xnomads, society]);
  return (
    <div className='w-full flex flex-col gap-32'>
      <Select
        placement='start'
        onSelect={(value) => setTab(value as Tab)}
        value={tab}
        optionConfig={{
          data: [...tabs].filter((tab) => {
            if (chain !== "solana" && tab === "xnomad") {
              return false;
            }
            return true;
          }),
          renderer: (tab) => tabMap[tab],
        }}
      >
        {tabMap[tab]}
      </Select>
      <CardViewGallery
        loading={loading || societyLoading}
        loadingMore={false}
        count={count}
      >
        {data?.map((nft) => (
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
