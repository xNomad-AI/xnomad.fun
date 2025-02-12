import { Button, Card, message } from "@/primitive/components";
import { NFT } from "@/types";
import Image from "next/image";
import { TwitterModal } from "./twitter";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/primitive/api";
import { Config } from "./types";
import { useMemoizedFn } from "ahooks";
import { TelegramModal } from "./telegram";
import { VoiceModal } from "./voice";
function configTwitter({
  nftId,
  config,
  testContent,
}: {
  nftId: string;
  config: Partial<Config>;
  testContent?: string;
}) {
  return api.v1.post<{
    isLogin: boolean;
    message: string;
  }>(`/nft/solana/${nftId}/config/twitter`, {
    characterConfig: config,
    testContent,
  });
}
export function Features({ nft }: { nft: NFT }) {
  const [xOpen, setXOpen] = useState(false);
  const [tgOpen, setTgOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [config, setConfig] = useState<Config>();
  const [twitterBound, setTwitterBound] = useState(false);

  useEffect(() => {
    api.v1
      .get<{ characterConfig: Config }>(`/nft/solana/${nft.id}/config`)
      .then((res) => {
        setConfig(res.characterConfig);
        // get twitter bound status
        configTwitter({
          nftId: nft.id,
          config: res.characterConfig,
          testContent: "",
        }).then((res) => {
          setTwitterBound(res.isLogin);
        });
      });
  }, []);
  const onSave = useMemoizedFn(async (config: Partial<Config>) => {
    const newConfig = await api.v1.post<{ characterConfig: Config }>(
      `/nft/solana/${nft.id}/config`,
      { characterConfig: config }
    );
    setConfig(newConfig.characterConfig);
  });
  const hasTwitterConfig = useMemo(() => {
    return Boolean(
      config?.settings.secrets?.TWITTER_USERNAME ||
        config?.settings.secrets?.TWITTER_PASSWORD ||
        config?.settings.secrets?.TWITTER_EMAIL ||
        config?.settings.secrets?.TWITTER_2FA_SECRET ||
        ((config?.postExamples?.length ?? 0) > 0 &&
          Boolean(config?.postExamples?.[0]))
    );
  }, [config]);
  const hasTgConfig = useMemo(() => {
    return Boolean(config?.settings.secrets?.TELEGRAM_BOT_TOKEN);
  }, [config]);
  return (
    <>
      <div className='w-full flex flex-col gap-16'>
        <Card className='flex items-center justify-between gap-16 p-16'>
          <div className='flex items-center gap-16'>
            <Image src={"/twitter.svg"} height={64} width={64} alt='' />
            <span>X(Twitter) Integration</span>
          </div>
          <div className='flex items-center gap-16'>
            {twitterBound ? (
              <span className='text-green'>Online</span>
            ) : (
              <span className='text-red'>Offline</span>
            )}
            <Button
              className='!w-[7.5rem]'
              onClick={() => {
                setXOpen(true);
              }}
            >
              {hasTwitterConfig ? "Edit" : "Add"}
            </Button>
          </div>
        </Card>
        <Card className='flex items-center justify-between gap-16 p-16'>
          <div className='flex items-center gap-16'>
            <Image src={"/telegram.svg"} height={64} width={64} alt='' />
            <span>Telegram Integration</span>
          </div>
          <Button
            className='!w-[7.5rem]'
            onClick={() => {
              setTgOpen(true);
            }}
          >
            {hasTgConfig ? "Edit" : "Add"}
          </Button>
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
            <Image src={"/voice.png"} height={64} width={64} alt='' />
            <span>Voice Generation</span>
          </div>
          <Button
            variant='secondary'
            className='!w-[7.5rem]'
            onClick={() => {
              setVoiceOpen(true);
            }}
          >
            Edit
          </Button>
        </Card>
      </div>
      <TwitterModal
        open={xOpen}
        onSave={async (config, testContent) => {
          const res = await configTwitter({
            nftId: nft.id,
            config,
            testContent,
          });
          if (!res.isLogin) {
            throw res.message;
          }
          setTwitterBound(true);
        }}
        config={config}
        onClose={() => {
          setXOpen(false);
        }}
      />
      <TelegramModal
        open={tgOpen}
        onSave={onSave}
        config={config}
        onClose={() => {
          setTgOpen(false);
        }}
      />
      <VoiceModal
        open={voiceOpen}
        onSave={onSave}
        config={config}
        onClose={() => {
          setVoiceOpen(false);
        }}
      />
    </>
  );
}
