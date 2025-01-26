import { bungee } from "@/app/layout/font";
import {
  createBaseIcon,
  IconDiscord,
  IconTwitterX,
  IconWebsite,
  InteractiveBox,
} from "@/primitive/components";
import { Collection } from "@/types";
import Image from "next/image";

export function CollectionInfo({ collection }: { collection: Collection }) {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-16'>
        <Image
          alt=''
          src={collection.logo}
          height={80}
          width={80}
          className='rounded-8 flex-shrink-0'
        />
        <div className='flex flex-col gap-4'>
          <h1 style={bungee.style} className='text-[40px]'>
            {collection.name}
          </h1>
          <span className=''>5,000 NFTs</span>
        </div>
      </div>
      <div className='flex items-center gap-16'>
        <MediaIcon link='https://x.com/xNomadAI' Icon={IconTwitterX} />

        <MediaIcon
          link='https://discord.com/invite/xnomad'
          Icon={IconDiscord}
        />
        <MediaIcon link='https://xnomad.ai' Icon={IconWebsite} />
      </div>
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
    <a href={link} target='_blank' rel='noreferrer'>
      <InteractiveBox className='h-40 w-40 rounded-6 border border-white-20 bg-black-10 flex items-center justify-center'>
        <Icon className='text-size-20 text-white' />
      </InteractiveBox>
    </a>
  );
}
