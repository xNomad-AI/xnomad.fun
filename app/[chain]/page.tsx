import { Container } from "../layout/contianer";
import { Card } from "@/primitive/components";

import { HotAgentTokens } from "./agent/[address]/content/agent-token/token-list/hot-list";
import { NewAgentTokens } from "./agent/[address]/content/agent-token/token-list/new-list";
import { UGCAgents } from "../home/ugc-agents";
import { Partners } from "../home/partners";
import { SwarmSection } from "../home/swarm-section";
import { LaunchNFTButton } from "../home/luanch-nft-button";

export default function Home() {
  return (
    <div className='w-full flex flex-col items-center'>
      <Container className='flex flex-col gap-32 w-full py-64 max-w-[100rem] self-center'>
        <div className='flex flex-col gap-8 items-center w-full'>
          <h1
            style={{
              textShadow: "0px 0px 6px rgba(255, 255, 255, 0.60)",
            }}
            className='text-[40px] font-bold text-white'
          >
            Your Ultimate AI Terminal for Crypto
          </h1>
          <p className='text-size-16 text-white'>
            Create your AI agent as NFT. Prompt to trade and earn for you.
          </p>
          <LaunchNFTButton />
        </div>
        <div></div>

        <SwarmSection />
        <div></div>
        <div className='grid grid-cols-2 w-full gap-32 mobile:grid-cols-1 mobile:gap-16'>
          <HotAgentTokens />

          <NewAgentTokens />
        </div>
        <div></div>

        <UGCAgents />

        <div></div>
        <h2 className='text-size-20 font-bold'>Launchpad</h2>
        <Card className='w-full h-[365px] flex items-center justify-center'>
          <span className='text-size-16 text-text2'>Coming Soon...</span>
        </Card>
        <div></div>
        <Partners />
        <div></div>
      </Container>
    </div>
  );
}
