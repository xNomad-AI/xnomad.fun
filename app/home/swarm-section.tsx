"use client";
import Link from "next/link";
import { useChainStore } from "../layout/chain-provider";
import { Card } from "@/primitive/components";
import { bungee } from "../layout/font";

export function SwarmSection() {
  const { chain } = useChainStore();
  return chain === "solana" ? (
    <>
      <h2 className='text-size-20 font-bold'>Swarm</h2>
      <div className='grid grid-cols-2 w-full gap-16 mobile:grid-cols-1'>
        <Link href={`/${chain}/xnomad`} prefetch>
          <Card className='hover:border-white-40 relative w-full aspect-[16/9] flex items-center justify-center'>
            <img
              alt='xnomad'
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
    </>
  ) : null;
}
