import { Collection } from "@/types/collection";

import { CollectionInfo } from "../components/collection-info";
import { Description } from "../components/description";

import { CollectionFilter } from "../components/collection-filter";
import { CollectionNFTs } from "../components/collection-nfts";
import { api } from "@/primitive/api";
const XNOMAD_CA = "a94cdc54c55334042014b3c2f300f68d";
export default async function Page() {
  const collection = await api.v1.get<Collection>(
    `/nft/solana/collections/${XNOMAD_CA}`
  );

  return (
    <main className='relative flex flex-col px-64 py-32 mobile:px-16 gap-32 w-full'>
      <CollectionInfo collection={collection} />
      <Description __html={collection.description} />
      <CollectionFilter />
      <div className='w-full flex'>
        {/* TODO: wait for traits filter support */}
        {/* <CollectionSidebar /> */}
        <CollectionNFTs collection={collection} />
      </div>
    </main>
  );
}
