"use client";
import { useChainStore } from "@/app/layout/chain-provider";
import { Card, message } from "@/primitive/components";
import Link from "next/link";

export default function Page() {
  const { chain } = useChainStore();
  return (
    <div className='w-full h-[calc(100vh-64px)] flex items-center justify-center gap-32'>
      <Link prefetch href={`/${chain}/launch/nft`} className='scale-default'>
        <Card className='bg-surface w-[20rem] h-[20rem] flex flex-col gap-16 items-center justify-center'>
          <h1 className='text-[96px]'>🤖</h1>
          <h2 className='text-center max-w-[230px] text-size-24 font-bold'>
            Create A Single AI Agent
          </h2>
        </Card>
      </Link>
      <Link
        href={`/${chain}/launch/swarm`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          message("Coming Soon", {
            type: "error",
          });
        }}
      >
        <Card className='bg-surface w-[20rem] h-[20rem] flex flex-col gap-16 items-center justify-center'>
          <h1 className='text-size-24 text-center font-bold'>
            🤖🤖🤖🤖🤖🤖
            <br />
            🤖🤖🤖🤖🤖🤖
            <br />
            🤖🤖🤖🤖🤖🤖
          </h1>
          <h2 className='text-center max-w-[230px] text-size-24 font-bold'>
            Create An Agent Swarm
          </h2>
        </Card>
      </Link>
    </div>
  );
}
