import { isOwner } from "@/lib/user/ownership";
import { Card, Divider, IconEdit } from "@/primitive/components";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAgentStore } from "../../../../store";
import { TokenInfo } from "../../token-list/network";
import { EditInfoModal } from "./edit-modal";
import { useState } from "react";

export function Info({ tokenInfo }: { tokenInfo: TokenInfo }) {
  const { publicKey } = useWallet();
  const { nft } = useAgentStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className='flex flex-col gap-16 p-16 w-full'>
        <div className='flex items-center justify-between w-full'>
          <span className='font-bold'>Token Info</span>
          {isOwner(publicKey?.toBase58(), nft.owner) && (
            <button
              onClick={() => {
                setOpen(true);
              }}
            >
              <IconEdit className='text-size-16' />
            </button>
          )}
        </div>
        <p className='text-size-12'>{tokenInfo.description}</p>
        <Divider horizontal className='w-full' />
        <a
          href={tokenInfo.twitter}
          className='flex justify-between items-center w-full'
        >
          X(Twitter)
          <span>{tokenInfo.twitter?.split("/").slice(-1)[0] ?? "--"}</span>
        </a>
        <a
          href={tokenInfo.twitter}
          className='flex justify-between items-center w-full'
        >
          Telegram
          <span>{tokenInfo.telegram?.split("/").slice(-1)[0] ?? "--"}</span>
        </a>
        <a
          href={tokenInfo.website}
          className='flex justify-between items-center w-full'
        >
          Website
          <span>
            {tokenInfo.website
              ?.replace("https://", "")
              .replace("http://", "") ?? "--"}
          </span>
        </a>
      </Card>
      <EditInfoModal
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        nft={nft}
        tokenInfo={tokenInfo}
      />
    </>
  );
}
