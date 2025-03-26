"use client";
import { useChainStore } from "@/app/layout/chain-provider";
import { bungee } from "@/app/layout/font";
import { api } from "@/primitive/api";
import {
  Button,
  createBaseIcon,
  IconDiscord,
  IconTwitterX,
  IconWebsite,
} from "@/primitive/components";
import { Collection } from "@/types";
import { useUpdateEffect } from "ahooks";
import Link from "next/link";
import { useCollectionStore } from "./store";
import { NOMADS_SOCIETY_ID } from "../ugc-agents/constants";
import { XNOMAD_ID } from "../xnomad/constants";
import { SupportedChain } from "@/types/preference";
import { useEffect } from "react";

export function CollectionInfo({
  collection,
  isSociety,
  chain: initChain,
}: {
  collection: Collection;
  isSociety?: boolean;
  chain?: SupportedChain;
}) {
  const { setCollection } = useCollectionStore();
  const { chain, setChain } = useChainStore();
  useUpdateEffect(() => {
    api.v1
      .get<{
        collection: Collection;
      }>(
        `/nft/${chain}/collections/${
          isSociety ? NOMADS_SOCIETY_ID[chain] : XNOMAD_ID
        }`,
        undefined,
        {
          cache: "no-store",
        }
      )
      .then(({ collection }) => setCollection(collection));
  }, [chain]);
  useEffect(() => {
    if (initChain && initChain !== chain) {
      setChain(initChain);
    }
  }, []);
  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-col gap-4'>
        <h1 style={bungee.style} className='text-[40px] mobile:text-size-24'>
          {isSociety ? "UGC AI Agents" : collection.name}
        </h1>
        <span className=''>{collection?.nftsCount?.toLocaleString()} NFTs</span>
      </div>

      {isSociety ? (
        <Link href={`/${chain}/launch`}>
          <Button>Create AI-NFT</Button>
        </Link>
      ) : (
        <div className='flex items-center gap-16'>
          <MediaIcon link='https://x.com/xNomadAI' Icon={IconTwitterX} />

          <MediaIcon
            link='https://discord.com/invite/xnomad'
            Icon={IconDiscord}
          />
          <MediaIcon link='https://xnomad.ai' Icon={IconWebsite} />
        </div>
      )}
    </div>
  );
}

function MediaIcon({
  link,
  Icon,
}: {
  link: string;
  Icon: ReturnType<typeof createBaseIcon>;
}) {
  return (
    <a
      href={link}
      target='_blank'
      rel='noreferrer'
      className='h-40 w-40 rounded-6 border border-white-20 hover:border-white-40 bg-black-10 flex items-center justify-center'
    >
      <Icon className='text-size-20 text-white' />
    </a>
  );
}
