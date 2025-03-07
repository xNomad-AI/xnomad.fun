import { Container } from "./layout/contianer";
import { Button, Card } from "@/primitive/components";
import { bungee } from "./layout/font";

import Link from "next/link";
import { HotAgentTokens } from "./sol/agent/[address]/content/agent-token/token-list/hot-list";
import { NewAgentTokens } from "./sol/agent/[address]/content/agent-token/token-list/new-list";
import { UGCAgents } from "./home/ugc-agents";
import { Partners } from "./home/partners";

export default function Home() {
  return (
    <Container className='flex flex-col gap-32 w-full py-64'>
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
        <Link href={"/sol/launch/nft"} className='mt-24'>
          <Button className='w-[20rem]'>Create AI-NFT</Button>
        </Link>
      </div>
      <div></div>
      <h2 className='text-size-20 font-bold'>Swarm</h2>
      <div className='grid grid-cols-2 w-full gap-16 mobile:grid-cols-1'>
        <Link href='/sol/xnomad' prefetch>
          <Card className='hover:border-white-40 relative w-full aspect-[16/9] flex items-center justify-center'>
            <img
              src={"/xnomad.webp"}
              className='hover:scale-110 transition-all ease-in-out duration-300 absolute top-0 left-0 w-full h-full'
            />
            <div className='pointer-events-none w-full h-full bg-black-20 absolute left-0 top-0 z-2'></div>
            <span
              className='pointer-events-none text-[40px] z-3 text-center'
              style={{
                ...bungee.style,
                textShadow: "0px 0px 6px rgba(255, 255, 255, 0.60)",
              }}
            >
              xNomad
              <br />
              GENESIS
            </span>
          </Card>
        </Link>
      </div>
      <div></div>
      <div className='grid grid-cols-2 w-full gap-32 mobile:grid-cols-1 mobile:gap-16'>
        <div className='flex flex-col gap-32'>
          <div className='flex items-center justify-between'>
            <h2 className='text-size-20 font-bold'>Hot Agent Tokens</h2>
            <Link href={"/sol/agent-token?sortBy=volume24h"} prefetch>
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
            <Link href={"/sol/agent-token?sortBy=deployedTime"} prefetch>
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
        <Link href={"/sol/agent-token?sortBy=age"} prefetch>
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
    </Container>
  );
}
