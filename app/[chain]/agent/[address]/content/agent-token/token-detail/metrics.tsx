import { TokenNumber } from "@/components/token-number";
import { useAgentStore } from "../../../store";
import { useTokenPagePriceStore } from "./store/price";
import { RateNum } from "@/components/rate-number";
import { PropsWithChildren } from "react";
import { useChainStore } from "@/app/layout/chain-provider";

export function TokenMetrics() {
  const { chain } = useChainStore();
  const { tokenPrice } = useTokenPagePriceStore();
  const { primaryToken } = useAgentStore();
  return (
    <div className='flex items-center gap-24 flex-wrap'>
      <MetricsCell title='Price'>
        <TokenNumber
          number={chain === "solana" ? tokenPrice : primaryToken?.price ?? 0}
          className='text-size-16 font-bold'
        />
      </MetricsCell>
      <MetricsCell title='Price 24h%'>
        <RateNum
          num={primaryToken?.priceChange24h}
          className='text-size-16 font-bold'
        />
      </MetricsCell>
      <MetricsCell title='24h Volume'>
        <TokenNumber
          number={primaryToken?.volume24h ?? ""}
          prefix={"$"}
          className='text-size-16 font-bold'
        />
      </MetricsCell>
      <MetricsCell title='Marketcap'>
        <TokenNumber
          number={primaryToken?.marketCap ?? ""}
          prefix={"$"}
          className='text-size-16 font-bold'
        />
      </MetricsCell>
      <MetricsCell title='Holders'>
        <TokenNumber
          number={primaryToken?.holdersCount ?? ""}
          className='text-size-16 font-bold'
        />
      </MetricsCell>
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
