import { Container } from "@/app/layout/contianer";
import { InfoSection } from "./info";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import { Content } from "./content";

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
    <Container className='flex gap-48 w-full portrait-tablet:flex-col'>
      <div className='portrait-tablet:hidden'>
        <InfoSection nft={nft} />
      </div>
      <Content nft={nft} />
    </Container>
  );
}
