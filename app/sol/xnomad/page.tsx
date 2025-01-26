import { Collection } from "@/types/collection";

import { CollectionInfo } from "../components/collection-info";
import { Description } from "../components/description";
// const XNOMAD_CA = "a94cdc54c55334042014b3c2f300f68d";
export default async function Page() {
  // TODO: wait for collection detail api
  const collection = {
    _id: "xnomad",
    id: "xnomad",
    categories: [],
    chain: "sol",
    contracts: [],
    createdAt: "2025-1-13T08:00:00.000Z",
    description:
      "xNomad Gensis is the first autonomous AI-NFT collection based on @ai16zdao Eliza. For the first time, NFT owners can chat with their NFTs, ask for claiming airdrops, tweeting on their behalf, executing automated on-chain transactions, and more.",
    logo: "/xnomad-nft-logo.svg",
    name: "XNOMAD",
    updatedAt: "2025-1-13T08:00:00.000Z",
  } satisfies Collection;

  return (
    <main className='relative flex flex-col px-64 py-32 mobile:px-16 gap-32 w-full'>
      <CollectionInfo collection={collection} />
      <Description __html={collection.description} />
    </main>
  );
}
