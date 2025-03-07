import { Card, Spin } from "@/primitive/components";
import { useRequest } from "ahooks";
import { getPrimaryToken } from "./network";
import { PropsWithChildren, useState } from "react";
import { IconPump } from "../../../chat/content/issue-token/icons";
import { Address } from "@/components/address";
import { TokenNumber } from "@/components/token-number";
import { RateNum } from "@/components/rate-number";
import { Chart } from "./chart";
import { NFT } from "@/types";
import clsx from "clsx";
import { TokenInfo as TokenInfoType } from "../token-list/network";
import { Table } from "./table";
import { TokenPageSocketProvider } from "./store/socket";
import { TradeSection } from "./trade";
import { TokenPagePriceStoreProvider } from "./store/price";
import { TradeConfigProvider } from "./store/trade-config";
import { TradeStoreProvider } from "./store/trade";
import { TradeSettingModal } from "./trade/setting-modal";

import { Info } from "./token-info";
import { AgeCell } from "../token-list/age-cell";

export function Detail({ nft, show }: { nft: NFT; show: boolean }) {
  const [primaryToken, setPrimaryToken] = useState<TokenInfoType>();
  useRequest(
    async () => {
      if (nft.id) {
        const res = await getPrimaryToken(nft.id);
        setPrimaryToken(res);
      }
    },
    {
      refreshDeps: [nft.id],
    }
  );
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
                          {primaryToken.name}
                        </span>
                        <span className='text-text2'>
                          ${primaryToken.symbol}
                        </span>
                        <IconPump className='text-size-18' />
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
                  <div className='flex items-center gap-24 flex-wrap'>
                    <MetricsCell title='Price'>
                      <TokenNumber
                        number={primaryToken.price ?? ""}
                        className='text-size-16 font-bold'
                      />
                    </MetricsCell>
                    <MetricsCell title='Price 24h%'>
                      <RateNum
                        num={primaryToken.priceChange24h}
                        className='text-size-16 font-bold'
                      />
                    </MetricsCell>
                    <MetricsCell title='24h Volume'>
                      <TokenNumber
                        number={primaryToken.volume24h ?? ""}
                        prefix={"$"}
                        className='text-size-16 font-bold'
                      />
                    </MetricsCell>
                    <MetricsCell title='Marketcap'>
                      <TokenNumber
                        number={primaryToken.marketCap ?? ""}
                        prefix={"$"}
                        className='text-size-16 font-bold'
                      />
                    </MetricsCell>
                    <MetricsCell title='Holders'>
                      <TokenNumber
                        number={primaryToken.holdersCount ?? ""}
                        className='text-size-16 font-bold'
                      />
                    </MetricsCell>
                  </div>
                </Card>
                <div className='flex portrait-tablet:flex-col gap-16'>
                  <div className='flex-1 flex flex-col gap-24'>
                    <Chart
                      key={primaryToken.address}
                      ca={primaryToken.address}
                      chain='solana'
                      tokenInfo={primaryToken}
                    />
                    <Table tokenInfo={primaryToken} />
                  </div>
                  <div className='w-full max-w-[20rem] portrait-tablet:max-w-[unset] flex flex-col gap-16'>
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

function MetricsCell({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div className='flex flex-col items-end'>
      <span className='text-size-12 text-text2'>{title}</span>
      {children}
    </div>
  );
}
