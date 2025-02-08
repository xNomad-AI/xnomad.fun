"use client";
import { bungee } from "@/app/layout/font";
import { XNOMAD_ID } from "@/app/sol/xnomad/constants";
import { Address } from "@/components/address";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { useRarity } from "@/lib/utils/rarity/use-rarity";
import {
  Card,
  IconContract,
  Modal,
  ModalContent,
  ModalTitleWithBorder,
} from "@/primitive/components";
import { NFT } from "@/types";
import { Character } from "@elizaos/core";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
export function InfoSection({ nft }: { nft: NFT }) {
  const style = useRarity({
    rank: nft.rarity.rank,
    total: nft.collectionId === XNOMAD_ID ? 5000 : Infinity,
  });
  return (
    <div className='flex flex-col w-[280px] gap-16 flex-shrink-0'>
      <img
        className='w-full aspect-square rounded-12 object-contain bg-surface'
        width={280}
        height={280}
        alt=''
        src={nft.image}
      />
      <div className='flex flex-col gap-8'>
        <h1 style={bungee.style} className='text-size-24'>
          {nft.name}
        </h1>
        <Link
          href={`/sol/${
            nft.collectionId === XNOMAD_ID ? "xnomad" : "nomads-society"
          }`}
          className='flex items-center gap-4'
        >
          <CollectionLogo logo={"/xnomad-nft-logo.svg"} size={24} />
          {nft.collectionName}
        </Link>
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
            <CharacterFileModal character={nft.aiAgent.character} />
          </div>
        </Card>
        <Card className='flex flex-col gap-16 p-16 w-full'>
          <div className='flex items-center justify-between'>
            <span className='font-bold'>Rarity</span>
            <span className={style.className}>#{nft.rarity.rank}</span>
          </div>
        </Card>
        <Card className='flex flex-col gap-16 p-16 w-full'>
          <span className='font-bold'>Traits</span>
          {nft.traits.map((trait) => (
            <div
              key={trait.value}
              className='flex items-center justify-between gap-16'
            >
              <TextWithEllipsis className='max-w-[90px] flex-shrink-0'>
                {trait.type}
              </TextWithEllipsis>
              <TextWithEllipsis>{trait.value}</TextWithEllipsis>
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

function CharacterFileModal({ character }: { character: Character }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconContract
        className='cursor-pointer text-size-20'
        onClick={() => {
          setOpen(true);
        }}
      />
      <Modal size='m' open={open} onMaskClick={() => setOpen(false)}>
        <ModalTitleWithBorder closable onClose={() => setOpen(false)}>
          Character Files
        </ModalTitleWithBorder>
        <ModalContent className='overflow-auto max-h-[600px]'>
          <p>{JSON.stringify(character, null, 2)}</p>
        </ModalContent>
      </Modal>
    </>
  );
}
