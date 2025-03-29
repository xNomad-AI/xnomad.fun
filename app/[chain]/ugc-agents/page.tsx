import { Collection, CollectionMetrics } from "@/types/collection";

import { CollectionInfo } from "../components/collection-info";
import { Description } from "../components/description";

import { CollectionFilter } from "../components/collection-filter";
import { CollectionNFTs } from "../components/collection-nfts";
import { api } from "@/primitive/api";
import { SideBar } from "../components/side-bar";
import { Background } from "../components/bg";
import { NOMADS_SOCIETY_ID } from "./constants";
import { ensureChain } from "@/lib/chain";
import { useCollectionStore } from "../components/store";
export default async function Page({
  params,
}: {
  params: {
    chain: string;
  };
}) {
  const chain = ensureChain(params.chain);
  const { collection } = await api.v1.get<{
    collection: Collection;
    metrics: CollectionMetrics;
  }>(`/nft/${chain}/collections/${NOMADS_SOCIETY_ID[chain]}`, undefined, {
    cache: "no-store",
  });

  return (
    <main className='relative flex flex-col px-64 py-32 mobile:px-16 gap-32 w-full'>
      <Background src='/society-bg.webp' />
      <CollectionInfo isSociety />
      <Description
        __html={
          "UGC AI Agents are NFTs launched by all users, and you can explore and interact with them through conversations. They chat, tweet, execute transactions, and grow within the xNomad universe. Every NFT tells a story."
        }
      />
      <CollectionFilter isSociety />
      <div className='w-full flex gap-24'>
        <SideBar />
        <CollectionNFTs collection={collection} isSociety />
      </div>
    </main>
  );
}
