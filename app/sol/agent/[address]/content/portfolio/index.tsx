import { Card } from "@/primitive/components";
import { NFT } from "@/types";
import BigNumber from "bignumber.js";
import { toIntl } from "@/lib/utils/number/bignumber";
import { DepositContainer } from "../container";
import { useAgentStore } from "../../store";
import { toCardNum } from "@/lib/utils/number";

export function Portfolio({ nft }: { nft: NFT }) {
  const { portfolio } = useAgentStore();
  return (
    <DepositContainer address={nft.agentAccount.solana}>
      <div className='grid grid-cols-3 gap-16'>
        <Card className='flex flex-col p-16'>
          <span className='text-size-12'>Net Worth</span>
          <span className='text-size-24 font-bold'>
            ${toIntl(BigNumber(portfolio?.totalUsd || 0))}
          </span>
        </Card>
        <Card className='flex flex-col p-16'>
          <span className='text-size-12'>Total Pnl</span>
          <span className='text-size-24 font-bold'>Coming soon...</span>
        </Card>
        <Card className='flex flex-col p-16'>
          <span className='text-size-12'>Win Rate</span>
          <span className='text-size-24 font-bold'>Coming soon...</span>
        </Card>
      </div>
      <div className='mt-16 flex flex-col w-full'>
        <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40'>
          <div className='flex w-[160px]'>Asset</div>
          <div className='flex w-[120px] justify-end'>Price</div>
          <div className='flex w-[120px] justify-end'>Balance</div>
          <div className='flex w-[120px] justify-end'>Holding Value</div>
        </div>
        {(portfolio?.items.length ?? 0) > 0 ? (
          portfolio?.items.map((item) => (
            <div
              key={item.symbol}
              className='h-64 flex items-center justify-between w-full border-b border-white-20 gap-8'
            >
              <div className='flex w-[160px] gap-4'>
                <img
                  height={20}
                  width={20}
                  className='rounded-full'
                  src={item.logoURI}
                  alt=''
                />
                <span className='font-bold'>{item.symbol}</span>
              </div>
              <div className='flex w-[120px] justify-end'>
                {toCardNum(item.priceUsd, "$")}
              </div>
              <div className='flex w-[120px] justify-end'>
                {toIntl(BigNumber(item.balance).div(10 ** item.decimals))}
              </div>
              <div className='flex w-[120px] justify-end'>
                {toCardNum(item.valueUsd, "$")}
              </div>
            </div>
          ))
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center'>
            No assets
          </div>
        )}
      </div>
    </DepositContainer>
  );
}
