"use client";
import { api } from "@/primitive/api";
import { NFT } from "@/types";
import { useState } from "react";
import { NOMADS_SOCIETY_ID } from "../sol/ugc-agents/constants";
import { useRequest } from "ahooks";
import { Spin } from "@/primitive/components";
import { Empty } from "@/components/empty";
import { NFTCard } from "../sol/components/collection-nfts";

export function UGCAgents() {
  const [agents, setAgents] = useState<NFT[]>([]);

  const { loading } = useRequest(async () => {
    const res = await api.v1.get<NFT[]>(
      `/nft/solana/collection/${NOMADS_SOCIETY_ID}/nfts`,
      {
        offset: 0,
        limit: 10,
        sortBy: "mintTimeDesc",
      }
    );

    setAgents(res);
  });
  return loading ? (
    <div className='w-full h-[200px] flex items-center justify-center'>
      <Spin />
    </div>
  ) : agents.length > 0 ? (
    <div className='w-full flex gap-16 overflow-auto'>
      {agents.map((agent) => (
        <NFTCard
          nft={agent}
          isHome
          className='!min-w-[240px]'
          collectionName={"UGC AI Agents"}
        />
      ))}
    </div>
  ) : (
    <div className='w-full h-[200px] flex items-center justify-center'>
      <Empty />
    </div>
  );
}
