import { bungee } from "@/app/layout/font";
import {
  Button,
  createBaseIcon,
  IconDiscord,
  IconTwitterX,
  IconWebsite,
  InteractiveBox,
} from "@/primitive/components";
import { Collection } from "@/types";
import Link from "next/link";

export function CollectionInfo({
  collection,
  isSociety,
}: {
  collection: Collection;
  isSociety?: boolean;
}) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-col gap-4'>
        <h1 style={bungee.style} className='text-[40px] mobile:text-size-24'>
          {collection.name}
        </h1>
        <span className=''>{collection?.nftsCount?.toLocaleString()} NFTs</span>
      </div>

      {isSociety ? (
        <Link href={`/sol/launch`}>
          <Button>Create AI-NFT</Button>
        </Link>
      ) : (
        <div className='flex items-center gap-16'>
          <MediaIcon link='https://x.com/xNomadAI' Icon={IconTwitterX} />

          <MediaIcon
            link='https://discord.com/invite/xnomad'
            Icon={IconDiscord}
          />
          <MediaIcon link='https://xnomad.ai' Icon={IconWebsite} />
        </div>
      )}
    </div>
  );
}

function MediaIcon({
  link,
  Icon,
}: {
  link: string;
  Icon: ReturnType<typeof createBaseIcon>;
}) {
  return (
    <a
      href={link}
      target='_blank'
      rel='noreferrer'
      className='h-40 w-40 rounded-6 border border-white-20 hover:border-white-40 bg-black-10 flex items-center justify-center'
    >
      <Icon className='text-size-20 text-white' />
    </a>
  );
}
