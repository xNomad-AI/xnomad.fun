"use client";
import { Card, message } from "@/primitive/components";
import Link from "next/link";

export default function Page() {
  return (
    <div className='w-full h-[calc(100vh-64px)] flex items-center justify-center gap-32'>
      <Link prefetch href={"/sol/launch/nft"} className='scale-default'>
        <Card className='bg-surface w-[20rem] h-[20rem] flex flex-col gap-16 items-center justify-center'>
          <h1 className='text-[96px]'>🤖</h1>
          <h2 className='text-center max-w-[230px] text-size-24 font-bold'>
            Create a Single AI-NFT Agent.
          </h2>
        </Card>
      </Link>
      <Link
        href={""}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          message("Coming Soon");
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
            Create an AI-NFT Collection
          </h2>
        </Card>
      </Link>
    </div>
  );
}
