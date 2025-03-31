"use client";
import { api } from "@/primitive/api";
import { NFT } from "@/types";
import { useState } from "react";
import { NOMADS_SOCIETY_ID } from "../[chain]/ugc-agents/constants";
import { useRequest } from "ahooks";
import { Button, Spin } from "@/primitive/components";
import { Empty } from "@/components/empty";
import { NFTCard } from "../[chain]/components/collection-nfts";
import { useChainStore } from "../layout/chain-provider";
import Link from "next/link";

export function UGCAgents() {
  const { chain } = useChainStore();
  const [agents, setAgents] = useState<NFT[]>([]);

  const { loading } = useRequest(
    async () => {
      const res = await api.v1.get<NFT[]>(
        `/nft/${chain}/collection/${NOMADS_SOCIETY_ID[chain]}/nfts`,
        {
          offset: 0,
          limit: 10,
          sortBy: "mintTimeDesc",
        }
      );

      setAgents(res);
    },
    {
      refreshDeps: [chain],
    }
  );
  return (
    <>
      <div className='flex items-center justify-between'>
        <h2 className='text-size-20 font-bold'>Latest UGC Agents</h2>
        <Link href={`/${chain}/ugc-agents`} prefetch>
          <Button variant='secondary' className='font-bold'>
            View More
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className='w-full h-[200px] flex items-center justify-center'>
          <Spin />
        </div>
      ) : agents.length > 0 ? (
        <div className='w-full flex gap-24 overflow-auto'>
          {agents.map((agent) => (
            <NFTCard
              nft={agent}
              isHome
              key={agent.id}
              className='!min-w-[240px]'
              collectionName={"UGC AI Agents"}
            />
          ))}
        </div>
      ) : (
        <div className='w-full h-[200px] flex items-center justify-center'>
          <Empty />
        </div>
      )}
    </>
  );
}
