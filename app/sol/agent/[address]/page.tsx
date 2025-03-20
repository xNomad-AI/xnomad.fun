import { Container } from "@/app/layout/contianer";
import { InfoSection } from "./info";
import { NFT } from "@/types";
import { api } from "@/primitive/api";
import { Content } from "./content";
import { AgentStoreProvider } from "./store";
import { cookies } from "next/headers";
import { preferenceNameMap } from "@/types/preference";

export default async function Page({
  params,
}: {
  params: Promise<{
    address: string;
  }>;
}) {
  const cookieStore = cookies();
  const { address } = await params;
  const nft = await api.v1.get<NFT>(`/nft/solana/nfts/${address}`, undefined, {
    cache: "no-store",
  });
  const agentSideWalletVisible = (cookieStore.get(
    preferenceNameMap.agentSideWalletVisible
  )?.value ?? "table") as "true" | "false";

  return (
    <AgentStoreProvider
      nft={nft}
      agentSideWalletVisible={agentSideWalletVisible === "true" ? true : false}
    >
      <Container className='flex gap-48 w-full portrait-tablet:flex-col'>
        <InfoSection />
        <Content />
      </Container>
    </AgentStoreProvider>
  );
}
