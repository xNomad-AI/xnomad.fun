import { bungee } from "@/app/layout/font";
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
      <div className='flex items-center gap-16'></div>
    </div>
  );
}
