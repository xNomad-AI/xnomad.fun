import {
  Button,
  Card,
  IconDisconnect,
  Toggle,
  Tooltip,
} from "@/primitive/components";
import { NFT } from "@/types";
import Image from "next/image";
import { TwitterModal } from "./twitter";
import { useMemo, useState } from "react";
import { api } from "@/primitive/api";
import { CharacterConfig, Config } from "./types";
import { useMemoizedFn, useMount } from "ahooks";
import { TelegramModal } from "./telegram";
import { VoiceModal } from "./voice";
import { ConfirmModal } from "./confirm";
import { editAgentConfig } from "./network";
import { useAgentStore } from "../../store";
import { SupportedChain } from "@/types/preference";
import { useChainStore } from "@/app/layout/chain-provider";
function configTwitter({
  nftId,
  config,
  testContent,
  chain,
}: {
  nftId: string;
  config: Partial<CharacterConfig>;
  chain: SupportedChain;
  testContent?: string;
}) {
  return api.v1.post<{
    isLogin: boolean;
    message: string;
  }>(`/nft/${chain}/${nftId}/config/twitter`, {
    characterConfig: config,
    testContent,
  });
}
function deleteTwitter(nftId: string, chain: SupportedChain) {
  return api.v1.delete<{
    isLogin: boolean;
    message: string;
  }>(`/nft/${chain}/${nftId}/config/twitter`);
}
export function Features({ nft }: { nft: NFT }) {
  const { chain } = useChainStore();
  const { agentConfig: config, setAgentConfig: setConfig } = useAgentStore();
  const [xOpen, setXOpen] = useState(false);
  const [tgOpen, setTgOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [twitterBound, setTwitterBound] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  useMount(() => {
    if (config) {
      // get twitter bound status
      configTwitter({
        nftId: nft.id,
        config: config.characterConfig,
        chain,
        testContent: "",
      }).then((res) => {
        setTwitterBound(res.isLogin);
      });
    }
  });
  const onSave = useMemoizedFn(async (_config: Partial<CharacterConfig>) => {
    const newConfig = await editAgentConfig(
      nft.id,
      {
        ...config,
        settings: {
          ..._config.settings,
          secrets: {
            ..._config.settings?.secrets,
            POST_IMMEDIATELY: _config.settings?.secrets?.POST_IMMEDIATELY,
            TWITTER_LOGIN_SUSPEND:
              _config.settings?.secrets?.TWITTER_LOGIN_SUSPEND,
          },
        },
      },
      chain
    );
    setConfig({
      ...(config as Config),
      characterConfig: newConfig.characterConfig,
    });
  });
  const hasTwitterConfig = useMemo(() => {
    return Boolean(
      config?.characterConfig?.settings.secrets?.TWITTER_USERNAME ||
        config?.characterConfig?.settings.secrets?.TWITTER_PASSWORD ||
        config?.characterConfig?.settings.secrets?.TWITTER_EMAIL ||
        config?.characterConfig?.settings.secrets?.TWITTER_2FA_SECRET ||
        config?.characterConfig?.templates?.twitterPostTemplate ||
        ((config?.characterConfig?.postExamples?.length ?? 0) > 0 &&
          Boolean(config?.characterConfig?.postExamples?.[0]))
    );
  }, [config]);
  const hasTgConfig = useMemo(() => {
    return Boolean(
      config?.characterConfig?.settings.secrets?.TELEGRAM_BOT_TOKEN
    );
  }, [config]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const twitterEnabled = process.env.TWITTER_ENABLED === "true";
  return (
    <>
      <div className='w-full flex flex-col gap-16'>
        <Card className='flex items-center justify-between gap-16 p-16'>
          <div className='flex items-center gap-16'>
            <Image src={"/twitter.svg"} height={64} width={64} alt='' />
            <span>X(Twitter) Integration</span>
            {hasTwitterConfig && twitterEnabled ? (
              <button
                onClick={() => {
                  setConfirmOpen(true);
                }}
              >
                <IconDisconnect className='text-size-24 text-red' />
              </button>
            ) : null}
          </div>
          <div className='flex items-center gap-16'>
            {twitterEnabled && (
              <div className='flex items-center gap-8'>
                Suspend Post
                <Toggle
                  value={
                    config?.characterConfig?.settings.secrets
                      ?.TWITTER_LOGIN_SUSPEND === "true"
                  }
                  disable={isConfigLoading}
                  onChange={() => {
                    setIsConfigLoading(true);

                    onSave({
                      settings: {
                        secrets: {
                          TWITTER_LOGIN_SUSPEND:
                            config?.characterConfig?.settings.secrets
                              ?.TWITTER_LOGIN_SUSPEND === "true"
                              ? "false"
                              : "true",
                        },
                      },
                    }).finally(() => {
                      setIsConfigLoading(false);
                    });
                  }}
                />
              </div>
            )}
            <Tooltip
              disabled={twitterEnabled}
              content={
                "Due to technical limitations of X, this feature is temporarily unavailable."
              }
            >
              <Button
                className='!w-[7.5rem]'
                disabled={!twitterEnabled}
                onClick={() => {
                  setXOpen(true);
                }}
              >
                {hasTwitterConfig ? "Edit" : "Add"}
              </Button>
            </Tooltip>
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
            chain,
            testContent,
          });
          if (!res.isLogin) {
            throw res.message;
          }
          setTwitterBound(true);
        }}
        config={config?.characterConfig}
        onClose={() => {
          setXOpen(false);
        }}
      />
      <TelegramModal
        open={tgOpen}
        onSave={onSave}
        config={config?.characterConfig}
        onClose={() => {
          setTgOpen(false);
        }}
      />
      <VoiceModal
        open={voiceOpen}
        onSave={onSave}
        config={config?.characterConfig}
        onClose={() => {
          setVoiceOpen(false);
        }}
      />
      <ConfirmModal
        title='Delete Twitter Integration'
        content='Are you sure you want to delete the Twitter Integration?'
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
        }}
        isConfirming={isConfigLoading}
        onConfirm={() => {
          setIsConfigLoading(true);
          deleteTwitter(nft.id, chain)
            .then(() => {
              setTwitterBound(false);
              setConfirmOpen(false);
            })
            .finally(() => {
              setIsConfigLoading(false);
            });
        }}
      />
    </>
  );
}
