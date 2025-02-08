import { Collection, CollectionMetrics } from "@/types/collection";

import { CollectionInfo } from "../components/collection-info";
import { Description } from "../components/description";

import { CollectionFilter } from "../components/collection-filter";
import { CollectionNFTs } from "../components/collection-nfts";
import { api } from "@/primitive/api";
import { SideBar } from "../components/side-bar";
import { Background } from "../components/bg";
import { XNOMAD_ID } from "./constants";
export default async function Page() {
  const { collection } = await api.v1.get<{
    collection: Collection;
    metrics: CollectionMetrics;
  }>(`/nft/solana/collections/${XNOMAD_ID}`, undefined, {
    cache: "no-cache",
  });

  return (
    <main className='relative flex flex-col px-64 py-32 mobile:px-16 gap-32 w-full'>
      <Background src='/xnomad-bg.webp' />
      <CollectionInfo collection={collection} />
      <Description __html={collection.description} />
      <CollectionFilter />
      <div className='w-full flex gap-24'>
        <SideBar />
        <CollectionNFTs collection={collection} />
      </div>
    </main>
  );
}
