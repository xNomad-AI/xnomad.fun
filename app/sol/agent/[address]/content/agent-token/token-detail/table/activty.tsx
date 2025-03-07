import { InfiniteScrollList } from "@/components/infinit-scroll";
import clsx from "clsx";
import { TokenTransaction, useActivities } from "./use-activities";
import { ActionTag } from "../../../wallet/activity/components";
import { Spin } from "@/primitive/components";
import { TokenNumber } from "@/components/token-number";
import { Address } from "@/components/address";
import BigNumber from "bignumber.js";
import { AgeCell } from "../../token-list/age-cell";

export function Activity({ show }: { show: boolean }) {
  const {
    data: activity,
    loadMore,
    loading,
    hasMore,
    loadingMore,
  } = useActivities(show);

  return (
    <div
      className={clsx("flex flex-col w-full", {
        hidden: !show,
      })}
    >
      <div className='flex items-center justify-between w-full border-b border-white-20 gap-8 h-40'>
        <div className='flex w-[80px]'>Time</div>
        <div className='flex w-[90px] justify-end'>Type</div>
        <div className='flex w-[120px] justify-end'>Total USD</div>
        <div className='flex w-[100px] justify-end'>Amount</div>
        <div className='flex w-[100px] justify-end'>Price</div>
        <div className='flex w-[120px] justify-end'>Maker</div>
      </div>

      {activity?.length > 0 ? (
        <InfiniteScrollList
          items={activity}
          gutterSize={0}
          itemSize={58}
          height={400}
          renderItem={(item: TokenTransaction) => {
            return (
              <a
                target='_blank'
                rel='noreferrer'
                href={`https://explorer.solana.com/tx/${item.txHash}`}
                key={item.txHash}
                className='h-58 flex items-center justify-between w-full border-b border-white-20 gap-8'
              >
                <div className='flex w-[80px] gap-4 items-center'>
                  <AgeCell time={item.timestamp * 1000} />
                </div>
                <div className='flex w-[90px] justify-end'>
                  <ActionTag type={item.event as any} />
                </div>
                <div className='flex w-[120px] justify-end'>
                  <TokenNumber number={item.amountUsd} prefix={"$"} />
                </div>
                <div className='flex w-[100px] justify-end'>
                  <TokenNumber number={item.amount} />
                </div>
                <div className='flex w-[100px] justify-end'>
                  <TokenNumber
                    prefix={"$"}
                    number={
                      item.priceUsd ??
                      BigNumber(item.amountUsd).div(item.amount).toNumber()
                    }
                  />
                </div>
                <div className='flex w-[120px] justify-end'>
                  <Address address={item.maker} />
                </div>
              </a>
            );
          }}
          hasNextPage={hasMore}
          isNextPageLoading={loadingMore}
          loadNextPage={loadMore}
        />
      ) : loading ? (
        <div className='w-full flex h-[200px] items-center justify-center gap-16'>
          <Spin />
        </div>
      ) : (
        <div className='flex justify-center w-full p-16 h-[200px] items-center text-text2'>
          No Activities
        </div>
      )}
    </div>
  );
}
