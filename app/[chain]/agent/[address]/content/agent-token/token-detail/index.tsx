import { Card, Spin, Tooltip } from "@/primitive/components";
import {
  IconFourMeme,
  IconPump,
} from "../../../chat/content/issue-token/icons";
import { Address } from "@/components/address";
import { Chart } from "./chart";
import { NFT } from "@/types";
import clsx from "clsx";
import { Table } from "./table";
import { TokenPageSocketProvider } from "./store/socket";
import { TradeSection } from "./trade";
import { TokenPagePriceStoreProvider } from "./store/price";
import { TradeConfigProvider } from "./store/trade-config";
import { TradeStoreProvider } from "./store/trade";
import { TradeSettingModal } from "./trade/setting-modal";

import { Info } from "./token-info";
import { AgeCell } from "../token-list/age-cell";
import { TextWithEllipsis } from "@/components/text-with-ellipsis";
import { useAgentStore } from "../../../store";
import { TokenMetrics } from "./metrics";
import { useChainStore } from "@/app/layout/chain-provider";
import { TextAnchor, TextLink } from "@/components/text-button";

export function Detail({ show }: { nft: NFT; show: boolean }) {
  const { primaryToken } = useAgentStore();
  const { chain } = useChainStore();
  return (
    <div
      className={clsx("w-full flex flex-col gap-16", {
        hidden: !show,
      })}
    >
      <p className='text-text2'>
        The agent token was bound by the agent owner. DYOR.
      </p>
      {primaryToken ? (
        <TokenPageSocketProvider ca={primaryToken.address}>
          <TokenPagePriceStoreProvider initialPrice={primaryToken.price}>
            <TradeConfigProvider>
              <TradeStoreProvider>
                <Card className='flex items-center justify-between p-16'>
                  <div className='flex items-center gap-8'>
                    <img
                      className='w-48 h-48 rounded-full object-contain'
                      src={primaryToken.logo}
                    />
                    <div className='flex flex-col'>
                      <div className='flex items-center gap-4'>
                        <span className='text-size-20 font-bold'>
                          {primaryToken.symbol}
                        </span>
                        <TextWithEllipsis className='text-text2'>
                          {primaryToken.name}
                        </TextWithEllipsis>
                        {chain === "solana" ? (
                          <Tooltip content='Pumpfun'>
                            <a
                              href={`https://pump.fun/coin/${primaryToken.address}`}
                              target='_blank'
                              rel='noreferrer'
                            >
                              <IconPump className='text-size-18' />
                            </a>
                          </Tooltip>
                        ) : (
                          <Tooltip content='Four.meme'>
                            <a
                              href={`https://four.meme/token/${primaryToken.address}`}
                              target='_blank'
                              rel='noreferrer'
                            >
                              <IconFourMeme className='text-size-18' />
                            </a>
                          </Tooltip>
                        )}
                      </div>
                      <div className='flex items-center gap-4'>
                        <Address
                          address={primaryToken.address ?? ""}
                          enableCopy
                          className='text-text2 text-size-12'
                        />
                        <span className='text-size-12'>
                          <AgeCell time={primaryToken.deployedTime} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <TokenMetrics />
                </Card>
                <div className='flex portrait-tablet:flex-col gap-16'>
                  <div className='flex-1 flex flex-col gap-24'>
                    <Chart
                      key={primaryToken.address}
                      ca={primaryToken.address}
                      chain={chain}
                      tokenInfo={primaryToken}
                    />
                    <Table tokenInfo={primaryToken} />
                  </div>
                  <div className='w-full max-w-[20rem] flex-shrink-0 portrait-tablet:max-w-[unset] flex flex-col gap-16'>
                    <TradeSection />

                    <Info tokenInfo={primaryToken} />
                    <TradeSettingModal />
                  </div>
                </div>
              </TradeStoreProvider>
            </TradeConfigProvider>
          </TokenPagePriceStoreProvider>
        </TokenPageSocketProvider>
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center'>
          <Spin />
        </div>
      )}
    </div>
  );
}
