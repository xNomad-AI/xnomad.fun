import { useState } from "react";
import { getAgentTokenList, TokenInfo } from "./network";
import { useRequest } from "ahooks";
import { useAgentStore } from "../../../store";
import {
  Button,
  Card,
  IconTelegram,
  IconTwitterX,
  IconWebsite,
  Spin,
} from "@/primitive/components";
import { Address } from "@/components/address";
import { TokenNumber } from "@/components/token-number";
import { RateNum } from "@/components/rate-number";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { TokenDetail } from "../token-detail";
import clsx from "clsx";

export function TokenList({ show }: { show: boolean }) {
  const { nft } = useAgentStore();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const { loading } = useRequest(
    async () => {
      const res = await getAgentTokenList({
        creatorAddress: nft.agentAccount.solana,
      });
      setTokens(res.list);
    },
    {
      refreshDeps: [nft.agentAccount.solana],
    }
  );
  return (
    <div
      className={clsx("flex flex-col gap-16 w-full", {
        hidden: !show,
      })}
    >
      <Card className='flex items-center justify-between p-16 relative'>
        <img
          className='w-full h-full object-cover -z-2 absolute left-0 top-0'
          src={nft.image}
        />
        <div className='w-full h-full -z-1 absolute left-0 top-0 bg-black-60'></div>
        <div className='text-size-16 font-bold'>Agent Token Not Bound</div>
        <Button>Bind Agent Token</Button>
      </Card>
      <p className='mt-16 text-text2'>
        The following shows the tokens issued by the AI agent. DYOR.
      </p>
      <div className='flex flex-col w-full'>
        <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40'>
          <div className='flex w-[200px]'>Issued Token</div>
          <div className='flex w-[120px] justify-end'>Price</div>
          <div className='flex w-[120px] justify-end'>Marketcap</div>
          <div className='flex w-[120px] justify-end'>24h Volume</div>
          <div className='flex w-[120px] justify-end'>Liquidity</div>
          <div className='flex w-[120px] justify-end'>Age</div>
        </div>
        {loading ? (
          <div className='h-[100px] w-full flex items-center justify-center'>
            <Spin />
          </div>
        ) : (tokens?.length ?? 0) > 0 ? (
          tokens?.map((item) => (
            <div
              key={item.symbol}
              className='h-64 flex items-center justify-between w-full border-b border-white-20 gap-8'
            >
              <div className='flex w-[200px] gap-4 items-center'>
                <img
                  height={32}
                  width={32}
                  className='w-32 h-32 aspect-square rounded-full flex-shrink-0 mobile:hidden'
                  src={item.logo}
                  alt=''
                />
                <div className='flex flex-col gap-4'>
                  <div className='flex items-end gap-4'>
                    <span className='font-bold'>{item.name}</span>
                    <span className='text-text2'>{item.symbol}</span>
                  </div>
                  <div className='flex items-center gap-4'>
                    <Address
                      address={item.address}
                      enableCopy
                      className='text-size-12 text-text2'
                    />
                    {item.twitter && (
                      <a href={item.twitter} target='_blank'>
                        <IconTwitterX className='text-size-12' />
                      </a>
                    )}
                    {item.telegram && (
                      <a href={item.telegram} target='_blank'>
                        <IconTelegram className='text-size-12' />
                      </a>
                    )}
                    {item.website && (
                      <a href={item.website} target='_blank'>
                        <IconWebsite className='text-size-12' />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex w-[120px] flex-col items-end'>
                <TokenNumber prefix={"$"} number={item.price} />
                <RateNum num={item.priceChange24h} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber number={item.marketCap} prefix={"$"} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber prefix={"$"} number={item.volume24h} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber prefix={"$"} number={item.liquidity} />
              </div>
              <div className='flex w-[120px] justify-end'>
                {beautifyTimeV2(
                  new Date(item.deployedTime).getTime(),
                  true,
                  false,
                  ""
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
            No Tokens
          </div>
        )}
      </div>
      <Button variant='secondary' className='!w-[200px] self-center'>
        Issue Token
      </Button>
    </div>
  );
}
