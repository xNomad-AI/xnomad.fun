import Image from "next/image";

export function Background({ src }: { src: string }) {
  return (
    <div className='absolute w-screen h-[274px] top-0 left-0 -z-1'>
      <Image
        src={src}
        height={274}
        width={1438}
        alt=''
        className='w-full h-full object-cover'
        objectFit='cover'
      />
      <div className='rotate-180 bg-[linear-gradient(180deg,#0D0F10_0%,rgba(7,8,8,0.36)_48.5%,rgba(0,0,0,0.00)_100%)] absolute z-1 w-full h-full left-0 top-0'></div>
    </div>
  );
}
