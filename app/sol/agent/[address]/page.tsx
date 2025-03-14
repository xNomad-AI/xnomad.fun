import { Container } from "@/app/layout/contianer";
import { InfoSection } from "./info";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import { Content } from "./content";
import { AgentStoreProvider } from "./store";

export default async function Page({
  params,
}: {
  params: Promise<{
    address: string;
  }>;
}) {
  const { address } = await params;
  const nft = await api.v1.get<NFT>(`/nft/solana/nfts/${address}`, undefined, {
    cache: "no-store",
  });
  return (
    <AgentStoreProvider nft={nft}>
      <Container className='flex gap-48 w-full portrait-tablet:flex-col'>
        <div className='portrait-tablet:hidden'>
          <InfoSection />
        </div>
        <Content />
      </Container>
    </AgentStoreProvider>
  );
}
