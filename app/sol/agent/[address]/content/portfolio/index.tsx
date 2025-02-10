import { Card } from "@/primitive/components";
import { NFT } from "@/types";
import BigNumber from "bignumber.js";
import { DepositContainer } from "../container";
import { useAgentStore } from "../../store";
import { Address } from "@/components/address";
import { TokenNumber } from "@/components/token-number";

export function Portfolio({ nft }: { nft: NFT }) {
  const { portfolio } = useAgentStore();
  return (
    <DepositContainer nft={nft}>
      <div className='grid grid-cols-3 gap-16'>
        <Card className='flex flex-col p-16'>
          <span className='text-size-12'>Net Worth</span>
          <span className='text-size-24 font-bold mobile:text-size-16'>
            <TokenNumber number={portfolio?.totalUsd || 0} prefix={"$"} />
          </span>
        </Card>
        <Card className='flex flex-col p-16'>
          <span className='text-size-12'>Total Pnl</span>
          <span className='text-size-24 font-bold mobile:text-size-16'>
            Coming soon...
          </span>
        </Card>
        <Card className='flex flex-col p-16'>
          <span className='text-size-12'>Win Rate</span>
          <span className='text-size-24 font-bold mobile:text-size-16'>
            Coming soon...
          </span>
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
                  height={32}
                  width={32}
                  className='w-32 h-32 aspect-square rounded-full flex-shrink-0'
                  src={item.logoURI}
                  alt=''
                />
                <div className='flex flex-col gap-4'>
                  <span className='font-bold'>{item.symbol}</span>
                  <Address
                    address={item.address}
                    enableCopy
                    className='text-size-12 text-text2'
                  />
                </div>
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber prefix={"$"} number={item.priceUsd} />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber
                  number={BigNumber(item.balance).div(10 ** item.decimals)}
                />
              </div>
              <div className='flex w-[120px] justify-end'>
                <TokenNumber prefix={"$"} number={item.valueUsd} />
              </div>
            </div>
          ))
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
            No Assets
          </div>
        )}
      </div>
    </DepositContainer>
  );
}
