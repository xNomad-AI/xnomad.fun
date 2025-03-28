import { Container } from "../layout/contianer";
import { Button, Card } from "@/primitive/components";
import { bungee } from "../layout/font";

import Link from "next/link";
import { HotAgentTokens } from "./agent/[address]/content/agent-token/token-list/hot-list";
import { NewAgentTokens } from "./agent/[address]/content/agent-token/token-list/new-list";
import { UGCAgents } from "../home/ugc-agents";
import { Partners } from "../home/partners";
import { ensureChain } from "@/lib/chain";
import { SwarmSection } from "../home/swarm-section";

export default function Home({
  params,
}: {
  params: {
    chain: string;
  };
}) {
  const chain = ensureChain(params.chain);

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
            Your AI-NFT Smart Terminal
          </h1>
          <p className='text-size-16 text-white'>
            Unleash the infinite power of AI agents' possibilities
          </p>
          <Link href={`/${chain}/launch/nft`} className='mt-24'>
            <Button className='w-[20rem]'>Create AI-NFT</Button>
          </Link>
        </div>
        <div></div>

        <SwarmSection />
        <div></div>
        <div className='grid grid-cols-2 w-full gap-32 mobile:grid-cols-1 mobile:gap-16'>
          <div className='flex flex-col gap-32'>
            <div className='flex items-center justify-between'>
              <h2 className='text-size-20 font-bold'>Hot Agent Tokens</h2>
              <Link href={`/${chain}/agent-token?sortBy=volume24h`} prefetch>
                <Button variant='secondary' className='font-bold'>
                  View More
                </Button>
              </Link>
            </div>
            <Card className='p-16 min-h-[330px]'>
              <HotAgentTokens />
            </Card>
          </div>
          <div className='flex flex-col gap-32'>
            <div className='flex items-center justify-between'>
              <h2 className='text-size-20 font-bold'>New Agent Tokens</h2>
              <Link href={`/${chain}/agent-token?sortBy=deployedTime`} prefetch>
                <Button variant='secondary' className='font-bold'>
                  View More
                </Button>
              </Link>
            </div>
            <Card className='p-16 min-h-[330px]'>
              <NewAgentTokens />
            </Card>
          </div>
        </div>
        <div></div>
        <div className='flex items-center justify-between'>
          <h2 className='text-size-20 font-bold'>Latest UGC Agents</h2>
          <Link href={`/${chain}/ugc-agents`} prefetch>
            <Button variant='secondary' className='font-bold'>
              View More
            </Button>
          </Link>
        </div>
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
