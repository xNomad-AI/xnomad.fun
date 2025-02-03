import { Container } from "@/app/layout/contianer";
import { InfoSection } from "./info";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import { Content } from "./content";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function Page({ params }: { params: any }) {
  const address = params.address;
  const nft = await api.v1.get<NFT>(`/nft/solana/nfts/${address}`);
  return (
    <Container className='flex gap-48 w-full'>
      <InfoSection nft={nft} />
      <Content nft={nft} />
    </Container>
  );
}
