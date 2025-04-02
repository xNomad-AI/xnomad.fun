"use client";
import { Container } from "@/app/layout/contianer";
import { bungee } from "@/app/layout/font";
import { Address } from "@/components/address";
import clsx from "clsx";
import Image from "next/image";
import { Content } from "./content";

export default function Page({
  params,
}: {
  params: {
    address: string;
    chain: string;
  };
}) {
  const { address, chain } = params;
  return (
    <Container className='flex flex-col gap-32 w-full'>
      <div className='flex items-center mt-32 gap-16'>
        <Image
          src={`/${chain === "bsc" ? "bscscan-light" : "solscan"}.png`}
          className='mobile:h-24 mobile:w-24'
          height={40}
          width={40}
          alt=''
        />
        <Address
          address={address}
          enableCopy
          className={clsx(bungee.className, "text-[40px] mobile:text-size-24")}
        />
      </div>
      <div></div>
      <Content address={address} />
    </Container>
  );
}
