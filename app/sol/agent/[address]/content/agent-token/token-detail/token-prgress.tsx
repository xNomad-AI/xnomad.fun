import { RateNum } from "@/components/rate-number";
import { TokenNumber } from "@/components/token-number";
import { Card, IconInfo, ProgressBar, Tooltip } from "@/primitive/components";
import { useRequest } from "ahooks";
import { useMemo, useState } from "react";
import { getTokenDetail, TokenDetail } from "./network";
import { useAgentStore } from "../../../store";
import BigNumber from "bignumber.js";

export function TokenProgress() {
  const { nft } = useAgentStore();
  const [tokenDetail, setTokenDetail] = useState<TokenDetail>();
  useRequest(
    async () => {
      if (nft.primaryCoin?.address) {
        const res = await getTokenDetail(nft.primaryCoin?.address);
        setTokenDetail(res as TokenDetail);
      }
    },
    {
      refreshDeps: [nft.primaryCoin?.address],
      ready: !!nft.primaryCoin?.address,
      pollingInterval: 1000 * 5,
    }
  );
  const mintProgress = useMemo(
    () =>
      BigNumber(tokenDetail?.initialBaseReserve ?? 0)
        .minus(tokenDetail?.baseReserve ?? 0)
        .div(tokenDetail?.initialBaseReserve ?? 1),
    [tokenDetail?.baseReserve, tokenDetail?.initialBaseReserve]
  );
  return (
    <Card className='flex flex-col gap-16 p-16'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <span>Progress</span>
          <Tooltip
            content={
              "When the market cap reaches $68,999 (~413.84 SOL), all the liquidity in the bonding curve will be deposited to raydium and burned. Progression increases as more tokens are bought."
            }
          >
            <IconInfo />
          </Tooltip>
        </div>
        <RateNum notTrend num={mintProgress.toNumber()} />
      </div>
      <p className='text-text2'>
        Graduate this coin to raydium at $68,998 market cap. There is{" "}
        <TokenNumber
          number={tokenDetail?.quoteReserve ?? ""}
          className='inline-flex'
        />{" "}
        SOL in the bonding curve.
      </p>
      <ProgressBar
        color='colorful'
        value={mintProgress.multipliedBy(100).toNumber()}
      />
    </Card>
  );
}
