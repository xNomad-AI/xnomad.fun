import { InfiniteScrollList } from "@/components/infinit-scroll";
import clsx from "clsx";
import { Spin } from "@/primitive/components";
import { TokenNumber } from "@/components/token-number";
import { Address } from "@/components/address";
import { getHolders, TokenTopHolder } from "./network";
import { useRequest } from "ahooks";
import { useAgentStore } from "../../../../store";
import { RateNum } from "@/components/rate-number";

export function Holders({ show }: { show: boolean }) {
  const { nft } = useAgentStore();
  const { data: holders, loading } = useRequest(
    async () => {
      const res = await getHolders({
        address: nft.primaryCoin?.address as string,
        asc: 0,
      });
      return res.sort((a, b) => b.amount - a.amount);
    },
    {
      ready: show && !!nft.primaryCoin?.address,
    }
  );

  return (
    <div
      className={clsx("flex flex-col w-full", {
        hidden: !show,
      })}
    >
      <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40 text-white-40 text-size-12'>
        <div className='flex w-[120px]'>
          <div className='flex w-[40px]'>#</div>Holder
        </div>
        <div className='flex w-[120px] justify-end'>Owned Amount</div>
        <div className='flex w-[120px] justify-end'>Owned%</div>
      </div>

      {(holders?.length ?? 0) > 0 ? (
        <InfiniteScrollList
          items={holders ?? []}
          gutterSize={0}
          itemSize={58}
          height={400}
          renderItem={(item: TokenTopHolder, index) => {
            return (
              <div
                key={item.address}
                className='h-58 flex items-center justify-between w-full border-b border-white-20 gap-8'
              >
                <div className='flex w-[120px]'>
                  <div className='flex w-[40px] gap-4 items-center'>
                    {index + 1}
                  </div>
                  <Address address={item.address} />
                </div>
                <div className='flex w-[120px] justify-end'>
                  <TokenNumber number={item.amount} />
                </div>
                <div className='flex w-[120px] justify-end'>
                  <RateNum num={item.amount_percentage} notTrend />
                </div>
              </div>
            );
          }}
          hasNextPage={false}
          isNextPageLoading={false}
          loadNextPage={() => {}}
        />
      ) : loading ? (
        <div className='w-full flex h-[200px] items-center justify-center gap-16'>
          <Spin />
        </div>
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No Holders
        </div>
      )}
    </div>
  );
}
