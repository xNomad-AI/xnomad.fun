"use client";
import { bungee } from "@/app/layout/font";
import { Address } from "@/components/address";
import { Card, IconDocs } from "@/primitive/components";
import { NFT } from "@/types";
import clsx from "clsx";
export function InfoSection({ nft }: { nft: NFT }) {
  return (
    <div className='flex flex-col w-[280px] gap-16 flex-shrink-0'>
      <img
        className='w-full aspect-square rounded-12'
        width={280}
        height={280}
        alt=''
        src={nft.image}
      />
      <div className='flex flex-col gap-8'>
        <h1 style={bungee.style} className='text-size-24'>
          {nft.name}
        </h1>
        <div className='flex items-center gap-4'>
          <CollectionLogo logo={"/xnomad-nft-logo.svg"} size={24} />
          {nft.collectionName}
        </div>
        <Card className='flex flex-col gap-16 p-16 w-full'>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Asset ID</span>
            <Address address={nft.id} />
          </div>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Owner</span>
            <Address address={nft.owner} />
          </div>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Character Files</span>
            <IconDocs />
          </div>
        </Card>
        <Card className='flex flex-col gap-16 p-16 w-full'>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Rarity</span>
            <span>#{nft.rarity.rank}</span>
          </div>
        </Card>
        <Card className='flex flex-col gap-16 p-16 w-full'>
          {nft.traits.map((trait) => (
            <div
              key={trait.value}
              className='flex items-center justify-between'
            >
              <span>{trait.type}</span>
              <span>{trait.value}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function CollectionLogo({
  size,
  className,
  logo,
}: {
  size?: number;
  className?: string;
  logo: string;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={clsx(className, "rounded-4 border overflow-hidden")}
    >
      <img
        width={size}
        height={size}
        alt=''
        className='object-cover'
        src={logo}
      />
    </div>
  );
}
