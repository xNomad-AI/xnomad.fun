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
    chain: string;
  }>;
}) {
  const cookieStore = cookies();
  const { address, chain: _chainInUrl } = await params;
  let chainInUrl = _chainInUrl.toLowerCase();
  if (chainInUrl === "sol") {
    chainInUrl = "solana";
  }

  const chain = chainInUrl ?? cookieStore.get("chain");
  const nft = await api.v1.get<NFT>(
    `/nft/${chain}/nfts/${address}`,
    undefined,
    {
      cache: "no-store",
    }
  );
  const agentSideWalletVisible = (cookieStore.get(
    preferenceNameMap.agentSideWalletVisible
  )?.value ?? "table") as "true" | "false";

  return (
    <AgentStoreProvider
      nft={nft}
      agentSideWalletVisible={agentSideWalletVisible === "false" ? false : true}
    >
      <Container className='flex w-full portrait-tablet:flex-col'>
        <InfoSection />
        <Content />
      </Container>
    </AgentStoreProvider>
  );
}
