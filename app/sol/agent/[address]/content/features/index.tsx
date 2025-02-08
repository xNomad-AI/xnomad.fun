import { Button, Card } from "@/primitive/components";
import { NFT } from "@/types";
import Image from "next/image";
import { TwitterModal } from "./twitter";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/primitive/api";
import { Config } from "./types";
import { useMemoizedFn } from "ahooks";

export function Features({ nft }: { nft: NFT }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<Config>();
  useEffect(() => {
    api.v1
      .get<{ characterConfig: Config }>(`/nft/solana/${nft.id}/config`)
      .then((res) => {
        setConfig(res.characterConfig);
      });
  }, []);
  const onSave = useMemoizedFn(async (config: Partial<Config>) => {
    await api.v1.post<Config>(`/nft/solana/${nft.id}/config`, config);
  });
  const hasTwitterConfig = useMemo(() => {
    return Boolean(
      config?.character.settings.secrets.TWITTER_USERNAME ||
        config?.character.settings.secrets.TWITTER_PASSWORD ||
        config?.character.settings.secrets.TWITTER_EMAIL ||
        config?.character.settings.secrets.TWITTER_2FA_SECRET ||
        (config?.character.postExamples.length ?? 0) > 0
    );
  }, [config]);
  return (
    <>
      <div className='w-full flex flex-col gap-16'>
        <Card className='flex items-center justify-between gap-16 p-16'>
          <div className='flex items-center gap-16'>
            <Image src={"/twitter.svg"} height={64} width={64} alt='' />
            <span>Twitter Integration</span>
          </div>
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            {hasTwitterConfig ? "Edit" : "Add"}
          </Button>
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
      <TwitterModal
        open={open}
        onSave={onSave}
        config={config}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
