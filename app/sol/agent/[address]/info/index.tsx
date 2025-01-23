"use client";
import clsx from "clsx";
import Image from "next/image";
export function InfoSection({ address }: { address: string }) {
  return (
    <div className='flex flex-col w-[280px] gap-16'>
      <Image
        className='w-full aspect-square rounded-12'
        width={280}
        height={280}
        alt=''
        src={"/brand.png"}
      />
      <div className='flex flex-col gap-8'>
        <h1 className='text-size-24'>Nova</h1>
        <div className='flex items-center gap-4'>
          <CollectionLogo logo={"/brand.png"} size={24} />
          XNomad
        </div>
        {address}
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
      <Image
        width={size}
        height={size}
        alt=''
        className='object-cover'
        src={logo}
      />
    </div>
  );
}
