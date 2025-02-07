import { Card, IconSol } from "@/primitive/components";
import { NFT } from "@/types";
import BigNumber from "bignumber.js";
import { toIntl } from "@/lib/utils/number/bignumber";
import { DepositContainer } from "../container";
import { useEffect, useState } from "react";
import { Activity, getActivities } from "./network";
import { upperFirstLetter } from "@/lib/utils/string";
import { beautifyTimeV2 } from "@/lib/utils/beautify-time";
import { InfiniteScrollList } from "@/components/infinit-scroll";
import { useRequest } from "ahooks";
const AFTER_TIME = Math.floor(
  new Date("2025-02-07T02:45:00Z").getTime() / 1000
);
export function Analytics({ nft }: { nft: NFT }) {
  // FIXME: demo purpose, should be removed
  const [activity, setActivity] = useState<Activity[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const { loading, run } = useRequest(
    async () => {
      getActivities({
        address: nft.agentAccount.solana,
        offset: activity.length,
        limit: 20,
        afterTime: AFTER_TIME,
      }).then((res) => {
        setActivity([...activity, ...res.items]);
        setHasNextPage(res.has_next);
      });
    },
    {
      manual: true,
    }
  );
  useEffect(() => {
    if (!nft.agentAccount.solana) return;
    getActivities({
      address: nft.agentAccount.solana,
      offset: 0,
      limit: 20,
      afterTime: AFTER_TIME,
    }).then((res) => {
      setActivity(res.items);
      setHasNextPage(res.has_next);
    });
  }, [nft.agentAccount.solana]);
  return (
    <DepositContainer address={nft.agentAccount.solana}>
      <div className='flex mt-16 flex-col w-full'>
        {activity?.length > 0 ? (
          <InfiniteScrollList
            items={activity}
            renderItem={(item) => (
              <Card key={item.tx_hash} className='p-16 flex items-center gap-8'>
                <ActionTag data={item} />
                <span>{toIntl(BigNumber(item.quote.ui_amount))}</span>
                <div className='flex items-center gap-4'>
                  <span
                    className={
                      item.base.change_amount > 0 ? "text-red" : "text-green"
                    }
                  >
                    {item.quote.symbol}
                  </span>
                  <span className='text-text2'>
                    ($
                    {toIntl(
                      BigNumber(item.quote.ui_amount).multipliedBy(
                        item.quote.price || item.quote.nearest_price
                      )
                    )}
                    )
                  </span>
                </div>
                <span className='text-size-12 text-text2'>with</span>

                <div className='flex items-center gap-4'>
                  <IconSol className='text-size-16' />
                  <p className='text-text2'>
                    <span className='text-text1'>
                      {toIntl(BigNumber(item.base.ui_amount))}
                    </span>
                    ($
                    {toIntl(
                      BigNumber(item.base.ui_amount).multipliedBy(
                        item.base.price || item.base.nearest_price
                      )
                    )}
                    )
                  </p>
                </div>
                <div className='flex-1'></div>
                <a
                  href={`https://explorer.solana.com/tx/${item.tx_hash}`}
                  target='_blank'
                  rel='noreferrer'
                  className='underline'
                >
                  {beautifyTimeV2(item.block_unix_time * 1000)}
                </a>
              </Card>
            )}
            hasNextPage={hasNextPage}
            isNextPageLoading={loading}
            loadNextPage={run}
          />
        ) : (
          <div className='flex justify-center w-full p-16 h-[200px] items-center'>
            No Activity
          </div>
        )}
      </div>
    </DepositContainer>
  );
}

function ActionTag({ data }: { data: Activity }) {
  switch (data.tx_type) {
    case "swap":
      if (data.base.change_amount > 0) {
        return (
          <div className='px-8 py-4 h-26 flex items-center bg-red-10 text-red rounded-4'>
            Sell
          </div>
        );
      } else {
        return (
          <div className='px-8 py-4 h-26 flex items-center bg-green-10 text-green rounded-4'>
            Buy
          </div>
        );
      }

    default:
      return (
        <div className='px-8 py-4 h-26 flex items-center bg-brand-10 text-brand rounded-4'>
          {upperFirstLetter(data.tx_type)}
        </div>
      );
  }
}
