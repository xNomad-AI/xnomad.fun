import { Container } from "@/app/layout/contianer";
import { InfoSection } from "./info";
import { NFT } from "@/types";
import { ModelProviderName } from "@elizaos/core";

export default function Page({
  params,
}: {
  params: {
    address: string;
  };
}) {
  const address = params.address;
  // TODO: fetch nft by address
  const nft = {
    _id: "1",
    id: "1",
    aiAgent: {
      engine: "eliza",
      character: {
        id: `1-${address}-eliza-1-1`,
        name: "Eliza",
        modelProvider: ModelProviderName.AKASH_CHAT_API,
        messageExamples: [],
        bio: "Eliza is a chatbot",
        postExamples: [],
        lore: [],
        topics: [],
        adjectives: [],
        clients: [],
        plugins: [],
        style: {
          all: [],
          post: [],
          chat: [],
        },
      },
    },
    chain: "sol",
    collectionId: "1",
    collectionName: "Eliza",
    contractAddress: "1",
    createdAt: "2021-10-10",
    image: "/eliza.png",
    name: "Eliza",
    nftId: "1",
    rarity: {
      score: 1,
      rank: 1,
    },
    tokenId: "1",
    tokenURI: "1",
    traits: [
      {
        type: "type",
        value: "value",
      },
    ],
    updatedAt: "2021-10-10",
  } satisfies NFT;
  return (
    <Container className='flex gap-48 w-full'>
      <InfoSection nft={nft} />
    </Container>
  );
}
