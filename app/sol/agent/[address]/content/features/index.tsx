import { Button, Card } from "@/primitive/components";
import { NFT } from "@/types";
import Image from "next/image";

export function Features({}: { nft: NFT }) {
  return (
    <div className='w-full flex flex-col gap-16'>
      <Card className='flex items-center justify-between gap-16 p-16'>
        <div className='flex items-center gap-16'>
          <Image src={"/twitter.svg"} height={64} width={64} alt='' />
          <span>Twitter Integration</span>
        </div>
        <Button>Add</Button>
      </Card>
      <Card className='flex items-center justify-between gap-16 p-16'>
        <div className='flex items-center gap-16'>
          <Image src={"/telegram.svg"} height={64} width={64} alt='' />
          <span>Telegram Integration</span>
        </div>
        <Button>Add</Button>
      </Card>
      <Card className='flex items-center justify-between gap-16 p-16'>
        <div className='flex items-center gap-16'>
          <Image src={"/discord.svg"} height={64} width={64} alt='' />
          <span>Discord Integration</span>
        </div>
        <span>Coming Soon</span>
      </Card>
      <Card className='flex items-center justify-between gap-16 p-16'>
        <div className='flex items-center gap-16'>
          <Image src={"/twitter.svg"} height={64} width={64} alt='' />
          <span>Voice Generation</span>
        </div>
        <Button variant='secondary'>Edit</Button>
      </Card>
    </div>
  );
}
